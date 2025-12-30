import type { Content } from "@shadow-shard-tools/docs-core";

type ChartBlock = Extract<Content, { type: "chart" }>;

interface Props {
  block: ChartBlock;
  onChange: (updated: ChartBlock) => void;
}

export function ChartBlockForm({ block, onChange }: Props) {
  const data = block.chartData ?? {};
  const labels = data.labels ?? [];
  const datasets = data.datasets ?? [{ label: "Series 1", data: [1, 2, 3] }];

  const updateField = (patch: Partial<ChartBlock["chartData"]>) => {
    onChange({ ...block, chartData: { ...data, ...patch } });
  };

  const updateDatasets = (next: typeof datasets) => {
    onChange({ ...block, chartData: { ...data, datasets: next } });
  };

  const colorInputValue = (color: unknown, fallback: string) => {
    if (typeof color !== "string" || color.length === 0) return fallback;
    if (color.startsWith("#")) return color;
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch;
      const toHex = (v: string) => {
        const n = Math.max(0, Math.min(255, Number(v) || 0));
        return n.toString(16).padStart(2, "0");
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    return fallback;
  };

  const applyAlpha = (
    baseColor: unknown,
    alpha: number,
    fallback: string,
  ): string => {
    if (typeof baseColor !== "string" || baseColor.length === 0) {
      return fallback;
    }
    const clamp = Math.max(0, Math.min(1, alpha));
    const hexMatch = baseColor.startsWith("#")
      ? baseColor.replace("#", "")
      : null;
    if (hexMatch && (hexMatch.length === 6 || hexMatch.length === 3)) {
      const hex =
        hexMatch.length === 3
          ? hexMatch
              .split("")
              .map((c) => c + c)
              .join("")
          : hexMatch;
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${clamp})`;
    }
    const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch;
      return `rgba(${r}, ${g}, ${b}, ${clamp})`;
    }
    return typeof baseColor === "string" ? baseColor : fallback;
  };

  const currentAlpha = (color: unknown) => {
    if (typeof color !== "string" || color.length === 0) return 1;
    const match = color.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/i);
    if (match) {
      const n = Number(match[1]);
      if (!Number.isNaN(n)) return Math.max(0, Math.min(1, n));
    }
    return 1;
  };

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>Chart type</span>
          <select
            className="border rounded px-2 py-1"
            value={data.type ?? "bar"}
            onChange={(e) => updateField({ type: e.target.value })}
          >
            {["bar", "line", "pie", "doughnut", "radar", "polarArea"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Title</span>
          <input
            className="border rounded px-2 py-1"
            value={data.title ?? ""}
            onChange={(e) => updateField({ title: e.target.value })}
            placeholder="Optional chart title"
          />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>Labels (comma separated)</span>
          <input
            className="border rounded px-2 py-1"
            value={labels.join(",")}
            onChange={(e) =>
              updateField({
                labels: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="e.g. Jan,Feb,Mar"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span>Alignment</span>
            <select
              className="border rounded px-2 py-1"
              value={data.alignment ?? "center"}
              onChange={(e) =>
                updateField({ alignment: e.target.value as typeof data.alignment })
              }
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>Scale</span>
            <input
              className="border rounded px-2 py-1"
              type="number"
              step="0.1"
              min="0.2"
              value={data.scale ?? 1}
              onChange={(e) => updateField({ scale: Number(e.target.value) || 1 })}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Datasets</p>
          <button
            type="button"
            className="px-2 py-1 text-xs border rounded"
            onClick={() =>
              updateDatasets([
                ...datasets,
                { label: `Series ${datasets.length + 1}`, data: [1, 1, 1] },
              ])
            }
          >
            + Add dataset
          </button>
        </div>
        {datasets.map((ds, idx) => (
          <div
            key={idx}
            className="border rounded p-3 space-y-2 bg-slate-50 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dataset {idx + 1}</span>
              {datasets.length > 1 && (
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() =>
                    updateDatasets(datasets.filter((_, i) => i !== idx))
                  }
                >
                  Remove
                </button>
              )}
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span>Label</span>
              <input
                className="border rounded px-2 py-1"
                value={ds.label ?? ""}
                onChange={(e) => {
                  const next = datasets.map((d, i) =>
                    i === idx ? { ...d, label: e.target.value } : d,
                  );
                  updateDatasets(next);
                }}
                placeholder="Series name"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Data (comma separated numbers)</span>
              <input
                className="border rounded px-2 py-1"
                value={(ds.data ?? []).join(",")}
                onChange={(e) => {
                  const values = e.target.value
                    .split(",")
                    .map((s) => Number(s.trim()))
                    .filter((n) => !Number.isNaN(n));
                  const next = datasets.map((d, i) =>
                    i === idx ? { ...d, data: values } : d,
                  );
                  updateDatasets(next);
                }}
                placeholder="e.g. 1,2,3"
              />
            </label>
            <div className="grid md:grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-sm">
                <span>Background color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-9 border rounded"
                    value={colorInputValue(ds.backgroundColor, "#3b82f6")}
                    onChange={(e) => {
                      const next = datasets.map((d, i) =>
                        i === idx ? { ...d, backgroundColor: e.target.value } : d,
                      );
                      updateDatasets(next);
                    }}
                  />
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    value={ds.backgroundColor ?? "#3b82f6"}
                    onChange={(e) => {
                      const next = datasets.map((d, i) =>
                        i === idx ? { ...d, backgroundColor: e.target.value } : d,
                      );
                      updateDatasets(next);
                    }}
                    placeholder="#3b82f6 or rgba(...)"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    className="border rounded px-2 py-1 w-20 text-xs"
                    title="Alpha"
                    value={currentAlpha(ds.backgroundColor)}
                  onChange={(e) => {
                    const alpha = Number(e.target.value);
                    const base = ds.backgroundColor ?? "#3b82f6";
                    const nextColor = applyAlpha(base, alpha, "#3b82f6");
                    const next = datasets.map((d, i) =>
                      i === idx ? { ...d, backgroundColor: nextColor } : d,
                    );
                    updateDatasets(next);
                  }}
                  />
                </div>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span>Border color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="w-10 h-9 border rounded"
                    value={colorInputValue(ds.borderColor, "#1d4ed8")}
                    onChange={(e) => {
                      const next = datasets.map((d, i) =>
                        i === idx ? { ...d, borderColor: e.target.value } : d,
                      );
                      updateDatasets(next);
                    }}
                  />
                  <input
                    className="border rounded px-2 py-1 flex-1"
                    value={ds.borderColor ?? "#1d4ed8"}
                    onChange={(e) => {
                      const next = datasets.map((d, i) =>
                        i === idx ? { ...d, borderColor: e.target.value } : d,
                      );
                      updateDatasets(next);
                    }}
                    placeholder="#1d4ed8 or rgba(...)"
                  />
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    className="border rounded px-2 py-1 w-20 text-xs"
                    title="Alpha"
                    value={currentAlpha(ds.borderColor)}
                  onChange={(e) => {
                    const alpha = Number(e.target.value);
                    const base = ds.borderColor ?? "#1d4ed8";
                    const nextColor = applyAlpha(base, alpha, "#1d4ed8");
                    const next = datasets.map((d, i) =>
                      i === idx ? { ...d, borderColor: nextColor } : d,
                    );
                    updateDatasets(next);
                  }}
                  />
                </div>
              </label>
            </div>
          </div>
        ))}
        {datasets.length === 0 && (
          <p className="text-sm text-slate-500">No datasets yet. Add one to start.</p>
        )}
      </div>
    </div>
  );
}

export default ChartBlockForm;
