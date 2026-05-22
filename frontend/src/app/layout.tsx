import { Metadata, Viewport } from "next";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { UserProvider } from "./UserProvider";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "LUNARIS | High-Fidelity Arcade Hub",
  description: "A premium real-time multiplayer arcade experience.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#020203",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
