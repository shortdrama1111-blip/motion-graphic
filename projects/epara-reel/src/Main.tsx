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
  if (t < h.wipe || t > 5.05) return null;
  const a = eio3(seg(t, h.wipe, h.wipe + 0.28)), b = eio3(seg(t, 4.83, 5.03));
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

const VirtualCard: React.FC<{t: number; T: number}> = ({t, T}) => {
  const flip = eo3(seg(t, T + 0.0, T + 0.5));
  const digits = '4821';
  const shown = Math.floor(lerp(0, 4, seg(t, T + 0.45, T + 0.85)));
  const shine = seg(t, T + 1.0, T + 1.5);
  return (
    <div style={{position: 'absolute', left: 150, top: 640, width: 780, height: 490, perspective: 1600}}>
      <div style={{width: '100%', height: '100%', borderRadius: 40, background: GRAD, transform: `rotateY(${lerp(80, 0, flip)}deg) rotateZ(${lerp(-6, -3, flip)}deg)`, opacity: clamp(flip * 3),
        boxShadow: '0 40px 70px rgba(91,42,155,0.35)', position: 'relative', overflow: 'hidden', fontFamily: F, color: '#fff'}}>
        <div style={{position: 'absolute', left: 54, top: 46, fontWeight: 800, fontSize: 58, letterSpacing: -2}}>epara</div>
        <div style={{position: 'absolute', right: 46, top: 52, padding: '8px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.22)', fontWeight: 700, fontSize: 24, letterSpacing: 3}}>VIRTUALE</div>
        <div style={{position: 'absolute', left: 56, top: 170, width: 96, height: 72, borderRadius: 14, background: 'linear-gradient(135deg,#F9E7B4,#D6B25E)'}} />
        <div style={{position: 'absolute', left: 56, bottom: 60, fontWeight: 700, fontSize: 46, letterSpacing: 6, fontVariantNumeric: 'tabular-nums'}}>
          •••• •••• •••• {digits.slice(0, shown)}<span style={{opacity: 0.35}}>{'••••'.slice(shown)}</span>
        </div>
        <div style={{position: 'absolute', top: -100, bottom: -100, width: 160, left: lerp(-300, 1000, shine), transform: 'rotate(20deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.45), rgba(255,255,255,0))', opacity: shine > 0 && shine < 1 ? 1 : 0}} />
      </div>
    </div>
  );
};

const Atm: React.FC<{t: number; T: number}> = ({t, T}) => {
  const n = Math.round(140 * eo3(seg(t, T + 0.1, T + 0.8)));
  return (
    <>
      <Pop t={t} t0={T + 0.05} x={CX} y={600}>
        <div style={{padding: '12px 30px', borderRadius: 999, background: C.navy, color: '#fff', fontFamily: F, fontWeight: 800, fontSize: 40, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>{n}+ ATM</div>
      </Pop>
      <div style={{position: 'absolute', left: 220, top: 680, width: 640, height: 470, borderRadius: 36, background: C.navy, boxShadow: '0 30px 60px rgba(17,21,36,0.25)'}}>
        <div style={{position: 'absolute', left: 50, top: 46, right: 50, height: 190, borderRadius: 20, background: '#1F2540', fontFamily: F, color: '#fff', padding: '30px 36px', boxSizing: 'border-box'}}>
          <div style={{fontWeight: 600, fontSize: 28, color: '#A9AEC6'}}>Tërhiq para</div>
          <div style={{fontWeight: 800, fontSize: 64, color: '#fff'}}>5,000 <span style={{color: C.coral}}>ALL</span></div>
        </div>
        {[...Array(9)].map((_, i) => <div key={i} style={{position: 'absolute', left: 140 + (i % 3) * 66, top: 268 + Math.floor(i / 3) * 52, width: 54, height: 40, borderRadius: 10, background: '#2C3352'}} />)}
        <div style={{position: 'absolute', left: 390, top: 268, width: 130, height: 144, borderRadius: 14, background: '#2C3352'}} />
      </div>
      {/* cash slot + notes */}
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

const SendMoney: React.FC<{t: number; T: number}> = ({t, T}) => {
  const u = eio3(seg(t, T + 0.3, T + 0.85));
  const x = lerp(260, 820, u), y = 860 - Math.sin(Math.PI * u) * 230;
  const av = (name: string, x0: number, col: string) => (
    <div style={{position: 'absolute', left: x0 - 95, top: 765, width: 190, textAlign: 'center', fontFamily: F}}>
      <div style={{width: 190, height: 190, borderRadius: 190, background: col, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 78, boxShadow: '0 20px 40px rgba(17,21,36,0.15)'}}>{name[0]}</div>
      <div style={{marginTop: 14, fontWeight: 700, fontSize: 32, color: C.navy}}>{name}</div>
    </div>
  );
  return (
    <>
      <Pop t={t} t0={T + 0.05} x={CX} y={630}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 28px', borderRadius: 999, background: C.navy, color: '#fff', fontFamily: F, fontWeight: 800, fontSize: 40}}>
          <span style={{width: 26, height: 26, borderRadius: 26, boxShadow: 'inset -9px -4px 0 0 #FFD27A'}} />00:00
        </div>
      </Pop>
      {av('Ti', 260, '#5B2A9B')}
      {av('Ana', 820, C.coral)}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <path d={`M260,860 Q540,400 820,860`} fill="none" stroke={C.line} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
      </svg>
      {u > 0 && u < 1 ? (
        <div style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: 100, background: GRAD, color: '#fff', display: 'grid', placeItems: 'center',
          fontFamily: F, fontWeight: 800, fontSize: 28, boxShadow: '0 16px 30px rgba(200,0,123,0.35)'}}>ALL</div>
      ) : null}
      <Pop t={t} t0={T + 0.9} x={CX} y={1062} from={0.7}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '22px 30px', borderRadius: 28, background: '#fff', border: `1px solid ${C.line}`, boxShadow: '0 20px 40px rgba(17,21,36,0.10)',
          fontFamily: F, whiteSpace: 'nowrap'}}>
          <Check on={1} size={44} />
          <span style={{fontWeight: 700, fontSize: 32, color: C.navy}}>Ana mori 5,000 ALL</span>
          <span style={{padding: '6px 16px', borderRadius: 999, background: '#FFE8EA', color: C.coral, fontWeight: 800, fontSize: 26}}>Falas</span>
        </div>
      </Pop>
    </>
  );
};

const QR: React.FC<{t: number; T: number}> = ({t, T}) => {
  const N = 25, cell = 14;
  let s = 12345;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const finder = (r: number, c: number) => [[0, 0], [0, N - 7], [N - 7, 0]].some(([a, b]) => r >= a && r < a + 7 && c >= b && c < b + 7);
  const mods: [number, number][] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!finder(r, c) && rnd() > 0.52) mods.push([r, c]);
  const scan = seg(t, T + 0.1, T + 0.95);
  const ly = 72 + Math.abs(Math.sin(scan * Math.PI * 1.5)) * N * cell;
  const paid = t >= T + 1.0;
  return (
    <>
      <div style={{...card, left: 250, top: 600, width: 580, height: 600, fontFamily: F, textAlign: 'center'}}>
        <div style={{marginTop: 26, fontWeight: 700, fontSize: 30, color: C.navy}}>Kafeneja</div>
        <svg width={N * cell} height={N * cell} style={{position: 'absolute', left: 290 - (N * cell) / 2, top: 88}}>
          {mods.map(([r, c], i) => <rect key={i} x={c * cell} y={r * cell} width={cell} height={cell} rx={3} fill={C.navy} />)}
          {[[0, 0], [0, N - 7], [N - 7, 0]].map(([r, c], i) => (
            <g key={i}><rect x={c * cell + 5} y={r * cell + 5} width={7 * cell - 10} height={7 * cell - 10} rx={14} fill="none" stroke={C.navy} strokeWidth={10} />
              <rect x={c * cell + 28} y={r * cell + 28} width={3 * cell - 14} height={3 * cell - 14} rx={6} fill={C.coral} /></g>
          ))}
        </svg>
        {scan > 0 && !paid ? <div style={{position: 'absolute', left: 60, right: 60, top: ly + 16, height: 6, borderRadius: 6, background: C.coral, boxShadow: '0 0 24px 6px rgba(250,64,82,0.5)'}} /> : null}
        {[[60, 70, 0], [520, 70, 90], [520, 530, 180], [60, 530, 270]].map(([x, y, r], i) => (
          <div key={i} style={{position: 'absolute', left: x - 4, top: y - 4, width: 46, height: 46, borderTop: `6px solid ${C.coral}`, borderLeft: `6px solid ${C.coral}`, borderTopLeftRadius: 14,
            transform: `rotate(${r}deg)`, transformOrigin: '4px 4px'}} />
        ))}
      </div>
      <Pop t={t} t0={T + 0.98} x={CX} y={1150} from={0.7}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '22px 30px', borderRadius: 28, background: '#fff', border: `1px solid ${C.line}`, boxShadow: '0 20px 40px rgba(17,21,36,0.12)',
          fontFamily: F, whiteSpace: 'nowrap'}}>
          <Check on={1} size={44} /><span style={{fontWeight: 800, fontSize: 34, color: C.navy}}>Paguar · 250 ALL</span>
        </div>
      </Pop>
    </>
  );
};

const ITEMS: {q: string; anim: React.FC<{t: number; T: number}>; stamp?: [number, number]}[] = [
  {q: 'Llogari pa shkuar|*në degë?*', anim: Onboard},
  {q: 'Kartë virtuale,|*menjëherë?*', anim: VirtualCard},
  {q: 'Cash në çdo ATM|*të BKT-së?*', anim: Atm, stamp: [790, 830]},
  {q: 'Para shokut, *falas,*|edhe në mesnatë?', anim: SendMoney, stamp: [540, 1262]},
  {q: 'Paguan me *QR*|kudo?', anim: QR, stamp: [770, 780]},
];

const Item: React.FC<{t: number; i: number}> = ({t, i}) => {
  const T = B.items[i], A = ITEMS[i].anim;
  return (
    <Screen t={t} T={T}>
      <Words text={ITEMS[i].q} t={t} t0={T} size={88} y={360} />
      <A t={t} T={T} />
      <Stamp t={t} t0={T + 1.0} x={ITEMS[i].stamp?.[0]} y={ITEMS[i].stamp?.[1]} />
    </Screen>
  );
};

// ---------------------------------------------------------------- rapid fire + end
const Rapid: React.FC<{t: number}> = ({t}) => {
  const r = B.rapid;
  const chips = ['Kartë fizike, edhe jashtë vendit', 'Llogari në LEK & EUR', 'Transferta RIA', 'Fatura online, 24/7', 'Cashback në çdo pagesë'];
  const br = seg(t, r.breath, r.breath + 0.45);
  if (t > r.breath + 0.5) return null;
  return (
    <Screen t={t} T={r.start} outAt={99}>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - br, filter: br > 0 ? `blur(${14 * br}px)` : undefined, transform: `scale(${1 - 0.04 * br})`}}>
        <Words text="Edhe *më shumë?*" t={t} t0={r.start} size={92} y={330} />
        {chips.map((c, i) => (
          <Pop key={i} t={t} t0={r.start + 0.25 + i * r.chipStep} x={CX} y={560 + i * 130} from={0.6}>
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
  const shakes: [number, number][] = [[B.hook.closed, 8], ...B.items.map((T) => [T + 1.0, 12] as [number, number]), [B.rapid.po, 16], [B.end.hit, 12]];
  const [sx, sy] = shake(t, shakes);
  const hasAudio = withAudio && getStaticFiles().some((f) => f.name === 'sfx.wav');
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
      {hasAudio ? <Audio src={staticFile('sfx.wav')} /> : null}
    </AbsoluteFill>
  );
};
