declare module "pdf-parse" {
  export type VerbosityLevel = number;

  export interface LoadParameters {
    data?: Uint8Array | Buffer | number[];
    url?: string;
    path?: string;
    password?: string;
    verbosity?: VerbosityLevel;
    [key: string]: unknown;
  }

  export interface TextResultPage {
    text: string;
    num: number;
  }

  export interface TextResult {
    text: string;
    pages: TextResultPage[];
    total: number;
  }

  export interface GetTextParams {
    first?: number;
    last?: number;
    partial?: number[];
    pageJoiner?: string;
    includeMarkedContent?: boolean;
    [key: string]: unknown;
  }

  export class PDFParse {
    constructor(options: LoadParameters);
    destroy(): Promise<void>;
    getInfo(params?: Record<string, unknown>): Promise<unknown>;
    getText(params?: GetTextParams): Promise<TextResult>;
    load(): Promise<unknown>;
  }
}
