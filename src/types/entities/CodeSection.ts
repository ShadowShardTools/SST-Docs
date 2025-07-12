import type { SupportedLanguage } from "../../configs/languages-config";

export interface CodeSection {
  language: SupportedLanguage;
  content: string;
  filename?: string;
}