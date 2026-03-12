declare module "@fortawesome/react-fontawesome" {
  import * as React from "react";

  export interface FontAwesomeIconProps {
    icon: any;
    className?: string;
    color?: string;
    size?: "xs" | "sm" | "lg" | "1x" | "2x" | "3x" | "4x" | "5x" | "6x" | "7x" | "8x" | "9x" | "10x";
    spin?: boolean;
    pulse?: boolean;
    beat?: boolean;
    fade?: boolean;
    bounce?: boolean;
    shake?: boolean;
    flip?: "horizontal" | "vertical" | "both";
    style?: React.CSSProperties;
    title?: string;
    [key: string]: any;
  }

  export const FontAwesomeIcon: React.ComponentType<FontAwesomeIconProps>;
}
