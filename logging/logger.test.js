'use strict';

const assert = require('assert');
const dgram = require('dgram');
const { EventEmitter } = require('events');
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');
const { debugAndErrors } = require('./logger');

const dumpFile = path.join(__dirname, 'logger-test-output.jsonl');
const httpRequests = [];
const syslogPackets = [];
const syslogStreams = [];
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

const withCapturedSyslogPackets = async (fn) => {
  const originalCreateSocket = dgram.createSocket;

  dgram.createSocket = (socketType) => {
    const socket = new EventEmitter();

    socket.send = (payload, port, host, callback) => {
      process.nextTick(() => {
        syslogPackets.push({
          socketType,
          port,
          host,
          body: Buffer.isBuffer(payload) ? payload.toString('utf8') : String(payload)
        });

        if (callback) {
          callback(null);
        }
      });
    };
    socket.close = () => {};

    return socket;
  };

  try {
    await fn();
  } finally {
    dgram.createSocket = originalCreateSocket;
  }
};

const withCapturedSyslogStreams = async (fn) => {
  const originalCreateConnection = net.createConnection;

  net.createConnection = (options, callback) => {
    const connection = new EventEmitter();

    connection.setTimeout = (timeoutMs) => {
      connection.timeoutMs = timeoutMs;
    };
    connection.end = (payload) => {
      syslogStreams.push({
        options,
        timeoutMs: connection.timeoutMs,
        payload
      });
    };
    connection.destroy = () => {};

    process.nextTick(() => {
      if (callback) {
        callback();
      }
    });

    return connection;
  };

  try {
    await fn();
  } finally {
    net.createConnection = originalCreateConnection;
  }
};

const main = async () => {
  fs.rmSync(dumpFile, { force: true });

  await withCapturedSyslogPackets(async () => {
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
                },
                syslog: {
                  enabled: true,
                  format: 'json',
                  protocol: 'udp',
                  host: 'logs.example.test',
                  port: 5514,
                  facility: 'local4',
                  appName: 'styleguide-test',
                  hostname: 'app-01',
                  procId: 'test-process',
                  msgId: 'test-log',
                  levels: ['warn', 'error']
                }
              },
              gates: {
                failedLoginAttemptsExample: {
                  level: 'warn',
                  console: true,
                  file: true,
                  http: true,
                  syslog: true
                },
                successfulLogin: {
                  level: 'info',
                  console: false,
                  file: false,
                  http: false,
                  syslog: false
                },
                curlAliasExample: {
                  level: 'error',
                  console: false,
                  file: false,
                  syslog: false,
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
          message: 'debug is file-only because console, http, and syslog filter it'
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
  });

  const dump = readDump();
  const fileKeys = dump.map((entry) => entry.loggerKey);
  const httpKeys = httpRequests.map((request) => request.body.loggerKey);
  const syslogEntries = syslogPackets.map((packet) => JSON.parse(packet.body.slice(packet.body.indexOf('{'))));
  const syslogKeys = syslogEntries.map((entry) => entry.loggerKey);

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
  assert.deepStrictEqual(syslogKeys.sort(), [
    'AUTH_FAILED_LOGIN_ATTEMPT',
    'WRAPPED_ROUTE_FAILED'
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

  for (const packet of syslogPackets) {
    assert.strictEqual(packet.socketType, 'udp4');
    assert.strictEqual(packet.host, 'logs.example.test');
    assert.strictEqual(packet.port, 5514);
    assert.match(packet.body, /^<16[34]>1 \S+ app-01 styleguide-test test-process test-log \[log /);
    assert.match(packet.body, /loggerKey="(AUTH_FAILED_LOGIN_ATTEMPT|WRAPPED_ROUTE_FAILED)"/);
  }

  await withCapturedSyslogStreams(async () => {
    const { generateLog } = debugAndErrors({
      settings: {
        logging: {
          logTextFormat: '[{$timestamp}] {$level} {$caller} {$loggerKey} {$message}',
          sinks: {
            console: { enabled: false },
            syslog: {
              enabled: true,
              format: 'text',
              protocol: 'tcp',
              host: 'logs.example.test',
              port: 5515,
              facility: 'local0',
              appName: 'stream-test',
              hostname: 'app-02',
              procId: 'stream-process',
              msgId: 'stream-log',
              timeoutMs: 1234,
              levels: ['error']
            }
          }
        }
      }
    });

    generateLog({
      level: 'error',
      caller: 'test::syslogTcp',
      loggerKey: 'SYSLOG_TCP',
      message: 'tcp syslog'
    });

    await wait({ ms: 20 });
  });

  assert.strictEqual(syslogStreams.length, 1);
  assert.deepStrictEqual(syslogStreams[0].options, {
    host: 'logs.example.test',
    port: 5515
  });
  assert.strictEqual(syslogStreams[0].timeoutMs, 1234);

  const frameMatch = /^(\d+) (.*)$/.exec(syslogStreams[0].payload);
  assert.ok(frameMatch);
  assert.strictEqual(Number(frameMatch[1]), Buffer.byteLength(frameMatch[2]));
  assert.match(frameMatch[2], /^<131>1 \S+ app-02 stream-test stream-process stream-log \[log /);
  assert.match(frameMatch[2], /loggerKey="SYSLOG_TCP"/);
  assert.match(frameMatch[2], /ERROR test::syslogTcp SYSLOG_TCP tcp syslog$/);

  console.log(`logger test passed; dump written to ${dumpFile}`);
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
