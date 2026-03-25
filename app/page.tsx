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
            padding: '1.5rem', 
            fontSize: '0.85rem', 
            background: '#0a0a0f',
            borderRadius: 0
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] overflow-hidden font-sans">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-20 md:hidden transition-all duration-300 animate-fade-in" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar - Premium Design */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-80 bg-gradient-to-b from-[#0f0f1a]/95 to-[#0a0a0f]/95 backdrop-blur-xl 
        border-r border-white/10 shadow-2xl flex flex-col transform transition-all duration-500 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header with Animated Gradient */}
        <div className="relative p-6 border-b border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-shimmer bg-[length:200%_100%]"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-lg animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-xl tracking-tight">
                  Adi AI 
                </h2>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Active • Premium
                </p>
              </div>
            </div>
            <button 
              onClick={() => setChatLog([])} 
              className="group relative overflow-hidden px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:scale-105"
            >
              <span className="text-sm font-medium text-cyan-400 flex items-center gap-1">
                ✨ New
              </span>
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {history.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3 animate-float">💭</div>
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
              className="group relative p-4 bg-white/5 rounded-2xl hover:bg-white/10 cursor-pointer transition-all duration-300 border border-white/5 hover:border-cyan-500/30 hover:shadow-lg animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-start gap-2">
                <div className="text-lg">💬</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-200 font-medium line-clamp-2">
                    {h.prompt}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-[9px] text-gray-500 flex items-center gap-1">
                      <span>📅</span> {new Date(h.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-[9px] text-gray-500 flex items-center gap-1">
                      <span>⏰</span> {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => deleteChat(h._id, e)} 
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all duration-200 bg-gray-800/80 rounded-full p-1.5"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="relative p-4 bg-gradient-to-r from-white/5 to-transparent border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={session?.user?.image || `https://ui-avatars.com/api/?name=${userName}&background=0ea5e9&color=fff&bold=true&size=128`} 
                className="w-11 h-11 rounded-full border-2 border-cyan-500 shadow-lg object-cover" 
                alt="avatar" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate flex items-center gap-1">
                {userName}
                <span className="text-[8px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full">Pro</span>
              </p>
              <p className="text-[9px] text-gray-400 truncate">{userEmail || "Connected with Google"}</p>
            </div>
            <button 
              onClick={() => signOut()} 
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-all duration-200"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#0f0f1a]/80 backdrop-blur-lg border-b border-white/10">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              adi ai
            </h1>
          </div>
          <div className="w-8" />
        </div>

        {/* Messages Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar"
        >
          {chatLog.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
              {/* Animated Welcome */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative text-8xl animate-float">🤖💙</div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Hey {userName.split(' ')[0]}! 👋
                </h3>
                <p className="text-gray-300 text-lg">
                  I remember everything you teach me! 🧠✨
                </p>
              </div>

              {/* Quick Start Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto mt-6">
                <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-cyan-500/50">
                  <div className="text-2xl mb-1">💡</div>
                  <p className="text-xs text-cyan-400">Quick Question</p>
                  <p className="text-[9px] text-gray-400">Ask anything instantly</p>
                </div>
                <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center hover:bg-white/10 transition-all cursor-pointer border border-white/10 hover:border-cyan-500/50">
                  <div className="text-2xl mb-1">📚</div>
                  <p className="text-xs text-cyan-400">Learning Mode</p>
                  <p className="text-[9px] text-gray-400">Learn something new</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 mt-4 text-center">
                <div className="px-3 py-1.5 bg-white/5 rounded-full">
                  <p className="text-[9px] text-gray-400">Total Chats</p>
                  <p className="text-sm font-bold text-cyan-400">{history.length}</p>
                </div>
                <div className="px-3 py-1.5 bg-white/5 rounded-full">
                  <p className="text-[9px] text-gray-400">Active Now</p>
                  <p className="text-sm font-bold text-green-400">● Online</p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {chatLog.map((chat, idx) => (
            <div key={idx} className="flex flex-col gap-4 animate-fade-in">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[85%] group">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <p className="text-sm leading-relaxed">{chat.p}</p>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    You • Just now
                  </p>
                </div>
              </div>
              
              {/* AI Message */}
              <div className="flex justify-start">
                <div className="max-w-[95%] w-full group">
                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-200 rounded-2xl rounded-tl-none px-6 py-5 border border-white/10 shadow-2xl backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                      <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-cyan-400">AI ADIAT</span>
                      <span className="text-[8px] text-gray-500 ml-auto">Powered by Adi AI</span>
                    </div>
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                          ) : (
                            <code className="bg-gray-700/50 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs" {...props}>
                              {children}
                            </code>
                          );
                        },
                        a({ href, children }: any) {
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline transition-colors">
                              {children}
                            </a>
                          );
                        },
                        h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-white">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mt-3 mb-2 text-white">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mt-2 mb-1 text-white">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-cyan-500 pl-4 my-2 italic text-gray-400">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {chat.r}
                    </ReactMarkdown>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    AI • Just now
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl rounded-tl-none px-6 py-4 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-xs text-gray-400">AI is thinking...</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-[#0a0a0f] to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-3 bg-gradient-to-r from-gray-800/40 to-gray-900/40 rounded-2xl border border-white/10 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all duration-300 shadow-2xl">
              <textarea
                ref={inputRef}
                className="flex-1 bg-transparent px-5 py-4 text-sm text-white placeholder-gray-500 focus:outline-none resize-none rounded-2xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="💭 Ask me anything... I'm here to help! ✨"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                rows={1}
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()} 
                className="group relative overflow-hidden m-2 h-12 w-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {loading ? (
                  <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between mt-3 px-2">
              <div className="flex items-center gap-3 text-[9px] text-gray-500">
                <span className="flex items-center gap-1">🔒 End-to-end encrypted</span>
                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-1">⚡ AI-Powered • GPT-4</span>
              </div>
              <p className="text-[9px] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-semibold">
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
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
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
            transform: translateY(-12px);
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
          animation: fade-in 0.4s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
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
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ff006a, #0062ff);
          border-radius: 10px;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}