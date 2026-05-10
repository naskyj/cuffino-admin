import React from "react";

import { AuthLayout } from "./_components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    // <NotificationProvider>
    <AuthLayout>{children}</AuthLayout>
    // </NotificationProvider>
  );
}
