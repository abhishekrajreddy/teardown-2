export { default } from "next-auth/middleware";

// Everything except /login, static assets, and the auth API itself
// requires a session. Add new top-level routes here as they're built.
export const config = {
  matcher: ["/today/:path*", "/log/:path*", "/timeline/:path*", "/supplements/:path*", "/experiments/:path*", "/sessions/:path*", "/formulary/:path*", "/account/:path*", "/exercises/:path*"],
};
