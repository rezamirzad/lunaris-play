import "./globals.css";
import ConvexClientProvider from "@/app/ConvexClientProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
