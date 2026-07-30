# Portfolio Project Info

## Overview

Kyunglim.Byun. portfolio main page built as an interactive art portfolio experience.

The page is centered around a 3D glass card carousel with image-based card surfaces, water-like reflection, animated intro camera motion, and a large interactive `PORTFOLIO` background typography layer.

## Tech Stack

- Framework: Next.js `16.2.12`
- UI Runtime: React `19.2.4`, React DOM `19.2.4`
- Language: TypeScript `^5`
- Styling: Tailwind CSS `^4` with `@tailwindcss/postcss`
- 3D Rendering: Three.js `^0.185.1`
- React Three Integration: `@react-three/fiber` `^9.6.1`
- Three Helpers: `@react-three/drei` `^10.7.7`
- Motion: GSAP `^3.15.0`, Framer Motion `^12.43.0`
- Icons: Lucide React `^1.27.0`
- Linting: ESLint `^9`, `eslint-config-next` `16.2.12`

## Main Features

- Fullscreen portfolio main experience
- 3D curved card carousel for `BUILD`, `THINK`, and `TEACH`
- Card contents loaded from image assets:
  - `/BUILD.png`
  - `/THINK.png`
  - `/TEACH.png`
- Glass-like curved card surface with edge highlights
- Water-style reflection below the carousel
- Feathered reflection edges so the reflection fades into the white background
- Pure white gallery-style background
- Large black serif `PORTFOLIO` background typography
- Mouse-driven ripple distortion on the background typography
- Cinematic intro:
  - Top-view carousel rotation
  - `PORTFOLIO` reveal
  - Smooth camera descent into frontal view
  - `KYUNGLIM.BYUN.` intro name held until the camera descent begins
- Wheel, swipe, keyboard, and navigation controls for carousel interaction

## Important Files

- `src/app/page.tsx`
  - Renders the main portfolio experience.

- `src/components/portfolio/PortfolioExperience.tsx`
  - Main composition layer.
  - Handles global phase, top label, `KYUNGLIM.BYUN.` intro text, background title animation, canvas, and navigation.

- `src/components/portfolio/PortfolioCanvas.tsx`
  - Three.js canvas setup.
  - Controls intro camera movement and ready-state pointer camera response.

- `src/components/portfolio/ThreePanelCarousel.tsx`
  - 3D carousel group.
  - Controls intro spin, carousel rotation, and reflection layer rendering.

- `src/components/portfolio/PortfolioPanel.tsx`
  - Curved card geometry.
  - Card image texture generation.
  - Glass highlight texture overlay.
  - Reflection shader and watery edge feathering.

- `src/components/portfolio/ReflectionGroup.tsx`
  - Mirrored reflection carousel layer.

- `src/components/portfolio/WaterSurfaceEffects.tsx`
  - Water surface haze, glow, and soft shadow effects.

- `src/components/portfolio/BackgroundTitle.tsx`
  - Canvas-based `PORTFOLIO` text.
  - Handles pointer-driven ripple distortion.

- `src/components/portfolio/CategoryIndicator.tsx`
  - Bottom carousel navigation.

- `src/data/categories.ts`
  - Category metadata for `BUILD`, `TEACH`, and `THINK`.

- `public/BUILD.png`, `public/THINK.png`, `public/TEACH.png`
  - Card surface images used as cover textures.

## Scripts

```bash
npm run dev
```

Starts the local development server.

```bash
npm run build
```

Creates an optimized production build.

```bash
npm run start
```

Runs the production build.

```bash
npm run lint
```

Runs ESLint.

## Local URL

```text
http://localhost:3000
```

## Notes

- The project is currently not initialized as a Git repository in this folder.
- `BUILD.png`, `THINK.png`, and `TEACH.png` also exist at the project root, but the browser-facing versions are in `public/`.
- The main carousel geometry, card size, curve, camera path, reflection spacing, and navigation are intentionally separated from card image content so visual assets can be changed without altering the 3D structure.
