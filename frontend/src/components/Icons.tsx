import type { ReactNode } from 'react';

export type IconName =
  | 'grid'
  | 'folder'
  | 'file'
  | 'ruler'
  | 'chart'
  | 'report'
  | 'settings'
  | 'cloud'
  | 'search'
  | 'bell'
  | 'plus'
  | 'arrow'
  | 'check'
  | 'layers'
  | 'download'
  | 'more'
  | 'filter'
  | 'x'
  | 'code'
  | 'shield';

export const icons: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  folder: (
    <>
      <path d="M3 7.5V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-3H5a2 2 0 0 0-2 2v2.5Z" />
      <path d="M3 9h18" />
    </>
  ),
  file: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v5h5M9 13h6M9 17h4" />
    </>
  ),
  ruler: (
    <>
      <path d="m4 18 14-14 3 3L7 21H4z" />
      <path d="m14 8 2 2M11 11l2 2M8 14l2 2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  report: (
    <>
      <path d="M5 2h11l3 3v17H5z" />
      <path d="M8 10h8M8 14h8M8 18h5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88L4.2 7.06l2.83-2.83.06.06A1.7 1.7 0 0 0 8.97 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.61.7 1.02 1.52 1.02H21v4h-.08c-.81 0-1.36.4-1.52.98Z" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 18H6a4 4 0 1 1 1.2-7.82A6 6 0 0 1 18.7 12H19a3 3 0 0 1 0 6h-3" />
      <path d="m9 15 3-3 3 3M12 12v9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  arrow: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),
  layers: (
    <>
      <path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  filter: (
    <>
      <path d="M3 4h18l-7 8v6l-4 2v-8z" />
    </>
  ),
  x: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
  code: (
    <>
      <path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2 4 5v6c0 5.3 3.4 9.7 8 11 4.6-1.3 8-5.7 8-11V5z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 18, className = 'icon' }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}
