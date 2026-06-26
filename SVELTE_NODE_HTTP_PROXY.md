# SvelteKit Node HTTP API Proxy

Use this guide when a SvelteKit app running on the Node adapter needs to support both:

- browser to API mode
- browser to SvelteKit Node proxy to API mode

This is not a generic browser CORS proxy pattern. It is a same-origin app proxy pattern for projects where the frontend can either call the API directly or ask the SvelteKit Node process to forward API HTTP requests.

## When To Use

Use this pattern when:

- the browser-facing API path must be configurable, such as `/api` or `/api-proxy`
- deployments may put SvelteKit and the API behind different internal network paths
- browser code should keep using one API helper instead of hardcoding deployment paths throughout pages
- the SvelteKit Node process can safely reach the upstream API

Do not use this pattern as an open proxy. The upstream API origin must come from trusted server-side startup config, not from request input.

## Runtime Contract

Keep proxy configuration in server-side runtime config. Existing deployments should default to direct browser mode with no config changes.

Recommended shape:

```ts
type HttpApiConfig = {
  mode: 'browser' | 'proxy';
  browserBasePath: string;
  proxy: {
    basePath: string;
    upstreamBaseUrl: string | null;
    upstreamBasePath: string;
  };
};
```

Recommended defaults:

```json
{
  "httpApi": {
    "mode": "browser",
    "browserBasePath": "/api",
    "proxy": {
      "basePath": "/api-proxy",
      "upstreamBaseUrl": null,
      "upstreamBasePath": "/api"
    }
  }
}
```

Rules:

- `mode: "browser"` keeps current direct browser API behavior.
- `mode: "proxy"` makes browser calls use `proxy.basePath`.
- `proxy.upstreamBaseUrl` is required only in proxy mode.
- `browserBasePath`, `proxy.basePath`, and `proxy.upstreamBasePath` must be path prefixes, not absolute URLs.
- Reject root-only API prefixes such as `/`; they are ambiguous and can capture the whole app.
- Config changes require a process restart if the app treats runtime config as startup-only.

## Path Model

Browser code should continue to ask for stable logical API URLs, usually `/api/...`.

A single URL helper rewrites only that logical `/api` prefix to the active browser-facing API base path:

```ts
const defaultApiBasePath = '/api';

const isAbsoluteUrl = ({ url }: { url: string }) => /^[a-z][a-z0-9+.-]*:/i.test(url);

const normalizeApiBasePath = ({ apiBasePath }: { apiBasePath: string }) => {
  const trimmed = apiBasePath.trim();
  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  if (!withoutTrailingSlash) return defaultApiBasePath;

  return withoutTrailingSlash.startsWith('/') ? withoutTrailingSlash : `/${withoutTrailingSlash}`;
};

export const buildApiUrl = ({
  url,
  apiBasePath
}: {
  url: string;
  apiBasePath: string;
}) => {
  if (isAbsoluteUrl({ url })) return url;
  if (url !== defaultApiBasePath && !url.startsWith(`${defaultApiBasePath}/`)) return url;

  return `${normalizeApiBasePath({ apiBasePath })}${url.slice(defaultApiBasePath.length)}`;
};
```

This lets existing browser code keep calling `/api/config/pull`, while proxy mode sends the actual browser request to `/api-proxy/config/pull`.

## SvelteKit Wiring

Expose the active browser API base path from a server load and write it to a stable browser-readable location:

```ts
// +layout.server.ts
export const load = async ({ locals }) => ({
  apiBasePath: getHttpApiClientBasePath({ runtimeConfig: locals.appContext.runtimeConfig })
});
```

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';

  export let data: App.PageData;

  if (browser) {
    document.documentElement.dataset.apiBasePath = data.apiBasePath ?? '/api';
  }
</script>
```

Then centralize fetch calls:

```ts
const readDocumentApiBasePath = () => {
  if (typeof document === 'undefined') return '/api';

  return document.documentElement.dataset.apiBasePath ?? '/api';
};

const isJsonContentType = ({ contentType }: { contentType: string }) => (
  /(^|[/+])json($|;)/i.test(contentType)
);

type ApiRequestResult<T> = {
  requestUrl: string;
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  contentType: string;
  isJsonResponse: boolean;
  responseText: string;
  payload: T | null;
  jsonParseError: unknown | null;
};

export const apiRequest = async <T = unknown>({
  url,
  method = 'GET',
  headers,
  body,
  apiBasePath = readDocumentApiBasePath()
}: {
  url: string;
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
  apiBasePath?: string;
}): Promise<ApiRequestResult<T>> => {
  // Callers inspect ok/status/payload/jsonParseError and decide whether to throw,
  // emit responseText, or log with generateError at the workflow boundary.
  // Transport and body-read rejections also belong to the caller.
  const requestUrl = buildApiUrl({ url, apiBasePath });
  const response = await fetch(requestUrl, {
    method,
    headers: headers ?? (body !== undefined ? { 'content-type': 'application/json' } : undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const responseText = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const isJsonResponse = isJsonContentType({ contentType });
  let payload: T | null = null;
  let jsonParseError: unknown | null = null;

  if (responseText && isJsonResponse) {
    try {
      payload = JSON.parse(responseText) as T;
    } catch (err) {
      jsonParseError = err;
    }
  }

  return {
    requestUrl,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    contentType,
    isJsonResponse,
    responseText,
    payload,
    jsonParseError
  };
};
```

Direct browser APIs that bypass the helper must also use `buildApiUrl`. Common examples:

- download links
- `EventSource`
- `WebSocket` URLs, if the websocket is also meant to proxy through this path
- `fetch(..., { keepalive: true })` on unload

## Proxy Handler Placement

Install the proxy in `hooks.server.ts` after request locals are initialized and before `resolve(event)`.

Typical order:

1. create or load request context
2. set correlation ID and auth/session locals
3. run the API proxy handler
4. fall through to SvelteKit `resolve(event)` for non-proxy paths

The handler should:

- do nothing unless `mode === "proxy"`
- do nothing unless the request path starts with the configured proxy base path
- strip the proxy prefix from the browser request path
- join `upstreamBaseUrl`, `upstreamBasePath`, stripped downstream path, and query string
- forward method, filtered headers, and request body
- return the upstream response status, headers, and body stream

Do not buffer upstream responses by default. Server-Sent Events, large downloads, and streaming responses need `response.body` to pass through as a stream.

## Header Rules

Keep hop-by-hop header filtering. A proxy should not forward transport-level headers that belong to one HTTP connection.

Filter these request and response headers:

```ts
const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
  'host'
]);
```

Also remove `content-encoding` from proxied responses if Node fetch has already decoded the body. Leaving a stale `content-encoding` header can make browsers decode an already-decoded body.

Do not add a generic "browser-only header" drop list by default. Cookies, `origin`, and `referer` are often required for session auth and same-origin protection in same-origin app proxies.

Useful forwarded headers:

- `x-forwarded-host`: original browser-facing host
- `x-forwarded-proto`: original browser-facing protocol
- `x-forwarded-for`: append the client address when available
- `x-correlation-id`: current request correlation ID if the project uses one

Let Node fetch set the upstream `host`, `content-length`, and transfer headers.

## CORS

Do not add CORS handling for the normal version of this pattern.

The browser calls SvelteKit on the same origin, such as `/api-proxy/...`. The SvelteKit Node process then calls the upstream API server-side. Browser CORS does not apply to that server-to-server hop.

Only add CORS behavior if the proxy endpoint is intentionally exposed for cross-origin browser callers. That is a different security model and should be documented explicitly in the consuming project.

## Response Rules

When creating the proxied `Response`:

- preserve upstream `status` and `statusText`
- preserve filtered upstream headers
- pass through `response.body` as a stream
- use `null` body for null-body statuses: `204`, `205`, and `304`

Example:

```ts
const nullBodyStatuses = new Set([204, 205, 304]);

return new Response(nullBodyStatuses.has(response.status) ? null : response.body, {
  status: response.status,
  statusText: response.statusText,
  headers: responseHeaders
});
```

## Security Checklist

- Do not accept an upstream URL from request input.
- Validate configured path prefixes as paths, not URLs.
- Require `upstreamBaseUrl` only when proxy mode is enabled.
- Preserve server-side authorization on all API mutations.
- Preserve same-origin checks where the API already relies on `origin`.
- Forward cookies only to the configured upstream API, never to arbitrary targets.
- Avoid logging full headers or bodies unless gated and redacted.

## Test Checklist

Add focused tests for:

- browser mode keeps the direct API base path
- proxy mode switches browser calls to the configured proxy base path
- app `basePath` is preserved in browser-facing paths
- proxy path stripping is exact and does not match near-prefixes
- target URL building preserves upstream URL path prefixes
- target URL building preserves query strings
- `buildApiUrl` rewrites `/api/...` but leaves non-API and absolute URLs alone
- request helpers preserve caller-provided headers and only default to JSON headers when headers are omitted
- API helpers return status, parsed payload, parse errors, and raw response text so callers decide the outcome
- lock or config validation rejects absolute URLs and root-only API prefixes for path settings

If the app uses SSE or downloads, add at least one integration-level check that the proxy does not buffer or corrupt the response body.
