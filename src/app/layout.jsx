import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

export const metadata = {
  title: {
    default: "PathMe | AI & Programming Education for What's Next",
    template: "%s | PathMe",
  },
  description:
    "Practical, interactive learning pathways for school students to master technology, coding, science, and future-ready skills.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
