import { useId } from "react";

const PARTS = [
  "58,8 98,92 24,108 46,64",
  "142,8 102,92 176,108 154,64",
  "24,108 100,78 176,108 164,154 100,170 36,154",
  "52,156 100,144 148,156 124,202 100,216 76,202",
];

const HOLES = ["72,118 90,118 90,128 72,128", "110,118 128,118 128,128 110,128", "92,168 100,160 108,168 100,182"];

export function FoxMark() {
  const maskId = useId();
  return (
    <svg className="fox-mark" viewBox="0 0 200 230" aria-hidden="true">
      <defs>
        <mask id={maskId}>
          <rect width="200" height="230" fill="white" />
          {HOLES.map((points) => (
            <polygon key={points} points={points} fill="black" />
          ))}
        </mask>
      </defs>
      {PARTS.map((points) => (
        <polygon key={points} points={points} fill="currentColor" mask={`url(#${maskId})`} />
      ))}
    </svg>
  );
}
