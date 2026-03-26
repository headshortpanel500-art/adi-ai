"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Sparkles, Send, Menu, X, Trash2, User, Bot, Loader2 } from "lucide-react";

export default function BlueChatApp() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ p: string; r: string }[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch (err) {
      console.error("History loading failed");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog, loading]);

  const loadOldChat = (oldChat: any) => {
    setChatLog([{ p: oldChat.prompt, r: oldChat.response }]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const deleteChat = async (id: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Delete this chat?")) return;

    try {
      const res = await fetch("/api/history/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setHistory(prev => prev.filter((h) => h._id !== id));
        setChatLog([]);
      }
    } catch (err) {
      alert("Failed to delete!");
    }
  };

  const handleTouchStart = (id: string) => {
    timerRef.current = setTimeout(() => {
      deleteChat(id);
    }, 800);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = input;
    const isFirstMessage = chatLog.length === 0;
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.answer) {
        setChatLog((prev) => [...prev, { p: userMsg, r: data.answer }]);
        if (isFirstMessage) {
          fetchHistory();
        }
      }
    } catch (err) {
      alert("Server error!");
    } finally {
      setLoading(false);
    }
  };

  const userName = session?.user?.name || "Adiat";
  const userEmail = session?.user?.email || "";

  const CodeBlock = ({ language, value }: { language: string, value: string }) => {
    const isCopied = copiedCode === value;
    const onCopy = () => {
      navigator.clipboard.writeText(value);
      setCopiedCode(value);
      setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
      <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 text-xs border-b border-white/10">
          <span className="font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
            {language || 'code'}
          </span>
          <button 
            onClick={onCopy} 
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            {isCopied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
            <span className="text-[10px]">{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <SyntaxHighlighter 
          language={language} 
          style={atomDark} 
          customStyle={{ 
            margin: 0, 
            padding: '1rem', 
            fontSize: '0.8rem', 
            background: '#0a0a0f',
            borderRadius: 0,
            overflowX: 'auto'
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] overflow-hidden font-sans">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-20 md:hidden transition-all duration-300 animate-fade-in" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar - Premium Design */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30 w-80 bg-gradient-to-b from-[#0f1a1a]/95 to-[#0a0f0f]/95 backdrop-blur-xl 
        border-r border-white/10 shadow-2xl flex flex-col transform transition-transform duration-500 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header with Animated Gradient */}
        <div className="relative p-5 border-b border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-shimmer bg-[length:200%_100%]"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg animate-pulse"></div>
                <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-lg md:text-xl tracking-tight">
                  Adi AI 
                </h2>
                <p className="text-[8px] md:text-[10px] text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Active • Premium
                </p>
              </div>
            </div>
            <button 
              onClick={() => setChatLog([])} 
              className="group relative overflow-hidden px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-105"
            >
              <span className="text-xs md:text-sm font-medium text-cyan-400 flex items-center gap-1">
                ✨ New
              </span>
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {history.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3 animate-float">💭</div>
              <p className="text-xs text-gray-400">No memories yet</p>
              <p className="text-[10px] text-gray-500 mt-1">Start your first conversation!</p>
            </div>
          )}
          {history.map((h, idx) => (
            <div 
              key={h._id} 
              onClick={() => loadOldChat(h)}
              onTouchStart={() => handleTouchStart(h._id)}
              onTouchEnd={handleTouchEnd}
              onContextMenu={(e) => { e.preventDefault(); deleteChat(h._id); }}
              className="group relative p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-all duration-300 border border-white/5 hover:border-cyan-500/30 hover:shadow-lg animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-start gap-2">
                <div className="text-base">💬</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-200 font-medium line-clamp-2">
                    {h.prompt}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <p className="text-[8px] text-gray-500 flex items-center gap-1">
                      <span>📅</span> {new Date(h.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-[8px] text-gray-500 flex items-center gap-1">
                      <span>⏰</span> {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => deleteChat(h._id, e)} 
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all duration-200 bg-gray-800/80 rounded-full p-1"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="relative p-3 bg-gradient-to-r from-white/5 to-transparent border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <img 
                src={session?.user?.image || `https://ui-avatars.com/api/?name=${userName}&background=0ea5e9&color=fff&bold=true&size=128`} 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-cyan-500 shadow-lg object-cover" 
                alt="avatar" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-bold text-white truncate flex items-center gap-1">
                {userName}
                <span className="text-[7px] md:text-[8px] bg-cyan-500/20 text-cyan-400 px-1 py-0.5 rounded-full">Pro</span>
              </p>
              <p className="text-[8px] md:text-[9px] text-gray-400 truncate">{userEmail || "Connected with Google"}</p>
            </div>
            <button 
              onClick={() => signOut()} 
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-xl transition-all duration-200 flex-shrink-0"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 bg-[#0f0f1a]/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              adi ai
            </h1>
          </div>
          <div className="w-8" />
        </div>

        {/* Messages Container - Fixed scrolling */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain p-3 md:p-6 space-y-4 custom-scrollbar"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          {chatLog.length === 0 && (
            <div className="min-h-[calc(100vh-200px)] md:min-h-[calc(100vh-150px)] flex flex-col items-center justify-center text-center space-y-4 animate-fade-in py-8">
              {/* Animated Welcome */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative text-6xl md:text-7xl animate-float">🤖💙</div>
              </div>
              
              <div className="space-y-2 px-4">
                <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Hey {userName.split(' ')[0]}! 👋
                </h3>
                <p className="text-gray-300 text-sm md:text-base">
                  I remember everything you teach me! 🧠✨
                </p>
              </div>

              {/* Quick Start Cards */}
              <div className="grid grid-cols-2 gap-2 max-w-sm w-full px-4">
                <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-2 text-center hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-cyan-500/50">
                  <div className="text-xl mb-0.5">💡</div>
                  <p className="text-[10px] text-cyan-400">Quick Question</p>
                  <p className="text-[8px] text-gray-400 hidden md:block">Ask anything instantly</p>
                </div>
                <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-2 text-center hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-cyan-500/50">
                  <div className="text-xl mb-0.5">📚</div>
                  <p className="text-[10px] text-cyan-400">Learning Mode</p>
                  <p className="text-[8px] text-gray-400 hidden md:block">Learn something new</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3 mt-2 text-center">
                <div className="px-3 py-1.5 bg-white/5 rounded-full">
                  <p className="text-[8px] text-gray-400">Total Chats</p>
                  <p className="text-sm font-bold text-cyan-400">{history.length}</p>
                </div>
                <div className="px-3 py-1.5 bg-white/5 rounded-full">
                  <p className="text-[8px] text-gray-400">Active Now</p>
                  <p className="text-sm font-bold text-green-400">● Online</p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {chatLog.map((chat, idx) => (
            <div key={idx} className="flex flex-col gap-3 animate-fade-in">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] md:max-w-[75%] group">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 md:px-5 md:py-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <p className="text-sm md:text-base leading-relaxed break-words">{chat.p}</p>
                  </div>
                  <p className="text-[8px] text-gray-500 mt-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    You • Just now
                  </p>
                </div>
              </div>
              
              {/* AI Message */}
              <div className="flex justify-start">
                <div className="max-w-[95%] md:max-w-[85%] w-full group">
                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-200 rounded-2xl rounded-tl-none px-4 py-3 md:px-6 md:py-5 border border-white/10 shadow-2xl backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                      <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                      </div>
                      <span className="text-[10px] md:text-xs font-semibold text-cyan-400">AI ADIAT</span>
                      <span className="text-[7px] md:text-[8px] text-gray-500 ml-auto">Powered by Adi AI</span>
                    </div>
                    <div className="prose prose-sm md:prose-base prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                            ) : (
                              <code className="bg-gray-700/50 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs break-words" {...props}>
                                {children}
                              </code>
                            );
                          },
                          a({ href, children }: any) {
                            return (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline transition-colors break-words">
                                {children}
                              </a>
                            );
                          },
                          h1: ({ children }) => <h1 className="text-xl md:text-2xl font-bold mt-3 mb-2 text-white">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg md:text-xl font-bold mt-2 mb-1.5 text-white">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base md:text-lg font-bold mt-1.5 mb-1 text-white">{children}</h3>,
                          p: ({ children }) => <p className="mb-2 leading-relaxed text-sm md:text-base">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-xs md:text-sm">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-cyan-500 pl-3 my-2 italic text-gray-400 text-sm">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {chat.r}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <p className="text-[8px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    AI • Just now
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl rounded-tl-none px-4 py-3 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span className="text-[10px] md:text-xs text-gray-400">AI is thinking...</span>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-5 bg-gradient-to-t from-[#0a0a0f] to-transparent border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-2 bg-gradient-to-r from-gray-800/40 to-gray-900/40 rounded-xl border border-white/10 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all duration-300 shadow-2xl">
              <textarea
                ref={inputRef}
                className="flex-1 bg-transparent px-3 py-2.5 md:px-4 md:py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none rounded-xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="💭 Ask me anything... I'm here to help! ✨"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                rows={1}
                style={{ minHeight: '44px', maxHeight: '100px' }}
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()} 
                className="group relative overflow-hidden m-1.5 h-9 w-9 md:h-10 md:w-10 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 mx-auto animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 mx-auto group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
            
            {/* Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-2 px-2 gap-1">
              <div className="flex items-center gap-2 text-[7px] md:text-[8px] text-gray-500">
                <span className="flex items-center gap-0.5">🔒 End-to-end encrypted</span>
                <span className="w-0.5 h-0.5 bg-gray-600 rounded-full hidden md:block"></span>
                <span className="flex items-center gap-0.5">⚡ AI-Powered • GPT-4</span>
              </div>
              <p className="text-[7px] md:text-[8px] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-semibold">
                Designed with 💙 by Adiat Sarker
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
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
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
          background-size: 200% 100%;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 10px;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 2px;
          }
        }
      `}</style>
    </div>
  );
}