# Blender MCP prompt: a realistic version of the hero gas lamp

Reference image: `assets/lamp-reference.png` (the hero lamp, lit, 600x1800). Paste the
prompt below into Claude Code with Blender open and BlenderMCP connected.

```text
Use the Blender MCP. First call get_scene_info; if it fails, stop and tell me.
Start from a CLEAN scene (delete the default cube, light and camera).

GOAL
Rebuild the lamppost from my website as a realistic 3D model with real materials. My
last attempt was an untextured grey model with a long box-like lantern and a flat wide
cap. That is wrong. This time copy the reference image's proportions EXACTLY, and give
every part a procedural material. It must still look like the SAME lamp, just real.

REFERENCE
Load C:\path\to\lamp-reference.png (it is in the repo at assets/lamp-reference.png;
use the real path on this PC). Add it as a background reference image on an Empty in
FRONT orthographic view, 1800 px tall = the full lamp. Model against it and compare
with viewport screenshots as you go. Do not freehand proportions.

SCALE AND PROPORTIONS
The lamp is 900 design-units tall and 200 wide (the base is the widest at 116).
Use 1 unit = 5 mm, so the lamp is 4.5 m tall. Ground is z = 0. Height of a part above
the ground = 899 minus the "y" below. Everything is centred on x = 0, y = 0.

Top to bottom (y = distance from the top of the picture, w = width in units):
 y 6-27    Finial: thin spike, 1.6 wide, with a tiny bead at y 27
 y 28-31   Small square pedestal, w 8
 y 31-32   Flat top plate, w 14
 y 32-56   LOW HEXAGONAL PYRAMID CAP, w 14 at top to 52 at bottom (24 tall, a gentle
           tent, NOT tall and NOT wider than the lantern). Faceted.
 y 56-58   thin dark trim, w 52
 y 58-62   plain iron band, w 52, with a thin rust line at y 62
 y 63-72   flare out, w 52 to 64
 y 72-76   top trim band, w 64, with a rust line
 y 76-128  LANTERN: hexagonal, TAPERED, w 60 at top to 44 at bottom, only 52 tall
           (it is short and squat, not long!). Six frosted-glass panels divided by slim
           iron mullions and a corner post at every edge. Three panels face the camera.
 y 128-132 thick iron rim, w 48, with a rust line
 y 132-155 hanging pendant: bell (w 40 to 26), small ring, narrower bell (w 24 to 14),
           acorn ball (w 7), tiny tip
 y 151-176 neck, tapering w 28 to 12
 y 176-202 upper turned collar: collar rings w 16 around a swelled vase section w 12-14
 y 202-402 SLENDER SHAFT, only w 6 (round)
 y 402-413 mid-shaft ring band, w 16 and 12
 y 413-613 lower shaft, w 6
 y 613-636 second turned collar, same shape as the first
 y 636-684 bottom shaft, w 6
 y 684-693 collar and flange, w 16 then 22
 y 693-786 OGEE BELL: concave shoulder, convex belly. w 22 at top, swells to 58, tapers to 24
           at bottom. Add subtle vertical fluting (8 shallow flutes).
 y 786-796 torus moulding rings, w 60 then 64, with a rust line
 y 796-822 pedestal tier 1, w 68, with a recessed panel on each face
 y 822-854 pedestal tier 2, w 84, with a recessed panel on each face
 y 854-878 chamfered ground block, w 100 flaring to 108
 y 878-899 ground plinth, w 116

BUILD METHOD
Make the round parts (finial, shaft, collars, neck, bell, rings) by Lathe/Screw on a
profile curve from the table. Make the hex cap, lantern and the stepped square base with
real mesh geometry, with a small bevel on every edge (Bevel modifier, 0.4 to 0.8 units,
2 segments) so edges catch the light. Add Subdivision where curves need it. Join
nothing until materials are assigned.

MATERIALS (all procedural, no image files, nothing left grey)
1. Painted cast iron (most of the lamp):
   Principled BSDF, base colour #0e0a07, roughness around 0.5 varied by a Noise
   texture (scale 40, +-0.15), a gentle bump from fine Noise (scale 300, strength 0.1)
   plus a Voronoi for tiny casting pits. Slight warm tint in the reflections.
2. Edge wear and rust:
   Use a Bevel node or Ambient Occlusion node as a mask. On sharp convex edges expose
   bare worn iron (dark grey #2b2622, Metallic 0.9, roughness 0.45). In crevices and
   under each ring band add rust #5a2a10 to #2a1408, roughness 0.8, broken up by a Noise
   texture so it is patchy, not a stripe. Keep it subtle, a well-kept antique, not ruined.
3. Frosted glass lantern panels:
   Principled BSDF: base #f4c478, transmission 0.6, roughness 0.5 (frosted), plus
   Emission #f4c478 at strength 6 weighted by a Fresnel/Layer Weight so the centre of each
   pane glows brightest (#fff5d0) and the edge is deeper amber (#c6862c). Slight
   thickness (Solidify).
4. Inside the lantern: a small emissive flame or mantle (#fff5d0, strength 30) with a
   Point light (warm 2000K, power 400 W, radius 1 cm) so the iron frame is lit from within.
5. Ground contact: a soft dark disc under the base (#000, alpha 0.5, blurred edge) so it
   sits on the ground, not floating.

LIGHTING AND RENDER
 - World: solid near-black warm brown #0d0905. No HDRI, no sky.
 - Faint warm key from the right (Area light, 2200K, low power) so the right edge of the
   iron reads as in the reference. Very faint low fill.
 - Cycles, 192 samples, denoise on, Filmic or AgX, Film > Transparent on.
 - Camera: orthographic, level, straight-on, centred on the lamp, whole lamp in frame.
   Render 1600 x 7200 px.
 - Make THREE renders: LIT (glow on), OUT (flame off, glass a dull dark amber, point light
   0), and HALO (a separate transparent PNG of only the soft amber glow around the lantern).
 - Also render a 3/4 view, so I can see the depth and materials.

CHECKS BEFORE YOU SAY DONE
 1. Overlay your front render on lamp-reference.png at 50 percent. The cap, lantern,
    collars and base must line up within a few pixels. If the lantern is longer than
    52 units, or the cap wider than 52, fix it.
 2. Zoom to the lantern and the base: there must be visible bevels, texture, wear and rust.
 3. It must look dark, warm and quiet like the reference. No chrome, no blue, no cool white.
 4. Describe anything you were unsure about.

SAVE to Desktop\lamppost-render: lamp-lit.png, lamp-out.png, lamp-halo.png,
lamp-3q.png, lamppost.blend.
```
