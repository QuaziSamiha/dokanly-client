import { getBaseUrl } from "@/config/env.config";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
