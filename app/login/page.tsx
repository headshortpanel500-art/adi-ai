"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Sparkles, Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleEmailLogin = () => {
    if (!email.trim()) return;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center p-5 font-sans relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        
        {/* Floating Particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
            }}
          />
        ))}

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
        {/* Outer Glow Effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          
          {/* Animated Top Gradient Bar */}
          <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-shimmer bg-[length:200%_100%]"></div>
          
          <div className="p-8 sm:p-10">
            
            {/* Logo/Icon Section with Premium Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-2xl animate-pulse group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-6 shadow-2xl">
                  {loading ? (
                    <Loader2 className="w-14 h-14 text-white animate-spin" />
                  ) : (
                    <Sparkles className="w-14 h-14 text-white transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                  )}
                </div>
                {loading && (
                  <div className="absolute -top-2 -right-2 animate-spin-slow">
                    <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-white to-blue-400 bg-clip-text text-transparent mb-4">
                ADI AI FRIEND
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-500"></div>
                <p className="text-gray-300 text-sm font-medium">YOUR PERSONAL AI</p>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-cyan-500"></div>
              </div>
            </div>

            {/* Description Card with Premium Glass Effect */}
            <div className="relative bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-6 mb-8 border border-white/20 backdrop-blur-sm group hover:border-cyan-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
              <p className="text-gray-200 text-base leading-relaxed text-center relative z-10 flex items-center justify-center gap-2">
                <span className="text-2xl animate-pulse">✨</span>
                
                <span className="text-2xl animate-pulse delay-300">✨</span>
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 relative z-10">
                <span className="text-[11px] px-3 py-1.5 bg-white/10 rounded-full text-gray-300 hover:bg-cyan-500/20 transition-all cursor-pointer">🎨 ওয়েব ডিজাইন</span>
                <span className="text-[11px] px-3 py-1.5 bg-white/10 rounded-full text-gray-300 hover:bg-cyan-500/20 transition-all cursor-pointer">💻 কোডিং</span>
                <span className="text-[11px] px-3 py-1.5 bg-white/10 rounded-full text-gray-300 hover:bg-cyan-500/20 transition-all cursor-pointer">🚀 ক্যারিয়ার গাইড</span>
              </div>
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              {/* Google Button with Premium Design */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="relative w-full group overflow-hidden rounded-2xl shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`relative flex items-center justify-center gap-3 bg-white text-gray-800 py-4 px-4 rounded-2xl font-semibold transition-all duration-300 ${loading ? 'opacity-80 cursor-not-allowed' : 'group-hover:scale-[0.98]'}`}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 text-cyan-500" />
                      <span>লগইন হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Google দিয়ে লগইন করো</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-4 text-xs text-gray-500 bg-gray-900/50 backdrop-blur-sm">অথবা</span>
              </div>

              {/* Email Option Toggle */}
              <button
                onClick={() => setShowEmailInput(!showEmailInput)}
                className="w-full text-center text-gray-400 text-sm hover:text-cyan-400 transition-colors py-3 flex items-center justify-center gap-2 group"
              >
                {showEmailInput ? (
                  <>🔽 গুগল লগইন করুন</>
                ) : (
                  <>
                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>ইমেইল দিয়ে লগইন</span>
                  </>
                )}
              </button>

              {/* Email Input with Premium Animation */}
              {showEmailInput && (
                <div className="animate-slideDown space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="তোমার ইমেইল ঠিকানা"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                  <button 
                    onClick={handleEmailLogin}
                    className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-400 font-semibold py-3 rounded-xl transition-all border border-white/10 hover:border-cyan-500/50"
                  >
                    {emailSent ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        লিংক পাঠানো হয়েছে!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        লগইন লিংক পাঠান
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Premium Features Grid */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="group bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 transform duration-300">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">⚡</div>
                  <div className="text-[10px] text-gray-400 font-medium">ইনস্ট্যান্ট</div>
                  <div className="text-[8px] text-gray-500 mt-0.5">Fast Response</div>
                </div>
                <div className="group bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 transform duration-300">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🔒</div>
                  <div className="text-[10px] text-gray-400 font-medium">সুরক্ষিত</div>
                  <div className="text-[8px] text-gray-500 mt-0.5">End-to-End</div>
                </div>
                <div className="group bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 transform duration-300">
                  <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎨</div>
                  <div className="text-[10px] text-gray-400 font-medium">মডার্ন</div>
                  <div className="text-[8px] text-gray-500 mt-0.5">Premium UI</div>
                </div>
              </div>
            </div>

            {/* Trust Badge with Premium Icons */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  NextAuth.js
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  SSL Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <div className="absolute bottom-5 left-0 right-0 text-center">
        <p className="text-gray-500 text-xs flex items-center justify-center gap-2">
          <span>© 2026 ADIAT SARKER</span>
          <span className="text-cyan-400 animate-pulse">❤️</span>
          <span>Premium AI Experience</span>
        </p>
        <p className="text-[9px] text-gray-600 mt-1 tracking-wider">
          ✨ Powered by Advanced AI Technology ✨
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          20%, 80% {
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(15px);
            opacity: 0.6;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
          background-size: 200% 100%;
        }
        .animate-spin-slow {
          animation: spin-slow 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}