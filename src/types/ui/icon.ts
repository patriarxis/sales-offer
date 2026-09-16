import { CSSProperties } from "react";
import type { IconWeight } from "@phosphor-icons/react";

export type IIconProps = {
  size?: number | string;
  color?: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
  weight?: IconWeight;
  "aria-label"?: string;
};
