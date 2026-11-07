'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { chatAPI } from '@/services/api';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your Gurukul guide. Ask me anything about learning or creating courses!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstChatRequest, setIsFirstChatRequest] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('server_warm')) {
      setIsFirstChatRequest(false);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const askagent = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatAPI.chat({
        messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
      });

      sessionStorage.setItem('server_warm', 'true');
      setIsFirstChatRequest(false);

      const botMessage = {
        role: 'assistant',
        content: response.data.reply || "I'm having trouble connecting right now.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      if (isFirstChatRequest && error?.silent) {
        setIsFirstChatRequest(false);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              '⏳ The server is warming up (this can take 30–60 seconds on first load). Please send your message again in a moment!',
          },
        ]);
      } else {
        console.error('Chat error:', error);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      askagent();
    }
  };

  return (
    <section className="ai w-full lg:w-[440px] xl:w-[480px] shrink-0 h-full flex flex-col p-6 sm:p-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 shrink-0">
        <div className="w-11 h-11 bg-gradient-to-tr from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Gurukul Assistant</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Instant AI answers about courses & platform
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role !== 'user' && (
              <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3.5 rounded-2xl text-sm sm:text-base leading-relaxed max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-none shadow-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-gray-100 text-gray-500 p-3.5 rounded-2xl rounded-tl-none text-sm italic">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            className="flex-1 bg-transparent border-0 px-3 py-2 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={askagent}
            disabled={isLoading || !input.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white p-2.5 rounded-lg transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChatAssistant;
