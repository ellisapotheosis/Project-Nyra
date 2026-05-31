"use client"

import { useState, useEffect, useRef, useCallback, type ElementType } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// Scramble Text — zero external dependencies (no GSAP)
// Includes: ScrambleText (mount), ScrambleTextOnHover, ScrambleLoop, AnimatedNoise
// ─────────────────────────────────────────────────────────────────────────────

const GLYPHS = "!@#$%^&*()_+-=<>?/\\[]{}Xx01ABCDEF"

/** rAF-based scramble runner. Returns cancel fn. */
function runScramble(
  text: string,
  durationMs: number,
  onUpdate: (d: string) => void,
  onComplete?: () => void,
): () => void {
  const start = performance.now()
  let rafId: number
  const tick = (now: number) => {
    const progress = Math.min((now - start) / durationMs, 1)
    const locked = Math.floor(progress * text.length)
    onUpdate(text.split("").map((c, i) =>
      i < locked ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    ).join(""))
    if (progress < 1) { rafId = requestAnimationFrame(tick) }
    else { onUpdate(text); onComplete?.() }
  }
  rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}

// ─────────────────────────────────────────────────────────────────────────────
// ScrambleText — animates once on mount
// ─────────────────────────────────────────────────────────────────────────────

interface ScrambleTextProps {
  text: string; className?: string; delayMs?: number; durationMs?: number; as?: ElementType
}

export function ScrambleText({ text, className, delayMs=0, durationMs=900, as:Tag="span" }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text)
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return; ran.current = true
    setDisplay(text.split("").map(() => GLYPHS[Math.floor(Math.random()*GLYPHS.length)]).join(""))
    const t = setTimeout(() => runScramble(text, durationMs, setDisplay), delayMs)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Tag className={className}>{display}</Tag>
}

// ─────────────────────────────────────────────────────────────────────────────
// ScrambleTextOnHover — scrambles on every mouse enter
// ─────────────────────────────────────────────────────────────────────────────

interface ScrambleHoverProps {
  text: string; className?: string; durationMs?: number; as?: ElementType; onClick?: () => void
}

export function ScrambleTextOnHover({ text, className, durationMs=400, as:Tag="span", onClick }: ScrambleHoverProps) {
  const [display, setDisplay] = useState(text)
  const animating = useRef(false)
  const cancel = useRef<(() => void)|null>(null)
  useEffect(() => { if (!animating.current) setDisplay(text) }, [text])
  const onEnter = useCallback(() => {
    if (animating.current) return; animating.current = true
    cancel.current?.()
    setDisplay(text.split("").map(() => GLYPHS[Math.floor(Math.random()*GLYPHS.length)]).join(""))
    cancel.current = runScramble(text, durationMs, setDisplay, () => { animating.current = false })
  }, [text, durationMs])
  return <Tag className={className} onMouseEnter={onEnter} onClick={onClick}>{display}</Tag>
}

// ─────────────────────────────────────────────────────────────────────────────
// ScrambleLoop — cycles through texts continuously
// ─────────────────────────────────────────────────────────────────────────────

export function ScrambleLoop({ texts, className, durationMs=800, holdMs=2400, as:Tag="span" }:
  { texts:string[]; className?:string; durationMs?:number; holdMs?:number; as?:ElementType }) {
  const [display, setDisplay] = useState(texts[0])
  const idx = useRef(0)
  useEffect(() => {
    let cancel: (()=>void)|null = null
    let t: ReturnType<typeof setTimeout>
    const next = () => {
      const txt = texts[idx.current++ % texts.length]
      cancel?.()
      cancel = runScramble(txt, durationMs, setDisplay, () => { t = setTimeout(next, holdMs) })
    }
    t = setTimeout(next, holdMs)
    return () => { clearTimeout(t); cancel?.() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Tag className={className}>{display}</Tag>
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedNoise — canvas film-grain overlay (ported from Vercel interface-2)
// ─────────────────────────────────────────────────────────────────────────────

export function AnimatedNoise({ opacity=0.04, className, frameSkip=2 }:
  { opacity?:number; className?:string; frameSkip?:number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext("2d"); if (!ctx) return
    let raf: number; let frame = 0
    const resize = () => { c.width=Math.ceil(c.offsetWidth/2); c.height=Math.ceil(c.offsetHeight/2) }
    const noise = () => {
      const d = ctx.createImageData(c.width, c.height)
      for (let i=0; i<d.data.length; i+=4) { const v=Math.random()*255; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255 }
      ctx.putImageData(d, 0, 0)
    }
    const tick = () => { frame++; if(frame%frameSkip===0) noise(); raf=requestAnimationFrame(tick) }
    resize(); window.addEventListener("resize", resize); tick()
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf) }
  }, [frameSkip])
  return <canvas ref={ref} className={className} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity, mixBlendMode:"overlay" }}/>
}

export default ScrambleText
