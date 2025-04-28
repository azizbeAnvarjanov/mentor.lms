import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import { TeacherProvider } from "../context/TeacherContext";
import SecurityLayer from "@/components/SecurityLayer";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ui/theme-provider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Impuls LMS Palatform",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TeacherProvider>
            {/* <SecurityLayer /> */}
            <Toaster position="top-center" />
            <Navbar />
            <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-20">
              {children}
            </main>
          </TeacherProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
