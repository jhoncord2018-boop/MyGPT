
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, AlertCircle, RefreshCcw, MoreHorizontal, User, Bot, ChevronRight } from 'lucide-react';
import { Message, Role } from '../types';
import { callGemini } from '../services/geminiService';

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedModel: string;
  systemInstruction?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  setMessages, 
  selectedModel,
  systemInstruction 
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async (isContinue = false) => {
    const messageContent = isContinue ? "Continue from where you left off" : input.trim();
    if (!messageContent && !isContinue) return;
    if (isLoading) return;

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: messageContent,
      timestamp: Date.now(),
    };

    let updatedMessages = [...messages];
    if (!isContinue) {
      updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');
    }

    setIsLoading(true);

    try {
      const responseText = await callGemini(selectedModel, updatedMessages, systemInstruction, isContinue);
      
      if (isContinue) {
        // Find the last model message and append to it
        setMessages(prev => {
          const newMessages = [...prev];
          for (let i = newMessages.length - 1; i >= 0; i--) {
            if (newMessages[i].role === Role.MODEL) {
              newMessages[i] = {
                ...newMessages[i],
                content: newMessages[i].content + '\n\n' + (responseText || '')
              };
              break;
            }
          }
          return newMessages;
        });
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: Role.MODEL,
          content: responseText || "I couldn't generate a response.",
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while calling the Gemini API');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative overflow-hidden">
      {/* Scrollable Message History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-8 max-w-4xl mx-auto w-full scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 px-8">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-semibold">How can I help you today?</h2>
            <p className="max-w-md text-zinc-400">
              Start a conversation with Gemini using the selected persona and model.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={msg.id} className="group animate-in fade-in duration-500">
            <div className="flex gap-4 items-start">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === Role.USER ? 'bg-zinc-800' : 'bg-indigo-600/20'
              }`}>
                {msg.role === Role.USER ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-indigo-400" />}
              </div>
              <div className="flex-1 space-y-2 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold uppercase tracking-widest opacity-30">
                    {msg.role === Role.USER ? 'You' : 'Gemini'}
                  </span>
                </div>
                <div className="prose prose-invert max-w-none text-zinc-300 selection:bg-indigo-500/30">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                
                {/* Continue button for last model message */}
                {!isLoading && msg.role === Role.MODEL && index === messages.length - 1 && (
                  <button 
                    onClick={() => handleSend(true)}
                    className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full transition-all border border-indigo-500/20"
                  >
                    <ChevronRight className="w-3 h-3" />
                    Continue response
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 items-start animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
              <RefreshCcw className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
            <div className="flex-1 space-y-4 pt-1">
              <div className="h-4 bg-zinc-900 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-900 rounded w-full"></div>
                <div className="h-4 bg-zinc-900 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-4 items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none text-zinc-100 shadow-2xl transition-all placeholder:text-zinc-600"
            style={{ minHeight: '56px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
              input.trim() && !isLoading ? 'bg-indigo-600 text-white hover:scale-105 active:scale-95' : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-600 mt-3 font-medium uppercase tracking-widest">
          Powered by Google Gemini • Using {selectedModel}
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
