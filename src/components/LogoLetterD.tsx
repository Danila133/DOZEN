"use client";

import { useId } from "react";

type LogoLetterDProps = {
  size?: number;
  className?: string;
};

/** Stylized D for $D token mark */
export function LogoLetterD({ size = 12, className = "" }: LogoLetterDProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `logo-d-spore-${uid}`;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.12)}
      viewBox="0 0 120 140"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="120" y2="140">
          <stop offset="0%" stopColor="#c8ff5c" />
          <stop offset="50%" stopColor="#b8ff3c" />
          <stop offset="100%" stopColor="#7ee081" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradId})`}
        d="M 24 8 H 64 Q 104 8 104 48 V 92 Q 104 132 64 132 H 24 Z M 48 32 V 108 H 62 Q 80 108 80 92 V 48 Q 80 32 62 32 Z"
      />
    </svg>
  );
}
