import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF7F2",
};

export const metadata: Metadata = {
  title: "Salon EyeLines | Haute Beauté & Bridal Sanctuary – Aluthgama, Sri Lanka",
  description: "Experience world-class beauty, precision eyelines, and royal bridal dressing in Aluthgama under the leadership of Nayani Munasinghe. Book your appointment online today.",
  keywords: ["Salon EyeLines", "Salon Aluthgama", "Bridal Dressing Sri Lanka", "Kandyan Bride", "Eyelash Extensions", "Nayani Munasinghe"],
  openGraph: {
    title: "Salon EyeLines | Elegance Redefined – Aluthgama",
    description: "Premier beauty and bridal lounge on the Southern coastline. Over 10,000 happy clients.",
    url: "https://saloneyelines.lk",
    siteName: "Salon EyeLines",
    images: [
      {
        url: "/images/salon_hero.jpg",
        width: 1200,
        height: 630,
        alt: "Salon EyeLines Luxury Ambience",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="/images/salon_eyelines_logo.jpg" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#FAF7F2]">
        <NavigationProgressBar />
        <ScrollProgressBar />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
