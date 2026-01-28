import { AlertCircle } from "lucide-react";
import { memo } from "react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  styles?: StyleTheme;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = memo(
  ({ message, onRetry, styles }) => {
    const toneClass = styles?.messageBox.error || "sst-msg-error";
    const buttonClass = styles?.buttons.common || "sst-btn";

    return (
      <div
        className="flex items-center justify-center p-8"
        role="alert"
        aria-live="polite"
      >
        <div
          className={`text-center max-w-md rounded-lg p-4 flex flex-col items-center gap-3 ${toneClass}`}
        >
          <AlertCircle className="w-8 h-8 text-current" aria-hidden="true" />
          <p>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium cursor-pointer ${buttonClass}`}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  },
);

export default ErrorMessage;
