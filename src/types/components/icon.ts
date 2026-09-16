import type { ReactNode } from "react";
import { ICONS } from "@/enums/icons";
import type { IIconProps } from "@/types/ui/icon";

export type IconProps = IIconProps & {
  name: ICONS;
  fallback?: ReactNode;
};
