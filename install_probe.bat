@echo off
setlocal enabledelayedexpansion

REM ================================================
REM Probe Installation Script v1.7.0 (Windows)
REM This script automates the installation of the OpenTelemetry-based TS/JS Probe.
REM ================================================

REM --- Configuration ---
set "TAG=%~1"
if "%TAG%"=="" set "TAG=v1.7.0"
set "GITHUB_BASE=https://raw.githubusercontent.com/Syncause/ts-agent-file/%TAG%"
echo [34m==^>[0m Using version tag: %TAG%

REM Default version tag
set "DEFAULT_TAG=v1.7.0"

REM --- 1. Detect Package Manager ---
REM Check for pnpm
if exist "pnpm-lock.yaml" (
    where pnpm >nul 2>&1
    if !errorlevel! equ 0 (
        set "PKG_MANAGER=pnpm"
        REM Check if this is a pnpm workspace
        if exist "pnpm-workspace.yaml" (
            echo [34m==^>[0m Detected pnpm workspace
            set "INSTALL_CMD=pnpm add -w"
            set "DEV_INSTALL_CMD=pnpm add -D -w"
        ) else (
            findstr /C:"\"workspaces\"" package.json >nul 2>&1
            if !errorlevel! equ 0 (
                echo [34m==^>[0m Detected pnpm workspace
                set "INSTALL_CMD=pnpm add -w"
                set "DEV_INSTALL_CMD=pnpm add -D -w"
            ) else (
                set "INSTALL_CMD=pnpm add"
                set "DEV_INSTALL_CMD=pnpm add -D"
            )
        )
        goto :pkg_manager_detected
    ) else (
        echo [33mWARNING:[0m pnpm-lock.yaml found but pnpm is not installed. Trying other package managers...
    )
)

REM Check for yarn
if exist "yarn.lock" (
    where yarn >nul 2>&1
    if !errorlevel! equ 0 (
        set "PKG_MANAGER=yarn"
        REM Detect Yarn version
        for /f "tokens=1 delims=." %%v in ('yarn --version 2^>nul') do set "YARN_MAJOR=%%v"
        
        REM Check if this is a yarn workspace
        findstr /C:"\"workspaces\"" package.json >nul 2>&1
        if !errorlevel! equ 0 (
            echo [34m==^>[0m Detected Yarn workspace ^(Yarn v!YARN_MAJOR!^)
            if "!YARN_MAJOR!"=="1" (
                set "INSTALL_CMD=yarn add --ignore-workspace-root-check"
                set "DEV_INSTALL_CMD=yarn add -D --ignore-workspace-root-check"
            ) else (
                set "INSTALL_CMD=yarn add"
                set "DEV_INSTALL_CMD=yarn add -D"
            )
        ) else (
            set "INSTALL_CMD=yarn add"
            set "DEV_INSTALL_CMD=yarn add -D"
        )
        goto :pkg_manager_detected
    ) else (
        echo [33mWARNING:[0m yarn.lock found but yarn is not installed. Trying other package managers...
    )
)

REM Fallback to npm (always available with Node.js)
where npm >nul 2>&1
if !errorlevel! equ 0 (
    set "PKG_MANAGER=npm"
    set "INSTALL_CMD=npm install"
    set "DEV_INSTALL_CMD=npm install -D"
) else (
    echo [31mERROR:[0m No package manager found. Please install npm, yarn, or pnpm.
    exit /b 1
)

:pkg_manager_detected
echo [34m==^>[0m Using package manager: %PKG_MANAGER%

REM --- 2. Detect Project Type ---
echo [34m==^>[0m Detecting project type...

if not exist "package.json" (
    echo [31mERROR:[0m package.json not found. This doesn't appear to be a Node.js project.
    exit /b 1
)

REM Check for Next.js dependency (highest priority)
findstr /C:"\"next\"" package.json >nul 2>&1
if !errorlevel! equ 0 (
    set "PROJECT_TYPE=next"
    echo [34m==^>[0m Detected Next.js project
    goto :project_detected
)

REM Check for TypeScript indicators
set "PROJECT_TYPE=js"

REM Check 1: TypeScript or @types/node in dependencies/devDependencies
findstr /R "\"typescript\"\|\"@types/node\"" package.json >nul 2>&1
if !errorlevel! equ 0 (
    set "PROJECT_TYPE=ts"
    echo [34m==^>[0m Detected TypeScript via package.json dependencies
    goto :project_detected
)

REM Check 2: tsconfig.json exists
if exist "tsconfig.json" (
    set "PROJECT_TYPE=ts"
    echo [34m==^>[0m Detected TypeScript via tsconfig.json
    goto :project_detected
)

REM Check 3: .ts or .tsx files in root or src directory
if exist "*.ts" (
    set "PROJECT_TYPE=ts"
    echo [34m==^>[0m Detected TypeScript via source files
    goto :project_detected
)
if exist "*.tsx" (
    set "PROJECT_TYPE=ts"
    echo [34m==^>[0m Detected TypeScript via source files
    goto :project_detected
)
if exist "src\*.ts" (
    set "PROJECT_TYPE=ts"
    echo [34m==^>[0m Detected TypeScript via source files
    goto :project_detected
)
if exist "src\*.tsx" (
    set "PROJECT_TYPE=ts"
    echo [34m==^>[0m Detected TypeScript via source files
    goto :project_detected
)

echo [34m==^>[0m Detected JavaScript project ^(no TypeScript indicators^)

:project_detected
echo [34m==^>[0m Final project type: %PROJECT_TYPE%

REM --- 3. Detect Target Directory ---
if exist "src" (
    set "TARGET_DIR=src"
) else (
    set "TARGET_DIR=."
)
echo [34m==^>[0m Target directory for probe files: %TARGET_DIR%

REM --- 4. Download Files ---
if "%PROJECT_TYPE%"=="next" (
    echo [34m==^>[0m Downloading Next.js instrumentation files and Babel config...
    curl -sL "%GITHUB_BASE%/instrumentation.ts" -o "%TARGET_DIR%\instrumentation.ts"
    curl -sL "%GITHUB_BASE%/instrumentation.node.next.ts" -o "%TARGET_DIR%\instrumentation.node.ts"
    curl -sL "%GITHUB_BASE%/probe-wrapper.ts" -o "%TARGET_DIR%\probe-wrapper.ts"
    REM Download Babel config to root
    curl -sL "%GITHUB_BASE%/.babelrc" -o ".babelrc"
    curl -sL "%GITHUB_BASE%/babel-plugin-probe.js" -o "babel-plugin-probe.js"
) else if "%PROJECT_TYPE%"=="ts" (
    echo [34m==^>[0m Downloading TypeScript instrumentation files...
    curl -sL "%GITHUB_BASE%/instrumentation.ts" -o "%TARGET_DIR%\instrumentation.ts"
    curl -sL "%GITHUB_BASE%/instrumentation.node.ts" -o "%TARGET_DIR%\instrumentation.node.ts"
) else (
    echo [34m==^>[0m Downloading JavaScript instrumentation files...
    curl -sL "%GITHUB_BASE%/instrumentation.js" -o "%TARGET_DIR%\instrumentation.js"
    curl -sL "%GITHUB_BASE%/instrumentation.node.js" -o "%TARGET_DIR%\instrumentation.node.js"
)

REM --- 5. Install Dependencies ---
echo [34m==^>[0m Installing core dependencies...
%INSTALL_CMD% @opentelemetry/sdk-node @opentelemetry/api @opentelemetry/auto-instrumentations-node @opentelemetry/sdk-metrics @opentelemetry/sdk-trace-node @opentelemetry/core @opentelemetry/winston-transport express ws

if "%PROJECT_TYPE%"=="ts" (
    echo [34m==^>[0m Installing TypeScript dependencies...
    %DEV_INSTALL_CMD% @types/express @types/ws @types/node tsx
)

if "%PROJECT_TYPE%"=="next" (
    echo [34m==^>[0m Installing TypeScript dependencies...
    %DEV_INSTALL_CMD% @types/express @types/ws @types/node tsx
    echo [34m==^>[0m Installing Next.js specific dependencies...
    %DEV_INSTALL_CMD% @babel/parser @babel/traverse magic-string
)

REM --- 6. Configure tsconfig.json for TypeScript projects ---
if "%PROJECT_TYPE%"=="ts" (
    echo [34m==^>[0m Configuring tsconfig.json with @/probe-wrapper path alias...
    node -e "const fs=require('fs');const td='%TARGET_DIR%';const p=td==='.'?'./probe-wrapper':'./'+td+'/probe-wrapper';if(fs.existsSync('tsconfig.json')){try{const t=JSON.parse(fs.readFileSync('tsconfig.json','utf8'));if(!t.compilerOptions)t.compilerOptions={};if(!t.compilerOptions.baseUrl)t.compilerOptions.baseUrl='.';if(!t.compilerOptions.paths)t.compilerOptions.paths={};t.compilerOptions.paths['@/probe-wrapper']=[p];fs.writeFileSync('tsconfig.json',JSON.stringify(t,null,2));console.log('Added @/probe-wrapper path alias to tsconfig.json');}catch(e){console.error('Warning: Could not update tsconfig.json:',e.message);}}else{console.log('Warning: tsconfig.json not found');}"
)

REM --- 7. Next.js Babel info ---
if "%PROJECT_TYPE%"=="next" (
    echo [34m==^>[0m Next.js project detected. Using Babel-based instrumentation ^(no next.config.js modification needed^).
)

REM --- 8. Modify package.json scripts ---
echo [34m==^>[0m Updating package.json scripts ^(manual double-check required^)...
if "%TARGET_DIR%"=="." (
    set "BASE_DIR=./"
) else (
    set "BASE_DIR=./%TARGET_DIR%/"
)

node -e "const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));const pt='%PROJECT_TYPE%';const bd='%BASE_DIR%'.replace(/\\/g,'/');if(pt==='next'){if(pkg.scripts.dev&&!pkg.scripts.dev.includes('--webpack')){pkg.scripts.dev=pkg.scripts.dev.replace('next dev','next dev --webpack');}if(pkg.scripts.build&&!pkg.scripts.build.includes('--webpack')){pkg.scripts.build=pkg.scripts.build.replace('next build','next build --webpack');}}else if(pt==='ts'){if(pkg.scripts.dev&&!pkg.scripts.dev.includes('--import')){const dc=pkg.scripts.dev;if(dc.startsWith('tsx ')){pkg.scripts.dev=dc.replace(/^tsx\s+/,'tsx --import '+bd+'instrumentation.node.ts ');}else if(dc.startsWith('node ')){pkg.scripts.dev=dc.replace(/^node\s+/,'node --import '+bd+'instrumentation.node.ts ');}else{pkg.scripts.dev='tsx --import '+bd+'instrumentation.node.ts '+dc;}}}else if(pt==='js'){if(pkg.scripts.dev&&!pkg.scripts.dev.includes('--require')){const dc=pkg.scripts.dev;if(dc.startsWith('node ')){pkg.scripts.dev=dc.replace(/^node\s+/,'node --require '+bd+'instrumentation.js ');}else{pkg.scripts.dev='node --require '+bd+'instrumentation.js '+dc;}}}fs.writeFileSync('package.json',JSON.stringify(pkg,null,2));"

echo [32mSUCCESS:[0m Installation complete. Please verify files and run the app.

endlocal
