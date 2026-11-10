import { create } from "zustand";
import { assist } from "./assistant";
import {
  initialOs,
  previewBody,
  type ChatMessage,
  type Line,
  type OsState,
  type Pane,
  type TermVisual,
} from "./model";
import { runCommand } from "./shell";
import { deskCommand, type DeskFx } from "./os-commands";
import { ICON_SEED, settleIcon, type DeskIcon } from "./icons";
import type { SnapMode } from "./snap";
import { predict } from "./predict";
import { BRAND } from "./brand";

type Confirm = { command: string; warning: string };

export type WinKind = "term" | "dev" | "ai" | "sys" | "browser" | "explorer" | "chat" | "dict" | "pkg" | "sky" | "guard" | "net" | "furry" | "inari" | "atlas" | "crypt" | "qan" | "ime" | "sat";

export type DeskWindow = {
  id: string;
  kind: WinKind;
  title: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  min: boolean;
  max: boolean;
  snap: SnapMode;
  prev: { x: number; y: number; w: number; h: number } | null;
  pinned: boolean;
};

const WIN_TITLE: Record<WinKind, string> = {
  term: "ターミナル",
  dev: "Q-DEV",
  ai: "AI",
  sys: "SYS",
  browser: "ブラウザ",
  explorer: "エクスプローラ",
  chat: "CHAT",
  dict: "辞典",
  pkg: "パッケージ",
  sky: "FoxSky",
  guard: "まもり",
  net: "回線",
  furry: "Furrysys",
  inari: "Inari",
  atlas: "地図",
  sat: "衛星図",
  crypt: "Foxcrypt",
  qan: "Qan",
  ime: "IME",
};
