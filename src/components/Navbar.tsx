"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Shirt,
  Home as HomeIcon,
  Menu,
  X,
  Sparkles,
  Bookmark,
  MapPin,
  CloudSun,
  ChevronDown,
} from "lucide-react";
import { SignOutButton } from "@/app/SignOutButton";
import { useLocationWeather } from "@/hooks/useLocationWeather";

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
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  const {
    fullLocation,
    shortLocation,
    weatherShort,
    isLoading: weatherLoading,
  } = useLocationWeather();

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(event.target as Node)
      ) {
        setDesktopMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopMenuOpen(false);
  }, [pathname]);

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
              className="h-16 w-auto"
              src="/wardrobe-ai-logo.webp"
              width={500}
              height={500}
              priority
            />
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
                {/* Desktop User Info & Auto-Detected Location */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight line-clamp-1 max-w-[140px]">
                    {user.name || "Bolu"}
                  </span>
                  <div className="flex items-center justify-end gap-1 font-label-caps text-label-caps text-on-surface-variant tracking-wider">
                    <MapPin className="w-2.5 h-2.5 text-secondary shrink-0" />
                    <span className="truncate max-w-[120px]">
                      {weatherLoading ? "Detecting..." : shortLocation}
                    </span>
                    {!weatherLoading && weatherShort && (
                      <>
                        <span className="text-outline-variant">·</span>
                        <span className="text-primary font-medium truncate max-w-[90px]">
                          {weatherShort}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Desktop Sign Out Button (Visible on md+ screens) */}
                {/* <div className="hidden md:flex items-center">
                  <SignOutButton
                    variant="desktop"
                    label="Sign out"
                    className="text-xs"
                  />
                </div> */}

                {/* Avatar with dropdown trigger (Desktop + Mobile) */}
                <div className="relative" ref={desktopMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopMenuOpen(!desktopMenuOpen);
                      setMobileMenuOpen(!mobileMenuOpen);
                    }}
                    className="relative flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
                    title="Account menu"
                    aria-label="Account menu"
                    aria-expanded={desktopMenuOpen || mobileMenuOpen}
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
                    <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant hidden md:block" />
                  </button>

                  {/* Desktop Dropdown Popover */}
                  {desktopMenuOpen && (
                    <div className="hidden md:block absolute right-0 top-full mt-2 w-64 bg-surface rounded-2xl shadow-xl border border-outline-variant/30 py-3 px-3 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                      {/* User Header */}
                      <div className="pb-2.5 mb-2 border-b border-outline-variant/20 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center text-base font-semibold shrink-0">
                          {user.name?.[0]?.toUpperCase() || "B"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-title-md text-title-md text-on-surface font-semibold truncate leading-tight">
                            {user.name || "Bolu"}
                          </p>
                          <p className="font-body-sm text-xs text-on-surface-variant truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Location & Live Weather Context Card */}
                      <div className="px-2.5 py-2 mb-2 rounded-xl bg-surface-container-low text-xs flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-on-surface font-medium">
                          <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span className="truncate">{fullLocation}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-on-surface-variant">
                          <CloudSun className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span>{weatherShort}</span>
                        </div>
                      </div>

                      {/* Quick Nav Links */}
                      <div className="space-y-0.5 mb-2">
                        <Link
                          href="/wardrobe"
                          onClick={() => setDesktopMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-on-surface hover:bg-surface-container transition-colors"
                        >
                          <Shirt className="w-4 h-4 text-secondary shrink-0" />
                          <span>My Wardrobe</span>
                        </Link>
                        <Link
                          href="/wardrobe/saved"
                          onClick={() => setDesktopMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-on-surface hover:bg-surface-container transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-secondary shrink-0" />
                          <span>Saved Outfits</span>
                        </Link>
                      </div>

                      {/* Sign Out CTA */}
                      <div className="pt-2 border-t border-outline-variant/20">
                        <SignOutButton
                          variant="menu"
                          onSignedOut={() => setDesktopMenuOpen(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>

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
                <div className="min-w-0">
                  <p className="font-title-md text-title-md text-on-surface font-semibold leading-snug truncate">
                    {user.name || "Bolu"}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
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
              <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-on-surface-variant py-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="font-medium text-on-surface">
                      {fullLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-medium">
                    <CloudSun className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span>{weatherShort}</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <SignOutButton
                    variant="ghost"
                    onSignedOut={() => setMobileMenuOpen(false)}
                  />
                </div>
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
