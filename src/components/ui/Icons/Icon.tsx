"use client";

import { ICONS } from "@/enums/icons";
import type { IconProps } from "@/types/components/icon";
import { IconRegistry } from "./iconsRegistry";

export const Icon = ({ name, fallback = null, ...props }: IconProps) => {
  const IconComponent = IconRegistry[name];

  if (!IconComponent) {
    return <>{fallback}</>;
  }

  return <IconComponent {...props} />;
};
