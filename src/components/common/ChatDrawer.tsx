import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  User,
  Wrench,
  X,
  Sparkles,
} from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const { chatMessages, sendChatMessage, currentUser, activeRequest, currentRole } = useApp();
  const [inputMessage, setInputMessage] = useState('');

  if (!isOpen) return null;

  const quickReplies = currentRole === 'CUSTOMER'
    ? [
        'Hazard lights are flashing',
        'Parked right near the landmark',
        'Battery is completely dead',
        'How many minutes away are you?',
      ]
    : [
        'I am 3 minutes away',
        'I have arrived at the spot',
        'Looking for your vehicle',
        'Please stay safe inside the car',
      ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendChatMessage(text.trim());
    setInputMessage('');
  };

  const otherPersonName =
    currentRole === 'CUSTOMER'
      ? activeRequest?.mechanicOwnerName || 'Ravi (Technician)'
      : activeRequest?.customerName || 'Sanju (Customer)';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideLeft">
      {/* Drawer Header */}
      <div className="p-4 bg-[#0B1F4B] text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00C2FF]/20 border border-[#00C2FF] flex items-center justify-center font-bold text-white">
            {currentRole === 'CUSTOMER' ? (
              <Wrench className="w-5 h-5 text-[#00C2FF]" />
            ) : (
              <User className="w-5 h-5 text-[#00C2FF]" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>{otherPersonName}</span>
              <span className="w-2 h-2 rounded-full bg-[#19C37D] animate-pulse" />
            </h3>
            <span className="text-[11px] text-slate-300 font-mono">
              Job #{activeRequest?.id || 'ACTIVE'} • Live Dispatch Channel
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        <div className="text-center">
          <span className="text-[10px] font-semibold text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
            End-to-End Encrypted Assistance Dispatch
          </span>
        </div>

        {chatMessages.map((msg) => {
          const isMe = msg.senderRole === currentRole;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {isMe ? 'You' : msg.senderName}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-[#0B1F4B] text-white rounded-tr-xs shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Replies Chips */}
      <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {quickReplies.map((qr) => (
          <button
            key={qr}
            type="button"
            onClick={() => handleSend(qr)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap transition-colors flex-shrink-0"
          >
            {qr}
          </button>
        ))}
      </div>

      {/* Message Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputMessage);
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message ${otherPersonName}...`}
          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#00C2FF]"
        />
        <button
          type="submit"
          id="send-chat-btn"
          disabled={!inputMessage.trim()}
          className="p-2.5 bg-[#0B1F4B] hover:bg-[#163D7A] disabled:opacity-40 text-white rounded-xl transition-colors"
        >
          <Send className="w-4 h-4 text-[#00C2FF]" />
        </button>
      </form>
    </div>
  );
};
