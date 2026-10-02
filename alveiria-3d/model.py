"""Bouteille Alveiria Prima 500 ml : modélisation, matériaux, export GLB et rendus.

Unités : diamètre du corps = 1, hauteur totale bouchon compris = 5 (proportions relevées sur la photo).
Usage : python model.py <dossier_sortie> [glb|still|turntable]
"""
import sys, math, os
import bpy, bmesh
from mathutils import Vector

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
MODE = sys.argv[2] if len(sys.argv) > 2 else 'glb'
HERE = os.path.dirname(os.path.abspath(__file__))
LABEL_IMG = os.path.join(HERE, 'label-unwrap.jpg')
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def lathe(name, profile, steps=128, smooth=True):
    """Révolution d'un profil (r, z) autour de l'axe Z."""
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0.0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1),
                   angle=math.tau, steps=steps, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    return ob


def shoulder(r0, r1, z0, z1, n=14):
    """Épaule arrondie (courbe en quart d'ellipse)."""
    pts = []
    for i in range(1, n + 1):
        t = i / n
        a = t * math.pi / 2
        pts.append((r1 + (r0 - r1) * math.cos(a), z0 + (z1 - z0) * math.sin(a)))
    return pts


R, BODY_TOP, SH_TOP, NECK_R = 0.5, 3.45, 3.80, 0.205
# ---------- verre (paroi extérieure puis intérieure, profil fermé) ----------
outer = [(0.0, 0.0), (0.44, 0.0), (0.485, 0.012), (0.5, 0.05)]
outer += [(R, BODY_TOP)] + shoulder(R, NECK_R + 0.02, BODY_TOP, SH_TOP)
outer += [(NECK_R, 4.0), (NECK_R, 4.55), (NECK_R + 0.015, 4.58), (0.175, 4.6)]
inner = [(0.165, 4.58), (0.165, 4.0), (0.18, 3.86)]
inner += [(0.47 - (0.47 - 0.19) * (1 - math.cos(t * math.pi / 2)), BODY_TOP + (SH_TOP - 0.06 - BODY_TOP) * math.sin(t * math.pi / 2)) for t in [1, .8, .6, .4, .2, 0]]
inner += [(0.47, 0.11), (0.43, 0.075), (0.0, 0.07)]
glass = lathe('Glass', outer + inner)

# ---------- huile (volume intérieur, remplie jusqu'à l'épaule) ----------
FILL = 3.42
oil = lathe('Oil', [(0.0, 0.075), (0.428, 0.08), (0.465, 0.115), (0.465, FILL), (0.0, FILL)])

# ---------- étiquette : segment de cylindre avec UV ----------
L = math.pi * 0.9
LB, LT, LR = 0.37, 3.30, 0.503
me = bpy.data.meshes.new('Label')
bm = bmesh.new()
uvl = bm.loops.layers.uv.new()
seg = 128
cols = []
for i in range(seg + 1):
    u = i / seg
    th = -L / 2 + L * u
    # face avant tournée vers -Y (devient +Z en glTF)
    x, y = LR * math.sin(th), -LR * math.cos(th)
    cols.append((bm.verts.new((x, y, LB)), bm.verts.new((x, y, LT)), u))
for i in range(seg):
    a0, b0, u0 = cols[i]
    a1, b1, u1 = cols[i + 1]
    f = bm.faces.new((a0, a1, b1, b0))
    for loop, uv in zip(f.loops, [(u0, 0), (u1, 0), (u1, 1), (u0, 1)]):
        loop[uvl].uv = uv
bm.normal_update()
bm.to_mesh(me)
bm.free()
label = bpy.data.objects.new('Label', me)
scene.collection.objects.link(label)
for p in me.polygons:
    p.use_smooth = True
label.data.flip_normals() if False else None

# ---------- capsule (manchon noir sur le col) ----------
sleeve = lathe('Sleeve', [(0.0, 3.74), (0.215, 3.74), (0.262, 3.80), (0.271, 3.86), (0.271, 4.50), (0.0, 4.50)])
# ---------- bouchon à vis ----------
cap_prof = [(0.0, 4.50), (0.278, 4.50), (0.284, 4.52), (0.284, 4.975), (0.278, 4.995), (0.0, 5.0)]
cap = lathe('Cap', cap_prof)
for z in (4.92, 4.84, 4.76):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.2845, minor_radius=0.0055, major_segments=128, minor_segments=8, location=(0, 0, z))
    t = bpy.context.active_object
    t.name = 'CapRing'
    t.data.polygons.foreach_set('use_smooth', [True] * len(t.data.polygons))
    t.select_set(True)
    cap.select_set(True)
    bpy.context.view_layer.objects.active = cap
    bpy.ops.object.join()
    bpy.ops.object.select_all(action='DESELECT')

# ---------- matériaux ----------
def principled(name, color, rough, metal=0.0, trans=0.0, ior=1.5, alpha=1.0, img=None, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['IOR'].default_value = ior
    b.inputs['Transmission Weight'].default_value = trans
    b.inputs['Coat Weight'].default_value = coat
    if img:
        tex = m.node_tree.nodes.new('ShaderNodeTexImage')
        tex.image = bpy.data.images.load(img)
        m.node_tree.links.new(tex.outputs['Color'], b.inputs['Base Color'])
    return m

M_GLASS = principled('Glass', (0.10, 0.12, 0.035), 0.03, trans=1.0, ior=1.52, coat=0.6)
M_OIL = principled('Oil', (0.62, 0.48, 0.06), 0.08, trans=0.85, ior=1.47)
M_LABEL = principled('Label', (1, 1, 1), 0.72, img=LABEL_IMG)
M_BLACK = principled('BlackPlastic', (0.012, 0.012, 0.011), 0.58, coat=0.12)
glass.data.materials.append(M_GLASS)
oil.data.materials.append(M_OIL)
label.data.materials.append(M_LABEL)
sleeve.data.materials.append(M_BLACK)
cap.data.materials.append(M_BLACK)

root = bpy.data.objects.new('AlveiriaPrima', None)
scene.collection.objects.link(root)
for ob in (glass, oil, label, sleeve, cap):
    ob.parent = root

# ---------- export GLB ----------
if MODE == 'glb':
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'alveiria-prima.glb'), export_format='GLB',
                              export_apply=True, export_yup=True, export_image_format='JPEG',
                              export_jpeg_quality=88)
    print('GLB OK')
    sys.exit(0)

# ---------- studio de rendu ----------
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 48 if MODE == 'turntable' else 160
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 16
scene.cycles.transmission_bounces = 16
scene.cycles.transparent_max_bounces = 16
scene.render.film_transparent = True
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'

world = bpy.data.worlds.new('W')
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (0.06, 0.045, 0.03, 1)
bg.inputs['Strength'].default_value = 0.6

def area(name, loc, rot, size, energy, color):
    d = bpy.data.lights.new(name, 'AREA')
    d.shape = 'RECTANGLE'
    d.size, d.size_y = size
    d.energy = energy
    d.color = color
    o = bpy.data.objects.new(name, d)
    o.location = loc
    o.rotation_euler = [math.radians(a) for a in rot]
    scene.collection.objects.link(o)
    return o

area('Key', (-3.2, -3.0, 3.2), (65, 0, -45), (1.4, 4.0), 900, (1.0, 0.86, 0.68))
area('Rim', (3.0, 2.2, 3.0), (-70, 0, -130), (0.6, 4.5), 1300, (1.0, 0.78, 0.5))
area('Strip', (2.6, -2.4, 2.6), (70, 0, 45), (0.25, 4.5), 500, (1.0, 0.95, 0.88))
area('Top', (0, 0, 7.5), (0, 0, 0), (2.5, 2.5), 300, (1.0, 0.93, 0.82))

cam_d = bpy.data.cameras.new('Cam')
cam_d.lens = 85
cam_d.sensor_fit = 'VERTICAL'
cam_d.sensor_height = 36
cam = bpy.data.objects.new('Cam', cam_d)
scene.collection.objects.link(cam)
scene.camera = cam
cam.location = (0, -13.9, 2.5)
cam.rotation_euler = (math.radians(90), 0, 0)

if MODE == 'still':
    scene.render.resolution_x, scene.render.resolution_y = 900, 1600
    scene.render.filepath = os.path.join(OUT, 'prima-still.png')
    bpy.ops.render.render(write_still=True)
    print('STILL OK')
elif MODE == 'turntable':
    scene.render.resolution_x, scene.render.resolution_y = 360, 760
    for i in range(36):
        root.rotation_euler = (0, 0, math.radians(i * 10))
        scene.render.filepath = os.path.join(OUT, 'turntable', f'prima_{i*10:03d}.png')
        bpy.ops.render.render(write_still=True)
        print('frame', i * 10, flush=True)
    print('TURNTABLE OK')
