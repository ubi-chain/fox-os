function hexPoints(cx: number, cy: number, r: number) {
  let points = "";
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = (cx + r * Math.cos(angle)).toFixed(1);
    const py = (cy + r * Math.sin(angle)).toFixed(1);
    points += `${i === 0 ? "" : " "}${px},${py}`;
  }
  return points;
}

const R = 16;
const DX = R * Math.sqrt(3);
const DY = R * 1.5;
const CENTERS: Array<[number, number]> = [
  [50, 46],
  [50, 46 - DY],
  [50 + DX, 46 - DY / 2],
  [50 + DX, 46 + DY / 2],
  [50, 46 + DY],
  [50 - DX, 46 + DY / 2],
  [50 - DX, 46 - DY / 2],
];

export function HiveMark() {
  return (
    <svg className="fox-mark" viewBox="0 0 100 92" aria-hidden="true">
      {CENTERS.map(([x, y], index) => (
        <polygon key={index} points={hexPoints(x, y, R - 1.4)} />
      ))}
    </svg>
  );
}
