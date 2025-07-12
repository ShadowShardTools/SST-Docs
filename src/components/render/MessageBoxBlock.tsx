import React from "react";
import {
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import type { StyleTheme } from "../../siteConfig";

const MessageBoxBlock: React.FC<{
  index: number;
  styles: StyleTheme;
  content?: string;
  messageType?: "info" | "warning" | "error" | "success" | "neutral" | "quote";
  messageSize?: "small" | "medium" | "large";
  showIcon?: boolean;
}> = ({
  index,
  styles,
  content,
  messageType = "info",
  messageSize = "medium",
  showIcon = true,
}) => {
  const getSizeClasses = () => {
    switch (messageSize) {
      case "small":
        return "p-3 text-sm";
      case "medium":
        return "p-4 text-base";
      case "large":
        return "p-6 text-lg";
      default:
        return "p-4 text-base";
    }
  };

  const getMessageClasses = () => {
    const baseClasses = `rounded-lg border ${getSizeClasses()}`;
    const typeStyles = {
      info: styles.components.messageInfo,
      warning: styles.components.messageWarning,
      error: styles.components.messageError,
      success: styles.components.messageSuccess,
      neutral: styles.components.messageNeutral,
      quote: styles.components.messageQuote,
    };
    return `${baseClasses} ${typeStyles[messageType] ?? ""}`;
  };

  const getIcon = () => {
    if (!showIcon) return null;

    const iconProps = {
      className: "w-5 h-5 mr-3 flex-shrink-0",
    };

    switch (messageType) {
      case "info":
        return <Info {...iconProps} />;
      case "warning":
        return <AlertTriangle {...iconProps} />;
      case "error":
        return <XCircle {...iconProps} />;
      case "success":
        return <CheckCircle {...iconProps} />;
      case "neutral":
        return <HelpCircle {...iconProps} />;
      default:
        return null;
    }
  };

  if (messageType === "quote") {
    return (
      <blockquote
        key={index}
        className={`pl-4 py-2 mb-4 ${styles.components.messageQuote}`}
      >
        {content && <p>{content}</p>}
      </blockquote>
    );
  }

  return (
    <div key={index} className="my-4">
      <div className={getMessageClasses()}>
        <div className="flex items-center">
          {getIcon()}
          <div className="flex-1">
            {content && <div className="mb-2 last:mb-0">{content}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBoxBlock;
