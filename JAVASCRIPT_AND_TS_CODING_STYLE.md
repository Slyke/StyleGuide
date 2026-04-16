# Coding Style

## Function Definitions

Prefer arrow function assignments over `function` declarations.

Use object-shaped parameters.

```js
const funcName = ({ param1, param2 }) => {
  // ...
};
```

## Wrapped Logic Checks

When a boolean condition wraps across lines, put the operator at the front of the continued line.

```js
if (
  conditionA
  && conditionB
  && conditionC
) {
  // ...
}
```

## Line Length

Do not wrap lines just to satisfy an artificially short width.

Keep straightforward assignments on one line when they remain readable.

```js
element.textContent = "Open a Reddit tab to view or change its account routing.";
```

## Explicit Grouping

If an expression combines multiple conditional or fallback operations, add parentheses to make evaluation order explicit.

This applies to nested ternaries and to mixed chains involving operators like `??`, `||`, `&&`, `===`, and similar operators when grouping is not immediately obvious.

```js
const label = primaryCondition
  ? primaryValue
  : (
    secondaryCondition
      ? secondaryValue
      : fallbackValue
  );

const resolvedValue = (input ?? fallback) === expectedValue;
const routeTarget = explicitTarget ?? (ruleTarget || defaultTarget);
```

## Nullish Fallbacks

Prefer `??` over `||` when the intent is to fall back only for `null` or `undefined`.

Keep `||` only when other falsey values should also trigger the fallback.

```js
const tabUrl = tab?.url ?? "";
```

## Promises And Async Failure Paths

When settling a `Promise` or promise-like flow, always return immediately after calling `resolve`, `reject`, or an equivalent completion callback unless the remaining code is deliberately meant to run after settlement.

This applies to `Promise` executors, callbacks inside a `Promise`, deferred-style helpers, and any wrapper that completes asynchronous work. Returning prevents the callback from continuing into later logic after the operation has already been settled.

Make async failure ownership obvious. An `await` does not need a local `try/catch` when the caller deliberately owns the failure path, but fire-and-forget work must attach a visible `.catch(...)` that logs or handles the error. Use local `try/catch` when the current function can add useful context, convert the error to a structured error, recover, or clean up.

Consider adding structured error and logging gates where appropriate, especially around callback failures or high-volume success events.

```ts
await new Promise<void>((resolve, reject) => {
  somethingAsync({ param }, (err) => {
    if (err) {
      generateError({
        caller: "asyncWork::run",
        reason: "Async work failed.",
        errorKey: "ASYNC_WORK_FAILED",
        gate: "failedAsyncWork",
        err,
        includeStackTrace: false,
        correlationId,
        context: {
          param
        }
      });

      return reject(err);
    }

    generateLog({
      level: "info",
      caller: "asyncWork::run",
      loggerKey: "ASYNC_WORK_SUCCEEDED",
      gate: "successfulAsyncWork",
      message: "Async work completed.",
      correlationId,
      context: {
        param
      }
    });

    return resolve();
  });
});

void runBackgroundTask().catch((err) => {
  generateError({
    caller: "backgroundTask::timer",
    reason: "Background task failed.",
    errorKey: "BACKGROUND_TASK_FAILED",
    err,
    correlationId
  });
});
```

## JSON

Prefer JSON5 for human-authored project config, local data, fixtures, and translation source files when the project controls the parser.

Use `.json5` extensions for files containing comments, trailing commas, unquoted keys, single quotes, or multiline strings.

Do not use JSON5 syntax in tool-owned or standards-required JSON files such as `package.json`, `package-lock.json`, generated manifests, API payloads, public JSON endpoints, or files consumed directly by third-party tools unless that tool explicitly supports JSON5.

For frontend translation files, JSON5 may be used as the source format, but emit or bundle strict JSON/JS objects for runtime if needed.

After parsing JSON5 config, validate the result with the project’s schema/type validator.
