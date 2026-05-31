"use client"

import { motion } from "framer-motion"

export type BlobExpression =
  | "happy" | "excited" | "stressed" | "blocked"
  | "celebrating" | "thinking" | "sleeping" | "neutral"

interface NyraBlobMascotProps {
  expression?: BlobExpression
  size?: number
  className?: string
  animated?: boolean
  glowing?: boolean
  rimColor?: string
}

const ANIM: Record<BlobExpression, object> = {
  happy:       { y:[0,-9,0], rotate:[0,0.5,-0.5,0], transition:{duration:3.4, repeat:Infinity, ease:"easeInOut"} },
  excited:     { y:[0,-16,0], rotate:[-2.5,2.5,-2.5], transition:{duration:1.6, repeat:Infinity, ease:"easeInOut"} },
  stressed:    { x:[-5,5,-4,4,-2,2,0], transition:{duration:0.55, repeat:3, ease:"easeInOut"} },
  blocked:     { x:[-18,12,-7,4,0], scale:[1,0.92,1.05,1], transition:{duration:0.65, ease:"easeOut"} },
  celebrating: { rotate:[-12,12,-10,10,-5,5,0], scale:[1,1.14,1,1.08,1], transition:{duration:1.1, repeat:Infinity} },
  thinking:    { rotate:[-4,0], y:[0,-4,0], transition:{duration:2.5, repeat:Infinity, repeatType:"reverse"} },
  sleeping:    { y:[0,-4,0], transition:{duration:4, repeat:Infinity, ease:"easeInOut"} },
  neutral:     { y:[0,-5,0], transition:{duration:4, repeat:Infinity, ease:"easeInOut"} },
}

// ─────────────────────────────────────────────────────────────────────────────
// Face definitions per expression
// ─────────────────────────────────────────────────────────────────────────────

interface EyeDef { scleraR:number; irisR:number; pupilR:number; irisOffX:number; irisOffY:number }
interface FaceDef { eye:EyeDef; mouthPath:string; showBlush:boolean; browL?:string; browR?:string }

const FACE: Record<BlobExpression, FaceDef> = {
  happy:       { eye:{scleraR:18,irisR:13,pupilR:8,irisOffX:2,irisOffY:2},   mouthPath:"M 65 121 Q 80 136 95 121",  showBlush:true  },
  excited:     { eye:{scleraR:20,irisR:15,pupilR:9,irisOffX:2,irisOffY:1},   mouthPath:"M 60 118 Q 80 140 100 118", showBlush:true  },
  stressed:    { eye:{scleraR:20,irisR:14,pupilR:9,irisOffX:1,irisOffY:1},   mouthPath:"M 65 123 Q 80 118 95 123",  showBlush:false,
    browL:"M 42 80 Q 52 74 60 78", browR:"M 100 78 Q 108 74 118 80" },
  blocked:     { eye:{scleraR:18,irisR:13,pupilR:8,irisOffX:2,irisOffY:2},   mouthPath:"M 67 128 Q 80 120 93 128",  showBlush:false,
    browL:"M 42 80 Q 52 74 60 78", browR:"M 100 78 Q 108 74 118 80" },
  celebrating: { eye:{scleraR:19,irisR:14,pupilR:9,irisOffX:2,irisOffY:1},   mouthPath:"M 57 116 Q 80 140 103 116", showBlush:true  },
  thinking:    { eye:{scleraR:18,irisR:13,pupilR:8,irisOffX:-2,irisOffY:-1}, mouthPath:"M 65 122 Q 80 130 95 118",  showBlush:false },
  sleeping:    { eye:{scleraR:18,irisR:13,pupilR:8,irisOffX:0,irisOffY:0},   mouthPath:"M 67 122 Q 80 128 93 122",  showBlush:true  },
  neutral:     { eye:{scleraR:18,irisR:13,pupilR:8,irisOffX:2,irisOffY:2},   mouthPath:"M 65 122 Q 80 130 95 122",  showBlush:false },
}

// ─────────────────────────────────────────────────────────────────────────────
// NyraEye — single eye with lashes, eyelid, iris, highlights
// ─────────────────────────────────────────────────────────────────────────────

function NyraEye({ cx, cy, def, isBlocked, isCelebrating, isSleeping }:
  { cx:number; cy:number; def:EyeDef; isBlocked?:boolean; isCelebrating?:boolean; isSleeping?:boolean }) {
  const { scleraR, irisR, pupilR, irisOffX, irisOffY } = def
  const lashes = [
    { x1:cx-12, y1:cy-scleraR+4, x2:cx-16, y2:cy-scleraR-7 },
    { x1:cx-6,  y1:cy-scleraR+1, x2:cx-8,  y2:cy-scleraR-9 },
    { x1:cx,    y1:cy-scleraR,   x2:cx,    y2:cy-scleraR-10 },
    { x1:cx+6,  y1:cy-scleraR+1, x2:cx+8,  y2:cy-scleraR-9 },
    { x1:cx+12, y1:cy-scleraR+4, x2:cx+16, y2:cy-scleraR-7 },
  ]
  if (isBlocked) return (
    <g>
      <circle cx={cx} cy={cy} r={scleraR} fill="white" opacity={0.9}/>
      <line x1={cx-10} y1={cy-10} x2={cx+10} y2={cy+10} stroke="#FF3D6E" strokeWidth={4.5} strokeLinecap="round"/>
      <line x1={cx+10} y1={cy-10} x2={cx-10} y2={cy+10} stroke="#FF3D6E" strokeWidth={4.5} strokeLinecap="round"/>
    </g>
  )
  if (isCelebrating) {
    const pts = Array.from({length:8},(_,i)=>{const a=(i*Math.PI)/4;const r=i%2===0?scleraR-2:scleraR-10;return`${cx+r*Math.cos(a-Math.PI/2)},${cy+r*Math.sin(a-Math.PI/2)}`}).join(" ")
    return <g><circle cx={cx} cy={cy} r={scleraR} fill="white" opacity={0.9}/><polygon points={pts} fill="#8F4DFF" opacity={0.95}/><circle cx={cx} cy={cy} r={4} fill="white"/></g>
  }
  if (isSleeping) return (
    <g>
      <path d={`M ${cx-scleraR} ${cy} Q ${cx} ${cy-scleraR*0.6} ${cx+scleraR} ${cy}`} fill="none" stroke="#1a0030" strokeWidth={3.5} strokeLinecap="round"/>
      {lashes.slice(1,4).map((l,i)=><line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#1a0030" strokeWidth={2.5} strokeLinecap="round"/>)}
    </g>
  )
  const ix=cx+irisOffX, iy=cy+irisOffY
  return (
    <g>
      <circle cx={cx} cy={cy} r={scleraR} fill="white" opacity={0.96}/>
      <radialGradient id={`ig${cx}`} cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#b47aff"/><stop offset="100%" stopColor="#5c1aff"/>
      </radialGradient>
      <circle cx={ix} cy={iy} r={irisR} fill={`url(#ig${cx})`}/>
      <circle cx={ix+1} cy={iy+1} r={pupilR} fill="#0d0020"/>
      <circle cx={ix+5} cy={iy-5} r={4} fill="white" opacity={0.95}/>
      <circle cx={ix+7} cy={iy-2} r={2} fill="white" opacity={0.6}/>
      <path d={`M ${cx-scleraR-2} ${cy-2} Q ${cx} ${cy-scleraR-6} ${cx+scleraR+2} ${cy-2}`} fill="none" stroke="#1a0030" strokeWidth={2.5} strokeLinecap="round"/>
      {lashes.map((l,i)=><line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#1a0030" strokeWidth={2.5} strokeLinecap="round"/>)}
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function NyraBlobMascot({
  expression="happy", size=140, className="", animated=true, glowing=false, rimColor="#30E7FF",
}: NyraBlobMascotProps) {
  const face = FACE[expression]
  const animProps = animated ? { animate: ANIM[expression] } : {}
  const isBlocked = expression === "blocked"
  const isCelebrating = expression === "celebrating"
  const isSleeping = expression === "sleeping"
  const isStressed = expression === "stressed"
  const showTeeth = expression === "excited" || expression === "celebrating"

  return (
    <motion.div className={`inline-block select-none ${className}`}
      style={{ width:size, height:size*(175/160) }} {...animProps}>
      <svg viewBox="0 0 160 175" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width:"100%", height:"100%", overflow:"visible" }}>
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF6FD0"/><stop offset="55%" stopColor="#C84BFF"/><stop offset="100%" stopColor="#8F4DFF"/>
          </linearGradient>
          <linearGradient id="hg" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FF4FC4"/><stop offset="100%" stopColor="#8F4DFF"/>
          </linearGradient>
          {glowing && (
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="10" result="b"/>
              <feComposite in="SourceGraphic" in2="b" operator="over"/>
            </filter>
          )}
        </defs>

        {/* outer glow halo */}
        {glowing && <ellipse cx="82" cy="106" rx="72" ry="68" fill={rimColor} opacity={0.07} filter="url(#glow)"/>}

        {/* horns */}
        <path d="M 36 52 C 28 36, 24 18, 32 14 C 40 10, 44 28, 42 52 Z" fill="url(#hg)" opacity={0.95}/>
        <path d="M 35 48 C 31 36, 30 22, 34 18" stroke="white" strokeWidth={1.5} strokeLinecap="round" opacity={0.35} fill="none"/>
        <path d="M 124 50 C 128 34, 136 16, 142 20 C 148 24, 140 42, 130 52 Z" fill="url(#hg)" opacity={0.95}/>
        <path d="M 125 48 C 127 36, 132 22, 136 20" stroke="white" strokeWidth={1.5} strokeLinecap="round" opacity={0.35} fill="none"/>

        {/* body */}
        <path d="M 80 22 C 108 16, 146 38, 150 74 C 154 110, 134 148, 104 158 C 78 166, 46 160, 26 140 C 6 120, 8 84, 20 58 C 32 32, 56 28, 80 22 Z" fill="url(#bg)"/>
        <path d="M 80 22 C 56 28, 32 32, 20 58 C 14 70, 12 86, 18 104" stroke="white" strokeWidth={2.5} strokeLinecap="round" opacity={0.18} fill="none"/>

        {/* brows */}
        {face.browL && <path d={face.browL} stroke="#1a0030" strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.85}/>}
        {face.browR && <path d={face.browR} stroke="#1a0030" strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.85}/>}

        {/* eyes */}
        <NyraEye cx={58} cy={94} def={face.eye} isBlocked={isBlocked} isCelebrating={isCelebrating} isSleeping={isSleeping}/>
        <NyraEye cx={102} cy={94} def={face.eye} isBlocked={isBlocked} isCelebrating={isCelebrating} isSleeping={isSleeping}/>

        {/* thinking droopy lid on right eye */}
        {expression==="thinking" && <path d="M 84 94 Q 102 82 120 94 L 120 94 Q 102 94 84 94 Z" fill="url(#bg)" opacity={0.72}/>}

        {/* blush */}
        {face.showBlush && <>
          <ellipse cx="38" cy="112" rx="18" ry="11" fill="#FF4FC4" opacity={0.28}/>
          <ellipse cx="122" cy="112" rx="18" ry="11" fill="#FF4FC4" opacity={0.28}/>
        </>}
        {isStressed && <>
          <ellipse cx="36" cy="110" rx="16" ry="9" fill="#FF6060" opacity={0.22}/>
          <ellipse cx="124" cy="110" rx="16" ry="9" fill="#FF6060" opacity={0.22}/>
        </>}

        {/* teeth fill for excited / celebrating */}
        {showTeeth && <path d={face.mouthPath} stroke="none" fill="white" opacity={0.9}/>}

        {/* mouth */}
        <path d={face.mouthPath} stroke="#1a0030" strokeWidth={3.5} strokeLinecap="round" fill="none" opacity={0.85}/>

        {/* sweat drop (stressed) */}
        {isStressed && <path d="M 122 80 C 116 74, 112 66, 122 62 C 132 66, 128 74, 122 80 Z" fill="#30E7FF" opacity={0.8}/>}

        {/* celebrating sparkles */}
        {isCelebrating && <>
          <text x="20" y="50" fontSize="14" textAnchor="middle" fill="#FFD700" opacity={0.9}>✦</text>
          <text x="138" y="44" fontSize="12" textAnchor="middle" fill="#30E7FF" opacity={0.9}>✦</text>
          <text x="148" y="100" fontSize="10" textAnchor="middle" fill="#FF4FC4" opacity={0.9}>✦</text>
        </>}

        {/* sleeping ZZZ */}
        {isSleeping && <g opacity={0.7}>
          <text x="136" y="72" fontSize="11" fill="#30E7FF" fontFamily="monospace" fontWeight="bold">z</text>
          <text x="144" y="58" fontSize="14" fill="#30E7FF" fontFamily="monospace" fontWeight="bold">z</text>
          <text x="154" y="42" fontSize="17" fill="#30E7FF" fontFamily="monospace" fontWeight="bold">Z</text>
        </g>}
      </svg>
    </motion.div>
  )
}

export default NyraBlobMascot
