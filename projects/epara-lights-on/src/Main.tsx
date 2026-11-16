import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, getStaticFiles, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import B from './beats.json';
import L from './lockmark.json';
import {loadFonts} from './fonts';
import {clamp, eio3, eo3, eo4, eoBack, lerp, seg, shake} from './lib';

const W = 1080, H = 1920;
const F = 'Jakarta, sans-serif';
const GRAD = 'linear-gradient(110deg,#F04E45 0%,#E0256A 30%,#C8007B 52%,#5B2A9B 78%,#0072BC 100%)';
// photo plates are 1116x2000: cover-fit into 1080x1920
const PS = 0.968, POY = -8;
const pp = (x: number, y: number) => [x * PS, y * PS + POY];

// ---------------------------------------------------------------- helpers
const Plate: React.FC<{src: string; scale?: number; ox?: number; oy?: number; style?: React.CSSProperties}> = ({src, scale = 1, ox = 540, oy = 960, style}) => (
  <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: POY, width: 1116 * PS, height: 2000 * PS, transformOrigin: `${ox}px ${oy}px`, transform: `scale(${scale})`, ...style}} />
);

// whip-in: every scene enters with a short zoom + blur, which hides the cut
const Enter: React.FC<{t: number; t0: number; children: React.ReactNode}> = ({t, t0, children}) => {
  const u = seg(t, t0, t0 + 0.22);
  return <AbsoluteFill style={{transform: `scale(${lerp(1.12, 1, eo3(u))})`, filter: u < 1 ? `blur(${18 * (1 - u)}px) brightness(${lerp(1.2, 1, u)})` : undefined}}>{children}</AbsoluteFill>;
};

const Pop: React.FC<{t: number; t0: number; x: number; y: number; rot?: number; children: React.ReactNode}> = ({t, t0, x, y, rot = 0, children}) => {
  if (t < t0) return null;
  const p = seg(t, t0, t0 + 0.32);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${lerp(0.5, 1, eoBack(p, 2.2))})`, opacity: clamp(p / 0.12)}}>{children}</div>;
};

const Chip: React.FC<{children: React.ReactNode; size?: number; dark?: boolean}> = ({children, size = 34, dark}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.45, padding: `${size * 0.55}px ${size * 0.9}px`, borderRadius: 999, whiteSpace: 'nowrap', fontFamily: F, fontWeight: 700, fontSize: size,
    background: dark ? 'rgba(14,16,32,0.72)' : 'rgba(255,255,255,0.96)', color: dark ? '#fff' : '#111524', border: dark ? '1.5px solid rgba(255,255,255,0.18)' : 'none',
    boxShadow: '0 18px 40px rgba(0,0,0,0.35)', backdropFilter: 'blur(14px)'}}>{children}</div>
);
const Tick: React.FC<{s?: number}> = ({s = 38}) => (
  <span style={{width: s, height: s, borderRadius: s, background: '#2EAD5E', color: '#fff', display: 'grid', placeItems: 'center', fontSize: s * 0.6, fontWeight: 800}}>✓</span>
);

// a glowing gradient light streak from p0 to p1, head at progress u
const Streak: React.FC<{p0: number[]; p1: number[]; u: number; width?: number; lift?: number}> = ({p0, p1, u, width = 14, lift = 0}) => {
  if (u <= 0 || u >= 1.25) return null;
  const pt = (v: number) => {
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2 - lift;
    const a = [lerp(p0[0], mx, v), lerp(p0[1], my, v)], b = [lerp(mx, p1[0], v), lerp(my, p1[1], v)];
    return [lerp(a[0], b[0], v), lerp(a[1], b[1], v)];
  };
  const head = Math.min(1, u), tail = Math.max(0, head - 0.35) + Math.max(0, u - 1) * 2.8;
  const pts = [...Array(24)].map((_, i) => pt(lerp(tail, head, i / 23)));
  const d = 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L');
  const h = pt(head);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs><linearGradient id="sg" gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}>
        <stop offset="0" stopColor="#F04E45" /><stop offset="0.5" stopColor="#C8007B" /><stop offset="1" stopColor="#5B2A9B" /></linearGradient>
        <filter id="sb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter></defs>
      <path d={d} stroke="url(#sg)" strokeWidth={width * 3} strokeLinecap="round" fill="none" opacity={0.55} filter="url(#sb)" />
      <path d={d} stroke="url(#sg)" strokeWidth={width} strokeLinecap="round" fill="none" />
      <path d={d} stroke="#fff" strokeWidth={width * 0.3} strokeLinecap="round" fill="none" opacity={0.8} />
      {u < 1 ? <circle cx={h[0]} cy={h[1]} r={width * 1.6} fill="#fff" opacity={0.9} filter="url(#sb)" /> : null}
    </svg>
  );
};

const Glow: React.FC<{x: number; y: number; r: number; a: number; color?: string}> = ({x, y, r, a, color = '#E0256A'}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%)`, opacity: a, mixBlendMode: 'screen'}} />
);

// ---------------------------------------------------------------- scenes
const Hook: React.FC<{t: number}> = ({t}) => {
  const push = lerp(1, 1.07, seg(t, B.hook, B.towers));
  // bottom-up switch-on, one floor at a time (facade y 492..1555 in plate px)
  const p = seg(t, B.lightOn, B.lightFull);
  const floors = 28, onFloors = Math.floor(p * floors + 0.0001);
  const topY = (1555 - (onFloors / floors) * (1555 - 492)) * PS + POY;
  const pulse = t > B.lightFull ? 0.25 * Math.exp(-4 * (t - B.lightFull)) : 0;
  const pushOut = t > B.lightOn ? 1 + 0.025 * Math.exp(-6 * (t - B.lightFull)) * seg(t, B.lightOn, B.lightFull) : 1;
  const [ix, iy] = pp(700, 1020);
  return (
    <Enter t={t} t0={B.hook}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '600px 1000px'}}>
        <Plate src="plates/P1-tower.jpg" />
        <div style={{position: 'absolute', inset: 0, clipPath: `inset(${topY}px 0 0 0)`, transform: `scale(${pushOut})`, transformOrigin: `${ix}px ${iy}px`}}>
          <Plate src="plates/hook_overlay.png" />
          <Plate src="plates/hook_overlay.png" style={{filter: 'blur(6px)', opacity: 0.22 + pulse, mixBlendMode: 'screen'}} />
        </div>
      </AbsoluteFill>
      <Streak p0={[540, 2000]} p1={[ix, iy]} u={seg(t, B.hook, B.impact) * 1.0 + Math.max(0, t - B.impact) * 3} width={12} lift={-120} />
      {t > B.impact ? (
        (() => { const u = seg(t, B.impact, B.impact + 0.55), rr = lerp(20, 460, eo3(u)); return (
          <div style={{position: 'absolute', left: ix - rr, top: iy - rr, width: 2 * rr, height: 2 * rr, borderRadius: '50%', border: `${lerp(10, 2, u)}px solid rgba(255,120,170,${0.6 * (1 - u)})`,
            boxShadow: `0 0 30px rgba(224,37,106,${0.5 * (1 - u)})`}} />); })()
      ) : null}
    </Enter>
  );
};

const Towers: React.FC<{t: number}> = ({t}) => {
  const [ax, ay] = pp(300, 760), [bx, by] = pp(930, 1010);
  const a = seg(t, B.winA, B.winA + 0.15), b = seg(t, B.winB, B.winB + 0.15);
  const flash = t > B.instant ? Math.exp(-5 * (t - B.instant)) : 0;
  const win = (x: number, y: number, on: number, w: number, h: number) => (
    <>
      <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, background: 'linear-gradient(160deg,#FF8A7A,#E0256A 55%,#8A2BB0)', opacity: on, borderRadius: 3,
        boxShadow: `0 0 ${30 + 40 * flash}px ${10 + 20 * flash}px rgba(224,37,106,${0.55 * on})`}} />
      <Glow x={x} y={y} r={160 + 120 * flash} a={on * (0.6 + flash)} />
    </>
  );
  return (
    <Enter t={t} t0={B.towers}>
      <AbsoluteFill style={{transform: `scale(${lerp(1, 1.06, seg(t, B.towers, B.skim))}) translateY(${lerp(0, -30, seg(t, B.towers, B.skim))}px)`}}>
        <Plate src="plates/P3-two-towers.jpg" />
        {win(ax, ay, a, 44, 54)}
        {win(bx, by, b, 26, 30)}
        <Streak p0={[ax, ay]} p1={[bx, by]} u={seg(t, B.ribbon, B.winB) * 1.0 + Math.max(0, t - B.winB) * 0.0} width={9} lift={260} />
        {t > B.winB ? <Streak p0={[ax, ay]} p1={[bx, by]} u={0.999} width={4 + 6 * flash} lift={260} /> : null}
      </AbsoluteFill>
      <Pop t={t} t0={B.winA + 0.1} x={ax + 40} y={ay - 110}><Chip size={30} dark>−5,000 Lekë</Chip></Pop>
      <Pop t={t} t0={B.winB + 0.05} x={bx - 40} y={by + 110}><Chip size={30} dark>+5,000 Lekë</Chip></Pop>
      <Pop t={t} t0={B.instant} x={540} y={1640}><Chip size={38}><Tick />Menjëherë · Falas</Chip></Pop>
    </Enter>
  );
};

const Skim: React.FC<{t: number}> = ({t}) => {
  return (
    <Enter t={t} t0={B.skim}>
      <Sequence from={Math.round(B.skim * B.fps)}><OffthreadVideo src={staticFile('clips/S2.mp4')} muted style={{width: W, height: H}} /></Sequence>
      {t < B.atm ? (
        <Pop t={t} t0={B.qr} x={330} y={760} rot={-6}>
          <div style={{width: 340, height: 735, borderRadius: 52, padding: 12, background: '#0F1020', boxShadow: '0 40px 80px rgba(0,0,0,0.6)'}}>
            <Img src={staticFile('plates/qr-rebuilt.png')} style={{width: 316, height: 711, borderRadius: 42}} />
          </div>
        </Pop>
      ) : null}
      {t < B.atm ? <Pop t={t} t0={B.paid} x={640} y={1180}><Chip size={36}><Tick />Paguar · 250 Lekë</Chip></Pop> : null}
      {t >= B.atm && t < B.daynight ? (
        <Pop t={t} t0={B.atm} x={540} y={900}>
          <div style={{width: 760, padding: '40px 44px', borderRadius: 40, background: 'rgba(14,16,32,0.78)', border: '1.5px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(16px)',
            boxShadow: '0 30px 70px rgba(0,0,0,0.5)', fontFamily: F, color: '#fff'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
              <div style={{width: 88, height: 88, borderRadius: 24, background: GRAD, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 30}}>ATM</div>
              <div><div style={{fontWeight: 800, fontSize: 46}}>Cash në çdo ATM</div>
                <div style={{fontWeight: 600, fontSize: 28, color: '#C9C6E8', marginTop: 6}}>Pa komision në 140+ ATM të BKT-së</div></div>
            </div>
          </div>
        </Pop>
      ) : null}
      {t >= B.daynight ? <Pop t={t} t0={B.daynight} x={540} y={900}><Chip size={44} dark><span style={{fontSize: 46}}>☾</span>Ditë e natë · 24/7</Chip></Pop> : null}
    </Enter>
  );
};

const City: React.FC<{t: number}> = ({t}) => {
  const r = lerp(0, 1900, eio3(seg(t, B.cityReveal, B.drop - 0.05)));
  const hit = t > B.drop ? Math.exp(-5 * (t - B.drop)) : 0;
  const mask = `radial-gradient(circle at 520px 1400px, #000 ${r}px, transparent ${r + 160}px)`;
  return (
    <Enter t={t} t0={B.city}>
      <AbsoluteFill style={{transform: `scale(${lerp(1, 1.1, seg(t, B.city, B.dive)) + 0.04 * hit})`, transformOrigin: '540px 1300px'}}>
        <Plate src="plates/city_dim.jpg" />
        <div style={{position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask}}><Plate src="plates/city_mark.jpg" /></div>
        <div style={{position: 'absolute', inset: 0, opacity: 0.5 * hit + 0.18 * seg(t, B.drop, B.drop + 0.1)}}>
          <Plate src="plates/city_mark.jpg" style={{filter: 'blur(26px)', mixBlendMode: 'screen'}} />
        </div>
      </AbsoluteFill>
    </Enter>
  );
};

const Dive: React.FC<{t: number}> = ({t}) => (
  <Enter t={t} t0={B.dive}>
    <Sequence from={Math.round(B.dive * B.fps)}><OffthreadVideo src={staticFile('clips/S3-clean.mp4')} muted playbackRate={B.diveRate} style={{width: W, height: H}} /></Sequence>
  </Enter>
);

const Phone2: React.FC<{t: number}> = ({t}) => (
  <Enter t={t} t0={B.phone2}>
    <Sequence from={Math.round(B.phone2 * B.fps)}><OffthreadVideo src={staticFile('clips/S1b.mp4')} muted style={{width: W, height: H}} /></Sequence>
  </Enter>
);

const End: React.FC<{t: number}> = ({t}) => {
  const f = clamp(Math.floor((t - B.end) * B.fps), 0, 59);
  // 1) pane lock-up (Blender), shown smaller and a little higher
  const K = 0.72, KY = -120;
  const m = {x0: 540 + (L.x0 - 540) * K, y0: 960 + (L.y0 - 960) * K + KY, x1: 540 + (L.x1 - 540) * K, y1: 960 + (L.y1 - 960) * K + KY};
  // 2) final lock-up: official logo centred; its mark rectangle inside the logo (logo raster 2000x1217, mark x35-908, y9-1206)
  const WF = 760, HF = WF * 1217 / 2000, LX = (W - WF) / 2, LY = 420;
  const fm = {x0: LX + (35 / 2000) * WF, y0: LY + (9 / 1217) * HF, x1: LX + (908 / 2000) * WF, y1: LY + (1206 / 1217) * HF};
  const dis = seg(t, B.logoSwap, B.logoSwap + 0.22);          // panes -> official mark, same place
  const flash = Math.exp(-((t - B.logoSwap - 0.08) ** 2) / 0.006);
  const mv = eio3(seg(t, B.markMove, B.logoFull));               // mark travels to its place in the logo
  const r = {x0: lerp(m.x0, fm.x0, mv), y0: lerp(m.y0, fm.y0, mv), x1: lerp(m.x1, fm.x1, mv), y1: lerp(m.y1, fm.y1, mv)};
  const word = eo3(seg(t, B.logoFull, B.logoFull + 0.4));      // wordmark written out from the mark
  const full = t >= B.logoFull;
  const wm = `linear-gradient(90deg, #000 ${lerp(45.4, 101, word)}%, transparent ${lerp(45.5, 104, word)}%)`;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, #2A1446 0%, #12123A 45%, #070914 100%)'}}>
      <div style={{position: 'absolute', left: 540 - 520, top: 700 - 520, width: 1040, height: 1040, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,0,123,0.32), rgba(0,0,0,0) 65%)', opacity: 1 - mv}} />
      {/* night turns to day: the official logo is made for a light background */}
      <AbsoluteFill style={{opacity: mv, background: 'radial-gradient(ellipse at 50% 30%, #FFFFFF 0%, #F7F2FB 55%, #F1E6F5 100%)'}} />
      <div style={{position: 'absolute', left: 540 - 560, top: 660 - 560, width: 1120, height: 1120, borderRadius: '50%', opacity: 0.55 * mv,
        background: 'radial-gradient(circle, rgba(224,37,106,0.16), rgba(0,114,188,0.06) 45%, rgba(255,255,255,0) 70%)'}} />
      {dis < 1 ? <Img src={staticFile(`lockup/${String(f).padStart(4, '0')}.png`)} style={{position: 'absolute', inset: 0, width: W, height: H, opacity: 1 - dis,
        transform: `translateY(${KY}px) scale(${K})`, transformOrigin: '540px 960px', filter: `brightness(${1 + 1.2 * flash})`}} /> : null}
      {dis > 0 && !full ? (
        <Img src={staticFile('mark.png')} style={{position: 'absolute', left: r.x0, top: r.y0, width: r.x1 - r.x0, height: r.y1 - r.y0, opacity: dis,
          filter: `brightness(${1 + 1.0 * flash}) drop-shadow(0 ${lerp(0, 18, mv)}px ${lerp(30 + 60 * flash, 30, mv)}px rgba(${mv > 0.5 ? '91,42,155,0.25' : '224,37,106,0.55'}))`}} />
      ) : null}
      {full ? (
        <Img src={staticFile('epara-logo.svg')} style={{position: 'absolute', left: LX, top: LY, width: WF, height: HF, WebkitMaskImage: wm, maskImage: wm,
          filter: 'drop-shadow(0 18px 30px rgba(91,42,155,0.25))'}} />
      ) : null}
      {t > B.tagline ? (
        <Img src={staticFile('tagline.svg')} style={{position: 'absolute', left: 540 - 330, top: 960 - 245, width: 660, height: 330, opacity: seg(t, B.tagline, B.tagline + 0.3),
          transform: `translateY(${20 * (1 - eo3(seg(t, B.tagline, B.tagline + 0.4)))}px)`}} />
      ) : null}
      <Pop t={t} t0={B.cta} x={540} y={1480}>
        <div style={{background: GRAD, color: '#fff', fontFamily: F, fontWeight: 800, fontSize: 48, padding: '30px 72px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 20px 50px rgba(200,0,123,0.45)'}}>Shkarko falas</div>
      </Pop>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1580, textAlign: 'center', fontFamily: F, fontWeight: 600, fontSize: 30, color: mv > 0.5 ? '#6B6880' : 'rgba(255,255,255,0.7)', opacity: seg(t, B.cta + 0.3, B.cta + 0.6)}}>App Store · Google Play</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- main
export const Main: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  loadFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const [sx, sy] = shake(t, [[B.impact, 10], [B.lightFull, 6], [B.drop, 18]]);
  const files = getStaticFiles().map((x) => x.name);
  const track = files.includes('mix.wav') ? 'mix.wav' : 'vo.wav';
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px)`}}>
        {t < B.hook + 0.02 ? (
          <AbsoluteFill>
            <OffthreadVideo src={staticFile('clips/S1a.mp4')} muted style={{width: W, height: H}} />
            <Streak p0={[495, 1065]} p1={[1150, 250]} u={seg(t, B.bolt, B.hook) * 1.2} width={14} lift={180} />
          </AbsoluteFill>
        ) : null}
        {t >= B.hook && t < B.towers + 0.25 ? <Hook t={t} /> : null}
        {t >= B.towers && t < B.skim + 0.25 ? <Towers t={t} /> : null}
        {t >= B.skim && t < B.city + 0.25 ? <Skim t={t} /> : null}
        {t >= B.city && t < B.dive + 0.25 ? <City t={t} /> : null}
        {t >= B.dive && t < B.phone2 + 0.25 ? <Dive t={t} /> : null}
        {t >= B.phone2 && t < B.end + 0.25 ? <Phone2 t={t} /> : null}
        {t >= B.end ? <End t={t} /> : null}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)', opacity: 1 - seg(t, B.markMove, B.logoFull)}} />
      {withAudio ? <Audio src={staticFile(track)} /> : null}
    </AbsoluteFill>
  );
};
