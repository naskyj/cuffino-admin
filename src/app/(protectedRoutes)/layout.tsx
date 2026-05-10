import React from "react";

// import { NotificationProvider } from "@/components/NotificationProvider";
import { View } from "./_components";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    // <NotificationProvider>
    <View>{children}</View>
    // </NotificationProvider>
  );
}
