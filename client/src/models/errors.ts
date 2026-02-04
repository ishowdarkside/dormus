export interface ServerError {
  status: string;
  message: string;
  errors?: Record<string, string>;
}
