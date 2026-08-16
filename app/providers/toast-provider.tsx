"use client";
import { AppToastProvider } from "@/components/app-toast";
import React from "react";

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AppToastProvider />
    </>
  );
}
