const WRAPPED = Symbol('probe_wrapped');

interface CallStackEntry {
    spanId: string;
    functionName: string;
    location: string;
    startTime: number;
    args: any[];
    parentSpanId?: string;
}

interface SpanRecord {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    name: string;
    location: string;
    startTime: number;
    endTime: number;
    duration: number;
    status: 'ok' | 'error';
    errorMessage?: string;
    args: string[];
    returnValue?: string;
    callerName?: string;
}

let currentTraceId: string | null = null;
const callStack: CallStackEntry[] = [];
const spanRecords: SpanRecord[] = [];
const MAX_SPANS = 10000;

function generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

function toStr(val: any): string {
    if (val === undefined) return '';
    if (val === null) return 'null';
    if (typeof val === 'string') return val.length > 500 ? val.slice(0, 500) + '...' : val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (typeof val === 'function') return `[Function ${val.name || 'anonymous'}]`;
    if (Array.isArray(val)) return `Array(${val.length})`;
    if (typeof val === 'object') {
        try {
            const s = JSON.stringify(val);
            return s.length > 500 ? s.slice(0, 500) + '...' : s;
        } catch {
            return '[unserializable]';
        }
    }
    return String(val);
}

function isPromiseLike(val: any): val is Promise<any> {
    return val && typeof val === 'object' && typeof val.then === 'function';
}

function getCurrentParent(): CallStackEntry | undefined {
    return callStack.length > 0 ? callStack[callStack.length - 1] : undefined;
}

function recordSpan(entry: CallStackEntry, endTime: number, status: 'ok' | 'error', returnValue?: any, errorMessage?: string): void {
    if (spanRecords.length >= MAX_SPANS) {
        spanRecords.splice(0, 1000);
    }

    const record: SpanRecord = {
        traceId: currentTraceId || generateId(),
        spanId: entry.spanId,
        parentSpanId: entry.parentSpanId,
        name: entry.functionName,
        location: entry.location,
        startTime: entry.startTime,
        endTime: endTime,
        duration: endTime - entry.startTime,
        status: status,
        args: entry.args.slice(0, 10).map(toStr),
        callerName: entry.parentSpanId ? callStack.find(e => e.spanId === entry.parentSpanId)?.functionName : undefined,
    };

    if (returnValue !== undefined) {
        record.returnValue = toStr(returnValue);
    }

    if (errorMessage) {
        record.errorMessage = errorMessage;
    }

    spanRecords.push(record);

    // Write to span.log immediately
    try {
        if (typeof process !== 'undefined' && process.cwd) {
            const fs = require('fs');
            const path = require('path');
            const logDir = path.join(process.cwd(), '.syncause');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            const logPath = path.join(logDir, 'span.log');
            fs.appendFileSync(logPath, JSON.stringify(record) + '\n');
        }
    } catch (e) {
        // Ignore file write errors during test runtime
    }
}

export function __probe_wrap<T extends (...args: any[]) => any>(
    fn: T,
    name: string,
    location: string = ''
): T {
    if ((fn as any)[WRAPPED]) return fn;

    const wrapped = function (this: any, ...args: any[]): any {
        if (!currentTraceId) {
            currentTraceId = generateId();
        }

        const parent = getCurrentParent();
        const entry: CallStackEntry = {
            spanId: generateId(),
            functionName: name,
            location: location,
            startTime: Date.now(),
            args: args,
            parentSpanId: parent?.spanId,
        };

        callStack.push(entry);

        try {
            const result = fn.apply(this, args);

            if (isPromiseLike(result)) {
                return result
                    .then((val) => {
                        const endTime = Date.now();
                        callStack.pop();
                        recordSpan(entry, endTime, 'ok', val);

                        if (callStack.length === 0) {
                            currentTraceId = null;
                        }
                        return val;
                    })
                    .catch((err) => {
                        const endTime = Date.now();
                        callStack.pop();
                        recordSpan(entry, endTime, 'error', undefined, String(err?.message || err));

                        if (callStack.length === 0) {
                            currentTraceId = null;
                        }
                        throw err;
                    });
            }

            const endTime = Date.now();
            callStack.pop();
            recordSpan(entry, endTime, 'ok', result);

            if (callStack.length === 0) {
                currentTraceId = null;
            }

            return result;
        } catch (err: any) {
            const endTime = Date.now();
            callStack.pop();
            recordSpan(entry, endTime, 'error', undefined, String(err?.message || err));

            if (callStack.length === 0) {
                currentTraceId = null;
            }
            throw err;
        }
    } as T;

    (wrapped as any)[WRAPPED] = true;
    Object.defineProperty(wrapped, 'name', { value: name, configurable: true });

    return wrapped;
}

export function __probe_enter(name: string, location: string, args: any[]): { spanId: string } {
    if (!currentTraceId) {
        currentTraceId = generateId();
    }

    const parent = getCurrentParent();
    const entry: CallStackEntry = {
        spanId: generateId(),
        functionName: name,
        location: location,
        startTime: Date.now(),
        args: args,
        parentSpanId: parent?.spanId,
    };

    callStack.push(entry);
    return { spanId: entry.spanId };
}

export function __probe_exit(spanId: string, returnValue?: any, error?: Error): void {
    const entryIndex = callStack.findIndex(e => e.spanId === spanId);
    if (entryIndex === -1) return;

    const entry = callStack[entryIndex];
    const endTime = Date.now();

    callStack.splice(entryIndex, 1);

    if (error) {
        recordSpan(entry, endTime, 'error', undefined, String(error?.message || error));
    } else {
        recordSpan(entry, endTime, 'ok', returnValue);
    }

    if (callStack.length === 0) {
        currentTraceId = null;
    }
}

export function getSpans(limit?: number): SpanRecord[] {
    const sorted = [...spanRecords].sort((a, b) => a.startTime - b.startTime);
    return limit ? sorted.slice(-limit) : sorted;
}

export function getSpansByTraceId(traceId: string): SpanRecord[] {
    return spanRecords.filter(s => s.traceId === traceId);
}

export function getTraces(limit?: number): Array<{ traceId: string; spans: SpanRecord[]; startTime: number }> {
    const traceMap = new Map<string, SpanRecord[]>();

    for (const span of spanRecords) {
        const existing = traceMap.get(span.traceId) || [];
        existing.push(span);
        traceMap.set(span.traceId, existing);
    }

    const traces = Array.from(traceMap.entries()).map(([traceId, spans]) => ({
        traceId,
        spans: spans.sort((a, b) => a.startTime - b.startTime),
        startTime: Math.min(...spans.map(s => s.startTime)),
    }));

    traces.sort((a, b) => b.startTime - a.startTime);

    return limit ? traces.slice(0, limit) : traces;
}

export function getCallTree(traceId: string): any {
    const spans = getSpansByTraceId(traceId);
    if (spans.length === 0) return null;

    const spanMap = new Map<string, SpanRecord & { children: any[] }>();
    const roots: any[] = [];

    for (const span of spans) {
        spanMap.set(span.spanId, { ...span, children: [] });
    }

    for (const span of spans) {
        const node = spanMap.get(span.spanId)!;
        if (span.parentSpanId && spanMap.has(span.parentSpanId)) {
            spanMap.get(span.parentSpanId)!.children.push(node);
        } else {
            roots.push(node);
        }
    }

    return roots.length === 1 ? roots[0] : roots;
}

export function clearSpans(): void {
    spanRecords.length = 0;
    callStack.length = 0;
    currentTraceId = null;
}

export function getStats(): {
    totalSpans: number;
    totalTraces: number;
    averageDuration: number;
} {
    const traceIds = new Set(spanRecords.map(s => s.traceId));
    const durations = spanRecords.map(s => s.duration);

    return {
        totalSpans: spanRecords.length,
        totalTraces: traceIds.size,
        averageDuration: durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : 0,
    };
}

export function formatCallTree(traceId: string, indent: string = ''): string {
    const tree = getCallTree(traceId);
    if (!tree) return 'No trace found';

    function formatNode(node: any, prefix: string): string {
        const status = node.status === 'error' ? ' [ERROR]' : '';
        const duration = `${node.duration}ms`;
        let line = `${prefix}${node.name} (${duration})${status}`;

        if (node.args && node.args.length > 0) {
            line += ` args: [${node.args.join(', ')}]`;
        }

        if (node.returnValue) {
            line += ` => ${node.returnValue}`;
        }

        const lines = [line];

        if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                const isLast = i === node.children.length - 1;
                const childPrefix = prefix + (isLast ? '  ' : '| ');
                const connector = isLast ? '`-' : '|-';
                lines.push(formatNode(node.children[i], prefix + connector));
            }
        }

        return lines.join('\n');
    }

    if (Array.isArray(tree)) {
        return tree.map(t => formatNode(t, '')).join('\n\n');
    }

    return formatNode(tree, '');
}

if (typeof global !== 'undefined') {
    (global as any).__probe_wrap = __probe_wrap;
    (global as any).__probe_enter = __probe_enter;
    (global as any).__probe_exit = __probe_exit;
    (global as any).__probe_getSpans = getSpans;
    (global as any).__probe_getTraces = getTraces;
    (global as any).__probe_clearSpans = clearSpans;
    (global as any).__probe_formatCallTree = formatCallTree;
}
