import React from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Markdown } from './Markdown';
import { EMISSION_FACTORS_LIST, MODE_NAMES } from '../utils';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionOptions?: Array<{ type: string; distance: number }>;
}

interface ChatWidgetProps {
  isLoggedIn: boolean;
  showFloatingChat: boolean;
  setShowFloatingChat: (show: boolean) => void;
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  isTyping: boolean;
  formType: string;
  handleSendChat: (text: string) => void;
  handleChatLog: (type: string, dist: number, messageId: string) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isLoggedIn,
  showFloatingChat,
  setShowFloatingChat,
  chatMessages,
  chatInput,
  setChatInput,
  isTyping,
  formType,
  handleSendChat,
  handleChatLog
}) => {
  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Floating Chat Panel */}
      {showFloatingChat && (
        <div className="w-80 sm:w-96 h-[480px] bg-slate-900/98 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.25s_ease-out]">
          {/* Header */}
          <div className="bg-[#0d1222] border-b border-slate-800 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 text-xs font-bold">
                AI
              </div>
              <div>
                <h4 className="font-bold text-[13px] text-slate-100">EcoGuide Assistant</h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowFloatingChat(false)}
              className="text-slate-400 hover:text-slate-100 text-xs font-semibold px-2 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-950/20">
            {chatMessages.map((msg) => {
              const isLegacy = ['gas_car', 'hybrid_car', 'electric_car', 'transit_bus', 'transit_train', 'escooter', 'walk_bike'].includes(formType);
              const unit = isLegacy ? 'miles' : (EMISSION_FACTORS_LIST.find(f => f.id === formType)?.unit ?? 'units');
              return (
                <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                  <span className="text-[9px] text-slate-500 mb-0.5">{msg.sender === 'bot' ? 'EcoGuide' : 'You'}</span>
                  
                  <div className={`p-3 rounded-xl text-[12.5px] leading-relaxed shadow-md ${msg.sender === 'user' ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-tr-none whitespace-pre-line' : 'bg-slate-900 border border-slate-800 rounded-tl-none text-slate-100'}`}>
                    {msg.sender === 'user' ? msg.text : <Markdown content={msg.text} />}
                  </div>

                  {msg.actionOptions && msg.actionOptions.length > 0 && (
                    <div className="w-full mt-2 p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-lg flex flex-col gap-1.5">
                      <span className="text-[9.5px] uppercase font-bold tracking-wider text-cyan-400 block mb-0.5">Log instantly:</span>
                      {msg.actionOptions.map((opt) => (
                        <button
                          key={opt.type}
                          onClick={() => handleChatLog(opt.type, opt.distance, msg.id)}
                          className="w-full bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 rounded-lg px-3 py-2 flex items-center justify-between text-[11.5px] transition-all text-slate-200"
                        >
                          <span>{MODE_NAMES[opt.type] || opt.type} ({opt.distance} {unit})</span>
                          <span className="text-emerald-400 font-bold">Log →</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {isTyping && (
              <div className="self-start flex flex-col items-start max-w-[80%]">
                <span className="text-[9px] text-slate-500 mb-0.5">EcoGuide</span>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-200"></span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Quick Chips */}
          <div className="px-4 py-2 border-t border-slate-800 bg-[#0d1222]/80 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSendChat('Plan commute')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors"
            >
              Plan commute
            </button>
            <button
              type="button"
              onClick={() => handleSendChat('Check budget')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors"
            >
              Check budget
            </button>
            <button
              type="button"
              onClick={() => handleSendChat('Carbon tips')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors"
            >
              Carbon tips
            </button>
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (chatInput.trim()) {
                handleSendChat(chatInput);
              }
            }}
            className="bg-[#0d1222] border-t border-slate-800 p-3 flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask EcoGuide..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[12.5px] text-slate-100 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 flex items-center justify-center text-slate-950 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bubble Button */}
      <button
        onClick={() => setShowFloatingChat(!showFloatingChat)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all relative border border-emerald-400/20"
        aria-label="Toggle AI assistant floating chat"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080b13]"></span>
      </button>
    </div>
  );
};
