"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, BarChart3, AlertCircle, Info, Check, Trash2 } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { formatDistanceToNow } from "date-fns";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick: (action: any) => void;
}

export function NotificationCenter({ isOpen, onClose, onActionClick }: NotificationCenterProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, removeNotification } = useBudgetStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'report': return <BarChart3 className="w-5 h-5 text-[#0A84FF]" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-[#FF453A]" />;
      default: return <Info className="w-5 h-5 text-[#30D158]" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'report': return 'bg-[#0A84FF]/15 border-[#0A84FF]/20';
      case 'alert': return 'bg-[#FF453A]/15 border-[#FF453A]/20';
      default: return 'bg-[#30D158]/15 border-[#30D158]/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm z-[110] bg-[#0A0A0C] border-l border-white/5 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Bell className="w-5 h-5 text-white/70" />
                </div>
                <h2 className="text-xl font-medium text-white tracking-tight">Notifications</h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4 mt-20">
                  <Bell className="w-12 h-12 stroke-[1]" />
                  <span className="text-sm">You're all caught up.</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <button 
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs text-white/40 hover:text-white transition-colors font-medium flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  </div>
                  
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`flex gap-4 p-4 rounded-[20px] transition-colors relative group ${notif.read ? 'bg-white/5 border border-white/5' : 'bg-white/10 border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'}`}
                      >
                        {!notif.read && (
                          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#0A84FF] shadow-[0_0_8px_#0A84FF]" />
                        )}
                        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border ${getBg(notif.type)}`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex flex-col pr-4">
                          <span className={`font-semibold text-sm mb-1 tracking-tight ${notif.read ? 'text-white/80' : 'text-white'}`}>
                            {notif.title}
                          </span>
                          <span className="text-xs text-white/50 leading-relaxed mb-3">
                            {notif.message}
                          </span>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                              {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                            </span>
                            
                            {notif.action && (
                              <button 
                                onClick={() => {
                                  markNotificationRead(notif.id);
                                  onActionClick(notif.action);
                                }}
                                className="text-xs font-semibold text-[#0A84FF] hover:text-[#5E9FFF] transition-colors"
                              >
                                {notif.action.label}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Delete Button (appears on hover) */}
                        <button
                          onClick={() => removeNotification(notif.id)}
                          className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-black border border-white/10 items-center justify-center text-white/40 hover:text-[#FF453A] hover:border-[#FF453A]/50 transition-colors opacity-0 group-hover:opacity-100 flex shadow-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
