import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "@/app/globals.scss";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cofrinho da Ana",
  description: "Relação de Operações e Gastos da Ana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} h-full antialiased`}
    >
      <body className="flex flex-col min-h-full">{children}</body>
    </html>
  );
}
