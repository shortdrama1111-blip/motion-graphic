import React from 'react';
import {AbsoluteFill, Audio, Img, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import B from './beats.json';
import {loadFonts} from './fonts';
import {clamp, eio3, eo3, eo4, eoBack, lerp, seg, shake} from './lib';

// ---------------------------------------------------------------- brand
const C = {
  navy: '#111524', coral: '#FA4052', grey: '#707070', light: '#F7F6F9', line: '#ECEAF0',
  green: '#16A34A',
};
const GRAD = 'linear-gradient(150deg, #F04E45 0%, #E0256A 30%, #C8007B 50%, #5B2A9B 78%, #0072BC 100%)';
const F = 'Jakarta, sans-serif';
const W = 1080, H = 1920, CX = 540;
const card: React.CSSProperties = {
  position: 'absolute', background: '#fff', borderRadius: 36, border: `1px solid ${C.line}`,
  boxShadow: '0 30px 60px rgba(17,21,36,0.10), 0 3px 8px rgba(17,21,36,0.05)',
};

// ---------------------------------------------------------------- primitives
const Words: React.FC<{text: string; t: number; t0: number; size: number; y: number; color?: string; accent?: string; weight?: number; tOut?: number}> =
  ({text, t, t0, size, y, color = C.navy, accent = C.coral, weight = 800, tOut = 1e9}) => {
    if (t < t0 - 0.01) return null;
    const o = seg(t, tOut, tOut + 0.2);
    if (o >= 1) return null;
    const words: {s: string; acc: boolean; br: boolean}[] = [];
    let acc = false;
    text.split('|').forEach((line, li) => line.split(' ').forEach((tok, wi) => {
      let s = tok, a = acc;
      if (s.startsWith('*')) { s = s.slice(1); a = true; acc = true; }
      if (s.endsWith('*')) { s = s.slice(0, -1); acc = false; }
      words.push({s, acc: a, br: li > 0 && wi === 0});
    }));
    return (
      <div style={{position: 'absolute', left: 70, right: 70, top: y, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: F, fontWeight: weight,
        fontSize: size, lineHeight: 1.08, letterSpacing: -0.025 * size, color, opacity: 1 - o, filter: o > 0 ? `blur(${6 * o}px)` : undefined}}>
        {words.map((w, i) => {
          const p = seg(t, t0 + i * 0.05, t0 + i * 0.05 + 0.3);
          return (
            <React.Fragment key={i}>
              {w.br ? <br /> : null}
              <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', padding: '0.05em 0.12em 0.14em', margin: '0 0 -0.12em'}}>
                <span style={{display: 'inline-block', transform: `translateY(${(1 - eo4(p)) * 105}%)`, opacity: clamp(p / 0.35), color: w.acc ? accent : undefined}}>{w.s}</span>
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

const Pop: React.FC<{t: number; t0: number; x: number; y: number; k?: number; from?: number; children: React.ReactNode}> = ({t, t0, x, y, k = 2.2, from = 0.4, children}) => {
  if (t < t0) return null;
  const p = seg(t, t0, t0 + 0.32);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${lerp(from, 1, eoBack(p, k))})`, opacity: clamp(p / 0.12)}}>{children}</div>;
};

// the brand's "PO!" stamp
const Stamp: React.FC<{t: number; t0: number; x?: number; y?: number; scale?: number; label?: string}> = ({t, t0, x = CX, y = 1215, scale = 1, label = 'PO!'}) => {
  if (t < t0) return null;
  const p = seg(t, t0, t0 + 0.14), ring = seg(t, t0, t0 + 0.5);
  return (
    <>
      <div style={{position: 'absolute', left: x, top: y, width: 10, height: 10, transform: 'translate(-50%,-50%)', borderRadius: '50%',
        boxShadow: `0 0 0 ${lerp(0, 260, eo3(ring)) * scale}px rgba(250,64,82,${0.22 * (1 - ring)})`}} />
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(-8deg) scale(${lerp(2.1, 1, eo4(p)) * scale})`, opacity: seg(t, t0, t0 + 0.04),
        background: GRAD, color: '#fff', fontFamily: F, fontWeight: 800, fontSize: 150, lineHeight: 1, letterSpacing: -4, padding: '26px 54px 34px', borderRadius: 40,
        border: '6px solid #fff', boxShadow: '0 24px 50px rgba(200,0,123,0.35)'}}>{label}</div>
    </>
  );
};

const Check: React.FC<{on: number; size?: number}> = ({on, size = 46}) => (
  <div style={{width: size, height: size, borderRadius: size, flex: 'none', display: 'grid', placeItems: 'center', fontSize: size * 0.55, fontWeight: 800, color: '#fff',
    background: on > 0 ? C.coral : '#fff', border: on > 0 ? 'none' : `3px solid ${C.line}`, transform: `scale(${on > 0 ? lerp(0.5, 1, eoBack(on, 2.5)) : 1})`}}>{on > 0 ? '✓' : ''}</div>
);

// vertical "next reel" whip between screens
const Screen: React.FC<{t: number; T: number; inDur?: number; outAt?: number; children: React.ReactNode}> = ({t, T, outAt, children}) => {
  const out = outAt ?? T + 1.83;
  if (t < T - 0.17 || t > out + 0.2) return null;
  const a = eio3(seg(t, T - 0.17, T + 0.03)), b = eio3(seg(t, out, out + 0.2));
  const y = (1 - a) * H - b * H;
  const blur = 16 * (Math.sin(Math.PI * seg(t, T - 0.17, T + 0.03)) + Math.sin(Math.PI * seg(t, out, out + 0.2)));
  return <div style={{position: 'absolute', inset: 0, transform: `translateY(${y}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</div>;
};

// ---------------------------------------------------------------- hook: the bank queue
const Hook: React.FC<{t: number}> = ({t}) => {
  const h = B.hook;
  if (t > h.wipe + 0.35) return null;
  const pr = eo3(seg(t, h.ticket, h.ticket + 0.7)) + 0.012 * Math.sin(t * 90) * (1 - seg(t, h.ticket + 0.55, h.ticket + 0.7)) * seg(t, h.ticket, h.ticket + 0.05);
  const serving = t < h.serve ? '089' : '090';
  const blink = t >= h.serve && t < h.serve + 0.4 ? (Math.sin((t - h.serve) * 50) > 0 ? 1 : 0.35) : 1;
  const minutes = 52 + (t < h.head2 ? 0 : Math.min(8, 3 * Math.floor((t - h.head2) / 0.5 + 1) - 1));
  const mins = Math.min(60, minutes);
  const closed = seg(t, h.closed, h.closed + 0.14);
  return (
    <AbsoluteFill style={{background: '#E4E4E9'}}>
      <Words text="Prapë në *radhë?*" t={t} t0={h.head1} tOut={h.head2 - 0.15} size={104} y={300} color="#2A2D3A" accent={C.coral} />
      <Words text="Dega mbyllet|në *15:00.*" t={t} t0={h.head2} size={92} y={300} color="#2A2D3A" />
      {/* "now serving" LED */}
      <div style={{position: 'absolute', left: 90, top: 500, width: 560, height: 150, borderRadius: 24, background: '#16171D', boxShadow: '0 16px 30px rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', boxSizing: 'border-box'}}>
        <span style={{fontFamily: F, fontWeight: 700, fontSize: 26, color: '#8A8D99', letterSpacing: 3, lineHeight: 1.2}}>DUKE<br />SHËRBYER</span>
        <span style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 92, color: '#FF3B30', opacity: blink, textShadow: '0 0 18px rgba(255,59,48,0.6)', letterSpacing: 6}}>{serving}</span>
      </div>
      {/* wall clock */}
      <div style={{position: 'absolute', left: 720, top: 485, width: 180, height: 180, borderRadius: '50%', background: '#fff', border: '8px solid #2A2D3A', boxSizing: 'border-box'}}>
        {[...Array(12)].map((_, i) => <div key={i} style={{position: 'absolute', left: 79, top: 6, width: 6, height: 14, background: '#2A2D3A', transformOrigin: '3px 76px', transform: `rotate(${i * 30}deg)`}} />)}
        <div style={{position: 'absolute', left: 79, top: 40, width: 6, height: 46, borderRadius: 3, background: '#2A2D3A', transformOrigin: '3px 46px', transform: `rotate(${(14 + mins / 60) * 30}deg)`}} />
        <div style={{position: 'absolute', left: 80, top: 22, width: 4, height: 64, borderRadius: 2, background: C.coral, transformOrigin: '2px 64px', transform: `rotate(${mins * 6}deg)`}} />
        <div style={{position: 'absolute', left: 74, top: 74, width: 16, height: 16, borderRadius: 16, background: '#2A2D3A'}} />
      </div>
      {/* ticket printer slot + ticket */}
      <div style={{position: 'absolute', left: 240, top: 735, width: 600, height: 34, borderRadius: 17, background: '#2A2D3A', zIndex: 2}} />
      <div style={{position: 'absolute', left: 290, top: 752, width: 500, height: 640, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 500, height: 620, background: '#fff', transform: `translateY(${(pr - 1) * 620}px)`,
          clipPath: 'polygon(0 0,100% 0,100% 96%,95% 100%,90% 96%,85% 100%,80% 96%,75% 100%,70% 96%,65% 100%,60% 96%,55% 100%,50% 96%,45% 100%,40% 96%,35% 100%,30% 96%,25% 100%,20% 96%,15% 100%,10% 96%,5% 100%,0 96%)',
          fontFamily: F, color: '#2A2D3A', textAlign: 'center', boxSizing: 'border-box', paddingTop: 50}}>
          <div style={{fontWeight: 600, fontSize: 24, letterSpacing: 4, color: '#9A9AA5'}}>NUMRI JUAJ</div>
          <div style={{fontWeight: 800, fontSize: 210, lineHeight: 1.05, letterSpacing: -8}}>147</div>
          <div style={{margin: '18px 50px', borderTop: '3px dashed #D5D5DC'}} />
          <div style={{fontWeight: 600, fontSize: 32}}>Para jush: <b style={{color: C.coral}}>58</b> klientë</div>
          <div style={{fontWeight: 500, fontSize: 28, color: '#8A8D99', marginTop: 14}}>Pritja: ~1 orë 20 min</div>
          {closed > 0 ? (
            <div style={{position: 'absolute', left: '50%', top: 300, transform: `translate(-50%,-50%) rotate(-14deg) scale(${lerp(2, 1, eo4(closed))})`, opacity: seg(t, h.closed, h.closed + 0.05),
              border: `8px solid ${C.coral}`, color: C.coral, borderRadius: 18, padding: '6px 26px', fontWeight: 800, fontSize: 84, letterSpacing: 4, background: 'rgba(255,255,255,0.88)'}}>MBYLLUR</div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// "Jo më." panel that wipes up over the queue
const NoMore: React.FC<{t: number}> = ({t}) => {
  const h = B.hook;
  const out = B.items[0].T - 0.17;
  if (t < h.wipe || t > out + 0.22) return null;
  const a = eio3(seg(t, h.wipe, h.wipe + 0.28)), b = eio3(seg(t, out, out + 0.2));
  return (
    <div style={{position: 'absolute', inset: 0, background: GRAD, transform: `translateY(${(1 - a) * H - b * H}px)`, borderRadius: lerp(120, 0, a)}}>
      <Words text="Jo më." t={t} t0={h.nomore} size={210} y={720} color="#fff" />
      <Words text="Me *epara* gjithçka|është në telefon." t={t} t0={h.phone} size={64} y={960} color="#fff" accent="#FFE3E6" weight={700} />
    </div>
  );
};

// ---------------------------------------------------------------- the five "PO!" moments
const Onboard: React.FC<{t: number; T: number}> = ({t, T}) => {
  const steps = ['Numri i telefonit', 'Karta e identitetit', 'Selfie'];
  const done = seg(t, T + 1.0, T + 1.2);
  return (
    <div style={{...card, left: 150, top: 640, width: 780, height: 500, padding: '46px 54px', boxSizing: 'border-box', fontFamily: F, color: C.navy}}>
      <div style={{fontWeight: 800, fontSize: 40}}>Hap llogarinë</div>
      <div style={{fontWeight: 500, fontSize: 26, color: C.grey, marginTop: 4}}>Vetëm me telefonin tënd</div>
      {steps.map((s, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: i ? 20 : 34, fontWeight: 600, fontSize: 32}}>
          <Check on={seg(t, T + 0.2 + i * 0.25, T + 0.45 + i * 0.25)} />{s}
        </div>
      ))}
      <div style={{position: 'absolute', left: 54, right: 54, bottom: 50, height: 14, borderRadius: 14, background: '#F1EEF3', overflow: 'hidden'}}>
        <div style={{width: `${100 * eio3(seg(t, T + 0.1, T + 0.95))}%`, height: '100%', background: GRAD}} />
      </div>
      {done > 0 ? <div style={{position: 'absolute', right: 54, top: 50, padding: '10px 22px', borderRadius: 999, background: '#FFE8EA', color: C.coral, fontWeight: 800, fontSize: 26, opacity: done}}>U hap!</div> : null}
    </div>
  );
};

const CARD_AR = 48 / 30.496;
const CardImg: React.FC<{w: number; style?: React.CSSProperties}> = ({w, style}) => (
  <Img src={staticFile('virtual-card.svg')} style={{width: w, height: w * CARD_AR, display: 'block', filter: 'drop-shadow(0 30px 40px rgba(46,47,129,0.35))', ...style}} />
);

const QRCode: React.FC<{cell: number; seed?: number}> = ({cell, seed = 12345}) => {
  const N = 25;
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const finder = (r: number, c: number) => [[0, 0], [0, N - 7], [N - 7, 0]].some(([a, b]) => r >= a && r < a + 7 && c >= b && c < b + 7);
  const mods: [number, number][] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!finder(r, c) && rnd() > 0.52) mods.push([r, c]);
  return (
    <svg width={N * cell} height={N * cell} style={{display: 'block'}}>
      {mods.map(([r, c], i) => <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} rx={cell * 0.22} fill={C.navy} />)}
      {[[0, 0], [0, N - 7], [N - 7, 0]].map(([r, c], i) => (
        <g key={i}><rect x={c * cell + cell * 0.4} y={r * cell + cell * 0.4} width={7 * cell - cell * 0.8} height={7 * cell - cell * 0.8} rx={cell} fill="none" stroke={C.navy} strokeWidth={cell * 0.75} />
          <rect x={c * cell + 2 * cell} y={r * cell + 2 * cell} width={3 * cell} height={3 * cell} rx={cell * 0.45} fill={C.coral} /></g>
      ))}
    </svg>
  );
};

const Chip: React.FC<{children: React.ReactNode; size?: number; dark?: boolean}> = ({children, size = 32, dark}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: `${size * 0.6}px ${size * 0.95}px`, borderRadius: 999, whiteSpace: 'nowrap', fontFamily: F, fontWeight: 700, fontSize: size,
    background: dark ? C.navy : '#fff', color: dark ? '#fff' : C.navy, border: dark ? 'none' : `1px solid ${C.line}`, boxShadow: '0 18px 36px rgba(17,21,36,0.10)'}}>{children}</div>
);

// 2. virtual card: created in-app, flips out, shine
const VirtualCard: React.FC<{t: number; T: number}> = ({t, T}) => {
  const flip = eo3(seg(t, T, T + 0.5)), shine = seg(t, T + 1.0, T + 1.5), w = 340;
  return (
    <>
      <div style={{position: 'absolute', left: CX - w / 2, top: 630, perspective: 1600}}>
        <div style={{position: 'relative', transform: `rotateY(${lerp(85, 0, flip)}deg) rotateZ(${lerp(-10, -4, flip)}deg) scale(${lerp(0.8, 1, flip)})`, opacity: clamp(flip * 3), borderRadius: 18, overflow: 'hidden'}}>
          <CardImg w={w} />
          <div style={{position: 'absolute', top: -100, bottom: -100, width: 140, left: lerp(-250, 600, shine), transform: 'rotate(20deg)',
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.5), rgba(255,255,255,0))', opacity: shine > 0 && shine < 1 ? 1 : 0}} />
        </div>
      </div>
      <Pop t={t} t0={T + 0.55} x={CX} y={1250} from={0.7}><Chip size={30}><Check on={1} size={40} />Gati për blerje online</Chip></Pop>
    </>
  );
};

// 3. physical card: lands with depth, flies abroad
const PhysicalCard: React.FC<{t: number; T: number}> = ({t, T}) => {
  const land = eo4(seg(t, T, T + 0.45)), w = 320;
  const fl = eio3(seg(t, T + 0.35, T + 0.95));
  const px = lerp(140, 940, fl), py = 660 - Math.sin(Math.PI * fl) * 90;
  const ang = Math.atan2(-Math.cos(Math.PI * fl) * 90 * Math.PI, 800) * 57.3;
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d="M140,660 Q540,480 940,660" fill="none" stroke="#D9D3E3" strokeWidth={5} strokeDasharray="2 14" strokeLinecap="round" />
        {fl > 0 && fl < 1 ? <g transform={`translate(${px},${py}) rotate(${ang})`}><path d="M-22,0 L22,0 M4,-20 L12,0 L4,20 M-16,-8 L-12,0 L-16,8" stroke={C.navy} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" /></g> : null}
      </svg>
      <div style={{position: 'absolute', left: CX - 150, top: 1180, width: 300, height: 40, borderRadius: '50%', background: 'rgba(17,21,36,0.18)', filter: 'blur(14px)', opacity: land}} />
      <div style={{position: 'absolute', left: CX - w / 2, top: lerp(380, 690, land), perspective: 1400, opacity: clamp(land * 4)}}>
        <div style={{transform: `rotateX(${lerp(55, 12, land)}deg) rotateZ(${lerp(-25, -8, land)}deg)`, borderRadius: 18, boxShadow: '0 6px 0 #1E2A6B, 0 12px 0 rgba(17,21,36,0.12)'}}>
          <CardImg w={w} />
        </div>
      </div>
      <Pop t={t} t0={T + 0.8} x={CX} y={1268} from={0.7}><Chip size={30}><Check on={1} size={40} />Paguar jashtë · 24.00 €</Chip></Pop>
    </>
  );
};

// 4. pay with QR or with the card
const Pay: React.FC<{t: number; T: number}> = ({t, T}) => {
  const scan = seg(t, T + 0.1, T + 0.55);
  const tap = eio3(seg(t, T + 0.5, T + 0.82));
  const wave = seg(t, T + 0.82, T + 1.3);
  const paid = t >= T + 0.95;
  return (
    <>
      <div style={{...card, left: 80, top: 650, width: 400, height: 480, borderRadius: 32, textAlign: 'center', fontFamily: F}}>
        <div style={{marginTop: 24, fontWeight: 700, fontSize: 28, color: C.navy}}>Skano QR</div>
        <div style={{position: 'absolute', left: 200 - 137, top: 90}}><QRCode cell={11} /></div>
        {scan > 0 && scan < 1 ? <div style={{position: 'absolute', left: 40, right: 40, top: 90 + Math.abs(Math.sin(scan * Math.PI)) * 275, height: 6, borderRadius: 6, background: C.coral, boxShadow: '0 0 24px 6px rgba(250,64,82,0.5)'}} /> : null}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', opacity: seg(t, T + 0.6, T + 0.75)}}><Check on={seg(t, T + 0.6, T + 0.85)} size={50} /></div>
      </div>
      <div style={{position: 'absolute', left: CX - 48, top: 842, width: 96, height: 96, borderRadius: 96, background: C.navy, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: F, fontWeight: 800, fontSize: 32, zIndex: 2}}>ose</div>
      <div style={{position: 'absolute', left: 620, top: 690, width: 320, height: 450, borderRadius: 36, background: C.navy, boxShadow: '0 30px 60px rgba(17,21,36,0.25)'}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 34, height: 170, borderRadius: 20, background: paid ? '#1C3A2E' : '#1F2540', fontFamily: F, color: '#fff', textAlign: 'center', paddingTop: 34, boxSizing: 'border-box'}}>
          <div style={{fontWeight: 600, fontSize: 24, color: '#A9AEC6'}}>{paid ? 'Paguar' : 'Totali'}</div>
          <div style={{fontWeight: 800, fontSize: 48}}>{paid ? '✓' : '250 ALL'}</div>
        </div>
        {[...Array(9)].map((_, i) => <div key={i} style={{position: 'absolute', left: 64 + (i % 3) * 68, top: 240 + Math.floor(i / 3) * 56, width: 56, height: 42, borderRadius: 10, background: '#2C3352'}} />)}
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {wave > 0 && wave < 1 ? [0, 1, 2].map((k) => {
          const r = 40 + 60 * k + 40 * wave;
          return <path key={k} d={`M${780 - r},${700 - r * 0.2} A${r},${r} 0 0 1 ${780 + r},${700 - r * 0.2}`} fill="none" stroke={C.coral} strokeWidth={6} strokeLinecap="round" opacity={(1 - wave) * (1 - k * 0.25)} />;
        }) : null}
      </svg>
      <div style={{position: 'absolute', left: lerp(1150, 700, tap), top: lerp(380, 520, tap), transform: `rotate(${lerp(30, -12, tap)}deg)`, zIndex: 3}}>
        <CardImg w={170} />
      </div>
    </>
  );
};

// 5. ATM: free at BKT ATMs, cash from any ATM
const Atm: React.FC<{t: number; T: number}> = ({t, T}) => {
  const n = Math.round(140 * eo3(seg(t, T + 0.1, T + 0.8)));
  return (
    <>
      <Pop t={t} t0={T + 0.05} x={CX} y={600}>
        <div style={{padding: '14px 30px', borderRadius: 999, background: C.navy, color: '#fff', fontFamily: F, fontWeight: 800, fontSize: 34, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
          Pa komision në <span style={{color: C.coral}}>{n}+</span> ATM të BKT-së</div>
      </Pop>
      <div style={{position: 'absolute', left: 220, top: 680, width: 640, height: 470, borderRadius: 36, background: C.navy, boxShadow: '0 30px 60px rgba(17,21,36,0.25)'}}>
        <div style={{position: 'absolute', left: 50, top: 46, right: 50, height: 190, borderRadius: 20, background: '#1F2540', fontFamily: F, color: '#fff', padding: '30px 36px', boxSizing: 'border-box'}}>
          <div style={{fontWeight: 600, fontSize: 28, color: '#A9AEC6'}}>Tërhiq para</div>
          <div style={{fontWeight: 800, fontSize: 64, color: '#fff'}}>5,000 <span style={{color: C.coral}}>ALL</span></div>
        </div>
        {[...Array(9)].map((_, i) => <div key={i} style={{position: 'absolute', left: 140 + (i % 3) * 66, top: 268 + Math.floor(i / 3) * 52, width: 54, height: 40, borderRadius: 10, background: '#2C3352'}} />)}
        <div style={{position: 'absolute', left: 390, top: 268, width: 130, height: 144, borderRadius: 14, background: '#2C3352'}} />
      </div>
      <div style={{position: 'absolute', left: 300, top: 1150, width: 480, height: 26, borderRadius: 13, background: '#0A0C15', zIndex: 3}} />
      <div style={{position: 'absolute', left: 330, top: 1163, width: 420, height: 230, overflow: 'hidden'}}>
        {[0, 1, 2].map((k) => {
          const p = eo3(seg(t, T + 1.0 + k * 0.08, T + 1.35 + k * 0.08));
          return <div key={k} style={{position: 'absolute', left: 20 + k * 6, top: lerp(-200, 10 + k * 8, p), width: 380, height: 190, borderRadius: 12, background: '#FBE3E6',
            border: '3px solid #F4B9C1', boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: F, fontWeight: 800, fontSize: 54, color: '#E0566A'}}>5000</div>;
        })}
      </div>
    </>
  );
};

// 6. midnight transfer: night scene, two phones, comet coin
const NightBg: React.FC<{t: number}> = ({t}) => {
  let s = 777;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const stars = [...Array(55)].map(() => [rnd() * W, rnd() * 1300, 1.5 + rnd() * 3.5, rnd() * 6]);
  const blds = [...Array(11)].map((_, i) => [i * 100 - 10 + rnd() * 20, 110 + rnd() * 40, 230 + rnd() * 260]);
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#060917 0%,#12123A 55%,#2B1450 100%)'}}>
      {stars.map(([x, y, r, ph], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: r, background: '#fff', opacity: 0.25 + 0.75 * Math.abs(Math.sin(t * 2.2 + ph))}} />)}
      <div style={{position: 'absolute', left: 820, top: 150, width: 120, height: 120, borderRadius: 120, boxShadow: 'inset -30px -8px 0 0 #FFE6A8', filter: 'drop-shadow(0 0 30px rgba(255,230,168,0.5))', transform: 'rotate(-20deg)'}} />
      {blds.map(([x, w, h], i) => {
        let q = i * 97 + 3;
        const r2 = () => ((q = (q * 1103515245 + 12345) % 2147483648) / 2147483648);
        return (
          <div key={i} style={{position: 'absolute', left: x, bottom: 0, width: w, height: 1920 - 1420 + h - 230, background: '#0B0E22'}}>
            {[...Array(14)].map((_, k) => <div key={k} style={{position: 'absolute', left: 14 + (k % 3) * 34, top: 22 + Math.floor(k / 3) * 48, width: 18, height: 24, borderRadius: 3,
              background: '#FFD27A', opacity: r2() > 0.55 ? 0.75 : 0.06}} />)}
          </div>
        );
      })}
    </div>
  );
};

const NightSend: React.FC<{t: number; T: number}> = ({t, T}) => {
  const fly = (tt: number) => eio3(seg(tt, T + 0.3, T + 0.85));
  const pos = (u: number): [number, number] => [lerp(300, 780, u), 905 - Math.sin(Math.PI * u) * 230];
  const u = fly(t);
  const trail = [...Array(14)].map((_, k) => pos(fly(t - k * 0.02)));
  const recv = seg(t, T + 0.85, T + 1.05);
  const press = t > T + 0.2 && t < T + 0.35 ? 0.92 : 1;
  const colon = Math.floor(t * 2) % 2 === 0 ? 1 : 0.25;
  const phone = (x: number, children: React.ReactNode, lit: number) => (
    <div style={{position: 'absolute', left: x - 130, top: 760, width: 260, height: 480, borderRadius: 44, background: '#1A1F38', border: '3px solid #2E3560', boxSizing: 'border-box', padding: 12,
      boxShadow: `0 0 ${60 * lit}px rgba(250,64,82,${0.45 * lit})`}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 32, background: lit > 0 ? `rgba(40,30,80,${0.6 + 0.4 * lit})` : '#0F1326', overflow: 'hidden', fontFamily: F, color: '#fff'}}>{children}</div>
    </div>
  );
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: F, fontWeight: 800, fontSize: 150, color: '#fff', letterSpacing: -2,
        textShadow: '0 0 30px rgba(200,0,123,0.8), 0 0 70px rgba(91,42,155,0.7)', opacity: seg(t, T, T + 0.2)}}>00<span style={{opacity: colon}}>:</span>00</div>
      {phone(260, (
        <div style={{padding: '40px 22px', textAlign: 'center'}}>
          <div style={{fontWeight: 600, fontSize: 22, color: '#A9AEC6'}}>Dërgo te Ana</div>
          <div style={{fontWeight: 800, fontSize: 40, marginTop: 30}}>5,000</div>
          <div style={{fontWeight: 700, fontSize: 22, color: C.coral}}>ALL</div>
          <div style={{margin: '70px auto 0', width: 170, padding: '16px 0', borderRadius: 999, background: GRAD, fontWeight: 800, fontSize: 26, transform: `scale(${press})`}}>Dërgo</div>
        </div>
      ), 0)}
      {phone(820, (
        <>
          <div style={{position: 'absolute', left: 12, right: 12, top: lerp(-120, 34, eoBack(recv, 1.8)), padding: '16px 16px', borderRadius: 20, background: '#fff', color: C.navy, opacity: clamp(recv * 3)}}>
            <div style={{fontWeight: 600, fontSize: 17, color: C.grey}}>epara · tani</div>
            <div style={{fontWeight: 800, fontSize: 24, marginTop: 4}}>+5,000 ALL</div>
            <div style={{display: 'inline-block', marginTop: 8, padding: '4px 12px', borderRadius: 999, background: '#FFE8EA', color: C.coral, fontWeight: 800, fontSize: 18}}>Falas</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center', fontWeight: 800, fontSize: 64, opacity: recv}}>Ana</div>
        </>
      ), recv)}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {u > 0 && u < 1 ? trail.slice(0, -1).map((p, k) => (
          <line key={k} x1={p[0]} y1={p[1]} x2={trail[k + 1][0]} y2={trail[k + 1][1]} stroke={k < 5 ? '#FFB3C1' : '#C8007B'} strokeWidth={22 - k * 1.4} strokeLinecap="round" opacity={0.9 * (1 - k / 14)} />
        )) : null}
        {recv > 0 && recv < 1 ? [...Array(12)].map((_, k) => {
          const a = (k / 12) * Math.PI * 2, d = 30 + 110 * eo3(recv);
          return <circle key={k} cx={780 + Math.cos(a) * d} cy={905 + Math.sin(a) * d} r={6 * (1 - recv)} fill="#FFD27A" />;
        }) : null}
      </svg>
      {u > 0 && u < 1 ? (
        <div style={{position: 'absolute', left: pos(u)[0] - 40, top: pos(u)[1] - 40, width: 80, height: 80, borderRadius: 80, background: GRAD, color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: F, fontWeight: 800, fontSize: 22, boxShadow: '0 0 40px 10px rgba(250,64,82,0.6)'}}>ALL</div>
      ) : null}
    </>
  );
};

// 7. RIA: money from abroad lands home
const Ria: React.FC<{t: number; T: number}> = ({t, T}) => {
  const u = eio3(seg(t, T + 0.25, T + 0.85));
  const p0: [number, number] = [250, 720], p1: [number, number] = [810, 1000];
  const ctrl: [number, number] = [560, 560];
  const at = (v: number): [number, number] => [(1 - v) ** 2 * p0[0] + 2 * (1 - v) * v * ctrl[0] + v * v * p1[0], (1 - v) ** 2 * p0[1] + 2 * (1 - v) * v * ctrl[1] + v * v * p1[1]];
  const pin = (x: number, y: number, label: string, t0: number) => (
    <Pop t={t} t0={t0} x={x} y={y}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <div style={{width: 56, height: 56, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: GRAD, boxShadow: '0 10px 20px rgba(200,0,123,0.35)'}} />
        <Chip size={26}>{label}</Chip>
      </div>
    </Pop>
  );
  return (
    <>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <circle cx={CX} cy={880} r={330} fill="none" stroke="#E6E0EE" strokeWidth={4} />
        {[0.25, 0.55, 0.85].map((k, i) => <ellipse key={i} cx={CX} cy={880} rx={330 * Math.abs(Math.cos(t * 0.6 + k * 3))} ry={330} fill="none" stroke="#ECE7F2" strokeWidth={3} />)}
        {[-200, 0, 200].map((dy, i) => <ellipse key={i} cx={CX} cy={880 + dy} rx={Math.sqrt(330 * 330 - dy * dy)} ry={22} fill="none" stroke="#ECE7F2" strokeWidth={3} />)}
        <path d={`M${p0[0]},${p0[1]} Q${ctrl[0]},${ctrl[1]} ${p1[0]},${p1[1]}`} fill="none" stroke="#D2C8DE" strokeWidth={5} strokeDasharray="2 14" strokeLinecap="round" />
      </svg>
      {pin(p0[0], p0[1] + 10, 'Jashtë vendit', T + 0.05)}
      {pin(p1[0], p1[1] + 10, 'Shqipëri', T + 0.15)}
      {u > 0 && u < 1 ? (
        <div style={{position: 'absolute', left: at(u)[0] - 44, top: at(u)[1] - 44, width: 88, height: 88, borderRadius: 88, background: GRAD, color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: F, fontWeight: 800, fontSize: 40, boxShadow: '0 16px 30px rgba(200,0,123,0.4)'}}>€</div>
      ) : null}
      <Pop t={t} t0={T + 0.9} x={CX} y={1258} from={0.7}><Chip size={30}><Check on={1} size={40} />Transfertë RIA · +200 €</Chip></Pop>
    </>
  );
};

// 8. cashback: coins jump back out of a payment
const Cashback: React.FC<{t: number; T: number}> = ({t, T}) => {
  const lands = [0, 1, 2, 3, 4].map((k) => T + 0.55 + k * 0.08);
  const bump = lands.reduce((a, l) => a + (t >= l ? Math.exp(-14 * (t - l)) : 0), 0);
  return (
    <>
      <div style={{...card, left: CX - 320, top: 640, width: 640, height: 300, fontFamily: F, padding: '40px 48px', boxSizing: 'border-box'}}>
        <div style={{fontWeight: 600, fontSize: 28, color: C.grey}}>Pagesë me epara</div>
        <div style={{fontWeight: 800, fontSize: 80, color: C.navy, letterSpacing: -2}}>1,200 <span style={{color: C.coral}}>ALL</span></div>
        <div style={{position: 'absolute', right: 48, top: 44}}><Check on={1} size={50} /></div>
      </div>
      {lands.map((l, k) => {
        const p = seg(t, T + 0.3 + k * 0.08, l);
        if (p <= 0 || p >= 1) return null;
        const x0 = CX - 160 + k * 80, x = lerp(x0, CX, p), y = lerp(860, 1150, p) - Math.sin(Math.PI * p) * 300;
        return <div key={k} style={{position: 'absolute', left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 68, background: GRAD, color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: F, fontWeight: 800, fontSize: 30, boxShadow: '0 10px 20px rgba(200,0,123,0.35)', transform: `rotate(${p * 360}deg)`}}>e</div>;
      })}
      <Pop t={t} t0={T + 0.3} x={CX} y={1160} from={0.6}>
        <div style={{transform: `scale(${1 + 0.12 * bump})`, padding: '26px 56px', borderRadius: 999, background: GRAD, color: '#fff', fontFamily: F, fontWeight: 800, fontSize: 44, whiteSpace: 'nowrap',
          boxShadow: '0 20px 40px rgba(200,0,123,0.3)'}}>+ Cashback</div>
      </Pop>
    </>
  );
};

const ITEMS: Record<string, {q: string; anim: React.FC<{t: number; T: number}>; stamp?: [number, number]; scale?: number; dark?: boolean}> = {
  onboard: {q: 'Llogari pa shkuar|*në degë?*', anim: Onboard},
  vcard: {q: 'Kartë virtuale,|*menjëherë?*', anim: VirtualCard, stamp: [810, 760]},
  pcard: {q: 'Kartë fizike, edhe|*jashtë vendit?*', anim: PhysicalCard, stamp: [810, 780]},
  pay: {q: 'Paguan me *QR*|ose me *kartë?*', anim: Pay, stamp: [540, 1262]},
  atm: {q: 'Cash në|*çdo ATM?*', anim: Atm, stamp: [790, 830]},
  night: {q: 'Para shokut, *falas,*|edhe në mesnatë?', anim: NightSend, stamp: [540, 1300], scale: 0.85, dark: true},
  ria: {q: 'Transferta me|*RIA?*', anim: Ria, stamp: [820, 760]},
  cashback: {q: 'Cashback sa herë|*paguan?*', anim: Cashback, stamp: [820, 700]},
};

const Item: React.FC<{t: number; i: number}> = ({t, i}) => {
  const {T, po, key} = B.items[i], it = ITEMS[key], A = it.anim;
  const next = i + 1 < B.items.length ? B.items[i + 1].T : B.rapid.start;
  return (
    <Screen t={t} T={T} outAt={next - 0.17}>
      {it.dark ? <NightBg t={t} /> : null}
      <Words text={it.q} t={t} t0={T} size={88} y={360} color={it.dark ? '#fff' : C.navy} accent={it.dark ? '#FF6B7A' : C.coral} />
      <A t={t} T={po - 1.0} />
      <Stamp t={t} t0={po} x={it.stamp?.[0]} y={it.stamp?.[1]} scale={it.scale} />
    </Screen>
  );
};

// ---------------------------------------------------------------- rapid fire + end
const Rapid: React.FC<{t: number}> = ({t}) => {
  const r = B.rapid;
  const chips = ['Llogari në LEK & EUR', 'Fatura online, 24/7', 'Shto para nga banka ose karta', 'epara Biznes'];
  const br = seg(t, r.breath, r.breath + 0.45);
  if (t > r.breath + 0.5) return null;
  return (
    <Screen t={t} T={r.start} outAt={99}>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - br, filter: br > 0 ? `blur(${14 * br}px)` : undefined, transform: `scale(${1 - 0.04 * br})`}}>
        <Words text="Edhe *më shumë?*" t={t} t0={r.start} size={92} y={330} />
        {chips.map((c, i) => (
          <Pop key={i} t={t} t0={r.start + r.chipStart + i * r.chipStep} x={CX} y={590 + i * 140} from={0.6}>
            <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '22px 34px', borderRadius: 999, background: '#fff', border: `1px solid ${C.line}`,
              boxShadow: '0 18px 36px rgba(17,21,36,0.09)', fontFamily: F, fontWeight: 700, fontSize: 38, color: C.navy, whiteSpace: 'nowrap'}}>
              <Check on={1} size={44} />{c}
            </div>
          </Pop>
        ))}
        <Stamp t={t} t0={r.po} y={1300} scale={1.2} />
      </div>
    </Screen>
  );
};

const End: React.FC<{t: number}> = ({t}) => {
  const e = B.end;
  if (t < e.hit - 0.02) return null;
  const punch = 1 + 0.08 * Math.exp(-8 * (t - e.hit));
  const reveal = eo3(seg(t, e.hit, e.hit + 0.35));
  const ring = seg(t, e.hit, e.hit + 0.8);
  const LW = 640, LH = Math.round((LW * 49.057) / 80.645);
  const mask = reveal >= 1 ? undefined : `radial-gradient(circle at 50% 50%, #000 ${reveal * 70}%, transparent ${reveal * 70 + 12}%)`;
  return (
    <>
      <div style={{position: 'absolute', left: CX, top: 760, width: 10, height: 10, borderRadius: 10, transform: 'translate(-50%,-50%)',
        boxShadow: `0 0 0 ${lerp(0, 700, eo3(ring))}px rgba(200,0,123,${0.12 * (1 - ring)})`}} />
      <div style={{position: 'absolute', left: CX - 500, top: 760 - 500, width: 1000, height: 1000, borderRadius: '50%', opacity: 0.55 * Math.exp(-3 * (t - e.hit)),
        background: 'radial-gradient(circle, rgba(240,78,69,0.45), rgba(200,0,123,0.25) 40%, rgba(0,114,188,0) 70%)'}} />
      <Img src={staticFile('epara-logo.svg')} style={{position: 'absolute', left: Math.round(CX - LW / 2), top: Math.round(760 - LH / 2), width: LW, height: LH,
        transform: punch > 1.0005 ? `scale(${punch})` : undefined, WebkitMaskImage: mask, maskImage: mask}} />
      {t >= e.tagline ? (
        <Img src={staticFile('tagline.svg')} style={{position: 'absolute', left: CX - 330, top: 790, width: 660, height: 330,
          opacity: seg(t, e.tagline, e.tagline + 0.25), transform: `translateY(${24 * (1 - eo3(seg(t, e.tagline, e.tagline + 0.4)))}px)`}} />
      ) : null}
      <Pop t={t} t0={e.cta} x={CX} y={1210} k={2.4}>
        <div style={{background: GRAD, color: '#fff', fontFamily: F, fontWeight: 800, fontSize: 44, padding: '28px 64px', borderRadius: 999, whiteSpace: 'nowrap',
          boxShadow: '0 20px 40px rgba(200,0,123,0.3)'}}>Shkarko falas</div>
      </Pop>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', fontFamily: F, fontWeight: 600, fontSize: 30, color: C.grey,
        opacity: seg(t, e.cta + 0.25, e.cta + 0.5)}}>App Store · Google Play</div>
    </>
  );
};

const Backdrop: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: C.light}}>
    {[['#FFD9DC', 0.15, 0.2, 0.75], ['#F3D4EA', 0.9, 0.55, 0.7], ['#D6E6F7', 0.3, 0.92, 0.7]].map(([col, x, y, s], i) => {
      const d = H * (s as number);
      return <div key={i} style={{position: 'absolute', width: d, height: d, borderRadius: '50%', background: col as string, filter: 'blur(110px)', opacity: 0.8,
        left: W * (x as number) - d / 2 + Math.sin(t * 0.4 + i * 2) * 50, top: H * (y as number) - d / 2 + Math.cos(t * 0.35 + i) * 40}} />;
    })}
  </AbsoluteFill>
);

// ---------------------------------------------------------------- main
export const Main: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  loadFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const shakes: [number, number][] = [[B.hook.closed, 8], ...B.items.map((it) => [it.po, 12] as [number, number]), [B.rapid.po, 16], [B.end.hit, 12]];
  const [sx, sy] = shake(t, shakes);
  const files = getStaticFiles().map((f) => f.name);
  const track = files.includes('final-mix.wav') ? 'final-mix.wav' : files.includes('sfx.wav') ? 'sfx.wav' : null;
  const hasAudio = withAudio && !!track;
  return (
    <AbsoluteFill style={{background: C.light, overflow: 'hidden'}}>
      <Backdrop t={t} />
      <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
        {B.items.map((_, i) => <Item key={i} t={t} i={i} />)}
        <Rapid t={t} />
        <End t={t} />
        <Hook t={t} />
        <NoMore t={t} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.06}}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
      {hasAudio ? <Audio src={staticFile(track!)} /> : null}
    </AbsoluteFill>
  );
};
