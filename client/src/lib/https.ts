import axios from "axios";
import { ENV } from "@/lib/env.ts";

export const http = axios.create({
  baseURL: ENV.BASE_URL,
  withCredentials: true,
});

http.interceptors.request.use(async (config) => {
  const token = await cookieStore.get("token");
  if (token) config.headers.Authorization = `Bearer ${token.value}`;
  return config;
});
