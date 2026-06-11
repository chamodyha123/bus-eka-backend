import { AuthProvider } from "@/context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}