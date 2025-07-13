export interface MessageBoxData {
  type?: "info" | "warning" | "error" | "success" | "neutral" | "quote";
  text?: string;
  size?: "small" | "medium" | "large";
  showIcon?: boolean;
}
