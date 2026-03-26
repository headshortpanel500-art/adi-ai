import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // login page (optional)
  },
});

export const config = {
  matcher: ["/"],
};