"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import AdminSidebar from "../sidebar/AdminSidebar";
import CustomNavDropdown from "@/components/primitives/CustomNavDropdown";

export default function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-border">
      <div className="px-6 lg:px-12">
        <div className="flex items-center justify-between h-20 py-4">
          {/* ===== LOGO ======= */}
          <Link href={"/"}>
            <Image
              src="/images/brand/logo.png"
              alt="Natura Logo"
              height={50}
              width={129}
            />
          </Link>

          <div className="flex items-center space-x-4">
            {/* ============= NOTIFICATION AND PROFILE ============== */}
            {/* <Link href="/" className="relative">
              <PiBell className="w-5 h-5" />
              <span className="absolute -top-4 -right-3 bg-destructive-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Link> */}
            {/* ============ LOGIN ========== */}
            <CustomNavDropdown />

            {/* ========== Mobile Menu Button ========== */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
      </div>
      {isMenuOpen && <AdminSidebar />}
    </nav>
  );
}
