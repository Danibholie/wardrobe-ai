"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Shirt, Plus, Home as HomeIcon, Menu, X, Sparkles, Calendar } from "lucide-react";
import { SignOutButton } from "@/app/SignOutButton";

export type NavbarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

interface NavbarProps {
  user?: NavbarUser | null;
  onSignOut?: () => Promise<void>;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      label: "Home",
      href: user ? "/home" : "/",
      active: pathname === "/home" || pathname === "/",
    },
    {
      label: "Wardrobe",
      href: "/wardrobe",
      active: pathname === "/wardrobe",
    },
    {
      label: "Plan",
      href: "/plan",
      active: pathname === "/plan",
    },
    {
      label: "Saved",
      href: "/wardrobe/saved",
      active: pathname === "/wardrobe/saved",
    },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(54,69,59,0.04)] border-b border-outline-variant/20">
      <div className="h-16 max-w-5xl mx-auto px-margin-mobile md:px-margin flex items-center justify-between gap-space-md">
        {/* Brand Logo & Name */}
        <Link
          href={user ? "/home" : "/"}
          className="flex items-center gap-space-sm group cursor-pointer"
        >
          <Image
            alt="Wardrobe AI Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida/AEtjO1UP5D9xXg9-RbsyJsRklGTTI6IgxYcU26iq2pBzrBU0C1a1K7MzwKSWX7exJKVKdPCSW90_v3qojIqaGuFLctGorJgeYxpPdDbiePPnRFc2WZKJAFEyoiEejvdwl3gtNFF9oLGX8U5RYuTFTTES-lCYXd4-ttjj7YaHyqh48bxnY56_oO3SJ2rYqXarVWexvI58DmBMoZI54hDRmuur01j6H6hRgZh_o_n5nVK7Iij10AfSDbpfBiZ72lQ"
            width={32}
            height={32}
          />
          <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-medium hidden sm:inline-block">
            Wardrobe AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-space-md">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors py-space-xs px-space-md rounded-lg font-title-md text-title-md ${
                link.active
                  ? "bg-primary-container text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-space-md">
          {user ? (
            <div className="flex items-center gap-space-sm sm:gap-space-md">
              <div className="hidden sm:flex flex-col text-right">
                <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight line-clamp-1">
                  {user.name || "Bolu"}
                </span>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Lagos, Nigeria
                </span>
              </div>
              <div className="relative flex items-center group">
                {user.image ? (
                  <Image
                    alt={user.name || "Profile"}
                    className="w-9 h-9 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-2 ring-primary/20"
                    src={user.image}
                    width={36}
                    height={36}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-semibold shadow-xs">
                    {user.name?.[0]?.toUpperCase() || "B"}
                  </div>
                )}
              </div>
              {/* Sign out form
              <form
                action="/api/auth/signout"
                method="POST"
                className="hidden sm:inline-block"
              >
                <SignOutButton />
              </form> */}
            </div>
          ) : (
            <Link
              href="/signin?callbackUrl=/wardrobe"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-container transition-colors shadow-xs"
            >
              Sign in
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant/20 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                link.active
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {link.label === "Home" && <HomeIcon className="w-4 h-4" />}
              {link.label === "Wardrobe" && <Shirt className="w-4 h-4" />}
              {link.label === "Plan" && <Calendar className="w-4 h-4" />}
              {link.label === "Saved" && <Sparkles className="w-4 h-4" />}
              <span>{link.label}</span>
            </Link>
          ))}

          {user && (
            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                Signed in as{" "}
                <strong className="text-on-surface">
                  {user.name || user.email}
                </strong>
              </span>
              <form action="/api/auth/signout" method="POST">
                <SignOutButton />
              </form>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
