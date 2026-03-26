"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Sparkles, Send, Menu, Trash2, Bot, Loader2 } from "lucide-react";

export default function BlueChatApp() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ p: string; r: string }[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

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

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 768) {
        const target = e.target as HTMLElement;
        if (!target.closest('aside') && !target.closest('.menu-button')) {
          setSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  const loadOldChat = (oldChat: any) => {
    setChatLog([{ p: oldChat.prompt, r: oldChat.response }]);
    setCurrentChatId(oldChat._id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const deleteChat = async (id: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!confirm("Delete this chat?")) return;

    try {
      const res = await fetch("/api/history/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setHistory(prev => prev.filter((h) => h._id !== id));
        if (currentChatId === id) {
          setChatLog([]);
          setCurrentChatId(null);
        }
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

    // Auto resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.answer) {
        const newChatLog = [...chatLog, { p: userMsg, r: data.answer }];
        setChatLog(newChatLog);
        if (isFirstMessage) {
          await fetchHistory();
        }
      }
    } catch (err) {
      alert("Server error!");
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setChatLog([]);
    setCurrentChatId(null);
    setInput("");
    if (window.innerWidth < 768) setSidebarOpen(false);
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
      <div className="relative group my-3 rounded-lg overflow-hidden border border-white/10">
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 text-[10px] border-b border-white/10">
          <span className="font-mono uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
            {language || 'code'}
          </span>
          <button 
            onClick={onCopy} 
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 transition-all duration-200"
          >
            {isCopied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
            <span className="text-[9px]">{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <SyntaxHighlighter 
          language={language} 
          style={atomDark} 
          customStyle={{ 
            margin: 0, 
            padding: '0.75rem', 
            fontSize: '0.7rem', 
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden transition-all duration-300" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-[#0f1a1a]/95 to-[#0a0f0f]/95 backdrop-blur-xl 
        border-r border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="relative p-4 border-b border-white/10">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-md animate-pulse"></div>
                <div className="relative w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-base tracking-tight">
                  Adi AI 
                </h2>
                <p className="text-[8px] text-gray-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                  Active
                </p>
              </div>
            </div>
            <button 
              onClick={startNewChat} 
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
            >
              <span className="text-[10px] font-medium text-cyan-400">✨ New</span>
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {history.length === 0 && (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">💭</div>
              <p className="text-[10px] text-gray-400">No memories yet</p>
              <p className="text-[8px] text-gray-500 mt-1">Start your first conversation!</p>
            </div>
          )}
          {history.map((h) => (
            <div 
              key={h._id} 
              onClick={() => loadOldChat(h)}
              onTouchStart={() => handleTouchStart(h._id)}
              onTouchEnd={handleTouchEnd}
              onContextMenu={(e) => { e.preventDefault(); deleteChat(h._id); }}
              className={`group relative p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                currentChatId === h._id 
                  ? 'bg-cyan-500/20 border border-cyan-500/30' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/20'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="text-sm flex-shrink-0">💬</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-200 font-medium line-clamp-2 break-words">
                    {h.prompt}
                  </p>
                  <p className="text-[8px] text-gray-500 mt-1">
                    {new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => deleteChat(h._id, e)} 
                className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all duration-200 bg-gray-800/80 rounded-full p-1"
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
                className="w-8 h-8 rounded-full border border-cyan-500 shadow-lg object-cover" 
                alt="avatar" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-gray-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[8px] text-gray-400 truncate">{userEmail || "Connected"}</p>
            </div>
            <button 
              onClick={() => signOut()} 
              className="text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-all duration-200"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main ref={mainRef} className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 bg-[#0f0f1a]/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-10">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="menu-button p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Adi AI
            </h1>
          </div>
          <button 
            onClick={startNewChat} 
            className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg"
          >
            New
          </button>
        </div>

        {/* Messages Container - Fixed scrolling */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 custom-scrollbar"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          {chatLog.length === 0 ? (
            <div className="min-h-[calc(100vh-180px)] flex flex-col items-center justify-center text-center space-y-3 py-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-2xl opacity-20"></div>
                <div className="relative text-5xl animate-float">🤖💙</div>
              </div>
              
              <div className="space-y-1 px-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Hey {userName.split(' ')[0]}! 👋
                </h3>
                <p className="text-gray-300 text-xs">
                  I remember everything you teach me! 🧠✨
                </p>
              </div>

              {/* Quick Start Cards */}
              <div className="grid grid-cols-2 gap-2 max-w-xs w-full px-4">
                <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                  <div className="text-lg mb-0.5">💡</div>
                  <p className="text-[9px] text-cyan-400">Quick Question</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center border border-white/10">
                  <div className="text-lg mb-0.5">📚</div>
                  <p className="text-[9px] text-cyan-400">Learning Mode</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-2 mt-2">
                <div className="px-2 py-1 bg-white/5 rounded-full">
                  <p className="text-[7px] text-gray-400">Total Chats</p>
                  <p className="text-xs font-bold text-cyan-400">{history.length}</p>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded-full">
                  <p className="text-[7px] text-gray-400">Status</p>
                  <p className="text-xs font-bold text-green-400">● Online</p>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            chatLog.map((chat, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%]">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-none px-3 py-2 shadow-lg">
                      <p className="text-sm leading-relaxed break-words">{chat.p}</p>
                    </div>
                  </div>
                </div>
                
                {/* AI Message */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] w-full">
                    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-200 rounded-2xl rounded-tl-none px-3 py-2.5 border border-white/10 shadow-lg">
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-white/10">
                        <div className="w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-2 h-2 text-white" />
                        </div>
                        <span className="text-[9px] font-semibold text-cyan-400">AI ADIAT</span>
                      </div>
                      <div className="prose prose-sm prose-invert max-w-none text-sm">
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || "");
                              return !inline && match ? (
                                <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                              ) : (
                                <code className="bg-gray-700/50 px-1 py-0.5 rounded text-cyan-300 font-mono text-[10px] break-words" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            a({ href, children }: any) {
                              return (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline transition-colors break-words text-xs">
                                  {children}
                                </a>
                              );
                            },
                            p: ({ children }) => <p className="mb-1.5 leading-relaxed text-sm">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-1.5 space-y-0.5">{children}</ul>,
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                          }}
                        >
                          {chat.r}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl rounded-tl-none px-3 py-2 border border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span className="text-[9px] text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Fixed positioning */}
        <div className="p-3 bg-gradient-to-t from-[#0a0a0f] to-transparent border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-2 bg-gradient-to-r from-gray-800/40 to-gray-900/40 rounded-lg border border-white/10 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all duration-300">
              <textarea
                ref={inputRef}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none resize-none rounded-lg"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                }}
                placeholder="Ask me anything..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                style={{ minHeight: '40px', maxHeight: '80px' }}
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()} 
                className="m-1.5 h-8 w-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 mx-auto animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 mx-auto" />
                )}
              </button>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-center mt-2">
              <p className="text-[6px] text-gray-500">
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
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(12px);
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
            transform: translateY(-5px);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
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