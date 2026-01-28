import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  XCircle,
} from "lucide-react";
import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import EditableRichText from "./EditableRichText";

interface EditableMessageBoxProps {
  data: any;
  textClass: string;
  onChange: (next: string) => void;
  typeClasses: Record<string, string>;
  styles: StyleTheme;
}

export function EditableMessageBox({
  data,
  textClass,
  onChange,
  typeClasses,
  styles,
}: EditableMessageBoxProps) {
  const type = data?.type ?? "neutral";
  const sizeClasses = "p-4 text-base";
  const typeStyles = {
    info: typeClasses.info,
    warning: typeClasses.warning,
    error: typeClasses.error,
    success: typeClasses.success,
    neutral: typeClasses.neutral,
    quote: typeClasses.quote,
  };
  const typeClass = typeStyles[type as keyof typeof typeStyles] ?? "";
  const showIcon = data?.showIcon ?? true;

  if (type === "quote") {
    return (
      <blockquote className={`pl-4 py-2 mb-4 ${typeStyles.quote ?? ""}`}>
        <EditableRichText
          value={data?.text ?? ""}
          styles={styles}
          className={`outline-none bg-transparent italic leading-relaxed ${textClass}`}
          onChange={onChange}
        />
      </blockquote>
    );
  }

  const icon = (() => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 mr-3 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />;
      case "error":
        return <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />;
      case "success":
        return <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />;
      case "neutral":
      default:
        return type === "neutral" ? (
          <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        ) : null;
    }
  })();

  return (
    <div className="mb-4">
      <div className={`rounded-lg border ${sizeClasses} ${typeClass}`}>
        <div className="flex items-center gap-3">
          {showIcon && icon}
          <div className="flex-1">
            <EditableRichText
              value={data?.text ?? ""}
              styles={styles}
              className={`outline-none bg-transparent ${textClass}`}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
