import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import { Heading1, Heading2, Heading3, Link2, Link2Off } from "lucide-react";
import AlignmentToggleButton from "./AlignmentToggleButton";
import Button from "../../../common/components/Button";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function TitleToolbarControls({ data, onChange, styles }: Props) {
  const level = Number(data.level ?? 2);
  const nextLevel = level >= 3 ? 1 : level + 1;
  const LevelIcon = level === 1 ? Heading1 : level === 2 ? Heading2 : Heading3;
  const anchorEnabled = !!data.enableAnchorLink;
  const AnchorIcon = anchorEnabled ? Link2 : Link2Off;

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          className="inline-flex items-center justify-center w-8 h-8"
          styles={styles}
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              titleData: {
                ...(prev as any).titleData,
                level: nextLevel,
              },
            }))
          }
          title={`Heading ${level}`}
          aria-label={`Heading ${level}`}
        >
          <LevelIcon className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <AlignmentToggleButton
          styles={styles}
          value={(data.alignment ?? "left") as "left" | "center" | "right"}
          onChange={(val) =>
            onChange((prev) => ({
              ...prev,
              titleData: {
                ...(prev as any).titleData,
                alignment: val,
              },
            }))
          }
        />
      </div>
      <Button
        type="button"
        className="inline-flex items-center justify-center w-8 h-8"
        styles={styles}
        variant={anchorEnabled ? "tabActive" : "tab"}
        onClick={() =>
          onChange((prev) => ({
            ...prev,
            titleData: {
              ...(prev as any).titleData,
              enableAnchorLink: !anchorEnabled,
            },
          }))
        }
        title={anchorEnabled ? "Anchor link: On" : "Anchor link: Off"}
        aria-label={anchorEnabled ? "Anchor link: On" : "Anchor link: Off"}
      >
        <AnchorIcon className="w-5 h-5" />
      </Button>
    </>
  );
}

export default TitleToolbarControls;
