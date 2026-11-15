#!/usr/bin/env bash
# Analyze a reference video: metadata, scene cuts, scene frames, contact sheet, palette.
# Usage: tools/analyze_reference.sh <video> [slug] [scene_threshold=0.3]
set -euo pipefail
IN="$1"; SLUG="${2:-$(basename "${IN%.*}")}"; TH="${3:-0.3}"
OUT="references/breakdowns/$SLUG"; mkdir -p "$OUT/scenes"

ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate \
  -of default=nw=1 "$IN" > "$OUT/meta.txt"

# Scene-change timestamps + one frame per scene
ffmpeg -hide_banner -loglevel error -i "$IN" \
  -vf "select='eq(n,0)+gt(scene,$TH)',showinfo,scale=480:-2" -vsync vfr \
  "$OUT/scenes/scene_%03d.jpg" 2> "$OUT/showinfo.log" || true
grep -o 'pts_time:[0-9.]*' "$OUT/showinfo.log" | cut -d: -f2 > "$OUT/cuts.txt" || true
rm -f "$OUT/showinfo.log"

# Contact sheet: 1 frame every 0.5s, 6 columns
ffmpeg -hide_banner -loglevel error -i "$IN" \
  -vf "fps=2,scale=320:-2,tile=6x8:padding=4:color=black" -frames:v 1 -update 1 \
  "$OUT/contact_sheet.jpg"

# Dominant palette (8 colors) from scene frames
if ls "$OUT"/scenes/*.jpg >/dev/null 2>&1; then
  convert "$OUT"/scenes/*.jpg -append -resize 400x -colors 8 -unique-colors txt:- \
    | grep -o '#[0-9A-Fa-f]\{6\}' > "$OUT/palette.txt" || true
fi

echo "Breakdown assets in $OUT:"; ls "$OUT"; echo "Cuts: $(wc -l < "$OUT/cuts.txt" 2>/dev/null || echo 0)"
