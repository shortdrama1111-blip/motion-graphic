export type P = [number, number];
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const eo3 = (u: number) => 1 - Math.pow(1 - u, 3);
export const eo4 = (u: number) => 1 - Math.pow(1 - u, 4);
export const eio3 = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const eoBack = (u: number, s = 1.6) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);
export const lp = (p: P, q: P, u: number): P => [lerp(p[0], q[0], u), lerp(p[1], q[1], u)];
// quadratic curve with sideways lift
export const arc = (p: P, q: P, u: number, lift: number): P => {
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
  const dx = q[0] - p[0], dy = q[1] - p[1];
  const len = Math.hypot(dx, dy) || 1;
  const c: P = [mx - (dy / len) * lift, my + (dx / len) * lift];
  const a = lp(p, c, u), b = lp(c, q, u);
  return lp(a, b, u);
};
export const onCircle = (c: P, r: number, deg: number): P => [c[0] + r * Math.cos((deg * Math.PI) / 180), c[1] + r * Math.sin((deg * Math.PI) / 180)];
// point on a rounded rect perimeter, u in [0,1), starting top-centre, clockwise
export const rrPoint = (cx: number, cy: number, w: number, h: number, r: number, u: number): P => {
  const x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
  const q = (Math.PI * r) / 2;
  const parts: [number, (s: number) => P][] = [
    [w / 2 - r, (s) => [cx + s, y0]],
    [q, (s) => onCircle([x1 - r, y0 + r], r, -90 + (s / q) * 90)],
    [h - 2 * r, (s) => [x1, y0 + r + s]],
    [q, (s) => onCircle([x1 - r, y1 - r], r, (s / q) * 90)],
    [w - 2 * r, (s) => [x1 - r - s, y1]],
    [q, (s) => onCircle([x0 + r, y1 - r], r, 90 + (s / q) * 90)],
    [h - 2 * r, (s) => [x0, y1 - r - s]],
    [q, (s) => onCircle([x0 + r, y0 + r], r, 180 + (s / q) * 90)],
    [w / 2 - r, (s) => [x0 + r + s, y0]],
  ];
  const total = parts.reduce((a, b) => a + b[0], 0);
  let d = (((u % 1) + 1) % 1) * total;
  for (const [len, fn] of parts) { if (d <= len) return fn(d); d -= len; }
  return [cx, y0];
};
// decaying camera shake
export const shake = (t: number, events: [number, number][]): P => {
  let x = 0, y = 0;
  for (const [t0, a] of events) {
    if (t < t0) continue;
    const k = a * Math.exp(-9 * (t - t0));
    x += k * Math.sin((t - t0) * 61 + t0 * 3);
    y += k * Math.cos((t - t0) * 53 + t0 * 7);
  }
  return [x, y];
};
