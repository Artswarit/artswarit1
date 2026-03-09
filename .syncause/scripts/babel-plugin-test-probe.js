/**
 * babel-plugin-test-probe.js - Universal Test Probe Babel Plugin
 * 
 * Automatically instruments ALL functions for tracing in unit tests.
 * Supports: Jest, Vitest, Mocha, AVA, Jasmine, Tape, and any other test framework.
 * 
 * Features:
 * 1. Wraps ALL function types: FunctionDeclaration, ArrowFunction, FunctionExpression
 * 2. Tracks nested function calls (parent-child span relationships)
 * 3. Zero-config for most test frameworks
 * 4. Supports both JS and TS projects
 * 5. Preserves source maps and stack traces
 */

const nodePath = require('path');

// Minimal exclusions - only exclude things that would break
const EXCLUDE_FUNCTIONS = new Set([
    // Built-in object methods
    'constructor', 'toString', 'valueOf', 'toJSON',
    // Common problematic names
    '__esModule',
]);

// Test framework specific functions to exclude (they're already instrumented by frameworks)
const TEST_FRAMEWORK_FUNCTIONS = new Set([
    // Jest
    'describe', 'it', 'test', 'beforeAll', 'afterAll', 'beforeEach', 'afterEach',
    'expect', 'jest',
    // Mocha
    'suite', 'suiteSetup', 'suiteTeardown', 'setup', 'teardown',
    // Jasmine
    'jasmine', 'spyOn', 'spyOnProperty',
    // AVA
    'serial', 'only', 'skip', 'todo', 'failing',
    // Vitest
    'vi', 'vitest',
    // Tape
    'tape',
]);

// Check if identifier looks like a React hook
function isReactHook(name) {
    return /^use[A-Z]/.test(name);
}

// Check if this is likely a React component (PascalCase + returns JSX)
function isLikelyReactComponent(name) {
    return /^[A-Z]/.test(name);
}

function shouldWrapFunction(name, path, state) {
    if (!name) return true; // Anonymous functions should be wrapped

    // Skip excluded functions
    if (EXCLUDE_FUNCTIONS.has(name)) return false;

    // Skip test framework functions
    if (TEST_FRAMEWORK_FUNCTIONS.has(name)) return false;

    // Skip React hooks
    if (isReactHook(name)) return false;

    // Skip if already wrapped (prevent double wrapping)
    if (name.startsWith('__probe_')) return false;

    // Option to skip React components
    if (state.opts.skipReactComponents && isLikelyReactComponent(name)) {
        return false;
    }

    return true;
}

/**
 * Check if function is inside a Jest mock call (jest.mock, jest.fn, jest.spyOn)
 * These should not be wrapped as they have special initialization timing
 */
function isInsideJestMock(path) {
    let parent = path.parentPath;
    let depth = 0;
    const maxDepth = 10; // Limit search depth

    while (parent && depth < maxDepth) {
        const node = parent.node;

        // Check for jest.mock(), jest.fn(), jest.spyOn(), vi.fn(), vi.mock()
        if (node.type === 'CallExpression') {
            const callee = node.callee;

            // Check for jest.mock, jest.fn, jest.spyOn pattern
            if (callee.type === 'MemberExpression' && callee.object) {
                const objName = callee.object.type === 'Identifier' ? callee.object.name : null;
                const propName = callee.property && callee.property.type === 'Identifier'
                    ? callee.property.name : null;

                // Jest patterns
                if (objName === 'jest' && ['mock', 'fn', 'spyOn', 'doMock', 'unmock'].includes(propName)) {
                    return true;
                }

                // Vitest patterns
                if (objName === 'vi' && ['mock', 'fn', 'spyOn', 'hoisted'].includes(propName)) {
                    return true;
                }
            }

            // Check for direct fn() or mock() calls
            if (callee.type === 'Identifier') {
                const callName = callee.name;
                if (['mock', 'unmock', 'doMock'].includes(callName)) {
                    return true;
                }
            }
        }

        parent = parent.parentPath;
        depth++;
    }

    return false;
}

function matches(pattern, pathStr) {
    if (pattern instanceof RegExp) return pattern.test(pathStr);
    if (typeof pattern === 'string') return pathStr.includes(pattern);
    return false;
}

function hasMatch(patterns, pathStr) {
    if (!patterns || patterns.length === 0) return false;
    const patternArr = Array.isArray(patterns) ? patterns : [patterns];
    return patternArr.some(p => matches(p, pathStr));
}

/**
 * Get the function name from various AST node types
 */
function getFunctionName(path) {
    const node = path.node;

    // FunctionDeclaration with id
    if (node.id && node.id.name) {
        return node.id.name;
    }

    // Variable declarator: const foo = () => {}
    if (path.parent && path.parent.type === 'VariableDeclarator' && path.parent.id) {
        if (path.parent.id.type === 'Identifier') {
            return path.parent.id.name;
        }
    }

    // Object property: { foo: () => {} }
    if (path.parent && path.parent.type === 'ObjectProperty' && path.parent.key) {
        if (path.parent.key.type === 'Identifier') {
            return path.parent.key.name;
        }
        if (path.parent.key.type === 'StringLiteral') {
            return path.parent.key.value;
        }
    }

    // Class method: class Foo { bar() {} }
    if (path.parent && path.parent.type === 'ClassMethod' && path.parent.key) {
        if (path.parent.key.type === 'Identifier') {
            return path.parent.key.name;
        }
    }

    // Assignment expression: foo = () => {}
    if (path.parent && path.parent.type === 'AssignmentExpression' && path.parent.left) {
        if (path.parent.left.type === 'Identifier') {
            return path.parent.left.name;
        }
        if (path.parent.left.type === 'MemberExpression' && path.parent.left.property) {
            if (path.parent.left.property.type === 'Identifier') {
                return path.parent.left.property.name;
            }
        }
    }

    // Export default: export default () => {}
    if (path.parent && path.parent.type === 'ExportDefaultDeclaration') {
        return 'default';
    }

    return null;
}

/**
 * Get source location info for better debugging
 */
function getLocationInfo(path, state) {
    const loc = path.node.loc;
    const filename = state.filename || 'unknown';
    const relativePath = nodePath.relative(process.cwd(), filename).replace(/\\/g, '/');

    if (loc) {
        return `${relativePath}:${loc.start.line}:${loc.start.column}`;
    }
    return relativePath;
}

module.exports = function (api, options = {}) {
    const t = api.types;

    // Cache based on options
    api.cache.using(() => JSON.stringify(options));

    const {
        // File extension filter
        test = /\.(ts|tsx|js|jsx|mjs|cjs)$/,

        // Include patterns (default: include all)
        include = [],

        // Exclude patterns
        exclude = ['/node_modules/', '/.git/', '/dist/', '/build/', '/coverage/'],

        // Runtime import path
        runtimePath = 'test-probe-runtime',

        // Whether to skip React components
        skipReactComponents = false,

        // Whether to wrap anonymous functions
        wrapAnonymous = true,

        // Whether to add source location to span names
        includeLocation = true,

        // Debug mode - log wrapped functions
        debug = false,
    } = options;

    function shouldProcessFile(filename) {
        if (!filename) return false;

        // Normalize filename to use forward slashes for consistent matching
        const normalizedFilename = filename.replace(/\\/g, '/');

        // Check extension
        if (test && !matches(test, normalizedFilename)) return false;

        // Check exclude patterns
        if (hasMatch(exclude, normalizedFilename)) return false;

        // Check include patterns (if specified, file must match)
        if (include && include.length > 0 && !hasMatch(include, normalizedFilename)) {
            return false;
        }

        return true;
    }

    /**
     * Create the wrapper call expression
     * __probe_wrap(originalFn, "functionName", "location")
     */
    function createWrapperCall(fnExpr, name, location) {
        const args = [
            fnExpr,
            t.stringLiteral(name || 'anonymous'),
        ];

        if (includeLocation && location) {
            args.push(t.stringLiteral(location));
        }

        return t.callExpression(
            t.identifier('__probe_wrap'),
            args
        );
    }

    /**
     * Transform a function body to use the probe wrapper
     * This is an alternative approach that wraps at call time
     */
    function wrapFunctionBody(path, state, fnName) {
        const body = path.get('body');

        // Skip if body is not a block statement (single expression arrow functions)
        if (!body.isBlockStatement()) {
            return false;
        }

        const location = getLocationInfo(path, state);

        // Inject __probe_enter at the start and __probe_exit at returns
        const enterCall = t.expressionStatement(
            t.callExpression(
                t.identifier('__probe_enter'),
                [
                    t.stringLiteral(fnName || 'anonymous'),
                    t.stringLiteral(location),
                    t.identifier('arguments'),
                ]
            )
        );

        body.unshiftContainer('body', enterCall);

        return true;
    }

    return {
        name: 'babel-plugin-test-probe',

        visitor: {
            Program: {
                enter(path, state) {
                    const filename = state.filename || (state.file && state.file.opts.filename);

                    if (!shouldProcessFile(filename)) {
                        state.skipProcessing = true;
                        return;
                    }

                    const relativePath = nodePath.relative(process.cwd(), filename).replace(/\\/g, '/');

                    if (debug) {
                        console.log(`[test-probe] Processing: ${relativePath}`);
                    }

                    state.wrappedFunctions = [];
                    state.needsImport = false;
                    state.relativePath = relativePath;
                },

                exit(path, state) {
                    if (state.skipProcessing) return;

                    if (state.needsImport && state.wrappedFunctions.length > 0) {
                        // Add import for the runtime
                        const importDecl = t.importDeclaration(
                            [
                                t.importSpecifier(
                                    t.identifier('__probe_wrap'),
                                    t.identifier('__probe_wrap')
                                ),
                            ],
                            t.stringLiteral(runtimePath)
                        );

                        // Find the right place to insert (after 'use strict' or directives)
                        const body = path.get('body');
                        let insertIndex = 0;

                        for (let i = 0; i < body.length; i++) {
                            const node = body[i].node;
                            if (t.isExpressionStatement(node) && t.isStringLiteral(node.expression)) {
                                // This is a directive like 'use strict'
                                insertIndex = i + 1;
                            } else if (t.isImportDeclaration(node)) {
                                // Put after existing imports
                                insertIndex = i + 1;
                            } else {
                                break;
                            }
                        }

                        path.node.body.splice(insertIndex, 0, importDecl);

                        if (debug) {
                            console.log(`[test-probe] Wrapped ${state.wrappedFunctions.length} functions in ${state.relativePath}:`);
                            console.log(`  ${state.wrappedFunctions.join(', ')}`);
                        }
                    }
                }
            },

            // Handle all function types
            'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path, state) {
                if (state.skipProcessing) return;

                // Skip if already wrapped
                if (path.node.__probeWrapped) return;

                const fnName = getFunctionName(path);

                // Check if should wrap
                if (!shouldWrapFunction(fnName, path, state)) return;

                // Skip functions inside jest.mock(), jest.fn(), etc.
                if (isInsideJestMock(path)) return;

                // Skip anonymous if option is disabled
                if (!fnName && !wrapAnonymous) return;

                const location = getLocationInfo(path, state);
                const displayName = fnName || `anonymous@${location}`;

                // Mark as wrapped to prevent infinite loops
                path.node.__probeWrapped = true;

                // For FunctionDeclaration, we need special handling
                if (path.isFunctionDeclaration()) {
                    // Transform: function foo() {} 
                    // To: function __probe_foo() {} const foo = __probe_wrap(__probe_foo, 'foo');

                    if (!fnName) return; // Function declarations must have names

                    const internalName = `__probe_${fnName}`;
                    const originalId = path.node.id;

                    // Rename the original function
                    path.node.id = t.identifier(internalName);

                    // Create the wrapper
                    const wrapperDecl = t.variableDeclaration('const', [
                        t.variableDeclarator(
                            t.identifier(fnName),
                            createWrapperCall(t.identifier(internalName), fnName, location)
                        )
                    ]);

                    // Handle exports
                    if (path.parent.type === 'ExportNamedDeclaration') {
                        // export function foo() {} -> function __probe_foo() {} export const foo = ...
                        const exportDecl = t.exportNamedDeclaration(wrapperDecl, []);
                        path.parentPath.replaceWithMultiple([path.node, exportDecl]);
                    } else if (path.parent.type === 'ExportDefaultDeclaration') {
                        // export default function foo() {} -> function __probe_foo() {} export default foo;
                        const defaultExport = t.exportDefaultDeclaration(t.identifier(fnName));
                        path.parentPath.replaceWithMultiple([path.node, wrapperDecl, defaultExport]);
                    } else {
                        // Regular function declaration
                        path.insertAfter(wrapperDecl);
                    }

                    state.wrappedFunctions.push(fnName);
                    state.needsImport = true;
                    return;
                }

                // For FunctionExpression and ArrowFunctionExpression
                // Wrap in place: (args) => body -> __probe_wrap((args) => body, 'name')

                // Don't wrap if parent is already a CallExpression to __probe_wrap
                if (path.parent.type === 'CallExpression' &&
                    path.parent.callee.type === 'Identifier' &&
                    path.parent.callee.name === '__probe_wrap') {
                    return;
                }

                // Clone the node to avoid mutation issues
                const fnNode = t.cloneNode(path.node, true);
                fnNode.__probeWrapped = true;

                const wrapped = createWrapperCall(fnNode, fnName, location);

                path.replaceWith(wrapped);

                state.wrappedFunctions.push(displayName);
                state.needsImport = true;
            },

            // Handle class methods
            ClassMethod(path, state) {
                if (state.skipProcessing) return;
                if (path.node.__probeWrapped) return;

                const methodName = path.node.key.type === 'Identifier'
                    ? path.node.key.name
                    : path.node.key.value;

                if (!shouldWrapFunction(methodName, path, state)) return;

                // For class methods, we wrap the body instead of the whole method
                // This preserves `this` context and other class semantics

                const location = getLocationInfo(path, state);
                const className = path.parent.parent && path.parent.parent.id
                    ? path.parent.parent.id.name
                    : 'Anonymous';
                const fullName = `${className}.${methodName}`;

                // Mark as wrapped
                path.node.__probeWrapped = true;

                // Get the method body
                const body = path.get('body');
                if (!body.isBlockStatement()) return;

                // Create wrapper statements
                const enterCall = t.variableDeclaration('const', [
                    t.variableDeclarator(
                        t.identifier('__probe_ctx'),
                        t.callExpression(
                            t.identifier('__probe_enter'),
                            [
                                t.stringLiteral(fullName),
                                t.stringLiteral(location),
                                t.arrayExpression(
                                    path.node.params.slice(0, 10).map((p, i) =>
                                        t.isIdentifier(p) ? p : t.identifier(`arg${i}`)
                                    )
                                )
                            ]
                        )
                    )
                ]);

                body.unshiftContainer('body', enterCall);

                state.wrappedFunctions.push(fullName);
                state.needsImport = true;
            }
        }
    };
};
