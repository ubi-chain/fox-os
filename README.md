# FOX OS / Open QAN Geometry

## Open QAN Geometry — free 3D editor preview

The experimental **Quad-First Geometry Editor** is available in this public repository:

- Editor source: [public/geometry-editor/index.html](public/geometry-editor/index.html)
- Release notes and limitations: [docs/geometry-editor-public-release.md](docs/geometry-editor-public-release.md)
- Editor code license: [MIT](public/geometry-editor/LICENSE)
- Editor documentation license: [CC BY 4.0 notice](docs/geometry-editor-CC-BY-4.0.md)

The editor supports quad-first primitive generation, GLB/glTF/OBJ import, GLB/OBJ export, orbit/pan/zoom, and basic topology checks. It is an experimental preview, not a validated engineering tool. Self-intersection and inter-object collision detection are not yet implemented.

## QAN Geometry Editor — lightweight 3D reference models

The free QAN Geometry Editor prototype is the starting point for a focused geometry-editor project. Its reference specification covers quad-first topology, QAN PI integration, import/export, and optimized lightweight 3D references for a fictional 10 km × 10 km Third-City-inspired environment and a conceptual linear/maglev system.

- Prototype: public/geometry-editor/index.html
- Reference architecture: docs/qan-geometry-editor-reference.md
- Preview limitations: docs/geometry-editor-public-release.md

The city and linear models are visualization assets, not construction-ready engineering plans. Robust self-intersection and inter-object collision detection remain planned work.

## Build FOX OS ISO

This repository uses `os/build.sh` to build an Ubuntu 24.04-based FOX OS ISO.

```bash
cd os
sudo ./build.sh --i-understand
```

On successful completion, the build produces `fox-os-amd64.hybrid.iso`.

To write the ISO to a USB drive, use a trusted imaging utility such as Rufus on Windows. Select the ISO, confirm the target USB drive carefully, and start the write process. Then use the PC's BIOS/UEFI boot menu to select the USB device.

## Security notice

Earlier setup notes in this repository described a fixed default administrator credential. That credential must not be used for any public, shared, or production deployment. The OS image and provisioning scripts still require a separate security audit to confirm that no fixed credential remains. Set unique credentials during installation and verify the result before connecting the system to a network.

Do not write an ISO to a disk unless you have verified the target device; the operation can erase data.

## Project status

- QAN PI: existing local math helpers and prototype runtime.
- Quad-first 3D editor: experimental browser preview.
- Robust mesh intersection/collision validation: not implemented yet.
- QAN parser hardening: required before accepting untrusted user or AI-generated expressions.
- Production readiness: not claimed.
