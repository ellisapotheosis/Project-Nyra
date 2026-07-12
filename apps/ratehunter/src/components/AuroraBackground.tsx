"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
void main(){gl_Position=vec4(a_pos,0.,1.);}
`;

const FRAG = `
precision highp float;
uniform float u_t;
uniform vec2 u_res;

vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289v2(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289v3(((x*34.)+1.)*x);}

float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=x0.x>x0.y?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  i=mod289v2(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m*m*m;
  vec3 x2=2.*fract(p*C.www)-1.;
  vec3 h=abs(x2)-.5;
  vec3 ox=floor(x2+.5);
  vec3 a0=x2-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float t=u_t*.22;

  /* ── water / gravity warp ── */
  float wx =snoise(vec2(uv.x*1.7 +t*.13, uv.y*1.1-t*.07))*.13;
  float wy =snoise(vec2(uv.x*2.3 -t*.09, uv.y*.85+t*.05))*.09;
  /* gravity: bands sag downward proportional to height */
  wy += sin(uv.x*6.2832+t*.38)*(.025+(1.-uv.y)*.045);
  /* secondary ripple layer for water feel */
  wx += snoise(vec2(uv.x*5.  -t*.22, uv.y*4. +t*.18))*.025;
  vec2 wuv=uv+vec2(wx,wy);

  /* ── multi-octave aurora noise ── */
  float n1=snoise(vec2(wuv.x*2.1 +t*.19, wuv.y*2.9+t*.11));
  float n2=snoise(vec2(wuv.x*3.6 -t*.15, wuv.y*1.7-t*.08));
  float n3=snoise(vec2(wuv.x*1.25+t*.07, wuv.y*3.6+t*.1 ));
  float n4=snoise(vec2(wuv.x*5.1 -t*.21, wuv.y*2.3+t*.14));/* fine detail */

  /* aurora height mask — upper ~65%, feathered edges */
  float mask=smoothstep(0.,.65,uv.y+.05)*smoothstep(1.1,.28,uv.y+.05);
  mask*=.75+snoise(vec2(uv.x*1.4,t*.14))*.25;

  float b1=smoothstep(-.28,.58,n1)*mask;
  float b2=smoothstep(-.32,.47,n2)*mask*.78;
  float b3=smoothstep(-.22,.52,n3)*mask*.58;
  float b4=smoothstep(-.38,.32,n4)*mask*.38;

  /* ── palette ── */
  vec3 bg       =vec3(.038,.038,.052);
  vec3 indigo   =vec3(.22,.09,.86);   /* #3817DB */
  vec3 purple   =vec3(.40,.06,.74);   /* #660ABD */
  vec3 violet   =vec3(.56,.08,.93);   /* #8F14ED */
  vec3 seafoam  =vec3(.0,.80,.70);    /* #00CCB2 */
  vec3 teal     =vec3(.0,.62,.72);    /* #009EB8 */
  vec3 neonPink =vec3(.96,.05,.50);   /* #F50D80 */
  vec3 hotPink  =vec3(.98,.24,.72);   /* #FA3DB8 */
  vec3 paleBlue =vec3(.44,.63,.99);   /* #70A0FC */

  /* slow-breathing colour cycle */
  float ct =sin(t*.42)*.5+.5;
  float ct2=cos(t*.31)*.5+.5;
  float ct3=sin(t*.57+1.3)*.5+.5;
  float ct4=cos(t*.23+.8)*.5+.5;

  vec3 c1=mix(indigo,  seafoam,  ct )*(b1*.95);
  vec3 c2=mix(purple,  neonPink, ct2)*(b2*.75);
  vec3 c3=mix(violet,  paleBlue, ct3)*(b3*.65);
  vec3 c4=mix(teal,    hotPink,  ct4)*(b4*.48);
  vec3 aurora=c1+c2+c3+c4;

  /* ── gravity pool / water reflection at bottom ── */
  float wy2=smoothstep(.22,.0,uv.y);
  float rip=snoise(vec2(uv.x*7.5+t*.52, uv.y*5.2+t*.31))*.014;
  float shim=snoise(vec2(uv.x*13.-t*.9, uv.y*10.))*.007;
  vec3 waterHue=mix(indigo,teal,sin(uv.x*9.42+t*.42)*.5+.5);
  vec3 water=waterHue*(wy2*.55+rip+shim)*(.55+ct*.45);

  /* ── compose ── */
  /* soft centre vignette keeps edges dark */
  vec2 vig=(uv-.5)*1.6;
  float vignette=smoothstep(.95,.05,dot(vig,vig));

  vec3 col=bg+aurora+water;
  col=mix(col*0.55, col, vignette);

  /* film grain — breaks colour banding */
  float grain=snoise(vec2(uv.x*820.+t*33.,uv.y*820.))*.012;
  col+=grain;

  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}
`;

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* skip animation for reduced-motion users */
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    /* compile helper */
    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    /* fullscreen quad */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_t");
    const uRes = gl.getUniformLocation(prog, "u_res");

    /* resize */
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    function resize() {
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();

    function draw() {
      if (!prefersReduced) {
        gl!.uniform1f(uTime, (performance.now() - start) / 1000);
      }
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
      aria-hidden
    />
  );
}
