import { Loader } from "lucide-react";
import { memo } from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  colorClass?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(
  ({ message = "Loading...", size = 5, colorClass = "text-blue-500" }) => (
    <div
      className="flex items-center justify-center p-8"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <Loader
          className={`w-${size} h-${size} animate-spin ${colorClass}`}
          aria-hidden="true"
        />
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  ),
);

export default LoadingSpinner;
