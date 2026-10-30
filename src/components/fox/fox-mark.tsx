import { emblemSrc } from "./extra-windows";
import { useFox } from "@/lib/fox/store";

export function FoxMark() {
  const creature = useFox((s) => s.creature);
  const emblemOn = useFox((s) => s.emblemOn);
  if (!emblemOn || creature === "none") return <span className="fox-mark fox-mark-blank" aria-hidden />;
  return <img className="fox-mark" src={emblemSrc(creature)} alt="" />;
}
