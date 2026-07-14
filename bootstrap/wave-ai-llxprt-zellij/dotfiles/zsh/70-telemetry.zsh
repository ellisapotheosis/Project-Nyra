# ==============================================================================
# XULBUX TELEMETRY (CPU/GPU/RAM/DISK MONITORING IN PROMPT)
# ==============================================================================
# Optional real-time system metrics in the prompt.
# Enable with: xulbux_tlm_on  |  Disable with: xulbux_tlm_off

export XULBUX_TLM="${XULBUX_TLM:-0}"
typeset -g _XULBUX_GPU_CACHE="/tmp/.xulbux_gpu_cache"

# Toggle functions
xulbux_tlm_on() {
  export XULBUX_TLM=1
  (( $+functions[p10k] )) && p10k reload
  echo "✅ Telemetry enabled"
}

xulbux_tlm_off() {
  export XULBUX_TLM=0
  (( $+functions[p10k] )) && p10k reload
  echo "✅ Telemetry disabled"
}

# Async GPU data fetch (non-blocking)
_xulbux_fetch_gpu_async() {
  (
    if command -v nvidia-smi >/dev/null 2>&1; then
      nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits 2>/dev/null | head -n1 > "$_XULBUX_GPU_CACHE.tmp"
      mv "$_XULBUX_GPU_CACHE.tmp" "$_XULBUX_GPU_CACHE"
    fi
  ) &!
}

# Only initialize telemetry if enabled
if [[ "${XULBUX_TLM}" == "1" ]]; then
  typeset -g _XULBUX_TLM_TS=0 _XULBUX_GPU='' _XULBUX_CPU='' _XULBUX_MEM='' _XULBUX_DSK=''

  _xulbux_refresh_tlm() {
    local now=$EPOCHSECONDS
    (( now == _XULBUX_TLM_TS )) && return 0
    _XULBUX_TLM_TS=$now

    # CPU load average
    _XULBUX_CPU="LA:$(cut -d' ' -f1 /proc/loadavg 2>/dev/null || echo '?')"

    # Memory usage (KB → MB)
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

    # Disk usage (root partition)
    _XULBUX_DSK="DSK:$(df -P / 2>/dev/null | awk 'NR==2{print $5}' || echo '?')"

    # GPU metrics (from async cache)
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

    # Trigger next async fetch
    _xulbux_fetch_gpu_async
  }

  # Powerlevel10k segment generators (ANSI colors on black)
  prompt_xulbux_cpu()  { _xulbux_refresh_tlm; p10k segment -b 0 -f "$X_VIOLET"    -t "$_XULBUX_CPU"; }
  prompt_xulbux_mem()  { _xulbux_refresh_tlm; p10k segment -b 0 -f "$X_TURQUOISE" -t "$_XULBUX_MEM"; }
  prompt_xulbux_disk() { _xulbux_refresh_tlm; p10k segment -b 0 -f "$X_SEAFOAM"   -t "$_XULBUX_DSK"; }
  prompt_xulbux_gpu()  { _xulbux_refresh_tlm; p10k segment -b 0 -f "$X_NEON_PINK" -t "$_XULBUX_GPU"; }

  # Add telemetry segments to right prompt
  typeset -g POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(status xulbux_gpu xulbux_cpu xulbux_mem xulbux_disk command_execution_time time)

  # Initial fetch and reload prompt
  _xulbux_fetch_gpu_async
  (( $+functions[p10k] )) && p10k reload
fi
