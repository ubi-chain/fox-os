# QAN Geometry Editor — Reference Architecture

**Project:** UBICHAIN / FoxOS / QAN PI  
**Status:** Open development specification  
**Code license target:** MIT  
**Documentation license target:** CC BY 4.0

## Purpose

Build a free, lightweight, editable 3D geometry editor around QAN PI and a quad-first mesh workflow. It will generate, inspect, import, and export low-poly reference models for:

1. A fictional 10 km × 10 km mountain megacity inspired by broad science-fiction city concepts, with underground infrastructure and resilient urban districts. This is an original design, not a recreation of a copyrighted city.
2. A lightweight linear-motor / maglev concept: vehicle, guideway, pylons, stations, tunnel portals, and service structures.

These are visualization and simulation references, not construction-ready engineering designs.

## Design principles

- Quad-first: generated surface faces use four shared vertex indices wherever practical.
- Manifold-aware: closed solids should have consistent edge incidence and outward normals.
- Prevent unintended self-intersections, duplicate coplanar faces, and inter-object penetration in validated output.
- Declare model units and geometric tolerances explicitly.
- Low-poly first: preserve silhouette and useful shape while minimizing vertices, draw calls, and duplicated geometry.
- Deterministic generation: identical parameters and engine versions should produce identical topology.
- Non-destructive editing: preserve source parameters separately from generated mesh data.
- OBJ is useful for quad-friendly interchange; GLB/glTF delivery normally triangulates faces.

## Reference model: 10 km × 10 km city

Use a local Cartesian coordinate system in metres. Terrain footprint: X and Y from -5000 to +5000.

### Scene layers

- terrain: low-resolution base terrain and mountain ridges.
- districts: modular city blocks and functional zones.
- buildings_lod0: near-camera landmark buildings.
- buildings_lod1: simplified mid-distance blocks.
- buildings_lod2: distant silhouettes or impostors.
- roads: ring road, secondary roads, service routes.
- rail: guideway, supports, stations, portals, vehicle.
- green_buffer: parks, forest belts, drainage corridors.
- utilities: simplified service corridors.

### Initial lightweight budgets

| Asset | Target budget |
|---|---:|
| Terrain | 100 × 100 quad grid or adaptive equivalent |
| Ordinary building LOD0 | 300–1,500 triangles |
| Repeated building LOD1 | 80–300 triangles |
| Distant building LOD2 | 12–80 triangles or impostor |
| Vegetation | Instanced low-poly clusters |
| Scene | Spatial chunks with frustum and LOD culling |

Use instancing for repeated windows, pylons, lamps, trees, and modular building families. Divide the map into spatial chunks, such as 250 m or 500 m cells, for visibility culling and streaming.

## Reference model: lightweight linear / maglev concept

Keep independently editable components:

- vehicle_shell: low-poly exterior envelope.
- guideway: continuous guideway mesh with shared vertices.
- support_pylons: instanced supports with configurable spacing.
- propulsion_reference: simplified ground-side coil housings for visualization.
- stations: platform, canopy, access, and evacuation volumes.
- tunnel_portals: terrain transitions and clearance envelope.
- clearance_envelope: non-rendering vehicle/guideway separation volume.
- maintenance_access: service walkways and inspection spaces.

Do not infer real levitation, propulsion, structural capacity, braking, evacuation, electromagnetic compatibility, or passenger safety from this visual model. Those require qualified railway, civil, electrical, fire, and safety engineering.

## Geometry validation pipeline

1. Validate parameter ranges and units.
2. Generate shared vertices and quad faces.
3. Reject zero-area faces and duplicate vertex indices within a face.
4. Check edge incidence and connected components.
5. Recalculate and verify normals.
6. Run triangle/quad intersection tests, excluding adjacent faces that legitimately share topology.
7. Detect coplanar duplicate and overlapping faces.
8. Run inter-object collision and clearance checks with declared tolerances.
9. Generate LODs and verify silhouette deviation.
10. Export and re-import OBJ/GLB in automated tests.

A basic manifold check does not prove a mesh is free of self-intersections. Those checks must be implemented and run separately.

## Proposed QAN PI integration contract

The current FoxOS QAN PI reference includes π, τ, e, circle area/circumference, and degree/radian helpers. The following JSON contract is a proposed API design, not existing executable QAN syntax:

    {
      "schema": "qan.geometry.parameters.v1",
      "units": "m",
      "primitive": "quad_grid",
      "dimensions": [10, 10, 1],
      "subdivisions": [100, 100],
      "validation": {
        "manifold": true,
        "selfIntersection": true,
        "duplicateFaces": true,
        "clearance": true
      },
      "lod": [0, 1, 2]
    }

AI systems should produce validated parameter objects, not executable scripts or unrestricted QAN expressions. A deterministic geometry engine performs calculations and mesh generation.

## Suggested repository layout

- src/core/: geometry primitives and deterministic generators.
- src/topology/: manifold, normal, duplicate-face, and intersection validation.
- src/formats/: OBJ and GLB/glTF adapters.
- src/qan/: QAN PI parameter bridge and schema validation.
- examples/third-city/: 10 km × 10 km environment parameters.
- examples/light-maglev/: vehicle, guideway, station, and clearance parameters.
- tests/: geometry invariants, import/export round trips, performance budgets.
- docs/: architecture, coordinate conventions, limitations, and attribution.

## Copilot implementation brief

Implement in small reviewable pull requests. Start with a tested geometry kernel and parameter schema, then topology checks, import/export, and finally city/rail generators. Add automated tests for each invariant. Do not claim collision-free output until robust self-intersection and inter-object clearance tests are implemented and passing. Preserve existing FoxOS APIs and do not replace the QAN parser without a migration plan.

## Current prototype limitations

The browser preview at public/geometry-editor/index.html supports quad-first cube, cube-projected sphere, and plane generation; GLB/glTF/OBJ import; GLB/OBJ export; mouse orbit/pan/zoom; and basic topology counts. It does not yet implement robust self-intersection, coplanar overlap, collision/clearance analysis, full QAN expression execution, LOD generation, or railway engineering validation.
