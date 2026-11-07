import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { isUserAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: {
    default: "Wardrobe AI · Curated Architecture",
    template: "%s | Wardrobe AI",
  },
  description:
    "Curate your personal collection, generate weather-smart outfits, and track your wardrobe rotation in Nigeria.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin?callbackUrl=/wardrobe");
  }

  const isAdmin = await isUserAdmin(session.user.email);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        user={{
          ...session.user,
          role: isAdmin ? "admin" : "user",
        }}
      />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
