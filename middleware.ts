export { auth as middleware } from "@/app/_lib/auth";

export const config = {
  matcher: ['/', '/home', '/:path/settings/profile']
}