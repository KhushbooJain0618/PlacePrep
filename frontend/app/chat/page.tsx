'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  MessageSquare,
  Clock,
  Mic,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../../lib/api';
import { ChatMessage } from '../../types';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Hello! I am **PlacePrep AI**, your campus placement preparation assistant. Grounded in curated placement resources, I can help you solve DSA problems, understand system architecture, review DBMS queries, and master core OOP concepts.\n\nWhat topic would you like to prepare today?',
      timestamp: 'Just now',
      sources: ['Placement Preparation Guide', 'DSA Fundamentals', 'Interview Handbook']
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleRecentConversations = [
    { title: 'DSA Roadmap & High Frequency Topics', time: 'Yesterday' },
    { title: 'Array vs Linked List Trade-offs', time: '2 days ago' },
    { title: 'SQL Joins & Normalization Rules', time: '3 days ago' },
    { title: 'Process vs Thread Memory Spaces', time: 'Sep 12' },
  ];

  const suggestedQuestions = [
    'What DSA topics should I prepare for campus placements?',
    'Explain the difference between an Array and a Linked List.',
    'Explain ACID properties in DBMS with real examples.',
    'What is the difference between Method Overloading and Overriding?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessageId = 'user-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend.trim(),
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome-1')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await api.sendChatMessage(textToSend.trim(), history);

      const aiMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: res.answer,
        timestamp: 'Just now',
        sources: res.sources
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Something went wrong while connecting to the AI service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetry = () => {
    if (messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: 'New chat session started. Ask any placement-related doubt!',
        timestamp: 'Just now',
        sources: ['Placement Preparation Guide', 'Interview Handbook']
      }
    ]);
    setError(null);
  };

  return (
    <div className="flex-1 flex bg-navy-950">
      <Sidebar />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sub-sidebar: Recent Conversations */}
        <div className="w-full md:w-64 shrink-0 bg-navy-900/60 border-r border-navy-800 p-4 hidden lg:flex flex-col justify-between">
          <div className="space-y-4">
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 px-3.5 rounded-xl bg-brand-blue/15 hover:bg-brand-blue/25 text-brand-cyan border border-brand-blue/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Conversation</span>
            </button>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
                Recent Queries
              </p>
              <div className="space-y-1">
                {sampleRecentConversations.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.title)}
                    className="w-full text-left p-2 rounded-lg hover:bg-navy-800 text-xs text-slate-300 hover:text-white transition-colors group flex items-start gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-cyan shrink-0 mt-0.5" />
                    <div className="flex-1 truncate">
                      <p className="truncate font-medium">{item.title}</p>
                      <span className="text-[10px] text-slate-500">{item.time}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RAG Information Pill */}
          <div className="p-3 bg-navy-950 border border-navy-800 rounded-xl text-xs space-y-1 text-slate-400">
            <div className="flex items-center gap-1.5 text-brand-cyan font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Knowledge Grounding</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Curated documents from Azure AI Search &amp; Placement Handbook index.
            </p>
          </div>
        </div>

        {/* Center/Main Chat Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-navy-950">
          {/* Header */}
          <div className="h-16 border-b border-navy-800 px-6 flex items-center justify-between bg-navy-900/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-white shadow-md shadow-brand-blue/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  PlacePrep AI
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Placement Preparation Assistant &bull; Grounded in Campus Resources
                </p>
              </div>
            </div>

            <button
              onClick={handleNewChat}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-navy-700 hover:bg-navy-800 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                      isUser
                        ? 'bg-brand-blue text-white shadow-sm'
                        : 'bg-navy-850 border border-navy-700 text-brand-cyan'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-2 max-w-[85%] sm:max-w-[78%]">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-brand-blue text-white rounded-tr-none shadow-md shadow-brand-blue/20'
                          : 'bg-navy-900 border border-navy-700/80 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-line prose-invert">
                        {msg.content}
                      </div>

                      {/* Copy Action Button */}
                      {!isUser && (
                        <div className="mt-3 pt-2 border-t border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
                          <span className="text-[11px] text-slate-400">AI Generated Guidance</span>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Grounded Sources Display */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="bg-navy-900/60 border border-navy-800 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                          <BookOpen className="w-3 h-3 text-brand-cyan" />
                          <span>Sources Grounded</span>
                        </div>
                        <ul className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, sIdx) => (
                            <li
                              key={sIdx}
                              className="px-2 py-0.5 rounded-md bg-navy-850 border border-navy-700/60 text-brand-cyan font-mono text-[11px]"
                            >
                              &bull; {src}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-xl mr-auto">
                <div className="w-8 h-8 rounded-lg bg-navy-850 border border-navy-700 text-brand-cyan flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-navy-900 border border-navy-700/80 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                  <span className="text-xs text-slate-400">PlacePrep AI is thinking</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-xl flex items-start justify-between gap-3 text-sm text-red-300">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold shrink-0 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          {messages.length <= 2 && (
            <div className="px-6 py-2 flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-navy-900 hover:bg-navy-850 border border-navy-700/80 text-slate-300 hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-4 sm:p-6 border-t border-navy-800 bg-navy-900/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-navy-950 border border-navy-700 rounded-xl p-2 focus-within:border-brand-blue transition-colors shadow-inner"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask PlacePrep anything about DSA, DBMS, OOP, or system design..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />

              {/* Speech Microphone Enhancement Icon */}
              <button
                type="button"
                className="p-2 rounded-lg text-slate-400 hover:text-brand-cyan hover:bg-navy-850 transition-colors"
                title="Voice input (Powered by Azure Speech STT)"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 rounded-lg bg-brand-blue hover:bg-blue-600 disabled:opacity-40 text-white font-semibold shadow-sm transition-all"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              PlacePrep AI is grounded in placement curriculum. All responses are AI-generated practice guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
