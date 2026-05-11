import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { UserProvider } from "./UserProvider";
import { ThemeProvider } from "./components/ThemeProvider";

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
