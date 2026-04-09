# Claude Flow Hook Runner - Bypasses npx cache issues

# Ensure NODE_PATH includes global node_modules
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $global:NODE_PATH = "$(npm root -g);$env:NODE_PATH"
}

# Try to run claude-flow directly, fallback to npx
try {
    if (Get-Command claude-flow -ErrorAction SilentlyContinue) {
        & claude-flow @args
    } elseif (Test-Path "node_modules/.bin/claude-flow") {
        & node node_modules/.bin/claude-flow @args
    } elseif (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm exec claude-flow@alpha @args 2>$null
    } else {
        npx --yes claude-flow@alpha @args 2>$null
    }
} catch {
    # Silently fail for hooks
}
