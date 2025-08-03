export type MessageBoxType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "neutral"
  | "quote";
export type MessageBoxSize = "small" | "medium" | "large";
export interface MessageBoxData {
  type?: MessageBoxType;
  text?: string;
  size?: "small" | "medium" | "large";
  showIcon?: boolean;
}
