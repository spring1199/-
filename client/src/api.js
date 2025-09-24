import axios from "axios";

const envBase = import.meta.env.VITE_API_URL?.trim();
const normalizedEnvBase = envBase ? envBase.replace(/\/+$/, "") : undefined;

const fallbackBase = import.meta.env.DEV
  ? "http://localhost:4000/api"
  : (() => {
      if (typeof window !== "undefined" && window.location?.origin) {
        return `${window.location.origin.replace(/\/+$/, "")}/api`;
      }
      return "/api";
    })();

export const api = axios.create({
  baseURL: normalizedEnvBase ?? fallbackBase,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};
