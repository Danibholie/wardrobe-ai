import React from "react";
import { SITE_CONFIG } from "@/lib/site";

export interface SocialLinksProps {
  className?: string;
  variant?: "icons" | "pills" | "compact";
  iconSize?: "sm" | "md" | "lg";
}

export const SOCIAL_PROFILES = [
  {
    name: "X (Twitter)",
    handle: SITE_CONFIG.social.twitterHandle,
    href: SITE_CONFIG.social.twitter,
    icon: (className: string) => (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
        className={className}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    hoverColor: "hover:text-black dark:hover:text-white hover:border-black/30",
  },
  {
    name: "Instagram",
    handle: "@WardrobeAING",
    href: SITE_CONFIG.social.instagram,
    icon: (className: string) => (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
        className={className}
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    hoverColor: "hover:text-pink-500 hover:border-pink-500/30",
  },
  {
    name: "TikTok",
    handle: "@wardrobeaing",
    href: SITE_CONFIG.social.tiktok,
    icon: (className: string) => (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="currentColor"
        className={className}
      >
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    hoverColor: "hover:text-[#00f2fe] hover:border-[#00f2fe]/30",
  },
];

export function SocialLinks({
  className = "",
  variant = "icons",
  iconSize = "md",
}: SocialLinksProps) {
  const iconDimensions =
    iconSize === "sm" ? "w-3.5 h-3.5" : iconSize === "lg" ? "w-5 h-5" : "w-4 h-4";
  const buttonDimensions =
    iconSize === "sm" ? "w-7 h-7" : iconSize === "lg" ? "w-10 h-10" : "w-8 h-8";

  if (variant === "pills") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {SOCIAL_PROFILES.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Follow Wardrobe AI on ${social.name}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/30 text-xs font-medium text-on-surface hover:bg-surface-container-high hover:text-primary transition-all shadow-2xs hover:scale-102"
          >
            {social.icon(iconDimensions)}
            <span>{social.name}</span>
          </a>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {SOCIAL_PROFILES.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Follow Wardrobe AI on ${social.name}`}
            className="text-stone-400 hover:text-white transition-colors duration-150 inline-flex items-center gap-1 text-xs"
          >
            {social.icon(iconDimensions)}
            <span className="hidden sm:inline">{social.name}</span>
          </a>
        ))}
      </div>
    );
  }

  // Default: round icon buttons
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {SOCIAL_PROFILES.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow Wardrobe AI on ${social.name}`}
          title={`Follow Wardrobe AI on ${social.name} (${social.handle})`}
          className={`${buttonDimensions} rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white transition-all duration-200 hover:scale-110 shadow-2xs`}
        >
          {social.icon(iconDimensions)}
        </a>
      ))}
    </div>
  );
}
