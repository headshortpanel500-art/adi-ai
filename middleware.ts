export { default } from "next-auth/middleware";

export const config = { 
  // শুধু হোম পেজ বা চ্যাট পেজকে প্রোটেক্ট করবে
  matcher: ["/"] 
};