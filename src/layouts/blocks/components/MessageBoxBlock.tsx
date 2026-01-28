import React from "react";
import {
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import type { MessageBoxData, StyleTheme } from "@shadow-shard-tools/docs-core";
import { sanitizeRichText } from "../../common/utils/richText";

interface Props {
  index: number;
  styles: StyleTheme;
  messageBoxData: MessageBoxData;
}

export const MessageBoxBlock: React.FC<Props> = ({
  index,
  styles,
  messageBoxData,
}) => {
  const getMessageClasses = () => {
    const baseClasses = `rounded-lg border p-4 text-base`;
    const type = messageBoxData.type ?? "neutral";

    const typeStyles = {
      info: styles.messageBox.info,
      warning: styles.messageBox.warning,
      error: styles.messageBox.error,
      success: styles.messageBox.success,
      neutral: styles.messageBox.neutral,
      quote: styles.messageBox.quote,
    };

    return `${baseClasses} ${typeStyles[type] ?? ""}`;
  };

  const getIcon = () => {
    if (!messageBoxData.showIcon) return null;

    const iconProps = {
      className: "w-5 h-5 mr-3 flex-shrink-0",
    };

    switch (messageBoxData.type) {
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

  if (messageBoxData.type === "quote") {
    return (
      <blockquote
        key={index}
        className={`pl-4 py-2 my-4 ${styles.messageBox.quote}`}
      >
        {messageBoxData.text && (
          <p
            dangerouslySetInnerHTML={{
              __html: sanitizeRichText(messageBoxData.text ?? "", styles),
            }}
          />
        )}
      </blockquote>
    );
  }

  return (
    <div key={index} className="my-4">
      <div className={getMessageClasses()}>
        <div className="flex items-center">
          {getIcon()}
          <div className="flex-1">
            {messageBoxData.text && (
              <div
                className="mb-2 last:mb-0"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(messageBoxData.text ?? "", styles),
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBoxBlock;
