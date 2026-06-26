export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
  redirectTo?: string;
  fieldErrors?: Record<string, string>;
  retryAfterSeconds?: number;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};
