export type Rect = {cx: number; cy: number; w: number; h: number};
export type Layout = {
  W: number; H: number; sq: boolean;
  bigHead: number; head: number; headY: number;
  s1Center: [number, number]; s1Lines: string; chips: [number, number][]; chipSize: number;
  s2Head: [number, number]; s2Card: Rect;
  hub: [number, number]; hubR: number; cards: Rect[];
  panel: Rect; ring: {cx: number; cy: number; r: number}; fwY: number;
  logo: Rect & {src: string}; taglineY: number; ctaY: number; urlY: number;
};

export const layoutFor = (W: number, H: number): Layout => {
  if (W === H) {
    return {
      W, H, sq: true, bigHead: 92, head: 66, headY: 150,
      s1Center: [540, 540], s1Lines: 'Your stack|changes|*every day.*',
      chips: [[250, 105], [830, 95], [170, 470], [910, 480], [180, 770], [890, 760], [320, 930], [760, 935]], chipSize: 22,
      s2Head: [540, 300], s2Card: {cx: 540, cy: 660, w: 900, h: 340},
      hub: [540, 640], hubR: 66,
      cards: [{cx: 250, cy: 470, w: 300, h: 118}, {cx: 250, cy: 815, w: 300, h: 118}, {cx: 830, cy: 470, w: 300, h: 118}, {cx: 830, cy: 815, w: 300, h: 118}],
      panel: {cx: 540, cy: 650, w: 960, h: 560}, ring: {cx: 540, cy: 590, r: 150}, fwY: 880,
      logo: {cx: 540, cy: 430, w: 360, h: 217, src: 'oz-logo-360.png'}, taglineY: 650, ctaY: 770, urlY: 862,
    };
  }
  return {
    W, H, sq: false, bigHead: 104, head: 76, headY: 165,
    s1Center: [960, 540], s1Lines: 'Your stack changes|*every day.*',
    chips: [[400, 240], [1530, 230], [290, 560], [1640, 590], [470, 860], [1450, 870], [1560, 410], [960, 930]], chipSize: 26,
    s2Head: [960, 270], s2Card: {cx: 960, cy: 660, w: 820, h: 340},
    hub: [960, 620], hubR: 74,
    cards: [{cx: 470, cy: 475, w: 330, h: 124}, {cx: 470, cy: 770, w: 330, h: 124}, {cx: 1450, cy: 475, w: 330, h: 124}, {cx: 1450, cy: 770, w: 330, h: 124}],
    panel: {cx: 960, cy: 640, w: 1080, h: 500}, ring: {cx: 960, cy: 590, r: 150}, fwY: 880,
    logo: {cx: 960, cy: 440, w: 420, h: 253, src: 'oz-logo-420.png'}, taglineY: 680, ctaY: 800, urlY: 890,
  };
};

// sparkle centre inside the cropped logo (fractions of width/height)
export const LOGO_SPARKLE = [0.8917, 0.1894] as const;
