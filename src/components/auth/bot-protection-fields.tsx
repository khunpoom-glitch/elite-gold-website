import { authBotProtectionFieldNames } from "@/lib/auth/validation";

export function AuthBotProtectionFields() {
  return (
    <div aria-hidden="true" className="hidden">
      <label>
        Website
        <input
          autoComplete="off"
          name={authBotProtectionFieldNames.website}
          tabIndex={-1}
          type="text"
        />
      </label>
    </div>
  );
}
