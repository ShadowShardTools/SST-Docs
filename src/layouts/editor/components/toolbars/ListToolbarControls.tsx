import type { Content, StyleTheme } from "@shadow-shard-tools/docs-core";
import { ChartNoAxesGantt, List, ListOrdered } from "lucide-react";
import AlignmentToggleButton from "./AlignmentToggleButton";
import Button from "../../../common/components/Button";
import NumericInput from "../../../common/components/NumericInput";

interface Props {
  data: any;
  onChange: (updater: (prev: Content) => Content) => void;
  styles: StyleTheme;
}

export function ListToolbarControls({ data, onChange, styles }: Props) {
  const listType = data.type ?? "ul";
  const nextType = listType === "ul" ? "ol" : "ul";
  const FormatIcon = listType === "ul" ? List : ListOrdered;
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
              listData: { ...(prev as any).listData, type: nextType },
            }))
          }
          title={listType === "ul" ? "Format: Bullets" : "Format: Numbers"}
          aria-label={listType === "ul" ? "Format: Bullets" : "Format: Numbers"}
        >
          <FormatIcon className="w-5 h-5" />
        </Button>
      </div>

      <AlignmentToggleButton
        styles={styles}
        value={(data.alignment ?? "left") as "left" | "center" | "right"}
        onChange={(val) =>
          onChange((prev) => ({
            ...prev,
            listData: {
              ...(prev as any).listData,
              alignment: val,
            },
          }))
        }
      />

      <Button
        type="button"
        className="inline-flex items-center justify-center w-8 h-8"
        styles={styles}
        variant={(data.inside ?? false) ? "tabActive" : "tab"}
        onClick={() =>
          onChange((prev) => ({
            ...prev,
            listData: {
              ...(prev as any).listData,
              inside: !(data.inside ?? false),
            },
          }))
        }
        aria-pressed={data.inside ?? false}
        title={(data.inside ?? false) ? "Inside: On" : "Inside: Off"}
        aria-label={(data.inside ?? false) ? "Inside: On" : "Inside: Off"}
      >
        <ChartNoAxesGantt className="w-5 h-5" />
      </Button>
      {listType === "ol" && (
        <label className="flex items-center gap-1">
          <span>Start</span>
          <NumericInput
            min={1}
            className={`${styles.input} px-2 py-1 w-14`}
            value={data.startNumber}
            onChange={(nextValue) =>
              onChange((prev) => ({
                ...prev,
                listData: {
                  ...(prev as any).listData,
                  startNumber: nextValue,
                },
              }))
            }
          />
        </label>
      )}
      <label className="flex items-center gap-1">
        <span>Aria</span>
        <input
          type="text"
          className={`${styles.input} px-2 py-1`}
          value={data.ariaLabel ?? ""}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              listData: {
                ...(prev as any).listData,
                ariaLabel: e.target.value,
              },
            }))
          }
        />
      </label>
    </>
  );
}

export default ListToolbarControls;
