import axios from "axios";
import { appToast } from "@/components/app-toast";
import { Constants } from "./constants";

export const axiosInstance = axios.create({
  baseURL: Constants.BASE_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 500) {
      appToast.error(message || "خطایی در سرور رخ داده است.");
    }

    return Promise.reject(error);
  },
);
