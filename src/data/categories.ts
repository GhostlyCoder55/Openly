import type { Category } from "./types";

export const categories: Category[] = [
  {
    id: "images",
    name: "Images",
    description: "Photographs, illustrations, icons, camera raw files, and other picture formats.",
    aliases: ["image", "images", "pictures", "photos", "photography"],
  },
  {
    id: "video-audio",
    name: "Video & audio",
    description: "Sound, music, and moving-image files, including containers that can hold several streams.",
    aliases: ["audio", "video", "music", "movies", "media", "sound"],
  },
  {
    id: "documents",
    name: "Documents & eBooks",
    description: "Text, office documents, page layouts, spreadsheets, presentations, and books.",
    aliases: ["document", "documents", "ebooks", "e-books", "office", "ebook"],
  },
  {
    id: "archives",
    name: "Archives",
    description: "Compressed files, bundles of files, and disk images that package other content.",
    aliases: ["archive", "archives", "compression", "compressed"],
  },
  {
    id: "development",
    name: "Development & data",
    description: "Source code, structured data, databases, notebooks, and files programmers exchange.",
    aliases: ["development", "code", "data", "programming", "developer", "database"],
  },
  {
    id: "games",
    name: "Games & emulation",
    description: "Console dumps, save data, package files, and other game-related formats.",
    aliases: ["games", "game", "emulation", "roms", "retro"],
  },
  {
    id: "3d-cad",
    name: "3D & CAD",
    description: "Meshes, scenes, CAD exchange files, and models used for design and printing.",
    aliases: ["3d", "3d models", "cad", "meshes", "3d model", "modeling"],
  },
  {
    id: "system",
    name: "System & executable",
    description: "Programs, installers, libraries, and operating-system packages.",
    aliases: ["system", "executable", "programs", "installers", "application", "apps"],
  },
];
