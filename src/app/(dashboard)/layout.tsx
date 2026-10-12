import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={session.user} />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
