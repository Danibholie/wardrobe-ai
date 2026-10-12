"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Shirt,
  Home as HomeIcon,
  Menu,
  X,
  Sparkles,
  Bookmark,
  Calendar,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { SignOutButton } from "@/app/SignOutButton";

export type NavbarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

interface NavbarProps {
  user?: NavbarUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      label: "Home",
      href: user ? "/home" : "/",
      icon: HomeIcon,
      active: pathname === "/home" || (!user && pathname === "/"),
    },
    {
      label: "Wardrobe",
      href: "/wardrobe",
      icon: Shirt,
      active: pathname === "/wardrobe" || pathname.startsWith("/wardrobe/add"),
    },
    {
      label: "Plan",
      href: "/plan",
      icon: Sparkles,
      active: pathname === "/plan",
    },
    {
      label: "Saved",
      href: "/wardrobe/saved",
      icon: Bookmark,
      active: pathname === "/wardrobe/saved",
    },
  ];

  return (
    <>
      {/* ============================================================== */}
      {/* TOP FIXED NAVIGATION HEADER                                    */}
      {/* ============================================================== */}
      <header className="fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(54,69,59,0.04)] border-b border-outline-variant/20">
        <div className="h-16 max-w-5xl mx-auto px-margin-mobile md:px-margin flex items-center justify-between gap-space-md">
          {/* Brand Logo & Title */}
          <Link
            href={user ? "/home" : "/"}
            className="flex items-center gap-space-sm group cursor-pointer shrink-0"
          >
            <Image
              alt="Wardrobe AI Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1UP5D9xXg9-RbsyJsRklGTTI6IgxYcU26iq2pBzrBU0C1a1K7MzwKSWX7exJKVKdPCSW90_v3qojIqaGuFLctGorJgeYxpPdDbiePPnRFc2WZKJAFEyoiEejvdwl3gtNFF9oLGX8U5RYuTFTTES-lCYXd4-ttjj7YaHyqh48bxnY56_oO3SJ2rYqXarVWexvI58DmBMoZI54hDRmuur01j6H6hRgZh_o_n5nVK7Iij10AfSDbpfBiZ72lQ"
              width={32}
              height={32}
              priority
            />
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-medium hidden xs:inline-block sm:inline-block">
              Wardrobe AI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-space-md">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-space-xs px-space-md rounded-lg font-title-md text-title-md ${
                  link.active
                    ? "bg-primary-container text-on-primary shadow-xs font-semibold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-normal"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Profile Info & Sign Out CTA */}
          <div className="flex items-center gap-space-sm sm:gap-space-md">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight line-clamp-1 max-w-[140px]">
                    {user.name || "Bolu"}
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Lagos, Nigeria
                  </span>
                </div>

                {/* Avatar with dropdown trigger */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="relative flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  title="Account menu"
                  aria-label="Account menu"
                >
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
                </button>

                {/* Mobile menu hamburger button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                  aria-label="Toggle user menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            ) : (
              <Link
                href="/signin?callbackUrl=/wardrobe"
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors shadow-xs"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Top Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-t border-outline-variant/20 px-4 py-3 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
            {user && (
              <div className="pb-2.5 mb-2 border-b border-outline-variant/15 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center text-base font-semibold">
                  {user.name?.[0]?.toUpperCase() || "B"}
                </div>
                <div>
                  <p className="font-title-md text-title-md text-on-surface font-semibold leading-snug">
                    {user.name || "Bolu"}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      link.active
                        ? "bg-primary text-on-primary font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {user && (
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">
                  Location: <strong className="text-on-surface font-medium">Lagos, NG</strong>
                </span>
                <form action="/api/auth/signout" method="POST">
                  <SignOutButton />
                </form>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* MOBILE PERSISTENT BOTTOM NAVIGATION BAR (md:hidden)            */}
      {/* Matches Editorial App Standard from User Templates             */}
      {/* ============================================================== */}
      {user && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(54,69,59,0.06)] border-t border-outline-variant/20 flex items-center justify-around h-16 px-gutter-mobile"
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isPlan = link.label === "Plan";

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  link.active
                    ? "text-primary font-title-md font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                  {isPlan && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-secondary" />
                  )}
                </div>
                <span className="font-label-caps text-label-caps mt-1">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
