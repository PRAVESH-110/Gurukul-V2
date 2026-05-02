'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { chatAPI } from '@/services/api';

const ChatAssistant = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your Gurukul guide. Ask me anything about learning or creating courses!"
        }
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
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input; // Capture input for API call
        setInput(''); // Clear input immediately
        setIsLoading(true);

        try {
            const response = await chatAPI.chat({
                messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
            });

            // Mark server as warm on success
            sessionStorage.setItem('server_warm', 'true');
            setIsFirstChatRequest(false);

            const botMessage = {
                role: 'assistant',
                content: response.data.reply || "I'm having trouble connecting right now."
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error: any) {
            if (isFirstChatRequest && error?.silent) {
                // Cold-start: show a friendly warmup message in chat instead of an error
                setIsFirstChatRequest(false);
                setMessages((prev) => [...prev, {
                    role: 'assistant',
                    content: '⏳ The server is warming up (this can take 30–60 seconds on first load). Please send your message again in a moment!'
                }]);
            } else {
                console.error("Chat error:", error);
                setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please try again." }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="ai relative mb-10 font-sm w-[30%] h-[500px] flex flex-col p-6 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-tr from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Gurukul Assistant</h3>
                    <p className="text-xs text-gray-500">Ask me anything!</p>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role !== 'user' && (
                            <div className="h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-gray-500" />
                            </div>
                        )}
                        <div
                            className={`p-3 rounded-2xl text-sm max-w-[85%] ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-700 rounded-tl-none'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && askagent()}
                    placeholder="Type your question..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                <button
                    onClick={askagent}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </section>
    );
};

export default ChatAssistant;
