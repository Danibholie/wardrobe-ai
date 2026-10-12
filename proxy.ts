export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/home/:path*",
    "/wardrobe/:path*",
    "/api/wardrobe/:path*",
    "/api/upload/:path*",
    "/api/identify-clothing/:path*",
    "/api/recommend-outfits/:path*",
    "/api/outfits/:path*",
  ],
};