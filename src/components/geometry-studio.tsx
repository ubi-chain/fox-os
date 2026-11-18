import { useEffect, useMemo, useState } from "react";
import "./geometry-studio.css";

type Vec3 = { x: number; y: number; z: number };
type Shape = "klein" | "circle" | "cube";

const PI = Math.PI;
const SIZE = 300;
const CENTER = SIZE / 2;

function rotate(point: Vec3, angles: Vec3): Vec3 {
  const ax = (angles.x * PI) / 180;
  const ay = (angles.y * PI) / 180;
  const az = (angles.z * PI) / 180;
  const y1 = point.y * Math.cos(ax) - point.z * Math.sin(ax);
  const z1 = point.y * Math.sin(ax) + point.z * Math.cos(ax);
  const x2 = point.x * Math.cos(ay) + z1 * Math.sin(ay);
  const z2 = -point.x * Math.sin(ay) + z1 * Math.cos(ay);
  return { x: x2 * Math.cos(az) - y1 * Math.sin(az), y: x2 * Math.sin(az) + y1 * Math.cos(az), z: z2 };
}

function project(point: Vec3, angles: Vec3, scale: number): [number, number] {
  const p = rotate(point, angles);
  const perspective = 260 / (260 + p.z * 0.22);
  return [CENTER + p.x * scale * perspective, CENTER - p.y * scale * perspective];
}

function kleinPoint(u: number, v: number): Vec3 {
  // Standard self-intersecting immersion of the Klein bottle in 3D.
  const r = 4 * (1 - Math.cos(u) / 2);
  return {
    x: 6 * Math.cos(u) * (1 + Math.sin(u)) + r * Math.cos(u) * Math.cos(v),
    y: 16 * Math.sin(u) + r * Math.sin(u) * Math.cos(v),
    z: r * Math.sin(v),
  };
}

function linePath(points: Vec3[], angles: Vec3, scale: number): string {
  return points.map((point, index) => {
    const [x, y] = project(point, angles, scale);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function kleinMesh(angles: Vec3, scale: number) {
  const paths: string[] = [];
  const steps = 18;
  const count = 32;
  for (let row = 0; row <= steps; row += 1) {
    const u = (row / steps) * 2 * PI;
    const points = Array.from({ length: count + 1 }, (_, column) => kleinPoint(u, (column / count) * 2 * PI));
    paths.push(linePath(points, angles, scale));
  }
  for (let column = 0; column <= steps; column += 1) {
    const v = (column / steps) * 2 * PI;
    const points = Array.from({ length: count + 1 }, (_, row) => kleinPoint((row / count) * 2 * PI, v));
    paths.push(linePath(points, angles, scale));
  }
  return paths;
}

function cubeEdges(angles: Vec3, scale: number) {
  const vertices: Vec3[] = [
    { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 },
  ];
  const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  return edges.map(([from, to]) => linePath([vertices[from], vertices[to]], angles, scale));
}

export function GeometryStudio() {
  const [shape, setShape] = useState<Shape>("klein");
  const [angles, setAngles] = useState<Vec3>({ x: 22, y: -18, z: 12 });
  const [scale, setScale] = useState(6.5);
  const [clock, setClock] = useState(() => new Date());
  const [animateTime, setAnimateTime] = useState(false);
  const [notice, setNotice] = useState("Ready · geometry stays in this browser");
  const meshes = useMemo(() => kleinMesh(angles, scale), [angles, scale]);
  const edges = useMemo(() => cubeEdges(angles, Math.min(scale, 62)), [angles, scale]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!animateTime) return;
    const timer = window.setInterval(() => {
      const now = new Date();
      setAngles((old) => ({ ...old, z: (now.getSeconds() * 6) % 360 }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [animateTime]);

  const exportSvg = () => {
    const svg = document.querySelector<SVGSVGElement>("#geometry-canvas");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fox-geometry-${shape}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("SVG exported");
  };

  return (
    <main className="geometry-studio">
      <header className="geometry-header">
        <div><span className="geometry-kicker">FOX CREATIVE TOOLS</span><h1>Geometry Studio</h1><p>Parametric forms · spreadsheet-inspired artboard · local SVG export</p></div>
        <div className="geometry-clock"><span>PI</span><strong>{PI.toFixed(8)}</strong><small>{clock.toLocaleTimeString()}</small></div>
      </header>
      <section className="geometry-workspace">
        <aside className="geometry-tools" aria-label="Geometry controls">
          <h2>Objects</h2>
          {(["klein", "circle", "cube"] as Shape[]).map((item) => <button key={item} type="button" className={shape === item ? "is-active" : ""} onClick={() => setShape(item)}>{item === "klein" ? "Klein bottle" : item === "circle" ? "Circle" : "Cube"}<span>{item === "klein" ? "SURFACE" : item === "circle" ? "2D / π" : "WIREFRAME"}</span></button>)}
          <h2>Transform · degrees</h2>
          {(["x", "y", "z"] as const).map((axis) => <label className="geometry-slider" key={axis}><span>{axis.toUpperCase()} <output>{Math.round(angles[axis])}°</output></span><input type="range" min={-180} max={180} value={angles[axis]} onChange={(event) => setAngles((old) => ({ ...old, [axis]: Number(event.target.value) }))} /></label>)}
          <label className="geometry-slider"><span>Scale <output>{scale.toFixed(1)}</output></span><input type="range" min={2} max={9} step={0.1} value={scale} onChange={(event) => setScale(Number(event.target.value))} /></label>
          <label className="geometry-check"><input type="checkbox" checked={animateTime} onChange={(event) => setAnimateTime(event.target.checked)} /> Link Z rotation to clock seconds</label>
          <button type="button" className="geometry-export" onClick={exportSvg}>Export SVG</button>
          <p role="status" className="geometry-notice">{notice}</p>
        </aside>
        <div className="geometry-canvas-wrap">
          <div className="geometry-canvas-label"><span>ARTBOARD · 300 × 300</span><span>{shape.toUpperCase()} · X/Y/Z</span></div>
          <svg id="geometry-canvas" className="geometry-canvas" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${shape} geometry preview`}>
            <defs><pattern id="geometry-grid" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M 15 0 L 0 0 0 15" fill="none" stroke="#342932" strokeWidth="0.7" /></pattern><radialGradient id="geometry-glow"><stop stopColor="#8c3140" stopOpacity=".23" /><stop offset="1" stopColor="#110d12" stopOpacity="0" /></radialGradient></defs>
            <rect width={SIZE} height={SIZE} fill="#110d12" /><rect width={SIZE} height={SIZE} fill="url(#geometry-grid)" /><circle cx={CENTER} cy={CENTER} r="130" fill="url(#geometry-glow)" />
            <line x1="20" x2="280" y1={CENTER} y2={CENTER} stroke="#78606b" strokeWidth=".6" /><line x1={CENTER} x2={CENTER} y1="20" y2="280" stroke="#78606b" strokeWidth=".6" />
            {shape === "klein" ? meshes.map((d, index) => <path key={index} d={d} fill="none" stroke={index < 19 ? "#ffd24a" : "#ef7f83"} strokeOpacity=".72" strokeWidth=".75" />) : null}
            {shape === "cube" ? edges.map((d, index) => <path key={index} d={d} fill="none" stroke="#ffd24a" strokeWidth="1.6" />) : null}
            {shape === "circle" ? <g transform={`rotate(${angles.z} ${CENTER} ${CENTER})`}><circle cx={CENTER} cy={CENTER} r={Math.min(scale * 12, 100)} fill="rgba(255,210,74,.1)" stroke="#ffd24a" strokeWidth="2" /><line x1={CENTER} y1={CENTER} x2={CENTER + Math.min(scale * 12, 100)} y2={CENTER} stroke="#ef7f83" strokeWidth="1.5" /><text x={CENTER + 8} y={CENTER - 8} fill="#f5eee8" fontSize="10">r · π</text></g> : null}
            <text x="12" y="18" fill="#9c8993" fontSize="8">π = {PI.toFixed(5)}</text><text x="12" y="290" fill="#9c8993" fontSize="8">t = {clock.toLocaleTimeString()}</text>
          </svg>
          <div className="geometry-axis"><span>X · {Math.round(angles.x)}°</span><span>Y · {Math.round(angles.y)}°</span><span>Z · {Math.round(angles.z)}°</span></div>
        </div>
        <aside className="geometry-sheet"><h2>Geometry cells <small>FORMULA VIEW</small></h2><div className="geometry-table-wrap"><table><thead><tr><th>Cell</th><th>Expression</th><th>Value</th></tr></thead><tbody>
          <tr><td>A1</td><td>PI()</td><td>{PI.toFixed(6)}</td></tr><tr><td>A2</td><td>rotation.x</td><td>{Math.round(angles.x)}°</td></tr><tr><td>A3</td><td>rotation.y</td><td>{Math.round(angles.y)}°</td></tr><tr><td>A4</td><td>rotation.z</td><td>{Math.round(angles.z)}°</td></tr><tr><td>B1</td><td>clock.time</td><td>{clock.toLocaleTimeString()}</td></tr><tr><td>B2</td><td>object.type</td><td>{shape}</td></tr><tr><td>B3</td><td>surface.u × v</td><td>{shape === "klein" ? "19 × 19" : "—"}</td></tr><tr><td>B4</td><td>scale</td><td>{scale.toFixed(1)}</td></tr>
        </tbody></table></div><p>Spreadsheet-style geometry values update with the artboard. This is a lightweight 2D/ SVG prototype, not a full 3D modeling or rendering engine.</p></aside>
      </section>
    </main>
  );
}
