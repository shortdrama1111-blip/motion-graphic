"""Blender (bpy) lock-up: lit window panes fly in from depth and lock into the extruded epara mark,
which turns to face the camera. Renders a transparent PNG sequence to build/lockup/.

Run: python3 tools/blender_lockup.py [--frames 0-59] [--res 540] [--samples 24]
"""
import math
import os
import sys

import bpy
import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
args = dict(a.split('=', 1) for a in sys.argv[1:] if '=' in a)
F0, F1 = map(int, args.get('--frames', '0-59').split('-'))
RESX = int(args.get('--res', '540'))
SAMPLES = int(args.get('--samples', '24'))
FPS = 30
LOCK = 34          # frame where all panes are in place
FACE = 56          # frame where the mark faces the camera

STOPS = [(0.0, (240, 78, 69)), (0.33, (224, 37, 106)), (0.55, (200, 0, 123)), (0.78, (91, 42, 155)), (1.0, (0, 114, 188))]


def grad(u):
    for (a0, c0), (a1, c1) in zip(STOPS, STOPS[1:]):
        if u <= a1:
            t = (u - a0) / (a1 - a0)
            return [((c0[i] * (1 - t) + c1[i] * t) / 255.0) ** 2.2 for i in range(3)]
    return [(c / 255.0) ** 2.2 for c in STOPS[-1][1]]


def mark_mask():
    a = cv2.imread(P('plates', 'logo-2000.png'), cv2.IMREAD_UNCHANGED)[:, :, 3]
    mk = a[9:1207, 35:909].copy()
    yy, xx = np.mgrid[0:mk.shape[0], 0:mk.shape[1]]
    mk[(xx + 35 >= 470) & (yy + 9 >= 740)] = 0
    return (mk > 40).astype(np.uint8)


def ease(u):
    u = max(0.0, min(1.0, u))
    return 1 - (1 - u) ** 3


# ---------------------------------------------------------------- scene
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x = RESX
sc.render.resolution_y = int(RESX * 16 / 9)
sc.render.fps = FPS
sc.view_settings.view_transform = 'Standard'
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'

world = bpy.data.worlds.new('w')
sc.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.01, 0.008, 0.02, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = 0.4

cam_data = bpy.data.cameras.new('cam')
cam_data.lens = 85
cam = bpy.data.objects.new('cam', cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
cam.location = (0, -9.0, 0)
cam.rotation_euler = (math.radians(90), 0, 0)

for loc, energy in (((-3, -4, 3), 400), ((3, -3, -1), 250), ((0, 2, 4), 300)):
    ld = bpy.data.lights.new('l', 'AREA')
    ld.energy = energy
    ld.size = 3
    lo = bpy.data.objects.new('l', ld)
    lo.location = loc
    lo.rotation_euler = (math.atan2(math.hypot(loc[0], loc[1]), loc[2]) * 0 + math.radians(60), 0, math.atan2(loc[0], -loc[1]))
    sc.collection.objects.link(lo)

# pivot that turns the whole mark to face camera
pivot = bpy.data.objects.new('pivot', None)
sc.collection.objects.link(pivot)

# glass-pane material: emissive gradient core (per-object colour) under a clear glossy coat
mat = bpy.data.materials.new('pane')
mat.use_nodes = True
nt = mat.node_tree
nt.nodes.clear()
out = nt.nodes.new('ShaderNodeOutputMaterial')
info = nt.nodes.new('ShaderNodeObjectInfo')
emis = nt.nodes.new('ShaderNodeEmission')
emis.inputs['Strength'].default_value = 3.2
glossy = nt.nodes.new('ShaderNodeBsdfPrincipled')
glossy.inputs['Base Color'].default_value = (0.02, 0.02, 0.03, 1)
glossy.inputs['Roughness'].default_value = 0.08
glossy.inputs['Coat Weight'].default_value = 1.0
fres = nt.nodes.new('ShaderNodeFresnel')
fres.inputs['IOR'].default_value = 1.6
mix = nt.nodes.new('ShaderNodeMixShader')
nt.links.new(info.outputs['Color'], emis.inputs['Color'])
nt.links.new(fres.outputs['Fac'], mix.inputs['Fac'])
nt.links.new(emis.outputs['Emission'], mix.inputs[1])
nt.links.new(glossy.outputs['BSDF'], mix.inputs[2])
nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])

# ---------------------------------------------------------------- panes from the official mark
mk = mark_mask()
Hm, Wm = mk.shape
MARK_H = 2.6
scale = MARK_H / Hm
cols, rows = 26, 36
cw, ch = Wm / cols, Hm / rows
rng = np.random.default_rng(5)
bpy.ops.mesh.primitive_cube_add(size=1)
proto = bpy.context.active_object
proto.data.materials.append(mat)
bev = proto.modifiers.new('bev', 'BEVEL')
bev.width = 0.006
bev.segments = 2
proto_mesh = proto.data
bpy.data.objects.remove(proto)
n = 0
for r in range(rows):
    for c in range(cols):
        cy, cx = int((r + 0.5) * ch), int((c + 0.5) * cw)
        if mk[cy, cx] == 0:
            continue
        o = bpy.data.objects.new(f'p{n}', proto_mesh)
        sc.collection.objects.link(o)
        o.parent = pivot
        o.scale = (cw * scale * 0.86, 0.05, ch * scale * 0.82)
        tx, tz = (cx - Wm / 2) * scale, (Hm / 2 - cy) * scale
        u = min(1.0, max(0.0, cx / Wm * 1.05 - 0.05))
        col = grad(u)
        o.color = (col[0], col[1], col[2], 1)
        # start scattered in depth, staggered from the bottom up (like the windows switching on)
        delay = (1 - cy / Hm) * 12 + rng.uniform(0, 6)
        sx, sy, sz = tx * rng.uniform(1.8, 3.2) + rng.normal(0, 0.6), rng.uniform(-6.5, 5.0), tz * rng.uniform(1.4, 2.6) + rng.normal(0, 0.5)
        rx, ry, rz = rng.uniform(-3, 3), rng.uniform(-3, 3), rng.uniform(-3, 3)
        for f in range(F0, max(F1, LOCK) + 1):
            k = ease((f - delay) / max(1.0, LOCK - delay))
            o.location = (sx + (tx - sx) * k, sy * (1 - k), sz + (tz - sz) * k)
            o.rotation_euler = (rx * (1 - k), ry * (1 - k), rz * (1 - k))
            o.keyframe_insert('location', frame=f)
            o.keyframe_insert('rotation_euler', frame=f)
        n += 1
print('panes', n)

for f in range(F0, F1 + 1):
    t = ease((f - 4) / (FACE - 4))
    pivot.rotation_euler = (math.radians(8 * (1 - t)), 0, math.radians(-62 * (1 - t)))
    pivot.location = (0, 2.0 * (1 - t), 0)
    pivot.keyframe_insert('rotation_euler', frame=f)
    pivot.keyframe_insert('location', frame=f)

os.makedirs(P('build', 'lockup'), exist_ok=True)
for f in range(F0, F1 + 1):
    sc.frame_set(f)
    sc.render.filepath = P('build', 'lockup', f'{f:04d}.png')
    bpy.ops.render.render(write_still=True)
print('done', F0, F1)
