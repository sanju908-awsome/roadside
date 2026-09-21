import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Info,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, clearNotifications, markNotificationRead } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 bg-[#0B1F4B] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#00C2FF]" />
          <h3 className="font-bold text-sm">Notifications & Dispatch Updates</h3>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearNotifications}
              className="text-[11px] text-slate-300 hover:text-white underline"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 space-y-2">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold">No notifications right now</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-3 rounded-xl cursor-pointer transition-colors ${
                n.read ? 'bg-white opacity-70' : 'bg-cyan-50/50 border border-cyan-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
