# Form — iPhone Studio

A mobile 3D mockup studio for mapping screenshots onto a physically lit iPhone and exporting polished PNG compositions. Built with React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, use-gesture, Framer Motion, Radix UI, and react-three-postprocessing.

Live app: https://form-iphone-studio.ruoken.chatgpt.site

## Setup

```sh
npm ci
npx playwright install chromium
npm run dev
```

The Playwright browser is required only for CLI rendering. The web editor works after `npm ci`. Installation downloads the pinned iPhone model with checksum verification and copies Three.js’s Draco decoders locally.

## CLI

Link the command from the repository:

```sh
npm link
form-studio --help
```

Create a mockup with the studio defaults:

```sh
form-studio render screenshot.png -o mockup.png
```

Use the complete scene controls:

```sh
form-studio render screenshot.png \
  --device iphone15 \
  --finish '#4c566e' \
  --device-x 0.2 --device-y -0.15 --device-z 0 \
  --rotate-x -15 --rotate-y -42 --rotate-z -7 \
  --scale 0.78 \
  --fit fill --screen-x 0.6 --screen-y -0.7 --zoom 1.35 \
  --camera Isometric --fov 24 --camera-y 0.8 --target-y -0.1 \
  --camera-roll 2 --focus-distance 8 --aperture 0.04 --dof 0.8 \
  --lighting 'High Contrast' \
  --key-intensity 3.2 --key-azimuth 70 --key-elevation 60 \
  --fill-intensity 0.3 --rim-intensity 2.4 --rim-azimuth 155 \
  --environment-intensity 0.6 --environment strip \
  --shadow-opacity 0.32 --shadow-softness 4 \
  --reflection-intensity 1.1 --screen-glow 0.8 \
  --temperature '#d7e6ff' \
  --background gradient --color-a '#17212b' --color-b '#5b6c7a' \
  --gradient-angle 155 --no-ground \
  --ratio 9:16 --resolution 2160 --transparent \
  -o launch-mockup.png
```

All web editor generation and export values have CLI equivalents. Rotation and camera-roll flags use degrees; JSON configurations use the web editor's internal radians. `--resolution` is the longest output edge. Transparent exports preserve depth of field by combining the postprocessed color pass with the direct scene alpha pass.

Use a reusable scene file:

```sh
form-studio config > scene.json
form-studio render screenshot.png --config scene.json -o mockup.png
```

Command-line flags override the corresponding values in `--config`. See `form-studio.config.example.json` for the full schema.

Other commands:

```sh
form-studio presets
form-studio presets camera
form-studio presets lighting --json
form-studio render screenshot.png --dry-run --camera 'Close Up'
form-studio validate
form-studio build
form-studio dev
```

If Chromium is installed outside Playwright, pass `--browser /path/to/chrome` or set `FORM_STUDIO_BROWSER`.

## Implementation

- A Draco-compressed, 31-mesh iPhone 15 Pro Max GLB with 64,229 triangles and local Draco decoders.
- A device-size switch changes body dimensions and the original rounded display mesh to iPhone 15 or iPhone 15 Pro Max proportions. Both variants retain the Pro camera housing; the regular size is not a full base-model hardware reconstruction.
- Screenshot UVs derive from decoded display geometry. Fit and Fill preserve the source aspect ratio. The physical screen shader combines unlit screenshot emission with subtle PBR glass reflections.
- Screenshots are decoded locally, downsampled to a 2048-pixel maximum edge, and never sent to a server. Configuration persists locally; screenshot binaries do not persist.
- Demand rendering, damped transforms, capped DPR, a 1024-pixel key shadow map, a generated 128-pixel studio environment, lazy panels, and optional depth of field.
- The browser and CLI use the same React scene, state model, presets, screenshot processing, shader, postprocessing, and export function. The CLI runs that renderer in headless Chromium instead of maintaining a second renderer.
- Export restores canvas dimensions, pixel ratio, camera aspect, clear alpha, and background even after failure.

## Validation

```sh
npm run validate
npm run build
```

Validation decodes the distributed Draco asset, checks display normals and both device ratios, exercises screenshot fitting, verifies export dimensions, tests live shader-uniform updates, and checks CLI option mapping. A real headless Chromium export has also been checked with every scene group represented, including screenshot replacement, iPhone 15 dimensions, camera and lighting presets, manual overrides, depth of field, 9:16 output, and transparent alpha.

Physical iPhone and Android touch behavior and Safari export remain device acceptance checks.

## Attribution

- [iPhone 15 specifications](https://support.apple.com/en-us/111831)
- [iPhone 15 Pro Max specifications](https://support.apple.com/en-us/111828)
- [Model by polyman, CC BY 4.0](https://sketchfab.com/3d-models/apple-iphone-15-pro-max-black-df17520841214c1792fb8a44c6783ee7)
- [Distributed GLB source](https://github.com/adrianhajdin/iphone/blob/main/public/models/scene.glb)

Full model attribution is available in `public/model-license.txt` and the web editor’s Device panel.
