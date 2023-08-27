import router from "@/router";
import { cloneVNode } from "vue";
import { useRoute } from "vue-router";

let fetchMode: RequestMode | undefined;
if (import.meta.env.PROD) {
  fetchMode = "same-origin";
} else {
  fetchMode = "cors";
}

export function sendRequest(
  currentRoute: string,
  path: string,
  method: "get" | "post" | "put" | "delete" = "get",
  body?: any
) {
  return fetch(import.meta.env.VITE_BASE_URL + path, {
    method: method,
    mode: fetchMode,
    credentials: "include",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  }).then((response) => {
    if (response.status === 401 || response.status === 403) {
      router.replace({ path: "/", query: { redirect: currentRoute } });
      throw Error("Fehler: " + response.toString());
    }
    return response;
  });
}
