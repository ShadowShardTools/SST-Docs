import type { SupportedLanguage } from "../configs/codeLanguagesConfig.js";

export interface CodeSection {
  language: SupportedLanguage;
  content: string;
  filename?: string;
}

export interface CodeData {
  content?: string;
  name?: string;
  language?: string;
  sections?: CodeSection[];
  maxHeight?: string;
  wrapLines?: boolean;
  defaultCollapsed?: boolean;
}
