import {continueRender, delayRender, staticFile} from 'remotion';

let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const h = delayRender('fonts');
  Promise.all(['500', '600', '700', '800'].map((w) =>
    new FontFace('Jakarta', `url(${staticFile(`fonts/plus-jakarta-sans-latin-${w}-normal.woff2`)})`, {weight: w})
      .load().then((f) => (document as any).fonts.add(f))))
    .then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
