let fetchMode: RequestMode | undefined;
if (import.meta.env.PROD) {
  fetchMode = "same-origin";
} else {
  fetchMode = "cors";
}

export function sendRequest(
  path: string,
  method: "get" | "post" = "get",
  body?: any
) {
  return fetch(import.meta.env.VITE_BASE_URL + path, {
    method: method,
    mode: fetchMode,
    credentials: "include",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
