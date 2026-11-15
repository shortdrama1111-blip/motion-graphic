# Motion Blur (Float accumulation)
- **Category:** finishing · **Engine:** any frame renderer · **Source:** [ref: 2026-11-15-keemfinity-moniepoint-listen]

Render k sub-frames across the shutter (half a frame) and average **in a Float32 buffer**. k = 1 on holds, 4–8 on moves, 16 on whips. 8-bit additive stacking causes stepped ghosts and a purple/lavender cast.

```js
const acc = new Float32Array(W*H*4);
for (let i=0;i<k;i++){
  setState(t + (0.5/FPS)*(k>1 ? i/(k-1)-0.5 : 0));
  render(); tctx.drawImage(src,0,0);
  const d = tctx.getImageData(0,0,W,H).data;
  if(i===0) acc.fill(0);
  for(let j=0;j<d.length;j++) acc[j]+=d[j];
}
const im = octx.createImageData(W,H);
for(let j=0;j<acc.length;j++) im.data[j]=acc[j]/k+0.5;
```
