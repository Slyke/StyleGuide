# Logger Usage (Portable Setup)

Use this when you have copied the logger files into another repo and need to wire them in.

Important: an error or logger key should never be reused. Each code path that produces a structured error or gated log should have its own unique key.

## 1. Copy required files

Copy these files into your backend project:

- `src/logger.js`
- `error_gen.js`
- `src/errors.json`

## 2. Initialize logger at startup

```js
const fs = require('fs');
const { debugAndErrors } = require('./src/logger');

const errorCodeMap = fs.existsSync('./src/errors.json')
  ? JSON.parse(fs.readFileSync('./src/errors.json', 'utf8'))
  : {};

const { generateLog, generateError, wrapError } = debugAndErrors({
  settings: {
    logging: {
      // Optional: custom text template for non-JSON logs.
      // Supported tokens: {$timestamp}, {$level}, {$caller}, {$message},
      // {$correlationId}, {$errorCode}, {$errorKey}, {$loggerKey}
      logTextFormat: '[{$timestamp}] {$level} {$caller} {$message}',
      sinks: {
        // levels: [] means all levels for that sink.
        console: { enabled: true, format: 'text', levels: [] },
        file: {
          enabled: false,
          format: 'json',
          path: './logs/app.jsonl',
          levels: ['warn', 'error']
        },
        http: {
          enabled: false,
          format: 'json',
          url: '',
          method: 'POST',
          timeoutMs: 2500,
          levels: ['error'],
          optionalHeaders: {
            'x-service-name': 'orders-api'
          }
        },
        syslog: {
          enabled: false,
          format: 'json',
          protocol: 'udp',
          host: 'localhost',
          port: 514,
          facility: 'local0',
          appName: 'orders-api',
          hostname: 'orders-api-01',
          procId: String(process.pid),
          msgId: 'app-log',
          timeoutMs: 2500,
          framing: 'octet-counted',
          levels: ['warn', 'error']
        }
      },
      gates: {
        failedLoginAttemptsExample: {
          level: 'warn',
          console: true,
          file: false,
          http: false,
          syslog: false
        },
        successfulLogin: {
          level: 'info',
          console: false,
          file: false,
          http: false,
          syslog: false
        }
      }
    }
  },
  errorCodeMap
});
```

The logging settings may live in a settings/config JSON file if the project has one. Otherwise, hardcode the values at startup. Add gates for noisy events that are useful while debugging but should not always be emitted to every sink.

## 3. Log normal events

```js
generateLog({
  level: 'info',
  caller: 'orders::create',
  loggerKey: 'ORDER_CREATED',
  message: 'Order created',
  correlationId,
  context: { orderId }
});
```

Supported levels are free-form strings, but keep projects consistent by using `debug`, `info`, `warn`, and `error`. Sink `levels` arrays decide which levels each sink emits.

## 4. Generate structured errors

```js
const errObj = generateError({
  caller: 'orders::create',
  reason: 'Failed to create order',
  errorKey: 'ORDER_CREATE_FAILED',
  err,
  includeStackTrace: true,
  correlationId,
  context: { orderId }
});
```

`generateError` creates a structured error object, maps `errorKey` to `errorCode` through `errors.json`, and logs the event at `error` level by default.

## 5. Wrap and bubble errors

```js
throw wrapError({
  caller: 'routes::orders',
  reason: 'Order route failed',
  errorKey: 'ORDER_ROUTE_FAILED',
  err,
  correlationId
});
```

`wrapError` returns a real `Error` with structured details attached and preserves the original error as `cause`.

## 6. Gate noisy logs and errors

Pass `loggerKey`, `errorKey`, or an explicit `gate` name to route noisy events through `settings.logging.gates`.

```js
generateError({
  caller: 'auth::login',
  reason: 'Failed login attempt',
  errorKey: 'AUTH_FAILED_LOGIN_ATTEMPT',
  gate: 'failedLoginAttemptsExample',
  context: { username }
});
```

```js
generateLog({
  level: 'info',
  caller: 'auth::login',
  loggerKey: 'successfulLogin',
  message: 'Successful login',
  context: { userId }
});
```

Gate fields:

- `enabled: false` suppresses the entry from every sink.
- `level` overrides the call's level before sink filtering.
- `console`, `file`, `http`, and `syslog` choose whether that sink can emit the entry.
- `curl` is accepted as an alias for `http` for older copied configs.

The `failedLoginAttemptsExample` gate is useful because repeated failed login attempts can spam `error` output. The `successfulLogin` gate is useful because successful login events can spam `info` output while still being handy during debugging.

## 7. Optional syslog sink

Use the `syslog` sink when a project needs to forward application logs to a syslog daemon, SIEM, node-local log collector, or platform log pipeline that accepts syslog input.

The sink emits RFC5424-shaped messages:

```text
<PRI>1 TIMESTAMP HOSTNAME APP-NAME PROCID MSGID STRUCTURED-DATA MESSAGE
```

The `MESSAGE` portion is JSON by default, preserving the same structured log entry used by the file and HTTP sinks. Set `format: 'text'` if the receiver expects plain text.

Supported transports:

- `protocol: 'udp'`: sends datagrams to `host:port`; default port is `514`.
- `protocol: 'tcp'`: sends over TCP with octet-counted framing by default.
- `protocol: 'tls'`: sends over TLS with octet-counted framing by default; default port is `6514` when no port is configured.

Common settings:

- `facility`: syslog facility name or numeric code. Use `local0` through `local7` for application logs unless your platform requires a different facility.
- `levels`: sink-level filter. Default is `['warn', 'error']`.
- `defaultSeverity`: fallback syslog severity for custom log levels that are not `debug`, `info`, `notice`, `warn`, `error`, `fatal`, or `panic`.
- `framing`: `octet-counted` or `newline`; applies to TCP/TLS only.
- `socketType`: `udp4` or `udp6`; applies to UDP only.
- `servername` and `tlsOptions`: optional TLS connection settings.

Syslog gate behavior matches the other sinks. If a gate omits `syslog`, the event may still be emitted to syslog when the sink is enabled and the level passes. Add `syslog: false` to high-volume gates that should not leave the process.

## 8. Add script commands to `package.json`

```json
{
  "scripts": {
    "error-add": "node error_gen.js --action add --error-file ./src/errors.json",
    "error-delete": "node error_gen.js --action delete --error-file ./src/errors.json",
    "error-rm": "node error_gen.js --action delete --error-file ./src/errors.json",
    "error-validate": "node error_gen.js --action validate --error-file ./src/errors.json"
  }
}
```

## 9. Manage error codes

Add a key:

```bash
npm run error-add -- --error-key ORDER_CREATE_FAILED
```

Delete a key:

```bash
npm run error-delete -- --error-key ORDER_CREATE_FAILED
```

Validate the map:

```bash
npm run error-validate
```

## 10. Optional environment variables

```env
ERROR_FILE_PATH=./src/errors.json

LOG_TEXT_FORMAT=[{$timestamp}] {$level} {$caller} {$message}

LOG_CONSOLE_ENABLED=true
LOG_CONSOLE_FORMAT=text
LOG_CONSOLE_LEVELS=info,warn,error,debug

LOG_FILE_ENABLED=false
LOG_FILE_FORMAT=json
LOG_FILE_PATH=./logs/app.jsonl
LOG_FILE_LEVELS=warn,error

LOG_HTTP_ENABLED=false
LOG_HTTP_URL=
LOG_HTTP_METHOD=POST
LOG_HTTP_TIMEOUT_MS=2500
LOG_HTTP_LEVELS=error
LOG_HTTP_HEADERS={"x-service-name":"orders-api"}

LOG_SYSLOG_ENABLED=false
LOG_SYSLOG_FORMAT=json
LOG_SYSLOG_PROTOCOL=udp
LOG_SYSLOG_HOST=localhost
LOG_SYSLOG_PORT=514
LOG_SYSLOG_FACILITY=local0
LOG_SYSLOG_APP_NAME=orders-api
LOG_SYSLOG_HOSTNAME=orders-api-01
LOG_SYSLOG_PROC_ID=
LOG_SYSLOG_MSG_ID=app-log
LOG_SYSLOG_DEFAULT_SEVERITY=info
LOG_SYSLOG_TIMEOUT_MS=2500
LOG_SYSLOG_FRAMING=octet-counted
LOG_SYSLOG_SOCKET_TYPE=udp4
LOG_SYSLOG_SERVERNAME=
LOG_SYSLOG_LEVELS=warn,error

LOG_K8S_METADATA_ENABLED=false
K8S_POD_NAME=
K8S_DEPLOYMENT=
K8S_NAMESPACE=
K8S_POD_IP=
K8S_POD_IPS=
K8S_NODE_NAME=
```

## Notes

- `generateLog` is for standard events.
- `generateError` creates structured error objects and logs them by default.
- `wrapError` is a convenience wrapper for bubbled errors and preserves the prior error chain.
- `errorKey` maps to `errorCode` through `errors.json`; fallback is `ERR_UNKNOWN` if present.
- HTTP headers may be configured as `headers` or `optionalHeaders` in settings, or as JSON in `LOG_HTTP_HEADERS`.
- Syslog is separate from HTTP/S ingestion. Use the `http` sink for HTTPS APIs and the `syslog` sink for syslog receivers.
