"use client";

import vazirFont from "@/app/fonts/vazirFont";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { ToastContainer, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastType = "success" | "error" | "warning" | "info";

type AppToastProps = {
  type: ToastType;
  message: string;
  closeToast?: () => void;
};

const config = {
  success: {
    icon: CheckCircleIcon,
    iconColor: "text-green-500",
    borderColor: "border-green-500",
  },

  error: {
    icon: ExclamationCircleIcon,
    iconColor: "text-red-500",
    borderColor: "border-red-500",
  },

  warning: {
    icon: ExclamationTriangleIcon,
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-500",
  },

  info: {
    icon: InformationCircleIcon,
    iconColor: "text-blue-500",
    borderColor: "border-blue-500",
  },
};

export function AppToast({ type, message, closeToast }: AppToastProps) {
  const { icon: Icon, iconColor, borderColor } = config[type];

  return (
    <div
      dir="rtl"
      className={`${vazirFont.className} bg-gray-200 flex w-full items-center gap-3 rounded-2xl border-r-4 ${borderColor} bg-white p-4 shadow-lg`}
    >
      <Icon className={`size-6 shrink-0 ${iconColor}`} />

      <span className="flex-1 text-sm font-medium text-gray-800">
        {message}
      </span>

      <button
        type="button"
        onClick={closeToast}
        className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
      >
        <XMarkIcon className="size-5" />
      </button>
    </div>
  );
}

const showToast = (
  type: ToastType,
  message: string,
  options?: ToastOptions,
) => {
  toast(
    ({ closeToast }) => (
      <AppToast type={type} message={message} closeToast={closeToast} />
    ),
    {
      className: "!bg-transparent !p-0 !shadow-none",
      ...options,
      position: "top-left",
    },
  );
};

export const appToast = {
  success: (message: string, options?: ToastOptions) =>
    showToast("success", message, options),

  error: (message: string, options?: ToastOptions) =>
    showToast("error", message, options),

  warning: (message: string, options?: ToastOptions) =>
    showToast("warning", message, options),

  info: (message: string, options?: ToastOptions) =>
    showToast("info", message, options),
};

export function AppToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar
      closeButton={false}
      newestOnTop
      rtl
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="!bg-transparent !p-0 !shadow-none"
    />
  );
}
