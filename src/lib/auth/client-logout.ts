export async function clearClientAuthSession() {
  const response = await fetch("/auth/logout", {
    cache: "no-store",
    credentials: "include",
    headers: {
      "x-elite-logout": "fetch",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Logout failed with status ${response.status}`);
  }
}

export function waitForLogoutFeedback(delayMs = 360) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}
