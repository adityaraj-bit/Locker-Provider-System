import "./globals.css";
import ReactQueryProvider from "@/providers/react-query-provider";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

import { ThemeProvider } from "@/providers/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              <Toaster position="top-right" />
              {children}
            </ReactQueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}