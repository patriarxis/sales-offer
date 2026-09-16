import { ICONS } from "@/enums/icons";
import { Facebook } from "./Library/Facebook";
import { Instagram } from "./Library/Instagram";
import { Linkedin } from "./Library/Linkedin";
import { Spotify } from "./Library/Spotify";
import { Tiktok } from "./Library/Tiktok";
import { Youtube } from "./Library/Youtube";
import { AppIconComponent } from "./icons.types";

export const customIconRegistry: Partial<Record<ICONS, AppIconComponent>> = {
  [ICONS.LINKEDIN]: Linkedin,
  [ICONS.INSTAGRAM]: Instagram,
  [ICONS.FACEBOOK]: Facebook,
  [ICONS.TIKTOK]: Tiktok,
  [ICONS.YOUTUBE]: Youtube,
  [ICONS.SPOTIFY]: Spotify,
};
