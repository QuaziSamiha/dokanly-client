import AdminNavbar from "@/components/layout/topbar/AdminNavbar";
import AdminSidebar from "@/components/layout/sidebar/AdminSidebar";
import { Metadata } from "next";
import { plusJakarta } from "@/lib/fonts";
import React, { ReactNode } from "react";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard of Natura Care Limited",
  description: "An e-commerce site of Bangladesh.",
};

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className={`${plusJakarta.className} antialiased`}>
      <div className="flex flex-col min-h-screen">
        <div className="top-0 fixed w-full z-[9999] bg-white">
          <AdminNavbar />
        </div>
        <div className="flex bg-backgroundPrimary mt-20 min-h-screen">
          <div className="max-lg:hidden">
            <AdminSidebar />
          </div>
          {/* min-w-0 + overflow-x-clip keep wide content from widening the page
              without making <main> a scroll container (that broke sticky headers). */}
          <main className="lg:ml-64 flex-1 min-w-0 overflow-x-clip max-lg:p-6 lg:pr-6 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
