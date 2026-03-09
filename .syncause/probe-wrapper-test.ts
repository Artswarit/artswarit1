/**
 * probe-wrapper-test.ts - Test version of probe-wrapper with file logging
 * 
 * This version writes spans to .syncause/span.log file for unit test tracing.
 * Use this file instead of probe-wrapper.ts when running unit tests with trace generation.
 */

import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import * as fs from 'fs';
import * as path from 'path';

// Span log file path
const SPAN_LOG_PATH = path.join(process.cwd(), '.syncause', 'span.log');

// Ensure .syncause directory exists
function ensureLogDir() {
    const dir = path.dirname(SPAN_LOG_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Write span to log file (new format)
function logSpan(spanData: Record<string, any>) {
    try {
        ensureLogDir();
        const logLine = JSON.stringify(spanData) + '\n';
        fs.appendFileSync(SPAN_LOG_PATH, logLine);
    } catch (e) {
        // Ignore log errors
    }
}

// Get tracer on each call - ensures we use the active TracerProvider
// even if the SDK was initialized after this module was loaded
function getTracer() {
    return trace.getTracer('probe-wrapper-test');
}

const WRAPPED = Symbol('probe_wrapped_test');

/**
 * Check if the value is a Promise-like object
 */
function isPromiseLike(val: any): val is Promise<any> {
    return val && typeof val === 'object' && typeof val.then === 'function';
}

/**
 * Convert the value to a string (used for span attributes)
 */
function toStr(val: any): string {
    if (val === undefined) return '';
    if (val === null) return 'null';
    if (typeof val === 'string') return val.length > 1000 ? val.slice(0, 1000) + '...' : val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) return `Array(${val.length})`;
    if (typeof val === 'object') {
        try {
            const s = JSON.stringify(val);
            return s.length > 1000 ? s.slice(0, 1000) + '...' : s;
        } catch {
            return '[unserializable]';
        }
    }
    return String(val);
}

/**
 * Wrap a function for tracing (with file logging)
 */
function wrapFunction(fn: Function, spanName: string, filePath?: string, lineNumber?: string): Function {
    if ((fn as any)[WRAPPED]) return fn;

    const wrapped = function (this: any, ...args: any[]) {
        // Get nanosecond precision timestamps
        const startEpochNanos = BigInt(Date.now()) * BigInt(1_000_000);
        const span = getTracer().startSpan(spanName);
        const spanContext = (span as any).spanContext?.();
        const traceId = spanContext?.traceId || '';

        // Build attributes object
        const attributes: Record<string, any> = {
            'function.name': spanName,
            'function.type': 'user_function',
        };

        // Add file and line info if available
        if (filePath) {
            attributes['file'] = filePath;
        }
        if (lineNumber) {
            attributes['line'] = lineNumber;
        }

        // Record arguments (up to 10)
        const maxArgs = Math.min(args.length, 10);
        for (let i = 0; i < maxArgs; i++) {
            attributes[`function.args.${i}`] = toStr(args[i]);
            span.setAttribute(`function.args.${i}`, toStr(args[i]));
        }

        span.setAttribute('function.name', spanName);
        span.setAttribute('function.type', 'user_function');

        const ctx = trace.setSpan(context.active(), span);

        // Calculate call depth (level) - default to 1
        const level = 1;

        // Helper to create new format span log
        const createSpanLog = (statusCode: string, description: string, returnValue?: string) => {
            const endEpochNanos = BigInt(Date.now()) * BigInt(1_000_000);

            if (returnValue !== undefined) {
                attributes['function.return.value'] = returnValue;
            }

            return {
                name: spanName,
                level,
                startEpochNanos: startEpochNanos.toString(),
                endEpochNanos: endEpochNanos.toString(),
                statusData: {
                    statusCode,
                    description,
                },
                attributes,
                traceId,
            };
        };

        try {
            const res = context.with(ctx, () => fn.apply(this, args));

            if (isPromiseLike(res)) {
                return res
                    .then((val) => {
                        span.setAttribute('function.return.value', toStr(val));
                        span.setStatus({ code: SpanStatusCode.OK });
                        logSpan(createSpanLog('OK', '', toStr(val)));
                        span.end();
                        return val;
                    })
                    .catch((err) => {
                        span.recordException(err);
                        span.setStatus({ code: SpanStatusCode.ERROR, message: String(err?.message || err) });
                        logSpan(createSpanLog('ERROR', String(err?.message || err)));
                        span.end();
                        throw err;
                    });
            }

            span.setAttribute('function.return.value', toStr(res));
            span.setStatus({ code: SpanStatusCode.OK });
            logSpan(createSpanLog('OK', '', toStr(res)));
            span.end();
            return res;
        } catch (err: any) {
            span.recordException(err);
            span.setStatus({ code: SpanStatusCode.ERROR, message: String(err?.message || err) });
            logSpan(createSpanLog('ERROR', String(err?.message || err)));
            span.end();
            throw err;
        }
    };

    (wrapped as any)[WRAPPED] = true;
    return wrapped;
}

/**
 * Manually wrap a function for tracing (with file logging)
 */
export function wrapUserFunction<T extends (...args: any[]) => any>(fn: T, name?: string): T {
    const spanName = name || fn.name || 'anonymous';
    return wrapFunction(fn, spanName) as T;
}

/**
 * Wrap all methods on an object (with file logging)
 */
export function wrapUserModule<T extends object>(obj: T, prefix?: string): T {
    const moduleName = prefix || 'module';

    for (const key of Object.keys(obj)) {
        const val = (obj as any)[key];
        if (typeof val === 'function' && !(val as any)[WRAPPED]) {
            (obj as any)[key] = wrapFunction(val, `${moduleName}.${key}`);
        }
    }

    return obj;
}

/**
 * Create a traced async function (with file logging)
 */
export function traced<T extends (...args: any[]) => Promise<any>>(fn: T, name?: string): T {
    const spanName = name || fn.name || 'tracedAsync';
    return wrapFunction(fn, spanName) as T;
}
