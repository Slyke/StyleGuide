'use strict';

const assert = require('assert');
const { EventEmitter } = require('events');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { debugAndErrors } = require('./logger');

const dumpFile = path.join(__dirname, 'logger-test-output.jsonl');
const httpRequests = [];
const capturedConsole = {
  log: [],
  warn: [],
  error: []
};

const wait = ({ ms }) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const readDump = () => {
  if (!fs.existsSync(dumpFile)) {
    return [];
  }

  return fs.readFileSync(dumpFile, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
};

const withCapturedConsole = async (fn) => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  };

  console.log = (message) => capturedConsole.log.push(String(message));
  console.warn = (message) => capturedConsole.warn.push(String(message));
  console.error = (message) => capturedConsole.error.push(String(message));

  try {
    await fn();
  } finally {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
};

const withCapturedHttpRequests = async (fn) => {
  const originalRequest = http.request;

  http.request = (options, callback) => {
    const request = new EventEmitter();

    request.end = (payload) => {
      process.nextTick(() => {
        httpRequests.push({
          method: options.method,
          hostname: options.hostname,
          port: options.port,
          path: options.path,
          timeout: options.timeout,
          headers: options.headers,
          body: JSON.parse(payload)
        });

        if (callback) {
          callback({ resume: () => {} });
        }
      });
    };
    request.destroy = () => {};

    return request;
  };

  try {
    await fn();
  } finally {
    http.request = originalRequest;
  }
};

const main = async () => {
  fs.rmSync(dumpFile, { force: true });

  await withCapturedHttpRequests(async () => {
    await withCapturedConsole(async () => {
      const { generateLog, generateError, wrapError } = debugAndErrors({
        settings: {
          logging: {
            logTextFormat: '[{$timestamp}] {$level} {$caller} {$loggerKey} {$message}',
            sinks: {
              console: {
                enabled: true,
                format: 'text',
                levels: ['warn', 'error']
              },
              file: {
                enabled: true,
                format: 'json',
                path: dumpFile,
                levels: []
              },
              http: {
                enabled: true,
                format: 'json',
                url: 'http://localhost:8080/logs',
                method: 'POST',
                timeoutMs: 2500,
                levels: ['warn', 'error'],
                optionalHeaders: {
                  'x-logger-test': 'optional-header',
                  'x-logger-number': 8080
                }
              }
            },
            gates: {
              failedLoginAttemptsExample: {
                level: 'warn',
                console: true,
                file: true,
                http: true
              },
              successfulLogin: {
                level: 'info',
                console: false,
                file: false,
                http: false
              },
              curlAliasExample: {
                level: 'error',
                console: false,
                file: false,
                curl: true
              },
              disabledExample: {
                enabled: false
              }
            }
          }
        },
        errorCodeMap: {
          AUTH_FAILED_LOGIN_ATTEMPT: '111111111111111F',
          WRAPPED_ROUTE_FAILED: '222222222222222E',
          ERR_UNKNOWN: 'FFFFFFFFFFFFFFF1'
        }
      });

      generateLog({
        level: 'debug',
        caller: 'test::debug',
        loggerKey: 'DEBUG_FILE_ONLY',
        message: 'debug is file-only because console and http filter it'
      });

      generateLog({
        level: 'info',
        caller: 'auth::login',
        loggerKey: 'successfulLogin',
        message: 'successful login should be gated off',
        context: { userId: 'user-1' }
      });

      generateError({
        caller: 'auth::login',
        reason: 'Failed login attempt',
        errorKey: 'AUTH_FAILED_LOGIN_ATTEMPT',
        gate: 'failedLoginAttemptsExample',
        context: { username: 'demo@example.test' }
      });

      generateLog({
        level: 'info',
        caller: 'test::curlAlias',
        loggerKey: 'curlAliasExample',
        message: 'curl gate alias sends this only to http'
      });

      generateLog({
        level: 'error',
        caller: 'test::disabled',
        loggerKey: 'disabledExample',
        message: 'disabled gate suppresses every sink'
      });

      const wrapped = wrapError({
        caller: 'routes::wrapped',
        reason: 'Wrapped route failed',
        errorKey: 'WRAPPED_ROUTE_FAILED',
        err: new Error('original failure'),
        includeStackTrace: false,
        correlationId: 'corr-123'
      });

      assert.strictEqual(wrapped.name, 'StructuredError');
      assert.strictEqual(wrapped.errorCode, '222222222222222E');
      assert.strictEqual(wrapped.cause.message, 'original failure');
    });

    await wait({ ms: 200 });
  });

  const dump = readDump();
  const fileKeys = dump.map((entry) => entry.loggerKey);
  const httpKeys = httpRequests.map((request) => request.body.loggerKey);

  assert.deepStrictEqual(fileKeys, [
    'DEBUG_FILE_ONLY',
    'AUTH_FAILED_LOGIN_ATTEMPT',
    'WRAPPED_ROUTE_FAILED'
  ]);
  assert.deepStrictEqual(httpKeys.sort(), [
    'AUTH_FAILED_LOGIN_ATTEMPT',
    'WRAPPED_ROUTE_FAILED',
    'curlAliasExample'
  ].sort());

  const failedLogin = dump.find((entry) => entry.loggerKey === 'AUTH_FAILED_LOGIN_ATTEMPT');
  assert.strictEqual(failedLogin.level, 'warn');
  assert.strictEqual(failedLogin.error.errorCode, '111111111111111F');
  assert.strictEqual(failedLogin.gate, undefined);

  assert.strictEqual(capturedConsole.log.length, 0);
  assert.strictEqual(capturedConsole.warn.length, 1);
  assert.strictEqual(capturedConsole.error.length, 1);
  assert.match(capturedConsole.warn[0], /WARN auth::login AUTH_FAILED_LOGIN_ATTEMPT Failed login attempt/);
  assert.match(capturedConsole.error[0], /ERROR routes::wrapped WRAPPED_ROUTE_FAILED Wrapped route failed/);

  for (const request of httpRequests) {
    assert.strictEqual(request.method, 'POST');
    assert.strictEqual(request.hostname, 'localhost');
    assert.strictEqual(request.port, '8080');
    assert.strictEqual(request.path, '/logs');
    assert.strictEqual(request.headers['x-logger-test'], 'optional-header');
    assert.strictEqual(request.headers['x-logger-number'], '8080');
  }

  console.log(`logger test passed; dump written to ${dumpFile}`);
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
