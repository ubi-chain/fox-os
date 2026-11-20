# Open QAN Geometry — Public Preview

**Status:** Experimental public preview (MVP)  
**Project:** UBICHAIN / FoxOS  
**Author display:** Independent Developer  
**License:** MIT for the editor code in `public/geometry-editor/index.html`; documentation in this file is CC BY 4.0.

## What is available

- Browser-based Three.js viewport with orbit, pan, zoom, and object selection.
- Quad-first cube, cube-projected quad sphere, and quad plane generation.
- Import of GLB, glTF, and OBJ files.
- Export to GLB and OBJ. Generated quad faces are retained in OBJ output.
- Basic topology inspection: vertices, quad faces, render triangles, unique edges, boundary edges, non-manifold edges, and invalid faces.
- Local browser processing; no upload endpoint is included.

## Important format and validation limits

- WebGL and glTF render triangle primitives. GLB export therefore triangulates quad faces; OBJ export preserves generated quads.
- The current checker does **not** yet detect arbitrary self-intersections, coplanar overlaps, or collisions between separate objects.
- Imported files may already be triangulated; original quad topology cannot always be recovered.
- This is an experimental geometry editor, not an engineering validation tool.

## Run

Open `/geometry-editor/index.html` from a local static server or publish the repository's `public` directory with the app. The page loads Three.js modules from jsDelivr, so an internet connection is required.

## Privacy and licensing

The editor has no account system and does not transmit model files. MIT permits use, modification, distribution, and commercial use, subject to retaining the copyright and license notice. Documentation is CC BY 4.0 and requires attribution.

## Next milestones

1. Replace the current QAN expression evaluator's dynamic JavaScript evaluation with a real parser before accepting untrusted QAN.
2. Add robust triangle/quad self-intersection tests and collision checks.
3. Add topology-preserving import paths and explicit unit metadata.
4. Add automated browser tests and a reproducible build pipeline.
5. Connect QAN PI through a versioned JSON parameter contract; never execute AI-generated source.
