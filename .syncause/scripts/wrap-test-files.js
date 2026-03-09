#!/usr/bin/env node
/**
 * wrap-test-files.js - Auto-wrap test files for trace generation
 * 
 * Universal version - works with any Node.js/TypeScript project
 * 
 * Features:
 * - Uses babel-plugin-test-probe to wrap ALL functions
 * - Supports js, ts, jsx, tsx test files
 * - Auto-imports test-probe-runtime for span tracking
 * 
 * Usage:
 *   node wrap-test-files.js <source-dir> <output-dir>
 * 
 * Example:
 *   node wrap-test-files.js __tests__ __tests_traced__
 *   node wrap-test-files.js test test_traced
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Detected path aliases from tsconfig.json
let PATH_ALIASES = [];

// Paths to exclude from wrapping
const EXCLUDE_PATTERNS = [
    /node_modules/,
    /instrumentation/,
    /probe-wrapper/,
    /test-probe-runtime/,
    /\.test\./,
    /\.spec\./,
    /\.d\.ts$/,
    /__mocks__/,
    /__fixtures__/,
];

/**
 * Read and parse tsconfig.json to detect path aliases
 */
function detectPathAliases() {
    const tsconfigPaths = [
        'tsconfig.json',
        'tsconfig.base.json',
        'jsconfig.json',
    ];

    for (const configFile of tsconfigPaths) {
        if (fs.existsSync(configFile)) {
            try {
                const content = fs.readFileSync(configFile, 'utf8');
                // Remove comments (simple approach)
                const cleaned = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
                const config = JSON.parse(cleaned);

                const paths = config?.compilerOptions?.paths || {};
                PATH_ALIASES = Object.keys(paths).map(alias => {
                    // Convert "@/*" to regex "^@/"
                    const pattern = alias.replace('/*', '').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    return new RegExp(`^${pattern}`);
                });

                if (PATH_ALIASES.length > 0) {
                    console.log(`[INFO] Detected path aliases from ${configFile}: ${Object.keys(paths).join(', ')}`);
                }
                return;
            } catch (err) {
                console.warn(`[WARN] Failed to parse ${configFile}:`, err.message);
            }
        }
    }

    // Default aliases if no tsconfig found
    PATH_ALIASES = [/^@\//, /^~\//, /^#\//];
    console.log('[INFO] No tsconfig found, using default aliases: @/, ~/, #/');
}

/**
 * Check if an import path should be wrapped
 */
function shouldWrapImport(importPath) {
    // Exclude node_modules and internal patterns
    if (EXCLUDE_PATTERNS.some(p => p.test(importPath))) {
        return false;
    }

    // Wrap all relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
        return true;
    }

    // Wrap all path alias imports
    if (PATH_ALIASES.some(p => p.test(importPath))) {
        return true;
    }

    return false;
}

/**
 * Calculate relative path from test file to test-probe-runtime
 */
function getRuntimeImportPath(testFilePath, outputDir) {
    const testDir = path.dirname(testFilePath);
    const relativeToOutput = path.relative(path.join(outputDir, testDir), '.');
    return path.join(relativeToOutput, '.syncause', 'test-probe-runtime').replace(/\\/g, '/');
}

function transformTestFile(code, filePath, outputDir) {
    let ast;
    try {
        ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx', 'decorators-legacy'],
        });
    } catch (err) {
        console.warn(`[WARN] Failed to parse ${filePath}:`, err.message);
        return code;
    }

    let wrappedCount = 0;

    // Apply babel-plugin-test-probe visitor to wrap ALL functions
    // This replaces the old wrapUserFunction approach
    try {
        const testProbePlugin = require('./babel-plugin-test-probe');

        // Calculate relative path to test-probe-runtime
        const runtimePath = getRuntimeImportPath(filePath, outputDir);

        const pluginApi = {
            types: t,
            cache: { using: () => { } }
        };

        const pluginOptions = {
            runtimePath: runtimePath,
            includeLocation: true,
            debug: false,
            wrapAnonymous: true
        };

        const pluginInstance = testProbePlugin(pluginApi, pluginOptions);

        const state = {
            filename: filePath,
            opts: pluginOptions,
            file: { opts: { filename: filePath } },
            cwd: process.cwd(),
            wrappedFunctions: [],
            needsImport: false
        };

        // Run plugin visitor
        traverse(ast, pluginInstance.visitor, undefined, state);
        wrappedCount = state.wrappedFunctions.length;

        if (wrappedCount === 0) {
            console.log(`[SKIP] ${filePath}: No functions to wrap`);
            return code;
        }

        console.log(`[WRAP] ${filePath}: Wrapped ${wrappedCount} functions: ${state.wrappedFunctions.slice(0, 5).join(', ')}${state.wrappedFunctions.length > 5 ? '...' : ''}`);

    } catch (e) {
        console.warn(`[WARN] Failed to apply probe plugin to ${filePath}:`, e.message);
        return code;
    }

    // Generate output code
    const output = generate(ast, { retainLines: true }, code);
    return output.code;
}

function processDirectory(sourceDir, outputDir) {
    // Check dependencies
    try {
        require('@babel/generator');
    } catch {
        console.error('Missing dependency: @babel/generator');
        console.log('Run: npm install -D @babel/parser @babel/traverse @babel/generator @babel/types');
        process.exit(1);
    }

    if (!fs.existsSync(sourceDir)) {
        console.error(`Source directory not found: ${sourceDir}`);
        process.exit(1);
    }

    // Detect path aliases
    detectPathAliases();

    // Create output directory
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    // Process all test files
    let files;
    try {
        files = fs.readdirSync(sourceDir, { recursive: true });
    } catch {
        // Fallback for older Node.js versions
        files = [];
        const walk = (dir, prefix = '') => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const relativePath = prefix ? path.join(prefix, item) : item;
                if (fs.statSync(fullPath).isDirectory()) {
                    walk(fullPath, relativePath);
                } else {
                    files.push(relativePath);
                }
            }
        };
        walk(sourceDir);
    }

    let processedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const outputPath = path.join(outputDir, file);

        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
            fs.mkdirSync(outputPath, { recursive: true });
            continue;
        }

        // Only process test files
        if (!/\.(test|spec)\.(ts|tsx|js|jsx|mjs)$/.test(file)) {
            // Copy non-test files as-is
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.copyFileSync(sourcePath, outputPath);
            continue;
        }

        const code = fs.readFileSync(sourcePath, 'utf8');
        const transformed = transformTestFile(code, file, outputDir);

        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, transformed);

        if (transformed !== code) {
            processedCount++;
        } else {
            skippedCount++;
        }
    }

    console.log('\n========================================');
    console.log(`[DONE] Processed: ${processedCount} files`);
    console.log(`[DONE] Skipped: ${skippedCount} files`);
    console.log(`[DONE] Output: ${outputDir}`);
    console.log('\nRun tests with:');
    console.log(`  npx jest ${outputDir} --forceExit`);
    console.log(`  npx vitest run ${outputDir}`);
    console.log(`  npx mocha "${outputDir}/**/*.test.ts"`);
}

// CLI
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node wrap-test-files.js <source-dir> <output-dir>');
    console.log('');
    console.log('Arguments:');
    console.log('  source-dir   Directory containing test files');
    console.log('  output-dir   Output directory for wrapped test files');
    console.log('');
    console.log('Examples:');
    console.log('  node wrap-test-files.js __tests__ __tests_traced__');
    console.log('  node wrap-test-files.js test test_traced');
    console.log('  node wrap-test-files.js tests tests_traced');
    process.exit(1);
}

const [sourceDir, outputDir] = args;
processDirectory(sourceDir, outputDir);
