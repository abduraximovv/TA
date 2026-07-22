"use client";

import React from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Plane, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white text-dark-graphite pt-16 pb-0 border-t border-gray-100">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Plane className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-dark-forest leading-tight tracking-tight">Travelora</span>
                <span className="text-[10px] text-gray-500 font-medium">Explore More. Worry Less.</span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
              Your trusted travel partner for unforgettable journeys. We provide the best packages, flights, and hotels worldwide.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={Instagram} />
              <SocialLink href="#" icon={Facebook} />
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href="#" icon={Youtube} />
            </div>
          </div>

          {/* Links Cols */}
          <div>
            <h4 className="font-bold text-sm text-dark-graphite mb-6">Company</h4>
            <ul className="space-y-3">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Press</FooterLink>
              <FooterLink href="#">Contact Us</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-dark-graphite mb-6">Support</h4>
            <ul className="space-y-3">
              <FooterLink href="#">FAQs</FooterLink>
              <FooterLink href="#">Booking Help</FooterLink>
              <FooterLink href="#">Returns</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms & Conditions</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-dark-graphite mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <span className="text-sm text-gray-500">+1 (800) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <span className="text-sm text-gray-500">info@travelora.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <span className="text-sm text-gray-500">123 Travelora Street,<br/>New York, USA</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-dark-forest py-6">
        <div className="section-container flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-xs font-medium">
            © {new Date().getFullYear()} Travelora. All rights reserved.
          </p>
          <div className="flex gap-2 text-white/50 text-xs">
            {/* Mock payment icons */}
            <div className="bg-white/10 px-3 py-1 rounded text-[10px] font-bold">VISA</div>
            <div className="bg-white/10 px-3 py-1 rounded text-[10px] font-bold">Mastercard</div>
            <div className="bg-white/10 px-3 py-1 rounded text-[10px] font-bold">PayPal</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-primary transition-colors"
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-gray-500 text-sm hover:text-primary transition-colors font-medium"
      >
        {children}
      </Link>
    </li>
  );
}
