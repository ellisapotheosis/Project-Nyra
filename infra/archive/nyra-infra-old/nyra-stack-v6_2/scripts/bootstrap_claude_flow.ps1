[CmdletBinding()]param([switch]$Enhanced,[switch]$Roo,[switch]$Sparc)
$flags=@(); if($Enhanced){$flags+='--enhanced'}; if($Roo){$flags+='--roo'}; if($Sparc){$flags+='--sparc'}
pnpm dlx claude-flow@alpha init --force @flags
