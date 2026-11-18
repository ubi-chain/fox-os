# QAN PI Geometry Engine — Technical Reference

**Status:** Design proposal / prototype integration plan  
**Date:** 2026-11-18  
**Repository:** `ubi-chain/fox-os`  
**Related project:** UBICHAIN / Universal Wide Web (UWW)

## 1. Purpose

The QAN PI Geometry Engine is a proposed extension that uses degree-based input, the mathematical constant π, phase offsets, and 3D coordinate calculations to define parametric geometry. An AI component may translate a natural-language request into a bounded set of geometry parameters. A deterministic geometry engine then calculates vertices and mesh topology.

The AI does not replace the mathematical engine. The AI proposes parameters; the geometry engine validates and calculates the model.

## 2. Current implementation versus proposal

### Already present in the repository

- QAN mini-runtime exports `PI = Math.PI` and `PI_DISPLAY`.
- Built-in constants include `pi`, `π`, `PI`, `tau`, `τ`, and `e`.
- Helpers include `degToRad`, `radToDeg`, `circumference`, and `circleArea`.
- `π(...)` supports local circle area, circumference, and degree/radian conversion.
- Geometry Studio has X/Y/Z rotation, parametric geometry examples, and SVG export.

### Proposed, not yet implemented as a complete feature

- Explicit phase-offset controls for parametric models.
- A validated geometry parameter schema and mesh-generation service.
- AI prompt-to-parameter translation.
- Model preview and GLB/OBJ export pipeline.
- A safe QAN parser and restricted execution model for untrusted input.

Do not interpret the proposed examples in this document as commands currently accepted by the QAN runtime.

## 3. Degree input and phase offset

Users may specify angles in degrees. Trigonometric functions in JavaScript and most geometry libraries expect radians, so convert at the boundary:

```text
radians = degrees × π / 180
```

To rotate the angular starting position (phase):

```text
thetaDegrees = baseAngleDegrees + phaseDegrees
thetaRadians = thetaDegrees × π / 180
```

Normalize a display angle if useful:

```text
normalizedDegrees = ((thetaDegrees % 360) + 360) % 360
```

The value of π does not move or change. The phase offset changes where the angular parameter begins on the shape.

## 4. Parametric 3D coordinate examples

### Sphere

Let (R) be radius, (	heta) horizontal angle, and (phi) vertical angle:

```text
x = R × sin(phi) × cos(theta)
y = R × sin(phi) × sin(theta)
z = R × cos(phi)
```

Use degree inputs for `thetaDegrees` and `phiDegrees`, then convert each to radians before calling sine or cosine.

### Torus

Let (R) be the major radius and (r) the tube radius:

```text
x = (R + r × cos(v)) × cos(u)
y = (R + r × cos(v)) × sin(u)
z = r × sin(v)
```

Apply independent phase offsets `phaseU` and `phaseV` to the degree parameters before conversion. This can rotate the parameterization without changing the underlying torus geometry.

### Rotation of a point

A point may be rotated around X, Y, and Z. Convert each degree angle to radians and apply the selected rotation matrices in a documented order. Rotation order matters; use one consistent convention throughout the application.

## 5. Proposed AI-assisted workflow

1. **Prompt:** User describes a shape, e.g. “a torus with a 45-degree phase offset and a fine wireframe”.
2. **AI parameter proposal:** AI returns structured values such as primitive type, dimensions, phase offsets, segment counts, and material hints.
3. **Schema validation:** Validate type, numeric ranges, units, segment limits, and resource budgets. Reject unknown fields.
4. **Deterministic geometry calculation:** Convert degrees to radians and calculate vertices and indices.
5. **Mesh validation:** Check finite coordinates, valid indices, normals, triangle count, and memory budget.
6. **Preview:** Render a preview in Geometry Studio / Three.js.
7. **Export:** Add GLB or OBJ export only after the corresponding implementation and tests exist.

AI output must be treated as untrusted input. It must never be executed as source code.

## 6. Proposed parameter contract

Illustrative JSON data contract (not a QAN syntax definition):

```json
{
  "schemaVersion": "1.0",
  "primitive": "sphere",
  "units": "degrees",
  "radius": 10,
  "phase": {
    "thetaDegrees": 45,
    "phiDegrees": 0
  },
  "segments": {
    "longitude": 48,
    "latitude": 24
  },
  "output": {
    "preview": true,
    "format": "mesh"
  }
}
```

The validator should enforce positive bounded dimensions, a fixed allow-list of primitives, bounded segment counts, and a total vertex/triangle budget. Never allow arbitrary code, file paths, network URLs, or executable plugin expressions in this contract.

## 7. Proposed QAN-style example

The following is pseudocode for a future QAN extension. It is not guaranteed to run in the current mini-runtime:

```text
# Degree-based inputs
angle = 90
phase = 45

# Convert to radians through the PI helper
theta = angle + phase

# Future geometry declaration (proposed)
MODEL sphere
RADIUS 10
THETA_OFFSET_DEG 45
COORDINATE_SYSTEM XYZ
SEGMENTS 48 24
GENERATE_MESH
```

Before adopting these commands, define the QAN grammar, parser, type system, error handling, and version compatibility rules.

## 8. Integration with existing Geometry Studio

- Reuse the same π constant and degree/radian conversion convention.
- Keep the geometry engine deterministic and independent of AI provider.
- Use Three.js or another explicitly selected renderer for preview; do not couple geometry math to UI state.
- Keep the current SVG export behavior separate from future mesh export.
- Add tests for 0°, 45°, 90°, 180°, 270°, 360°, negative angles, and phase wraparound.
- Add geometry tests for known sphere/torus points and mesh bounds.

## 9. Security and reliability requirements

The current QAN mini-runtime evaluates arithmetic expressions using JavaScript `Function` after a character allow-list. That is not an adequate sandbox for arbitrary or adversarial input. Before exposing QAN or AI-generated expressions to untrusted users:

- Replace dynamic evaluation with a small arithmetic parser / AST evaluator.
- Allow only explicit numeric operators and approved functions.
- Apply input length, nesting, execution, vertex, and memory limits.
- Validate all AI-generated parameters against a strict schema.
- Keep model generation local and deterministic after parameter validation.
- Do not permit generated QAN to access filesystem, network, secrets, or privileged APIs.
- Run tests and security review before production deployment.

## 10. Suggested implementation milestones

1. **M1 — Math tests:** verify degree/radian and phase calculations.
2. **M2 — Parameter schema:** define versioned primitive and mesh parameter types.
3. **M3 — Deterministic mesh engine:** sphere and torus first, then additional surfaces.
4. **M4 — Preview:** connect mesh output to Geometry Studio.
5. **M5 — AI adapter:** prompt-to-JSON only, with validation and user confirmation.
6. **M6 — Export:** GLB/OBJ support, tests, and compatibility documentation.
7. **M7 — QAN language integration:** formal grammar and safe interpreter before enabling new commands.

## 11. References in this repository

- [QAN π reference](./qan-pi-reference.md)
- [Geometry Studio reference](./geometry-studio-reference.md)
- Runtime: `src/lib/fox/qan-runtime.ts`
- Geometry Studio: `src/components/geometry-studio.tsx`

## 12. Relationship to UBICHAIN / UWW

This engine is intended as a candidate creator-tool component for UWW. UBICHAIN may provide identity, project metadata, permissions, and asset coordination, while geometry generation remains a separately testable module. The satellite-network concept UWW-SN is not required for local geometry calculations.
