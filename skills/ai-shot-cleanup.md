# AI Shot Cleanup (fake text / signs)
- **Category:** QA / compositing · **Engine:** OpenCV

AI footage invents signs with fake letters. Detect bright wide blobs, **track** from a good seed frame forward/backward in a search window, union boxes over ±2 frames, strong double Gaussian blur + darken with a feathered mask. Clamp correctly at frame edges (bug to avoid: mask offset when the box touches the top). Verify on a strip of frames.
