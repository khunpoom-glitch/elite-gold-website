export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
  redirectTo?: string;
  fieldErrors?: Record<string, string>;
};

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};
