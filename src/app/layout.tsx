import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { Toaster } from "~/components/ui/toaster";
import { TRPCReactProvider } from "~/trpc/react";
import { Navbar } from "~/components/Menu";
import { ThemeProvider } from "~/components/ui/theme-provider";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Cognimate",
  description:
    "Your all-in-one AI Study Assistant designed to elevate your learning experience!",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative">
            <Navbar />
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
