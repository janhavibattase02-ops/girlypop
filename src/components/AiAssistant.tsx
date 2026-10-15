import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  ShieldAlert,
  Heart,
  Flame,
  HelpCircle,
  RefreshCw,
  User,
  Bot,
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { speakText, stopSpeaking } from '../utils/audioAlert';

interface AiAssistantProps {
  user: UserProfile;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  user,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      text: `Hey ${user.name || 'babe'}! 💖 I'm **GirlyPop**, your personal sisterly AI protector and reproductive health confidante.\n\nWhether you need tactical safety de-escalation tips, instant period cramp comfort, or confidential answers to sensitive vaginal questions—I'm here for you 24/7 with zero judgment and total privacy. How are you feeling today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Trigger initial prompt if sent from another screen
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userAge: user.age,
          conversationHistory: messages.map((m) => ({ role: m.role, text: m.text })),
          context: {
            userAge: user.age,
            hasEmergencyContacts: user.trustedContacts.length > 0,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      const reply = data.reply || "I am right here with you babe. What else can I guide you with?";

      const assistantMessage: ChatMessage = {
        id: 'msg_res_' + Date.now(),
        role: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error fetching assistant response:', err);
      const fallbackMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        text: `🌸 Honey, I hear you! Here is what you should do immediately:\n- Stay grounded and breathe deeply.\n- If this is an emergency, press the red SOS button or call emergency services.\n- If you have cramps, apply a heating pad, sip warm chamomile tea, and take a restful child's pose.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(text.replace(/[*_#]/g, ''));
      setIsSpeaking(true);
    }
  };

  const quickPrompts = [
    { label: '🚨 Walking alone & followed', prompt: 'I am walking alone at night and feel like a stranger is following me. What should I do right now?' },
    { label: '🩸 Severe period cramps relief', prompt: 'I have intense, sudden period cramps right now. Give me fast physical remedies and natural comfort tips.' },
    { label: '🌸 Discharge color decoder', prompt: 'Explain the difference between normal healthy vaginal discharge, ovulation discharge, and an infection like yeast or BV.' },
    { label: '🥑 Cycle syncing food tips', prompt: 'What are the best foods to eat during the luteal and menstrual phases to minimize bloating and fatigue?' },
    { label: '🩺 PCOS vs Endometriosis', prompt: 'How do I know if my irregular cycles and pelvic pain could be PCOS or Endometriosis?' },
  ];

  return (
    <div className="flex flex-col h-[78vh] max-w-4xl mx-auto rounded-3xl border border-[#9b5de5]/40 bg-[#241c2e]/95 overflow-hidden shadow-2xl text-white">
      {/* Top Header in Lavender & Soft Rose */}
      <div className="p-4 md:p-5 border-b border-[#9b5de5]/40 bg-gradient-to-r from-[#5a3e7a] via-[#7b4fa6] to-[#9b5de5] text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-[#5a723b]/40 border border-[#8fa963]/50 flex items-center justify-center text-[#d8ebbe]">
              <Sparkles className="w-6 h-6 animate-pulse text-[#97c458]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#1d2616]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-serif text-white">GirlyPop AI Sister</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5a723b]/30 text-[#d8ebbe] border border-[#8fa963]/40">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-[#b5c7a3]">
              Calibrated for age {user.age} • 100% Confidential Safety & Health Support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={() => {
                stopSpeaking();
                setIsSpeaking(false);
              }}
              className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" /> Stop Audio
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-[#141b0f]/90 border-b border-[#5a723b]/30 overflow-x-auto flex gap-2 no-scrollbar">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp.prompt)}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-[#253218] hover:bg-[#344622] hover:border-[#8fa963] border border-[#5a723b]/40 text-xs text-[#d8ebbe] hover:text-white transition cursor-pointer"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#2e3e1e] border border-[#5a723b]/60 flex items-center justify-center text-[#97c458] shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-[#5a723b] text-white rounded-tr-none border border-[#8fa963]/40'
                    : 'bg-[#222c1b] text-white rounded-tl-none border border-[#5a723b]/40'
                }`}
              >
                {/* Formatted body */}
                <div className="whitespace-pre-wrap space-y-1">
                  {m.text.split('\n').map((line, idx) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <div key={idx} className="font-bold text-[#d8ebbe] mt-2">
                          {line.replace(/\*\*/g, '')}
                        </div>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <div key={idx} className="flex items-start gap-1.5 pl-1 text-[#e1eed2]">
                          <span className="text-[#97c458] mt-1">•</span>
                          <span>{line.replace(/^- /, '')}</span>
                        </div>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10 text-[10px] text-[#b5c7a3]">
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => toggleSpeak(m.text)}
                      className="hover:text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3 text-[#97c458]" /> Read Aloud
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#5a723b]/40 border border-[#8fa963]/50 flex items-center justify-center text-white shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-[#2e3e1e] border border-[#5a723b]/60 flex items-center justify-center text-[#97c458] shrink-0">
              <Sparkles className="w-4 h-4 animate-spin text-[#97c458]" />
            </div>
            <div className="bg-[#222c1b] text-[#d8ebbe] rounded-2xl rounded-tl-none p-3.5 text-xs flex items-center gap-2 border border-[#5a723b]/40">
              <span className="w-2 h-2 rounded-full bg-[#97c458] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#97c458] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#97c458] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-[#b5c7a3] ml-1">GirlyPop is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 md:p-4 bg-[#141b0f]/90 border-t border-[#5a723b]/30 flex gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask GirlyPop about safety, cramps, discharge, or wellness..."
          className="flex-1 px-4 py-3 rounded-2xl bg-[#1d2616] border border-[#5a723b]/50 text-white placeholder:text-stone-500 focus:outline-none focus:border-[#97c458] text-xs md:text-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 md:px-5 md:py-3 rounded-2xl bg-gradient-to-r from-[#4f6631] to-[#5d773a] hover:from-[#5d773a] hover:to-[#6c8b43] disabled:opacity-40 text-white font-semibold text-xs md:text-sm shadow-lg flex items-center gap-1.5 transition cursor-pointer border border-[#8fa963]/40"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
