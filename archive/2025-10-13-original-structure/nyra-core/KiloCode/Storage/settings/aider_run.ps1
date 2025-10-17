param(
  [string]$Repo='.', 
  [string]$Model='gpt-5-mini', 
  [string]$Include='src/**/*.py,src/**/*.ts,src/**/*.tsx'
)
# Simple Aider harness for Windows PowerShell
# Requires Aider installed and OPENAI_API_KEY (or equivalent) set in env.
Set-Location $Repo
aider --model $Model --yes --watch --message "Debug & fix tests; write tests if missing." --subtree $Include
