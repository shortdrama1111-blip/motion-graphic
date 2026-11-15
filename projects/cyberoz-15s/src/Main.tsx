import React from 'react';
import {AbsoluteFill, Audio, Img, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import B from './beats.json';
import {loadFonts} from './fonts';
import {LOGO_SPARKLE, Layout, Rect, layoutFor} from './layout';
import {P, arc, clamp, eio3, eo3, eo4, eoBack, lerp, lp, onCircle, rrPoint, seg, shake} from './lib';

// ---------------------------------------------------------------- brand
const C = {
  ink: '#290A1A', wine: '#660033', grey: '#6B7280', grey2: '#9CA3AF', line: '#EFE8EC',
  green: '#1E8E4E', greenBg: '#E7F6EC', red: '#C62D3A', redBg: '#FDECEE', amber: '#A86300', amberBg: '#FFF3DF',
};
const OUTFIT = 'Outfit, sans-serif';
const INTER = 'Inter, sans-serif';
const cardStyle: React.CSSProperties = {
  position: 'absolute', background: '#fff', border: `1px solid ${C.line}`,
  boxShadow: '0 22px 48px rgba(41,10,26,0.09), 0 2px 6px rgba(41,10,26,0.05)',
};

// ---------------------------------------------------------------- text
type Word = {s: string; acc: boolean; br: boolean};
const parse = (spec: string): Word[] => {
  const out: Word[] = [];
  let acc = false;
  spec.split('|').forEach((line, li) => {
    line.split(' ').forEach((tok, wi) => {
      let s = tok, a = acc;
      if (s.startsWith('*')) { s = s.slice(1); a = true; acc = true; }
      if (s.endsWith('*')) { s = s.slice(0, -1); acc = false; }
      out.push({s, acc: a, br: li > 0 && wi === 0});
    });
  });
  return out;
};

const Headline: React.FC<{
  spec: string; t: number; t0: number; tOut?: number; size: number; x: number; y: number;
  wordT0?: number[]; weight?: number; color?: string;
}> = ({spec, t, t0, tOut = 1e9, size, x, y, wordT0, weight = 700, color = C.ink}) => {
  if (t < t0 - 0.01 || t > tOut + 0.3) return null;
  const o = seg(t, tOut, tOut + 0.28);
  const words = parse(spec);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', width: '92%', textAlign: 'center',
      fontFamily: OUTFIT, fontWeight: weight, fontSize: size, lineHeight: 1.06, color,
      letterSpacing: `${-0.02 * size + 4 * o}px`, filter: o > 0 ? `blur(${7 * o}px)` : undefined, opacity: 1 - o,
    }}>
      {words.map((w, i) => {
        const a = wordT0 ? wordT0[i] : t0 + i * 0.06;
        const p = seg(t, a, a + 0.45);
        return (
          <React.Fragment key={i}>
            {w.br ? <br /> : null}
            <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', padding: '0.04em 0.1em 0.16em', margin: '0 0.02em -0.12em'}}>
              <span style={{
                display: 'inline-block', transform: `translateY(${(1 - eo4(p)) * 105}%)`, opacity: clamp(p / 0.35),
                color: w.acc ? C.wine : undefined, fontStyle: w.acc ? 'italic' : undefined,
              }}>{w.s}</span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Pop: React.FC<{t: number; t0: number; x: number; y: number; children: React.ReactNode; style?: React.CSSProperties; k?: number}> =
  ({t, t0, x, y, children, style, k = 2.2}) => {
    if (t < t0) return null;
    const p = seg(t, t0, t0 + 0.38);
    const s = lerp(0.45, 1, eoBack(p, k));
    return (
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: clamp(p / 0.15), ...style}}>
        {children}
      </div>
    );
  };

const Status: React.FC<{kind: 'pass' | 'fail'; size: number}> = ({kind, size}) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: size * 0.4, padding: `${size * 0.35}px ${size * 0.8}px`, borderRadius: 999,
    background: kind === 'pass' ? C.greenBg : C.redBg, color: kind === 'pass' ? C.green : C.red,
    fontFamily: INTER, fontWeight: 600, fontSize: size, whiteSpace: 'nowrap',
  }}>
    <span style={{width: size * 0.45, height: size * 0.45, borderRadius: 99, background: kind === 'pass' ? C.green : C.red}} />
    {kind === 'pass' ? 'Passing' : 'Failing'}
  </span>
);

const sparklePath = (r: number) => {
  const k = 0.16 * r;
  return `M0,${-r} Q${k},${-k} ${r},0 Q${k},${k} 0,${r} Q${-k},${k} ${-r},0 Q${-k},${-k} 0,${-r} Z`;
};

// ---------------------------------------------------------------- geometry shared by scenes and the light
const rowRect = (L: Layout, i: number): Rect => {
  const p = L.panel, top = p.cy - p.h / 2 + 108, rh = (p.h - 132) / 4;
  return {cx: p.cx, cy: top + rh * i + rh / 2, w: p.w - 56, h: rh - 10};
};
const chipsY = (L: Layout) => (rowRect(L, 1).cy + rowRect(L, 2).cy) / 2;
const chipsSpan = (L: Layout): [number, number] => [L.panel.cx - L.panel.w * 0.38, L.panel.cx + L.panel.w * 0.38];
const pillPt = (L: Layout): P => { const r = rowRect(L, 0); return [r.cx + r.w / 2 - 205, r.cy]; };
const headerDot = (L: Layout): P => [L.panel.cx - L.panel.w / 2 + 40, L.panel.cy - L.panel.h / 2 + 54];
const edgeOf = (L: Layout, c: Rect): P => [c.cx + (L.hub[0] < c.cx ? -c.w / 2 : c.w / 2), c.cy];
const legT = (i: number) => B.s3.legsStart + 2 * i * B.s3.legDur;
const legsEnd = B.s3.legsStart + 8 * B.s3.legDur;
const logoBox = (L: Layout) => ({left: Math.round(L.logo.cx - L.logo.w / 2), top: Math.round(L.logo.cy - L.logo.h / 2)});
const sparklePt = (L: Layout): P => { const b = logoBox(L); return [b.left + L.logo.w * LOGO_SPARKLE[0], b.top + L.logo.h * LOGO_SPARKLE[1]]; };
const ringP = (t: number) => eio3(seg(t, B.s5.fill, B.s5.full));

// ---------------------------------------------------------------- the light (one head, the whole film)
const headAt = (L: Layout, t: number): P | null => {
  const hub = L.hub as P, R = L.hubR + 30;
  if (t < B.s3.slam + 0.2) return null;
  if (t < B.s3.legsStart) return hub;
  for (let i = 0; i < 4; i++) {
    const a = legT(i), d = B.s3.legDur, e = edgeOf(L, L.cards[i]);
    if (t < a + d) return lp(hub, e, eio3(seg(t, a, a + d)));
    if (t < a + 2 * d) return lp(e, hub, eio3(seg(t, a + d, a + 2 * d)));
  }
  const o0 = legsEnd + 0.12;
  if (t < o0) return lp(hub, onCircle(hub, R, -90), eio3(seg(t, legsEnd, o0)));
  const orbit = (tt: number) => onCircle(hub, R, -90 + 360 * (tt - o0) / 0.95);
  const m = B.s4.morph, hd = headerDot(L);
  if (t < m) return orbit(t);
  if (t < m + 0.45) return arc(orbit(m), hd, eio3(seg(t, m, m + 0.45)), 70);
  const hover = (c: P, r = 6) => onCircle(c, r, t * 430);
  const f = B.s4.fail, r0 = rowRect(L, 0), rTop: P = [r0.cx, r0.cy - r0.h / 2];
  if (t < f) return hover(hd);
  if (t < f + 0.15) return lp(hover(hd), rTop, eo4(seg(t, f, f + 0.15)));
  if (t < f + 0.62) return rrPoint(r0.cx, r0.cy, r0.w, r0.h, 16, eio3(seg(t, f + 0.15, f + 0.62)));
  const [cx0, cx1] = chipsSpan(L), cy = chipsY(L) + 34;
  if (t < B.s4.chips) return arc(rTop, [cx0, cy], eio3(seg(t, f + 0.62, B.s4.chips)), 60);
  if (t < B.s4.chips + 0.45) return [lerp(cx0, cx1, eio3(seg(t, B.s4.chips, B.s4.chips + 0.45))), cy];
  const pp = pillPt(L);
  if (t < B.s4.fix) return arc([cx1, cy], pp, eio3(seg(t, B.s4.chips + 0.45, B.s4.fix)), -80);
  const ring = L.ring, top: P = [ring.cx, ring.cy - ring.r];
  if (t < B.s4.out) return hover(pp);
  if (t < B.s5.fill) return arc(hover(pp), top, eio3(seg(t, B.s4.out, B.s5.fill)), -90);
  if (t < B.s5.full) return onCircle([ring.cx, ring.cy], ring.r, -90 + 360 * ringP(t));
  const sp = sparklePt(L);
  if (t < B.s5.breath) return hover(top, 5);
  if (t < B.s6.hit - 0.1) return arc(hover(top, 5), sp, eio3(seg(t, B.s5.breath, B.s6.hit - 0.1)), 140);
  if (t < B.s6.hit + 0.32) return sp;
  return null;
};

const Light: React.FC<{L: Layout; t: number}> = ({L, t}) => {
  const I = seg(t, B.s3.slam + 0.2, B.s3.slam + 0.32) * (1 - seg(t, B.s6.hit + 0.02, B.s6.hit + 0.3));
  const h = headAt(L, t);
  if (!h || I <= 0) return null;
  const N = 26, span = 0.2, pts: P[] = [];
  for (let i = 0; i <= N; i++) { const q = headAt(L, t - (i * span) / N); if (!q) break; pts.push(q); }
  const segs = pts.slice(0, -1).map((p, j) => ({p, q: pts[j + 1], f: Math.pow(1 - (j + 0.5) / N, 1.6)}));
  const layers: [number, number, string][] = [[10, 0.12, '#C98BAE'], [4.2, 0.95, C.wine], [1.5, 0.65, '#FBE8F1']];
  return (
    <svg width={L.W} height={L.H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <radialGradient id="glow"><stop offset="0" stopColor="#E7A9C8" stopOpacity="0.6" /><stop offset="1" stopColor="#E7A9C8" stopOpacity="0" /></radialGradient>
        <radialGradient id="spill"><stop offset="0" stopColor="#F2C6DA" stopOpacity="0.45" /><stop offset="1" stopColor="#F2C6DA" stopOpacity="0" /></radialGradient>
        <filter id="sh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <circle cx={h[0]} cy={h[1]} r={150} fill="url(#spill)" opacity={I} style={{mixBlendMode: 'multiply'}} />
      <g filter="url(#sh)" transform="translate(0,9)">
        {segs.map((s, j) => <line key={j} x1={s.p[0]} y1={s.p[1]} x2={s.q[0]} y2={s.q[1]} stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={0.13 * I * s.f} />)}
      </g>
      {layers.map(([w, a, col], li) => (
        <g key={li}>{segs.map((s, j) => <line key={j} x1={s.p[0]} y1={s.p[1]} x2={s.q[0]} y2={s.q[1]} stroke={col} strokeWidth={w} strokeLinecap="round" opacity={a * I * s.f} />)}</g>
      ))}
      <circle cx={h[0]} cy={h[1]} r={26} fill="url(#glow)" opacity={I} />
      <path d={sparklePath(15)} transform={`translate(${h[0]},${h[1]}) rotate(${(t * 140) % 360})`} fill={C.wine} opacity={I} />
      <circle cx={h[0]} cy={h[1]} r={2.2} fill="#fff" opacity={0.9 * I} />
    </svg>
  );
};

// ---------------------------------------------------------------- background + finishing
const Background: React.FC<{L: Layout; t: number}> = ({L, t}) => {
  const desat = seg(t, B.s2.in, B.s2.in + 0.5) * (1 - seg(t, B.s2.suck, B.s3.slam));
  const blobs: [string, number, number, number][] = [['#EADCF3', 0.18, 0.22, 0.55], ['#F8DDE9', 0.82, 0.3, 0.5], ['#FBE9DD', 0.6, 0.86, 0.45]];
  return (
    <AbsoluteFill style={{background: '#FDFCFD'}}>
      {blobs.map(([col, x, y, s], i) => {
        const d = Math.max(L.W, L.H) * s;
        return <div key={i} style={{
          position: 'absolute', width: d, height: d, borderRadius: '50%', background: col, filter: 'blur(90px)',
          left: L.W * x - d / 2 + Math.sin(t * 0.35 + i * 2) * 40, top: L.H * y - d / 2 + Math.cos(t * 0.3 + i) * 30,
          opacity: 0.75 * (1 - 0.7 * desat),
        }} />;
      })}
    </AbsoluteFill>
  );
};

const Finish: React.FC<{L: Layout; frame: number}> = ({L, frame}) => (
  <>
    <svg width={L.W} height={L.H} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.07}}>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 7} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(41,10,26,0.07) 100%)'}} />
  </>
);

// ---------------------------------------------------------------- scene 1 + 2: the changing stack, the frozen audit
const CHIPS: [string, string][] = [
  ['+ New cloud service', '#8B5CF6'], ['+ 3 users added', C.wine], ['IAM role changed', '#D97706'], ['+ AI tool connected', '#0EA5E9'],
  ['+ New vendor', '#16A34A'], ['Repo created', '#64748B'], ['S3 bucket created', '#D97706'], ['+ SaaS app', '#8B5CF6'],
];

const Stack: React.FC<{L: Layout; t: number}> = ({L, t}) => {
  if (t > B.s3.slam + 0.05) return null;
  const desat = seg(t, B.s2.in, B.s2.in + 0.5);
  const sc = L.chipSize;
  return (
    <>
      {CHIPS.map(([label, dot], i) => {
        const t0 = B.s1.chipsStart + i * B.s1.chipStep;
        if (t < t0) return null;
        const p = seg(t, t0, t0 + 0.38);
        const u = eio3(seg(t, B.s2.suck + i * 0.015, B.s3.slam));
        const base: P = [L.chips[i][0] + Math.sin(t * 0.7 + i) * 7, L.chips[i][1] + Math.cos(t * 0.6 + i * 1.7) * 7];
        const [x, y] = lp(base, L.hub as P, u);
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(0.45, 1, eoBack(p, 2.2)) * lerp(1, 0.1, u)})`,
            opacity: clamp(p / 0.15) * (1 - 0.45 * desat) * (1 - u * u), filter: `grayscale(${desat})`,
            display: 'flex', alignItems: 'center', gap: sc * 0.5, padding: `${sc * 0.55}px ${sc * 0.9}px`, borderRadius: 999,
            background: '#fff', border: `1px solid ${C.line}`, boxShadow: '0 12px 28px rgba(41,10,26,0.08)',
            fontFamily: INTER, fontWeight: 500, fontSize: sc, color: C.ink, whiteSpace: 'nowrap',
          }}>
            <span style={{width: sc * 0.45, height: sc * 0.45, borderRadius: 99, background: dot}} />{label}
          </div>
        );
      })}
    </>
  );
};

const Audit: React.FC<{L: Layout; t: number}> = ({L, t}) => {
  if (t < B.s2.in || t > B.s3.slam + 0.05) return null;
  const c = L.s2Card, sc = L.sq ? 0.95 : 1;
  const p = eo3(seg(t, B.s2.in + 0.05, B.s2.in + 0.6));
  const u = eio3(seg(t, B.s2.suck, B.s3.slam));
  const [x, y] = lp([c.cx, c.cy + 40 * (1 - p)], L.hub as P, u);
  const rows = ['Asset inventory', 'Access reviews', 'Encryption at rest', 'Vendor risk'];
  const stamp = B.s2.line2 + 0.4;
  return (
    <div style={{
      ...cardStyle, left: x - c.w / 2, top: y - c.h / 2, width: c.w, height: c.h, borderRadius: 24, padding: '26px 32px', boxSizing: 'border-box',
      opacity: p * (1 - u), transform: `scale(${lerp(1, 0.05, u)}) rotate(${-1.2 * (1 - u)}deg)`, filter: u > 0 ? `blur(${10 * u}px)` : undefined,
      fontFamily: INTER, color: C.ink,
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 38, height: 38, borderRadius: 9, background: '#1F7A4D', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 18}}>X</div>
        <div style={{fontWeight: 600, fontSize: 26 * sc}}>ISO 27001 · annual review.xlsx</div>
        <div style={{marginLeft: 'auto', background: C.amberBg, color: C.amber, borderRadius: 999, padding: '6px 14px', fontSize: 19 * sc, fontWeight: 600, whiteSpace: 'nowrap'}}>Last checked 11 months ago</div>
      </div>
      <div style={{marginTop: 18, borderTop: `1px solid ${C.line}`}}>
        {rows.map((r, i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '13px 4px', borderBottom: `1px solid ${C.line}`, fontSize: 23 * sc}}>
            <span style={{color: '#4B5563'}}>{r}</span><span style={{color: C.grey2, fontStyle: 'italic'}}>Not checked</span>
          </div>
        ))}
      </div>
      {t > stamp ? (
        <div style={{
          position: 'absolute', right: 70, bottom: 54, transform: `rotate(-9deg) scale(${lerp(1.8, 1, eo4(seg(t, stamp, stamp + 0.18)))})`,
          opacity: seg(t, stamp, stamp + 0.08), border: `4px solid ${C.amber}`, color: C.amber, borderRadius: 10, padding: '6px 16px',
          fontFamily: OUTFIT, fontWeight: 800, fontSize: 40 * sc, letterSpacing: 2, background: 'rgba(255,255,255,0.85)',
        }}>OUTDATED</div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- scene 3: the sparkle connects the stack
const NAMES: [string, string][] = [['GH', 'GitHub'], ['GC', 'Google Cloud'], ['AWS', 'AWS'], ['AZ', 'Microsoft Azure']];
const Integration: React.FC<{c: Rect; i: number; t: number; t0: number; sc: number; contentOpacity?: number}> = ({c, i, t, t0, sc, contentOpacity = 1}) => (
  <Pop t={t} t0={t0} x={c.cx} y={c.cy}>
    <div style={{...cardStyle, position: 'relative', width: c.w, height: c.h, borderRadius: 22, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px', boxSizing: 'border-box'}}>
      <div style={{opacity: contentOpacity, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 54 * sc, height: 54 * sc, borderRadius: 14, background: '#F6EEF3', color: C.wine, display: 'grid', placeItems: 'center', fontFamily: INTER, fontWeight: 700, fontSize: 18 * sc}}>{NAMES[i][0]}</div>
        <div>
          <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 25 * sc, color: C.ink, whiteSpace: 'nowrap'}}>{NAMES[i][1]}</div>
          <div style={{marginTop: 6, opacity: seg(t, t0 + 0.15, t0 + 0.35), display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: INTER, fontWeight: 600, fontSize: 17 * sc, color: C.green}}>
            <span style={{width: 9, height: 9, borderRadius: 9, background: C.green, opacity: 0.55 + 0.45 * Math.sin(t * 9)}} />Monitoring
          </div>
        </div>
      </div>
    </div>
  </Pop>
);

const Connect: React.FC<{L: Layout; t: number}> = ({L, t}) => {
  if (t < B.s3.slam - 0.02 || t > B.s4.morph + 0.5) return null;
  const hub = L.hub as P, s = B.s3.slam;
  const out = eio3(seg(t, B.s4.morph, B.s4.morph + 0.3));
  const burst = seg(t, s, s + 0.7);
  const star = eoBack(seg(t, s, s + 0.28), 2.4) * (1 - eio3(seg(t, s + 0.3, s + 0.55)));
  const disc = eoBack(seg(t, s + 0.18, s + 0.5), 2);
  const sc = L.sq ? 0.92 : 1;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - out, filter: out > 0 ? `blur(${8 * out}px)` : undefined}}>
        <svg width={L.W} height={L.H} style={{position: 'absolute', inset: 0}}>
          <circle cx={hub[0]} cy={hub[1]} r={lerp(L.hubR, L.W * 0.4, eo3(burst))} fill="none" stroke={C.wine} strokeWidth={3} opacity={0.45 * (1 - burst)} />
          {L.cards.map((c, i) => {
            const a = legT(i), u = eio3(seg(t, a, a + B.s3.legDur));
            if (u <= 0) return null;
            const e = edgeOf(L, c), q = lp(hub, e, u);
            return (
              <g key={i}>
                <line x1={hub[0]} y1={hub[1]} x2={q[0]} y2={q[1]} stroke={C.wine} strokeWidth={3} opacity={0.35} />
                {u >= 1 ? [0, 0.5].map((k) => {
                  const ph = (((t - a) * 0.8 + k) % 1 + 1) % 1, d = lp(hub, e, ph);
                  return <circle key={k} cx={d[0]} cy={d[1]} r={4.5} fill={C.wine} opacity={0.6 * Math.sin(Math.PI * ph)} />;
                }) : null}
              </g>
            );
          })}
        </svg>
        {L.cards.map((c, i) => (i === 2 && t >= B.s4.morph ? null : <Integration key={i} c={c} i={i} t={t} t0={legT(i) + B.s3.legDur - 0.04} sc={sc} />))}
        <div style={{
          position: 'absolute', left: hub[0] - L.hubR, top: hub[1] - L.hubR, width: 2 * L.hubR, height: 2 * L.hubR, borderRadius: '50%',
          background: '#fff', boxShadow: '0 16px 40px rgba(102,0,51,0.18)', transform: `scale(${disc})`, display: 'grid', placeItems: 'center',
        }}>
          <Img src={staticFile(L.logo.src)} style={{width: L.hubR * 1.15}} />
        </div>
        {t > legsEnd ? (
          <Pop t={t} t0={legsEnd} x={hub[0]} y={hub[1] + L.hubR + 58}>
            <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: C.greenBg, color: C.green, fontFamily: INTER, fontWeight: 700, fontSize: 18, letterSpacing: 1.5}}>
              <span style={{width: 10, height: 10, borderRadius: 10, background: C.green, opacity: 0.5 + 0.5 * Math.sin(t * 8)}} />LIVE
            </div>
          </Pop>
        ) : null}
      </div>
      {star > 0.001 ? (
        <svg width={L.W} height={L.H} style={{position: 'absolute', inset: 0}}>
          <path d={sparklePath(L.hubR * 1.5)} transform={`translate(${hub[0]},${hub[1]}) scale(${star}) rotate(${lerp(-45, 0, eo3(seg(t, s, s + 0.4)))})`} fill={C.wine} />
        </svg>
      ) : null}
      <Headline spec="cyberOZ checks it *live.*" t={t} t0={B.s3.headline} tOut={B.s4.morph - 0.05} size={L.head} x={L.W / 2} y={L.headY} />
    </>
  );
};

// ---------------------------------------------------------------- scene 4 + 5: drift caught, mapped, fixed → audit-ready
const ROWS: [string, string][] = [
  ['S3 Bucket Encryption', 'Server-side encryption on all buckets'], ['IAM Policy Review', 'Least-privilege policies'],
  ['Branch Protection Rules', 'Required on main branch'], ['MFA Enabled', 'Enforced for all users'],
];
const MAP = ['ISO 27001 · A.8.24', 'NIS2 · Art. 21', 'SOC 2 · CC6.1'];

const lerpRect = (a: Rect, b: Rect, u: number): Rect => ({cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), w: lerp(a.w, b.w, u), h: lerp(a.h, b.h, u)});

const Checks: React.FC<{L: Layout; t: number}> = ({L, t}) => {
  if (t < B.s4.morph || t > B.s5.breath + 0.45) return null;
  const sc = L.sq ? 0.9 : 1;
  const D = 2 * (L.ring.r + 48);
  const disc: Rect = {cx: L.ring.cx, cy: L.ring.cy, w: D, h: D};
  const u1 = eio3(seg(t, B.s4.morph, B.s4.morph + 0.45));
  const u2 = eio3(seg(t, B.s5.morph, B.s5.morph + 0.45));
  const r = lerpRect(lerpRect(L.cards[2], L.panel, u1), disc, u2);
  const radius = lerp(lerp(22, 26, u1), D / 2, u2);
  const content = seg(t, B.s4.morph + 0.3, B.s4.morph + 0.5) * (1 - seg(t, B.s4.out - 0.05, B.s4.out + 0.1));
  const card0 = 1 - seg(t, B.s4.morph, B.s4.morph + 0.12);
  const breath = seg(t, B.s5.breath, B.s5.breath + 0.4);
  const f = B.s4.fail, failed = t >= f && t < B.s4.fix;
  const dim = 1 - 0.8 * seg(t, B.s4.chips - 0.12, B.s4.chips + 0.12);
  const rowShake = t >= f ? 9 * Math.exp(-10 * (t - f)) * Math.sin(70 * (t - f)) : 0;
  const pr = ringP(t);
  const circ = 2 * Math.PI * L.ring.r;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - breath, filter: breath > 0 ? `blur(${14 * breath}px)` : undefined, transform: `scale(${1 - 0.03 * breath})`}}>
      <div style={{...cardStyle, left: r.cx - r.w / 2, top: r.cy - r.h / 2, width: r.w, height: r.h, borderRadius: radius, overflow: 'hidden'}}>
        {card0 > 0 ? (
          <div style={{position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', opacity: card0, display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{width: 54, height: 54, borderRadius: 14, background: '#F6EEF3', color: C.wine, display: 'grid', placeItems: 'center', fontFamily: INTER, fontWeight: 700, fontSize: 18}}>AWS</div>
            <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 25, color: C.ink}}>AWS</div>
          </div>
        ) : null}
      </div>
      {content > 0 ? (
        <div style={{position: 'absolute', left: L.panel.cx - L.panel.w / 2, top: L.panel.cy - L.panel.h / 2, width: L.panel.w, height: L.panel.h, opacity: content, fontFamily: INTER, color: C.ink}}>
          <div style={{position: 'absolute', left: 64, top: 30, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, fontSize: 29 * sc}}>
            AWS · Security checks
          </div>
          <div style={{position: 'absolute', right: 32, top: 30, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 999, background: C.greenBg, color: C.green, fontWeight: 700, fontSize: 17, letterSpacing: 1.5}}>
            <span style={{width: 10, height: 10, borderRadius: 10, background: C.green, opacity: 0.5 + 0.5 * Math.sin(t * 8)}} />LIVE
          </div>
          {ROWS.map(([name, sub], i) => {
            const rr = rowRect(L, i), a = B.s4.morph + 0.45 + i * 0.06, rp = eo3(seg(t, a, a + 0.3));
            const isFail = i === 0 && failed;
            const subText = i === 0 && t >= B.s4.fix ? 'Fixed · back in compliance' : isFail ? '1 bucket unencrypted · detected just now' : sub;
            const subCol = i === 0 && t >= B.s4.fix ? C.green : isFail ? C.red : C.grey;
            const flash = i === 0 && t >= f ? Math.max(0, 1 - seg(t, B.s4.fix, B.s4.fix + 0.4)) * (0.55 + 0.45 * Math.exp(-6 * (t - f))) : 0;
            return (
              <div key={i} style={{
                position: 'absolute', left: rr.cx - rr.w / 2 - (L.panel.cx - L.panel.w / 2) + (i === 0 ? rowShake : 0), top: rr.cy - rr.h / 2 - (L.panel.cy - L.panel.h / 2) + 14 * (1 - rp),
                width: rr.w, height: rr.h, borderRadius: 16, boxSizing: 'border-box', padding: '0 24px', display: 'flex', alignItems: 'center',
                background: flash > 0 ? `rgba(253,236,238,${flash})` : '#FBF9FA', opacity: rp * (i > 0 ? dim : 1), filter: i > 0 && dim < 1 ? `blur(${3 * (1 - dim)}px)` : undefined,
              }}>
                <div>
                  <div style={{fontWeight: 600, fontSize: 24 * sc}}>{name}</div>
                  <div style={{marginTop: 4, fontSize: 18 * sc, color: subCol}}>{subText}</div>
                </div>
                <div style={{marginLeft: 'auto'}}><Status kind={isFail ? 'fail' : 'pass'} size={19 * sc} /></div>
              </div>
            );
          })}
          {t > B.s4.chips - 0.1 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: chipsY(L) - (L.panel.cy - L.panel.h / 2) - 26, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14}}>
              <span style={{fontSize: 19 * sc, color: C.grey, fontWeight: 500, opacity: seg(t, B.s4.chips - 0.1, B.s4.chips + 0.1), marginRight: 4}}>Mapped to</span>
              {MAP.map((m, i) => {
                const p = seg(t, B.s4.chips + i * 0.08, B.s4.chips + i * 0.08 + 0.35);
                return <span key={i} style={{
                  display: 'inline-block', transform: `scale(${lerp(0.5, 1, eoBack(p, 2.2))})`, opacity: clamp(p / 0.15), padding: '9px 18px', borderRadius: 12,
                  background: '#fff', border: `1.5px solid ${C.wine}`, color: C.wine, fontWeight: 600, fontSize: 20 * sc, whiteSpace: 'nowrap',
                }}>{m}</span>;
              })}
            </div>
          ) : null}
        </div>
      ) : null}
      {t > B.s5.morph + 0.3 ? (
        <>
          <svg width={L.W} height={L.H} style={{position: 'absolute', inset: 0, opacity: seg(t, B.s5.morph + 0.3, B.s5.morph + 0.5)}}>
            <circle cx={L.ring.cx} cy={L.ring.cy} r={L.ring.r} fill="none" stroke="#F3E6ED" strokeWidth={20} />
            <circle cx={L.ring.cx} cy={L.ring.cy} r={L.ring.r} fill="none" stroke={C.wine} strokeWidth={20} strokeLinecap="round"
              strokeDasharray={`${circ * pr} ${circ}`} transform={`rotate(-90 ${L.ring.cx} ${L.ring.cy})`} opacity={pr > 0.003 ? 1 : 0} />
          </svg>
          <div style={{position: 'absolute', left: L.ring.cx, top: L.ring.cy, transform: 'translate(-50%,-50%)', textAlign: 'center', opacity: seg(t, B.s5.fill - 0.15, B.s5.fill + 0.05)}}>
            <div style={{fontFamily: OUTFIT, fontWeight: 700, fontSize: 80, color: C.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{Math.round(100 * pr)}%</div>
            <div style={{fontFamily: INTER, fontWeight: 500, fontSize: 20, color: C.grey, marginTop: 8}}>Overall compliance</div>
          </div>
          {t > B.s5.full ? (() => {
            const [bx, by] = onCircle([L.ring.cx, L.ring.cy], L.ring.r, -40);
            return <Pop t={t} t0={B.s5.full} x={bx + 30} y={by - 30} k={2.6}>
              <div style={{width: 58, height: 58, borderRadius: 58, background: C.green, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 32, fontWeight: 700, boxShadow: '0 10px 24px rgba(30,142,78,0.35)'}}>✓</div>
            </Pop>;
          })() : null}
          <div style={{position: 'absolute', left: 0, right: 0, top: L.fwY, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', gap: 16}}>
            {['ISO 27001', 'SOC 2', 'NIS2', 'GDPR'].map((fw, i) => {
              const a = B.s5.frameworks + i * 0.09, p = seg(t, a, a + 0.36);
              if (p <= 0) return <span key={i} style={{visibility: 'hidden'}} />;
              return <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, padding: '11px 20px', borderRadius: 999, background: '#fff', border: `1px solid ${C.line}`,
                boxShadow: '0 10px 24px rgba(41,10,26,0.07)', transform: `scale(${lerp(0.5, 1, eoBack(p, 2.2))})`, opacity: clamp(p / 0.15),
                fontFamily: INTER, fontWeight: 600, fontSize: 23 * sc, color: C.ink,
              }}><span style={{width: 24, height: 24, borderRadius: 24, background: C.green, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 15}}>✓</span>{fw}</span>;
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- scene 6: logo out of the breath
const Endcard: React.FC<{L: Layout; t: number}> = ({L, t}) => {
  if (t < B.s6.hit - 0.02) return null;
  const h = B.s6.hit, {left, top} = logoBox(L), sp = sparklePt(L);
  const rp = eo3(seg(t, h, h + 0.5)), R = lerp(0, L.logo.w * 1.4, rp);
  const punch = 1 + 0.06 * Math.exp(-8 * (t - h));
  const ring = seg(t, h, h + 0.8);
  const spx = sp[0] - left, spy = sp[1] - top;
  const mask = rp >= 1 ? undefined : `radial-gradient(circle at ${spx}px ${spy}px, #000 ${R}px, transparent ${R + 70}px)`;
  return (
    <>
      <svg width={L.W} height={L.H} style={{position: 'absolute', inset: 0}}>
        <defs><radialGradient id="flare"><stop offset="0" stopColor="#E7A9C8" stopOpacity="0.55" /><stop offset="1" stopColor="#E7A9C8" stopOpacity="0" /></radialGradient></defs>
        <circle cx={sp[0]} cy={sp[1]} r={360} fill="url(#flare)" opacity={Math.exp(-3.5 * (t - h))} />
        <circle cx={sp[0]} cy={sp[1]} r={lerp(20, L.W * 0.45, eo3(ring))} fill="none" stroke={C.wine} strokeWidth={3} opacity={0.4 * (1 - ring)} />
      </svg>
      <Img src={staticFile(L.logo.src)} style={{
        position: 'absolute', left, top, width: L.logo.w, height: L.logo.h,
        transform: punch > 1.0005 ? `scale(${punch})` : undefined, transformOrigin: `${spx}px ${spy}px`,
        WebkitMaskImage: mask, maskImage: mask,
      }} />
      <Headline spec="Compliance *Simplified.*" t={t} t0={B.s6.tagline} size={L.head * 0.82} x={L.W / 2} y={L.taglineY} />
      <Pop t={t} t0={B.s6.cta} x={L.W / 2} y={L.ctaY} k={2.4}>
        <div style={{background: C.wine, color: '#fff', fontFamily: INTER, fontWeight: 600, fontSize: 30, padding: '22px 46px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 16px 36px rgba(102,0,51,0.28)'}}>Get early access  →</div>
      </Pop>
      <div style={{position: 'absolute', left: 0, right: 0, top: L.urlY, textAlign: 'center', fontFamily: INTER, fontWeight: 500, fontSize: 24, color: C.grey,
        opacity: seg(t, B.s6.url, B.s6.url + 0.3), transform: `translateY(${10 * (1 - eo3(seg(t, B.s6.url, B.s6.url + 0.4)))}px)`}}>cyberoz.io</div>
    </>
  );
};

// ---------------------------------------------------------------- main
export const Main: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  loadFonts();
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = frame / fps;
  const L = layoutFor(width, height);
  const [sx, sy] = shake(t, [[B.s3.slam, 14], [B.s4.fail, 5], [B.s6.hit, 10]]);
  const hasMix = withAudio && getStaticFiles().some((f) => f.name === 'mix.wav');
  return (
    <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
      <Background L={L} t={t} />
      <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
        <Stack L={L} t={t} />
        <Headline spec={L.s1Lines} t={t} t0={B.s1.head} tOut={B.s1.out} size={L.bigHead} x={L.s1Center[0]} y={L.s1Center[1]} />
        <Audit L={L} t={t} />
        <Headline spec="Your compliance?" t={t} t0={B.s2.line1} tOut={B.s2.suck} size={L.bigHead * 0.8} x={L.W / 2} y={L.s2Head[1] - L.bigHead * 0.45} />
        <Headline spec="Checked *once a year.*" t={t} t0={B.s2.line2} tOut={B.s2.suck} size={L.bigHead * 0.8} x={L.W / 2} y={L.s2Head[1] + L.bigHead * 0.45} />
        <Connect L={L} t={t} />
        <Checks L={L} t={t} />
        <Headline spec="Something drifts?" t={t} t0={B.s4.headline} tOut={B.s4.instantly - 0.3} size={L.head} x={L.W / 2} y={L.headY} />
        <Headline spec="You see it *instantly.*" t={t} t0={B.s4.instantly} tOut={B.s4.out} size={L.head} x={L.W / 2} y={L.headY} />
        <Headline spec="Audit-ready. *Every day.*" t={t} t0={B.s5.headline} tOut={B.s5.breath} size={L.head} x={L.W / 2} y={L.headY}
          wordT0={[B.s5.headline, B.s5.everyDay, B.s5.everyDay + 0.07]} />
        <Endcard L={L} t={t} />
        <Light L={L} t={t} />
      </AbsoluteFill>
      <Finish L={L} frame={frame} />
      {hasMix ? <Audio src={staticFile('mix.wav')} /> : null}
    </AbsoluteFill>
  );
};
