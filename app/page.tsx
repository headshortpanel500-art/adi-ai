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
      if (Array.isArray(data)) {
        setHistory(data);
        return data; // Return data for syncing
      }
    } catch (err) {
      console.error("History loading failed");
    }
    return [];
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
        // Fix: Ensure the screen clears if the current active chat is deleted
        if (currentChatId === id || history.find(h => h._id === id)) {
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
    // Fix: Clear hover state to prevent the "trash icon" from appearing on the next message
    setHoveredMessage(null);
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
        setChatLog(prev => [...prev, { p: userMsg, r: data.answer }]);
        
        // Fix: If it's the first message, sync the newly created Chat ID from the database
        if (isFirstMessage) {
          const updatedHistory = await fetchHistory();
          if (updatedHistory && updatedHistory.length > 0) {
            setCurrentChatId(updatedHistory[0]._id);
          }
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

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30 w-80 bg-gradient-to-b from-slate-900/95 to-purple-950/95 backdrop-blur-xl 
        border-r border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-shimmer bg-[length:200%_100%]"></div>
        
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
                  Premium • Active
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

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <span className="text-xs font-semibold text-purple-400">CHAT HISTORY</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
          
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

        <div className="relative p-4 bg-gradient-to-r from-white/5 to-transparent border-t border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src={session?.user?.image || `https://ui-avatars.com/api/?name=${userName}&background=8b5cf6&color=fff&bold=true&size=128`} 
              className="w-10 h-10 rounded-full border-2 border-purple-500 shadow-lg object-cover" 
              alt="avatar" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail || "Student"}</p>
            </div>
            <button onClick={() => signOut()} className="text-xs text-red-400 hover:text-red-300">Exit</button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur-lg border-b border-white/10">
          <button onClick={() => setSidebarOpen(true)} className="menu-button p-2 rounded-xl hover:bg-white/10">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Adi AI</h1>
          <button onClick={startNewChat} className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg">New</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar w-full">
          {chatLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-7xl animate-float">🤖💙</div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Hey {userName.split(' ')[0]}! 👋</h3>
              <p className="text-gray-300">I remember everything you teach me! 🧠✨</p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-hidden">
              {chatLog.map((chat, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col gap-3 animate-fade-in w-full mb-6"
                  onMouseEnter={() => setHoveredMessage(idx)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  <div className="flex justify-end w-full">
                    <div className="relative max-w-[85%] md:max-w-[70%]">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-xl">
                        <p className="text-base break-words whitespace-pre-wrap">{chat.p}</p>
                      </div>
                      {/* Show trash icon if hovered OR if it's the only message (useful for mobile) */}
                      <button 
                        onClick={() => deleteMessage(idx)}
                        className={`absolute -right-2 -top-2 p-1.5 bg-red-500 rounded-full shadow-lg transition-opacity duration-200 ${hoveredMessage === idx ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <Trash2 size={12} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-start w-full">
                    <div className="relative w-full max-w-[90%] md:max-w-[85%]">
                      <div className="bg-gradient-to-br from-gray-800/80 to-purple-900/50 text-gray-200 rounded-2xl rounded-tl-none px-5 md:px-6 py-4 border border-purple-500/30 shadow-xl w-full">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/30">
                          <Bot className="w-3 h-3 text-cyan-400" />
                          <span className="text-xs font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">AI ADIAT</span>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown components={{ code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || "");
                              return !inline && match ? <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} /> : <code className="bg-gray-700/50 px-1 rounded text-cyan-300" {...props}>{children}</code>;
                            }}}>
                            {chat.r}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 rounded-2xl px-6 py-4 border border-purple-500/30">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 md:p-6 bg-slate-900 border-t border-white/10">
          <div className="max-w-4xl mx-auto relative flex items-end gap-3 bg-gray-800/40 rounded-2xl border border-purple-500/30 p-2">
            <textarea
              ref={inputRef}
              className="flex-1 bg-transparent px-4 py-2 text-white focus:outline-none resize-none"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              placeholder="Ask me anything..."
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              rows={1}
            />
            <button 
              onClick={handleSend} 
              disabled={loading || !input.trim()} 
              className="h-10 w-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #8b5cf6; border-radius: 10px; }
      `}</style>
    </div>
  );
}