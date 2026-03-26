"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Sparkles, Send, Menu, Trash2, Bot, Loader2, X, MoreVertical } from "lucide-react";

export default function BlueChatApp() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ p: string; r: string }[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog, loading]);

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

  const deleteMessage = (index: number) => {
    const newChatLog = [...chatLog];
    newChatLog.splice(index, 1);
    setChatLog(newChatLog);
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
      <div className="relative group my-3 rounded-xl overflow-hidden border border-purple-500/20 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-gray-900 to-purple-900/50 text-gray-300 text-xs">
          <span className="font-mono uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse"></span>
            {language || 'code'}
          </span>
          <button 
            onClick={onCopy} 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
          >
            {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            <span className="text-xs">{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <SyntaxHighlighter 
          language={language} 
          style={atomDark} 
          customStyle={{ 
            margin: 0, 
            padding: '1rem', 
            fontSize: '0.85rem', 
            background: '#0a0a0f',
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-20 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar - Colorful Premium Design */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30 w-80 bg-gradient-to-b from-slate-900/95 to-purple-950/95 backdrop-blur-xl 
        border-r border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Animated Gradient Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-shimmer bg-[length:200%_100%]"></div>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-xl animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Adi AI
                </h2>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Premium • Always Learning
                </p>
              </div>
            </div>
            <button 
              onClick={startNewChat} 
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/30 transition-all duration-300"
            >
              <span className="text-sm font-medium text-cyan-400">New Chat</span>
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <span className="text-xs font-semibold text-purple-400">CHAT HISTORY</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
          
          {history.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-3 animate-float">💭✨</div>
              <p className="text-sm text-gray-400">No memories yet</p>
              <p className="text-xs text-gray-500 mt-1">Start your first conversation!</p>
            </div>
          )}
          {history.map((h) => (
            <div 
              key={h._id} 
              onClick={() => loadOldChat(h)}
              onTouchStart={() => handleTouchStart(h._id)}
              onTouchEnd={handleTouchEnd}
              className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                currentChatId === h._id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 shadow-lg' 
                  : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="text-xl">💬</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 font-medium line-clamp-2">
                    {h.prompt}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-2">
                    <span>📅 {new Date(h.timestamp).toLocaleDateString()}</span>
                    <span>⏰ {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => deleteChat(h._id, e)} 
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all duration-200 bg-gray-800/80 rounded-full p-1.5"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="relative p-4 bg-gradient-to-r from-white/5 to-transparent border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={session?.user?.image || `https://ui-avatars.com/api/?name=${userName}&background=8b5cf6&color=fff&bold=true&size=128`} 
                className="w-10 h-10 rounded-full border-2 border-purple-500 shadow-lg object-cover" 
                alt="avatar" 
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate flex items-center gap-1">
                {userName}
                <span className="text-[8px] bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full">Pro</span>
              </p>
              <p className="text-xs text-gray-400 truncate">{userEmail || "Connected with Google"}</p>
            </div>
            <button 
              onClick={() => signOut()} 
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-all duration-200"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-gradient-to-r from-slate-900/90 to-purple-900/90 backdrop-blur-lg border-b border-white/10">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="menu-button p-2 rounded-xl hover:bg-white/10 transition-all"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Adi AI
            </h1>
          </div>
          <button 
            onClick={startNewChat} 
            className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg"
          >
            New
          </button>
        </div>

        {/* Messages Container - Added bg-gray-900 to fix white background issue */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-gray-900"
          style={{ 
            height: '100%',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {chatLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative text-7xl animate-float">🤖💙</div>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Hey {userName.split(' ')[0]}! 👋
                </h3>
                <p className="text-gray-300 text-base">
                  I remember everything you teach me! 🧠✨
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-sm w-full mt-4">
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-3 text-center border border-cyan-500/30 hover:scale-105 transition-transform cursor-pointer">
                  <div className="text-2xl mb-1">💡</div>
                  <p className="text-sm font-semibold text-cyan-400">Quick Question</p>
                  <p className="text-xs text-gray-400">Ask anything instantly</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 text-center border border-purple-500/30 hover:scale-105 transition-transform cursor-pointer">
                  <div className="text-2xl mb-1">📚</div>
                  <p className="text-sm font-semibold text-purple-400">Learning Mode</p>
                  <p className="text-xs text-gray-400">Learn something new</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full">
                  <p className="text-xs text-gray-400">Total Chats</p>
                  <p className="text-xl font-bold text-cyan-400">{history.length}</p>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                  <p className="text-xs text-gray-400">Active Now</p>
                  <p className="text-xl font-bold text-green-400">● Online</p>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages with Delete Button */
            chatLog.map((chat, idx) => (
              <div 
                key={idx} 
                className="flex flex-col gap-3 animate-fade-in"
                onMouseEnter={() => setHoveredMessage(idx)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {/* User Message */}
                <div className="flex justify-end group">
                  <div className="relative max-w-[85%]">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-xl">
                      <p className="text-base leading-relaxed">{chat.p}</p>
                    </div>
                    <button 
                      onClick={() => deleteMessage(idx)}
                      className={`absolute -right-2 -top-2 p-1.5 bg-red-500 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                        hoveredMessage === idx ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
                      }`}
                    >
                      <Trash2 size={12} className="text-white" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 text-right">You • Just now</p>
                  </div>
                </div>
                
                {/* AI Message */}
                <div className="flex justify-start group">
                  <div className="relative max-w-[90%] w-full">
                    <div className="bg-gradient-to-br from-gray-800/80 to-purple-900/50 text-gray-200 rounded-2xl rounded-tl-none px-6 py-4 border border-purple-500/30 shadow-xl">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/30">
                        <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          AI ADIAT
                        </span>
                      </div>
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                            ) : (
                              <code className="bg-gray-700/50 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-sm" {...props}>
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
                          p: ({ children }) => <p className="mb-2 leading-relaxed text-base">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-purple-500 pl-4 my-2 italic text-gray-400">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {chat.r}
                      </ReactMarkdown>
                    </div>
                    <button 
                      onClick={() => deleteMessage(idx)}
                      className={`absolute -left-2 -top-2 p-1.5 bg-red-500 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                        hoveredMessage === idx ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
                      }`}
                    >
                      <Trash2 size={12} className="text-white" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1">AI • Just now</p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-gradient-to-br from-gray-800/80 to-purple-900/50 rounded-2xl rounded-tl-none px-6 py-4 border border-purple-500/30 shadow-xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-sm text-gray-400">AI is thinking...</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-slate-900 to-transparent border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-3 bg-gradient-to-r from-gray-800/40 to-purple-900/40 rounded-2xl border border-purple-500/30 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/50 transition-all duration-300">
              <textarea
                ref={inputRef}
                className="flex-1 bg-transparent px-5 py-4 text-base text-white placeholder-gray-500 focus:outline-none resize-none rounded-2xl"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                placeholder="💭 Ask me anything... I'm here to help! "
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()} 
                className="group relative overflow-hidden m-2 h-12 w-12 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 shadow-xl disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {loading ? (
                  <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mx-auto group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-3 px-2">
              <div className="flex items-center gap-3 text-xs text-gray-500">
              </div>
            </div>
          </div>
        </div>
      </main>

<style jsx>{`
  :root {
    color-scheme: dark !important;
  }

  html {
    color-scheme: dark !important;
    background: #020617 !important;
  }

  body {
    background: #020617 !important;
  }

  /* Force all elements to stay dark */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  @media (prefers-color-scheme: light) {
    html, body {
      background: #020617 !important;
      color: white !important;
    }
  }

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
      transform: translateY(-10px);
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
    width: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
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