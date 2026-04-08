import axios from "axios";
import { ENV } from "@/config/env";

const apiClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 60000
});
export default apiClient
