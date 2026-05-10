import * as ocr from "./tools/ocr";

export type AgentRequest = {
  filePath: string;
  metadata?: Record<string, unknown>;
};

export type ExtractedDocument = {
  provider: "openai" | "claude";
  summary: string;
  fields: Record<string, unknown>;
};

export type AgentResponse = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  errors?: string[];
};

export type AgentTools = {
  ocr: typeof ocr;
};
