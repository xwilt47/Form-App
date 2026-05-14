export type InputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "url"
  | "tel"
  | "date"
  | "textarea";

export interface InputConfig {
  name: string;
  type: InputType;
  limit: number;
  required?: boolean;
  placeholder?: string;
}

export interface PageConfig {
  pageTitle: string;
  inputs: InputConfig[];
}

export interface FormConfig {
  formTitle: string;
  pages: PageConfig[];
}

