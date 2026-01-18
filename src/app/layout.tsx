import "./globals.css";

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import React from "react";

import ToastProvider from "@/components/ToastProvider";
import ReduxStoreProvider from "@/context/ReduxStoreProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cuffino Admin",
  description: "Cuffino Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <ReduxStoreProvider>
          {children}
          <ToastProvider />
        </ReduxStoreProvider>
      </body>
    </html>
  );
}
