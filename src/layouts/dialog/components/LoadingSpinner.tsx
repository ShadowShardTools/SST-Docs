import { Loader } from "lucide-react";
import { memo } from "react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  colorClass?: string;
  styles?: StyleTheme;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(
  ({ message = "Loading...", size = 5, colorClass, styles }) => {
    const dimension = `${size * 0.25}rem`;
    const toneClass = colorClass || styles?.text.general || "sst-text-general";

    return (
      <div
        className="flex items-center justify-center p-8"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <Loader
            className={`animate-spin ${toneClass}`}
            style={{ width: dimension, height: dimension }}
            aria-hidden="true"
          />
          <span className={styles?.text.general || "sst-text-general"}>
            {message}
          </span>
        </div>
      </div>
    );
  },
);

export default LoadingSpinner;
