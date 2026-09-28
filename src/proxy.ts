import { auth } from "./lib/auth";

export default auth((req) => {
  // Authentication is handled by the `authorized` callback below.
});

export const config = {
  matcher: ["//:path*"],
};