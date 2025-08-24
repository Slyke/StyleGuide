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
