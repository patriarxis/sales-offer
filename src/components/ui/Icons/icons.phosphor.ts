import { ICONS } from "@/enums/icons";
import { IIconProps } from "@/types/ui/icon";
import { ComponentType, createElement } from "react";
import {
  CalendarBlankIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadSimpleIcon,
  HashIcon,
  LockIcon,
  type IconProps as PhosphorIconProps,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { AppIconComponent } from "./icons.types";

const withPhosphorFill = (
  IconComponent: ComponentType<PhosphorIconProps>,
  defaultWeight: PhosphorIconProps["weight"] = "fill",
): AppIconComponent => {
  const WrappedIcon = ({ ...props }: IIconProps) =>
    createElement(IconComponent, {
      ...(props as unknown as PhosphorIconProps),
      weight:
        (props as { weight?: PhosphorIconProps["weight"] }).weight ?? defaultWeight,
    });

  return WrappedIcon;
};

export const phosphorIconRegistry: Partial<Record<ICONS, AppIconComponent>> = {
  [ICONS.CALENDAR]: withPhosphorFill(CalendarBlankIcon),
  [ICONS.DOWNLOAD]: withPhosphorFill(DownloadSimpleIcon),
  [ICONS.CHECK_CIRCLE]: withPhosphorFill(CheckCircleIcon),
  [ICONS.X_CIRCLE]: withPhosphorFill(XCircleIcon),
  [ICONS.CLOCK]: withPhosphorFill(ClockIcon),
  [ICONS.HASH]: withPhosphorFill(HashIcon),
  [ICONS.LOCK]: withPhosphorFill(LockIcon, "fill"),
  [ICONS.WARNING]: withPhosphorFill(WarningCircleIcon),
};
