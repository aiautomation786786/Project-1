import { clerkMiddleware } from "@clerk/nextjs/server";

// Sign-in is optional in Codian — anonymous users can still analyse code.
// We mount Clerk middleware unconditionally so signed-in users have a session
// available to the app router, but we don't gate any route here.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals and all static files unless explicitly requested.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
