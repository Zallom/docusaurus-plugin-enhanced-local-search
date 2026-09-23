import React, {type ReactNode, type SVGProps} from 'react';

/* Icônes au trait, héritent de la couleur du texte (`currentColor`). */

type IconProps = SVGProps<SVGSVGElement>;

const Base = ({children, ...props}: IconProps & {children: ReactNode}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}>
    {children}
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <Base {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);

export const PageIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Base>
);

export const HashIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" />
  </Base>
);

export const ClockIcon = (props: IconProps) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const StarIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </Base>
);

export const EnterIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M9 10 4 15l5 5" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </Base>
);

export const CloseIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Base>
);

export const ArrowUpIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Base>
);

export const ArrowDownIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Base>
);

export const ArrowRightIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </Base>
);

export const ExternalIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Base>
);
