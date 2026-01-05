import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Info,
  XCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";

interface EditableMessageBoxProps {
  data: any;
  textClass: string;
  onChange: (next: string) => void;
  typeClasses: Record<string, string>;
}

export function EditableMessageBox({
  data,
  textClass,
  onChange,
  typeClasses,
}: EditableMessageBoxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== (data?.text ?? "")) {
      ref.current.innerText = data?.text ?? "";
    }
  }, [data?.text]);

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
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          className={`outline-none bg-transparent italic leading-relaxed ${textClass}`}
          onInput={(e) => onChange((e.target as HTMLElement).innerText)}
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
            <div
              ref={ref}
              contentEditable
              suppressContentEditableWarning
              className={`outline-none bg-transparent ${textClass}`}
              onInput={(e) => onChange((e.target as HTMLElement).innerText)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
