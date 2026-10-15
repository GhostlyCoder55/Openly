import { archiveFormats } from "./archives";
import { cadFormats } from "./cad";
import { developmentFormats } from "./development";
import { documentFormats } from "./documents";
import { fontFormats } from "./fonts";
import { gameFormats } from "./games";
import { imageFormats } from "./images";
import { mediaFormats } from "./media";
import { systemFormats } from "./system";
import type { Format } from "../types";

export const formats: Format[] = [
  ...documentFormats,
  ...fontFormats,
  ...imageFormats,
  ...mediaFormats,
  ...archiveFormats,
  ...developmentFormats,
  ...cadFormats,
  ...systemFormats,
  ...gameFormats,
];
