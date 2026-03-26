"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Sparkles, Mail, ArrowRight, Loader2, CheckCircle, Github, Chrome } from "lucide-react";

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
    // Add your email magic link logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] flex items-center justify-center p-4 md:p-5 font-sans relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
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
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:50px_50px]"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
        {/* Outer Glow Effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900/95 to-[#0f0f1a]/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          
          {/* Animated Top Gradient Bar */}
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-shimmer bg-[length:200%_100%]"></div>
          
          <div className="p-6 md:p-8 lg:p-10">
            
            {/* Logo/Icon Section with Premium Animation */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-2xl animate-pulse group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-full p-5 md:p-6 shadow-2xl">
                  {loading ? (
                    <Loader2 className="w-10 h-10 md:w-14 md:h-14 text-white animate-spin" />
                  ) : (
                    <Sparkles className="w-10 h-10 md:w-14 md:h-14 text-white transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                  )}
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 md:mb-4">
                ADI AI FRIEND
              </h1>
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent to-cyan-500"></div>
                <p className="text-gray-300 text-xs md:text-sm font-medium">YOUR PERSONAL AI ASSISTANT</p>
                <div className="w-8 md:w-12 h-px bg-gradient-to-l from-transparent to-cyan-500"></div>
              </div>
            </div>

            {/* Description Card with Premium Glass Effect */}
            <div className="relative bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-white/20 backdrop-blur-sm group hover:border-cyan-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed text-center relative z-10">
                🚀 আপনার ব্যক্তিগত AI সহকারী যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত!
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3 md:mt-4 relative z-10">
                <span className="text-[10px] md:text-[11px] px-2 md:px-3 py-1 md:py-1.5 bg-white/10 rounded-full text-gray-300 hover:bg-cyan-500/20 transition-all cursor-pointer">🎨 ডিজাইন</span>
                <span className="text-[10px] md:text-[11px] px-2 md:px-3 py-1 md:py-1.5 bg-white/10 rounded-full text-gray-300 hover:bg-cyan-500/20 transition-all cursor-pointer">💻 কোডিং</span>
                <span className="text-[10px] md:text-[11px] px-2 md:px-3 py-1 md:py-1.5 bg-white/10 rounded-full text-gray-300 hover:bg-cyan-500/20 transition-all cursor-pointer">📚 শিক্ষা</span>
                <span className="text-[10px] md:text-[11px] px-2 md:px-3 py-1 md:py-1.5 bg-white/10 rounded-full text-gray-300 hover:bg-cyan-500/20 transition-all cursor-pointer">💼 ক্যারিয়ার</span>
              </div>
            </div>

            {/* Login Options */}
            <div className="space-y-3 md:space-y-4">
              {/* Google Button with Premium Design */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="relative w-full group overflow-hidden rounded-xl md:rounded-2xl shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`relative flex items-center justify-center gap-2 md:gap-3 bg-white text-gray-800 py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-semibold transition-all duration-300 ${loading ? 'opacity-80 cursor-not-allowed' : 'group-hover:scale-[0.98]'}`}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 md:h-5 md:w-5 text-cyan-500" />
                      <span className="text-sm md:text-base">লগইন হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Chrome className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-sm md:text-base">Google দিয়ে লগইন করো</span>
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-3 md:px-4 text-[10px] md:text-xs text-gray-500 bg-gray-900/50 backdrop-blur-sm">অথবা</span>
              </div>

              {/* Email Option Toggle */}
              <button
                onClick={() => setShowEmailInput(!showEmailInput)}
                className="w-full text-center text-gray-400 text-xs md:text-sm hover:text-cyan-400 transition-colors py-2 md:py-3 flex items-center justify-center gap-2 group"
              >
                {showEmailInput ? (
                  <>🔽 গুগল লগইন করুন</>
                ) : (
                  <>
                    <Mail className="w-3 h-3 md:w-4 md:h-4 group-hover:scale-110 transition-transform" />
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
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                  </div>
                  <button 
                    onClick={handleEmailLogin}
                    className="w-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-400 font-semibold py-2.5 md:py-3 rounded-xl transition-all border border-white/10 hover:border-cyan-500/50 text-sm md:text-base"
                  >
                    {emailSent ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                        লিংক পাঠানো হয়েছে!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        লগইন লিংক পাঠান
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                      </span>
                    )}
                  </button>
                  <p className="text-[8px] md:text-[9px] text-gray-500 text-center">
                    আমরা আপনাকে একটি ম্যাজিক লিংক ইমেইল করব
                  </p>
                </div>
              )}
            </div>

            {/* Premium Features Grid */}
            <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                <div className="group bg-white/5 rounded-lg md:rounded-xl p-2 md:p-3 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 transform duration-300">
                  <div className="text-xl md:text-2xl mb-0.5 md:mb-1 group-hover:scale-110 transition-transform">⚡</div>
                  <div className="text-[8px] md:text-[10px] text-gray-400 font-medium">ইনস্ট্যান্ট</div>
                  <div className="text-[6px] md:text-[8px] text-gray-500 mt-0.5">Fast Response</div>
                </div>
                <div className="group bg-white/5 rounded-lg md:rounded-xl p-2 md:p-3 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 transform duration-300">
                  <div className="text-xl md:text-2xl mb-0.5 md:mb-1 group-hover:scale-110 transition-transform">🔒</div>
                  <div className="text-[8px] md:text-[10px] text-gray-400 font-medium">সুরক্ষিত</div>
                  <div className="text-[6px] md:text-[8px] text-gray-500 mt-0.5">End-to-End</div>
                </div>
                <div className="group bg-white/5 rounded-lg md:rounded-xl p-2 md:p-3 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 transform duration-300">
                  <div className="text-xl md:text-2xl mb-0.5 md:mb-1 group-hover:scale-110 transition-transform">🎨</div>
                  <div className="text-[8px] md:text-[10px] text-gray-400 font-medium">প্রিমিয়াম</div>
                  <div className="text-[6px] md:text-[8px] text-gray-500 mt-0.5">Modern UI</div>
                </div>
              </div>
            </div>

            {/* Trust Badge with Premium Icons */}
            <div className="mt-5 md:mt-6 text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[8px] md:text-[10px] text-gray-500">
                <span className="flex items-center gap-1 md:gap-1.5">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-500 rounded-full"></div>
                  NextAuth.js
                </span>
                <span className="flex items-center gap-1 md:gap-1.5">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-500 rounded-full"></div>
                  SSL Encrypted
                </span>
                <span className="flex items-center gap-1 md:gap-1.5">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-500 rounded-full"></div>
                  GPT-4 Powered
                </span>
                <span className="flex items-center gap-1 md:gap-1.5">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-cyan-500 rounded-full"></div>
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <div className="absolute bottom-3 md:bottom-5 left-0 right-0 text-center px-4">
        <p className="text-gray-500 text-[8px] md:text-xs flex flex-wrap items-center justify-center gap-1 md:gap-2">
          <span>© 2026 ADIAT SARKER</span>
          <span className="text-cyan-400 animate-pulse">❤️</span>
          <span>Premium AI Experience</span>
        </p>
        <p className="text-[7px] md:text-[9px] text-gray-600 mt-1 tracking-wider">
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
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .animate-float {
            animation-duration: 5s;
          }
        }
      `}</style>
    </div>
  );
}