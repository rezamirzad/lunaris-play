import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { UserProvider } from "./UserProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        <ConvexClientProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
