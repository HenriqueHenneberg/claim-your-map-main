import type { CSSProperties } from "react";
import type { OwnMapTerritory } from "@/lib/ownmap-data";

const fallbackByType = {
  country: "radial-gradient(circle at 25% 20%, rgba(214,168,58,.24), transparent 34%), linear-gradient(135deg, #071017 0%, #111827 52%, #0f172a 100%)",
  state: "radial-gradient(circle at 20% 24%, rgba(34,197,94,.18), transparent 32%), linear-gradient(135deg, #071017 0%, #10201d 48%, #0d1722 100%)",
  city: "radial-gradient(circle at 70% 20%, rgba(96,165,250,.18), transparent 34%), linear-gradient(135deg, #071017 0%, #111827 45%, #15110a 100%)",
};

export function territoryVisualStyle(territory: OwnMapTerritory, explicitUrl?: string): CSSProperties {
  const accent = territory.owner?.accent ?? "#d4a736";
  const url = explicitUrl || territory.bannerUrl;

  if (url) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(2,6,23,.08), rgba(2,6,23,.74)), url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  return {
    backgroundImage: `linear-gradient(135deg, ${accent}26, transparent 34%), ${fallbackByType[territory.type]}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
