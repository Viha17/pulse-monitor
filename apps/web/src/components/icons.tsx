const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  "aria-hidden": true,
};

export const ArrowLeft = () => (
  <svg {...base}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </svg>
);

export const ArrowUpRight = () => (
  <svg {...base} width={12} height={12}>
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

export const Plus = () => (
  <svg {...base} width={14} height={14}>
    <path d="M12 4v16M4 12h16" />
  </svg>
);
