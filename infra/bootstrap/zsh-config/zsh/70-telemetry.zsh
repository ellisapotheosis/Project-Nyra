export XULBUX_TLM="${XULBUX_TLM:-0}"
typeset -g _XULBUX_GPU_CACHE="/tmp/.xulbux_gpu_cache"

xulbux_tlm_on()  { export XULBUX_TLM=1; (( $+functions[p10k] )) && p10k reload; }
xulbux_tlm_off() { export XULBUX_TLM=0; (( $+functions[p10k] )) && p10k reload; }

_xulbux_fetch_gpu_async() {
  (
    if command -v nvidia-smi >/dev/null 2>&1; then
      nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits 2>/dev/null | head -n1 > "$_XULBUX_GPU_CACHE.tmp"
      mv "$_XULBUX_GPU_CACHE.tmp" "$_XULBUX_GPU_CACHE"
    fi
  ) &!
}

if [[ "${XULBUX_TLM}" == "1" ]]; then
  typeset -g _XULBUX_TLM_TS=0 _XULBUX_GPU='' _XULBUX_CPU='' _XULBUX_MEM='' _XULBUX_DSK=''

  _xulbux_refresh_tlm() {
    local now=$EPOCHSECONDS
    (( now == _XULBUX_TLM_TS )) && return 0
    _XULBUX_TLM_TS=$now
    _XULBUX_CPU="LA:$(cut -d' ' -f1 /proc/loadavg 2>/dev/null || echo '?')"

    if [[ -r /proc/meminfo ]]; then
      local mt mf
      mt="$(awk '/MemTotal/{print $2}' /proc/meminfo)"
      mf="$(awk '/MemAvailable/{print $2}' /proc/meminfo)"
      local used=$(( (mt - mf) / 1024 ))
      local tot=$(( mt / 1024 ))
      _XULBUX_MEM="RAM:${used}/${tot}MB"
    else
      _XULBUX_MEM="RAM:?"
    fi

    _XULBUX_DSK="DSK:$(df -P / 2>/dev/null | awk 'NR==2{print $5}' || echo '?')"

    if [[ -f "$_XULBUX_GPU_CACHE" ]]; then
      local g
      g="$(<"$_XULBUX_GPU_CACHE")"
      if [[ -n "$g" ]]; then
        local u mu mt
        u="$(echo "$g" | cut -d',' -f1 | xargs)"
        mu="$(echo "$g" | cut -d',' -f2 | xargs)"
        mt="$(echo "$g" | cut -d',' -f3 | xargs)"
        _XULBUX_GPU="GPU:${u}% ${mu}/${mt}MB"
      else
        _XULBUX_GPU="GPU:?"
      fi
    else
      _XULBUX_GPU="GPU:na"
    fi

    _xulbux_fetch_gpu_async
  }

  prompt_xulbux_cpu()  { _xulbux_refresh_tlm; p10k segment -b "$X_BG" -f "$X_BLUEPURP" -t "$_XULBUX_CPU"; }
  prompt_xulbux_mem()  { _xulbux_refresh_tlm; p10k segment -b "$X_BG" -f "$X_CYAN"     -t "$_XULBUX_MEM"; }
  prompt_xulbux_disk() { _xulbux_refresh_tlm; p10k segment -b "$X_BG" -f "$X_LAVENDER" -t "$_XULBUX_DSK"; }
  prompt_xulbux_gpu()  { _xulbux_refresh_tlm; p10k segment -b "$X_BG" -f "$X_ROSE"     -t "$_XULBUX_GPU"; }

  typeset -g POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(status xulbux_gpu xulbux_cpu xulbux_mem xulbux_disk command_execution_time time)
  _xulbux_fetch_gpu_async
  (( $+functions[p10k] )) && p10k reload
fi
