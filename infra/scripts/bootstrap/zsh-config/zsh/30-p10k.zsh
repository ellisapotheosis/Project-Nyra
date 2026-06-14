typeset -g X_LAVENDER='#B57EDC'
typeset -g X_SEAFOAM='#A8E6CF'
typeset -g X_BLUEPURP='#7F5AF0'
typeset -g X_CYAN='#56B6C2'
typeset -g X_ROSE='#FFB3D9'
typeset -g X_PINK2='#FF8DC7'
typeset -g X_BG='#050505'

[[ -r ~/.p10k.zsh ]] && source ~/.p10k.zsh
[[ -r ~/.p10k.nyra.zsh ]] && source ~/.p10k.nyra.zsh

unset LS_COLORS
export LS_COLORS="di=38;2;127;90;240:fi=38;2;181;126;220:ln=38;2;86;182;194:ex=38;2;168;230;207"
export EZA_COLORS="di=38;2;127;90;240:fi=38;2;181;126;220:ln=38;2;86;182;194:ex=38;2;168;230;207"
