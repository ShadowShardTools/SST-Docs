export type MessageBoxType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "neutral"
  | "quote";

export interface MessageBoxData {
  type?: MessageBoxType;
  text?: string;
  showIcon?: boolean;
}
