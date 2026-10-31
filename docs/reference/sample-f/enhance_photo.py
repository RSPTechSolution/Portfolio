"""Enhance the portrait without altering facial geometry.
Only global/local tone, colour, sharpening, crop, uniform upscale and a
background-only blur. No warping, no face retouching, no generative fill."""
import sys
import cv2
import numpy as np

src_path, out_path, preview_path = sys.argv[1], sys.argv[2], sys.argv[3]
img = cv2.imread(src_path, cv2.IMREAD_COLOR)
H0, W0 = img.shape[:2]

# 1. Align: 4:5 crop, eyes on the upper third, face slightly left of centre
#    (he looks to frame-right, so leave lead room on that side).
eye_x, eye_y = 470, 488                      # measured on the 941x1672 original
cw = 660; ch = int(cw * 5 / 4)               # 660 x 825
x0 = int(round(eye_x - 0.46 * cw)); y0 = int(round(eye_y - 0.34 * ch))
x0 = max(0, min(W0 - cw, x0)); y0 = max(0, min(H0 - ch, y0))
crop = img[y0:y0 + ch, x0:x0 + cw].copy()

# 2. Subject mask with GrabCut (rect + hints), feathered.
mask = np.full(crop.shape[:2], cv2.GC_PR_BGD, np.uint8)
mask[int(ch * 0.08):, int(cw * 0.02):int(cw * 0.97)] = cv2.GC_PR_FGD
mask[:int(ch * 0.07), :] = cv2.GC_BGD                       # sky above hair
mask[:int(ch * 0.45), :int(cw * 0.20)] = cv2.GC_BGD          # trees left of head
mask[:int(ch * 0.50), int(cw * 0.74):] = cv2.GC_BGD          # trees right of head
mask[:int(ch * 0.16), int(cw * 0.64):] = cv2.GC_BGD          # sky right of hair
mask[int(ch * 0.24):int(ch * 0.44), int(cw * 0.36):int(cw * 0.54)] = cv2.GC_FGD   # face (well inside the cheeks)
mask[int(ch * 0.62):, int(cw * 0.25):int(cw * 0.72)] = cv2.GC_FGD                 # shirt
bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(crop, mask, None, bgd, fgd, 10, cv2.GC_INIT_WITH_MASK)
fg = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 1.0, 0.0).astype(np.float32)
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))

# 3. Uniform 2x upscale (same factor on both axes -> no shape change).
S = 2
up = cv2.resize(crop, (cw * S, ch * S), interpolation=cv2.INTER_LANCZOS4)
fg = cv2.resize(fg, (cw * S, ch * S), interpolation=cv2.INTER_LINEAR)
fg_hard = fg.copy()
fg = cv2.GaussianBlur(fg, (0, 0), 4)[..., None]          # feathered edge

f = up.astype(np.float32) / 255.0

# 4. Tone: local contrast on luminance (CLAHE, gentle), lift shadows, protect highlights.
lab = cv2.cvtColor(up, cv2.COLOR_BGR2LAB)
L, A, B = cv2.split(lab)
L2 = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8)).apply(L)
L = cv2.addWeighted(L, 0.45, L2, 0.55, 0)
lab = cv2.merge([L, A, B])
f = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR).astype(np.float32) / 255.0
f = np.clip(f, 0, 1)
f = f + 0.10 * (1 - f) * (1 - f) * f * 4          # shadow lift (tone curve)
f = 1 - (1 - f) ** 1.08                           # gentle brightening, highlights rolled off
f = (f - 0.5) * 1.08 + 0.5                        # a touch of global contrast

# 5. Colour: vibrance (boost low-saturation colours more), warm golden grade.
hsv = cv2.cvtColor(np.clip(f, 0, 1).astype(np.float32), cv2.COLOR_BGR2HSV)
s = hsv[..., 1]
hsv[..., 1] = np.clip(s + (1 - s) * s * 0.85, 0, 1)
f = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
f[..., 2] *= 1.035; f[..., 1] *= 1.01; f[..., 0] *= 0.955   # BGR: warm up

# 6. Background only: soft bokeh blur, slightly darker & less saturated.
bg = cv2.GaussianBlur(f, (0, 0), 6)
bg_hsv = cv2.cvtColor(np.clip(bg, 0, 1).astype(np.float32), cv2.COLOR_BGR2HSV)
bg_hsv[..., 1] *= 1.05; bg_hsv[..., 2] *= 0.92
bg = cv2.cvtColor(bg_hsv, cv2.COLOR_HSV2BGR)

# 7. Subject only: crisp detail (unsharp mask on luminance-ish via all channels, small radius).
blur = cv2.GaussianBlur(f, (0, 0), 1.4)
sharp = np.clip(f + (f - blur) * 0.9, 0, 1)
blur2 = cv2.GaussianBlur(sharp, (0, 0), 5)
sharp = np.clip(sharp + (sharp - blur2) * 0.18, 0, 1)   # mid-frequency clarity

out = sharp * fg + bg * (1 - fg)

# 8. Vignette.
h, w = out.shape[:2]
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
d = np.sqrt(((xx - w * 0.47) / (w * 0.75)) ** 2 + ((yy - h * 0.40) / (h * 0.80)) ** 2)
out *= (1 - np.clip(d - 0.55, 0, 1) * 0.45)[..., None]

out8 = (np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)
cv2.imwrite(out_path, out8, [cv2.IMWRITE_PNG_COMPRESSION, 6])

# before/after preview at equal size
before = cv2.resize(crop, (cw * S, ch * S), interpolation=cv2.INTER_LANCZOS4)
prev = np.hstack([before, np.full((ch * S, 24, 3), 255, np.uint8), out8])
prev = cv2.resize(prev, (prev.shape[1] // 2, prev.shape[0] // 2), interpolation=cv2.INTER_AREA)
cv2.imwrite(preview_path, prev)
mask_dbg = (fg[..., 0] * 255).astype(np.uint8)
cv2.imwrite(preview_path.replace('.png', '-mask.png'), cv2.resize(mask_dbg, (cw, ch)))
print('crop', x0, y0, cw, ch, '->', out8.shape[1], 'x', out8.shape[0])

# ---- layers for 2.5D parallax (no geometry change to the face) ----
base = out_path.rsplit('.', 1)[0]
alpha = cv2.GaussianBlur(fg_hard, (0, 0), 1.6)
alpha = np.clip((alpha - 0.5) * 1.6 + 0.5, 0, 1)            # crisp but anti-aliased edge
subj = np.dstack([out8, (alpha * 255 + 0.5).astype(np.uint8)])
cv2.imwrite(base + '-subject.png', subj)
# background: remove the subject and fill the hole so parallax never reveals a ghost
hole = cv2.dilate((fg_hard > 0.3).astype(np.uint8), np.ones((41, 41), np.uint8))
small = cv2.resize(out8, (out8.shape[1] // 4, out8.shape[0] // 4), interpolation=cv2.INTER_AREA)
hole_s = cv2.resize(hole, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
fill = cv2.inpaint(small, hole_s, 9, cv2.INPAINT_TELEA)
fill = cv2.resize(fill, (out8.shape[1], out8.shape[0]), interpolation=cv2.INTER_CUBIC)
hm = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 12)[..., None]
bgl = (out8.astype(np.float32) * (1 - hm) + fill.astype(np.float32) * hm)
bgl = cv2.GaussianBlur(bgl, (0, 0), 3)
cv2.imwrite(base + '-bg.png', np.clip(bgl, 0, 255).astype(np.uint8))
print('layers written')
