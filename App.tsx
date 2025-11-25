import React, { useState, useRef, useEffect } from 'react';
import { DEFAULT_CONFIG } from './constants';
import { Message, ModelConfig, Role, Attachment } from './types';
import { sendMessageToGemini } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import { Menu, Sparkles, Trash2, Github } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string, attachments: Attachment[]) => {
    // 1. Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      attachments: attachments,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // 2. Call Gemini
    // We pass the *current* state of messages (before this update has technically settled in all contexts, 
    // but here we just pass the array we just created + prev)
    // Actually, safest to use the updater pattern or a temp variable.
    const currentHistory = [...messages, userMessage];
    
    try {
      const responseMessage = await sendMessageToGemini(
        messages, // Pass history *excluding* the new one? No, usually include it? 
                  // Service logic: mapMessagesToContent takes history. 
                  // If we use generateContent stateless, we need ALL messages including the new one.
                  // BUT, the service function signature I wrote is `(currentHistory, newMessageText...)`.
                  // So I should pass `messages` (history) and the new input separately.
        text,
        attachments,
        config
      );
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error("App Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden">
      
      {/* Sidebar (Config) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        config={config}
        setConfig={setConfig}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative transition-all duration-300">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white" size={18} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">Gemini Nexus</h1>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                <span className={config.modelName.includes('pro') ? 'text-purple-400' : 'text-blue-400'}>
                   {config.modelName.replace('gemini-', '').replace('-preview', '')}
                </span>
                {config.useSearch && <span className="text-green-500">• Grounded</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={clearHistory}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-900"
              title="Clear History"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-900"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto min-h-full flex flex-col">
            
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 select-none pointer-events-none">
                <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800 animate-pulse-fast">
                   <Sparkles size={48} className="text-gray-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-300 mb-2">Ready to create.</h2>
                <p className="text-gray-500 max-w-md">
                  Select a model, upload images, or toggle search grounding to begin your session.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start w-full mb-6">
                 <div className="flex items-center gap-3 bg-gray-900/50 p-4 rounded-2xl rounded-tl-none border border-gray-800">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Gemini is thinking...</span>
                 </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Footer */}
        <footer className="p-4 bg-gray-950 border-t border-gray-800">
          <InputArea onSend={handleSend} isLoading={isLoading} />
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-600">
              Gemini can make mistakes. Review generated code and facts.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default App;
