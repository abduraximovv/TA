"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Heart, Menu, X, Plane, ShieldCheck, HeadphonesIcon, Map } from "lucide-react";
import { useAuth } from "@repo/auth";
import { AuthModal } from "@/components/auth/AuthModal";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/discover" },
  { label: "Packages", href: "/packages" },
  { label: "Hotels", href: "/hotels" },
  { label: "Flights", href: "/flights" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        {/* Top Bar - Only visible on desktop when not scrolled down far */}
        <div className={`hidden lg:block bg-primary text-white text-[13px] font-medium transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden' : 'h-10'}`}>
          <div className="section-container h-full flex items-center justify-center gap-10">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              <span>Free cancellation</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Best price guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure booking</span>
            </div>
            <div className="flex items-center gap-2">
              <HeadphonesIcon className="w-4 h-4" />
              <span>24/7 Customer support</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="bg-white shadow-sm h-[72px]">
          <div className="section-container h-full flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Plane className="w-6 h-6 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-dark-forest leading-tight tracking-tight">Travelora</span>
                <span className="text-[10px] text-gray-500 font-medium">Explore More. Worry Less.</span>
              </div>
            </Link>

            {/* Center Navigation */}
            <nav className="hidden xl:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] font-semibold transition-all duration-300 relative group text-dark-graphite hover:text-primary ${pathname === link.href ? "text-primary" : ""}`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full transition-all duration-300 ${
                      pathname === link.href ? "w-full bg-primary" : "w-0 group-hover:w-full bg-primary"
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Right Utilities (Icons moved from bottom nav) */}
            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/map" className="text-dark-graphite hover:text-primary transition-colors">
                <Map className="w-5 h-5" />
              </Link>
              
              <button className="text-dark-graphite hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
              
              <button className="text-dark-graphite hover:text-primary transition-colors">
                <Heart className="w-5 h-5" />
              </button>

              {!isLoading && (
                <>
                  {user ? (
                    <Link
                      href="/profile"
                      className="text-dark-graphite hover:text-primary transition-colors"
                    >
                      <User className="w-5 h-5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="text-dark-graphite hover:text-primary transition-colors"
                    >
                      <User className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}

              <Link
                href="/discover"
                className="hidden sm:inline-flex bg-primary text-white hover:bg-primary-dark rounded-full text-sm font-semibold px-6 py-2.5 items-center gap-2 transition-colors"
              >
                <Plane className="w-4 h-4" />
                Book Now
              </Link>
              
              <button className="xl:hidden text-dark-graphite hover:text-primary transition-colors ml-2">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-[72px]' : 'h-[112px]'}`} />

      <AuthModal isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
}
