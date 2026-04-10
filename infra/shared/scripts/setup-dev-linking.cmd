@echo off
echo Setting up Project-Nyra development package linking...

cd /d C:\Dev\Projects\Repos\Project-Nyra

echo.
echo Step 1: Installing dependencies in archon-os...
cd submodules\archon-os
pnpm install
if errorlevel 1 goto error

echo.
echo Step 2: Creating global link for archon-os...
pnpm link --global
if errorlevel 1 goto error

echo.
echo Step 3: Installing dependencies in archon frontend...
cd ..\archon\archon-ui-main
pnpm install
if errorlevel 1 goto error

echo.
echo Step 4: Creating global link for archon-ui...
pnpm link --global
if errorlevel 1 goto error

echo.
echo Step 5: Returning to project root and linking packages locally...
cd ..\..\..
pnpm link --global archon-os
if errorlevel 1 echo Warning: archon-os linking failed

pnpm link --global archon-ui
if errorlevel 1 echo Warning: archon-ui linking failed

echo.
echo Step 6: Testing better-sqlite3...
node test-sqlite-simple.js
if errorlevel 1 goto error

echo.
echo ✅ Development linking setup completed successfully!
echo.
echo Next steps:
echo 1. Test archon-os: npx archon-os --version
echo 2. Start development: .\scripts\switch-environment.ps1 -Environment development
goto end

:error
echo.
echo ❌ Setup failed! Check the error messages above.
exit /b 1

:end