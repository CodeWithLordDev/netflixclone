import { useId } from "react";

export default function StreamFlixLogo({ className = "h-10 w-auto" }) {
  const curveId = useId();

  return (
    <svg
      width="600"
      height="200"
      viewBox="0 0 600 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="StreamFlix"
    >
      <defs>
        <path id={curveId} d="M100 120 Q300 90 500 120" />
      </defs>
      <text
        fill="#E50914"
        fontSize="64"
        fontFamily="Arial Black, sans-serif"
        letterSpacing="3"
        textAnchor="middle"
      >
        <textPath href={`#${curveId}`} startOffset="50%">
          StreamFlix
        </textPath>
      </text>
    </svg>
  );
}
