export type DiagnosticLevel = "info" | "warn" | "error";

export interface DataDiagnostic {
  code?: string;
  level: DiagnosticLevel;
  message: string;
  context?: Record<string, unknown>;
}
