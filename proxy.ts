export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/home/:path*",
    "/plan/:path*",
    "/wardrobe/:path*",
    "/admin/:path*",
    "/api/wardrobe/:path*",
    "/api/upload/:path*",
    "/api/identify-clothing/:path*",
    "/api/recommend-outfits/:path*",
    "/api/outfits/:path*",
    "/api/admin/:path*",
    "/api/user/:path*",
    "/api/payments/initialize",
    "/api/payments/verify",
  ],
};