import {continueRender, delayRender, staticFile} from 'remotion';

const faces: [string, string, string][] = [
  ['Outfit', '400', 'outfit-latin-400-normal.woff2'],
  ['Outfit', '600', 'outfit-latin-600-normal.woff2'],
  ['Outfit', '700', 'outfit-latin-700-normal.woff2'],
  ['Outfit', '800', 'outfit-latin-800-normal.woff2'],
  ['Inter', '400', 'inter-latin-400-normal.woff2'],
  ['Inter', '500', 'inter-latin-500-normal.woff2'],
  ['Inter', '600', 'inter-latin-600-normal.woff2'],
  ['Inter', '700', 'inter-latin-700-normal.woff2'],
];
let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const h = delayRender('fonts');
  Promise.all(
    faces.map(([family, weight, file]) => {
      const f = new FontFace(family, `url(${staticFile('fonts/' + file)})`, {weight});
      return f.load().then((loaded) => (document as any).fonts.add(loaded));
    })
  ).then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};
