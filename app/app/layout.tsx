import type { Metadata } from "next";

import { QueryProvider } from "@/providers/query-provider";
import ToastProvider from "@/providers/toast-provider";
import vazirFont from "./fonts/vazirFont";
import "./globals.css";

export const metadata: Metadata = {
  title: "Publisher",
  description: "Post Publisher ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirFont.className} h-full antialiased`}
    >
      <body className="bg-gray-800 p-4">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
