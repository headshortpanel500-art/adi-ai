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

  const deleteChat = async (id: string, e?: React.MouseEvent) => {
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
        if (currentChatId === id) {
          setChatLog([]);
          setCurrentChatId(null);
        }
      }
    } catch (err) {
      alert("Failed to delete!");
    }
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
      <div className="relative group my-2 rounded-lg overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800 text-gray-300 text-xs">
          <span className="font-mono uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            {language || 'code'}
          </span>
          <button 
            onClick={onCopy} 
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-gray-700 transition-all"
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
            padding: '0.75rem', 
            fontSize: '0.75rem', 
            background: '#1a1a1a',
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-900 overflow-hidden">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-30 w-72 bg-gray-800 
        border-r border-gray-700 shadow-xl flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">Adi AI</h2>
                <p className="text-[10px] text-gray-400">Always Learning</p>
              </div>
            </div>
            <button 
              onClick={startNewChat} 
              className="px-2 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs text-blue-400"
            >
              ✨ New
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {history.length === 0 && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">💭</div>
              <p className="text-[11px] text-gray-400">No chats yet</p>
            </div>
          )}
          {history.map((h) => (
            <div 
              key={h._id} 
              onClick={() => loadOldChat(h)}
              className={`group relative p-2 rounded-lg cursor-pointer transition-colors ${
                currentChatId === h._id 
                  ? 'bg-blue-600/20 border border-blue-500/50' 
                  : 'bg-gray-700/50 hover:bg-gray-700'
              }`}
            >
              <p className="text-xs text-gray-200 line-clamp-2 break-words pr-6">
                {h.prompt}
              </p>
              <p className="text-[9px] text-gray-500 mt-1">
                {new Date(h.timestamp).toLocaleDateString()}
              </p>
              <button 
                onClick={(e) => deleteChat(h._id, e)} 
                className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition p-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <img 
              src={session?.user?.image || `https://ui-avatars.com/api/?name=${userName}&background=3b82f6&color=fff&size=64`} 
              className="w-8 h-8 rounded-full border border-blue-500" 
              alt="avatar" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{userName}</p>
            </div>
            <button 
              onClick={() => signOut()} 
              className="text-[10px] text-red-400 hover:text-red-300"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-900">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="menu-button p-1.5"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <h1 className="text-sm font-bold text-white">Adi AI</h1>
          </div>
          <button 
            onClick={startNewChat} 
            className="text-[10px] text-blue-400 bg-blue-600/20 px-2 py-1 rounded"
          >
            New
          </button>
        </div>

        {/* Messages Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-3"
          style={{ 
            height: '100%',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {chatLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-3">
              <div className="text-5xl">🤖💙</div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Hey {userName.split(' ')[0]}! 👋
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  I remember everything you teach me!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-[200px] w-full">
                <div className="bg-gray-800 rounded-lg p-2 text-center">
                  <div className="text-lg">💡</div>
                  <p className="text-[9px] text-blue-400">Ask me</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-2 text-center">
                  <div className="text-lg">📚</div>
                  <p className="text-[9px] text-blue-400">Learn</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-gray-800 rounded-full">
                  <p className="text-[9px] text-gray-400">Total Chats</p>
                  <p className="text-sm font-bold text-blue-400">{history.length}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            chatLog.map((chat, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-tr-none px-3 py-2">
                    <p className="text-sm break-words">{chat.p}</p>
                  </div>
                </div>
                
                {/* AI Message */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] bg-gray-800 text-gray-200 rounded-2xl rounded-tl-none px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bot className="w-3 h-3 text-blue-400" />
                      <span className="text-[9px] font-semibold text-blue-400">AI</span>
                    </div>
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                          ) : (
                            <code className="bg-gray-700 px-1 rounded text-blue-300 text-[10px]" {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => <p className="mb-1 text-sm leading-relaxed">{children}</p>,
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-sm">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {chat.r}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl rounded-tl-none px-3 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                  <span className="text-[10px] text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-gray-900 border-t border-gray-800">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
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
              className="h-9 w-9 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[8px] text-gray-600">Designed with 💙 by Adiat Sarker</p>
          </div>
        </div>
      </main>

      <style jsx>{`
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