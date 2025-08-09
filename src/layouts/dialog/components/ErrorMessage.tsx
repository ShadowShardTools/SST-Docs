import { AlertCircle } from "lucide-react";
import { memo } from "react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = memo(
  ({ message, onRetry }) => (
    <div
      className="flex items-center justify-center p-8"
      role="alert"
      aria-live="polite"
    >
      <div className="text-center max-w-md">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  ),
);

export default ErrorMessage;
