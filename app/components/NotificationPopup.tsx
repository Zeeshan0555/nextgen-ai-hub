'use client';

import { useState, useEffect } from 'react';
import { Bell, X, ShieldAlert } from 'lucide-react';

export default function NotificationPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const dismissed = localStorage.getItem('neurowire_notif_dismissed');
      if (!dismissed) setShowPopup(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    if (!('Notification' in window)) {
      setPermissionMessage('This browser does not support notifications.');
      return;
    }

    try {
      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

      if (permission === 'granted') {
        setPermissionMessage('Browser permission granted. News alerts are not connected yet.');
      } else if (permission === 'denied') {
        setPermissionMessage('Notification permission was denied in your browser settings.');
      } else {
        setPermissionMessage('Notification permission was not granted.');
      }
    } catch {
      setPermissionMessage('Could not request notification permission in this browser.');
    }
  };

  const handleSkip = () => {
    setShowPopup(false);
    localStorage.setItem('neurowire_notif_dismissed', 'true');
  };

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[90] max-w-sm w-full bg-[#070b19]/95 border border-blue-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-6 duration-400 text-slate-100">
      <div className="flex items-start space-x-3.5">
        <div className="p-3 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 shrink-0">
          <Bell className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] font-['Space_Grotesk'] text-slate-200 tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
              BROWSER NOTIFICATIONS
            </span>
            <button
              onClick={handleSkip}
              className="text-slate-500 hover:text-white transition-colors p-1"
              aria-label="Dismiss notification settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            You can allow this browser to show notifications. Breaking-news alerts are not connected yet.
          </p>

          {permissionMessage && (
            <p role="status" className="text-xs text-cyan-300 mb-3 leading-relaxed">
              {permissionMessage}
            </p>
          )}

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleAllow}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs py-2 px-3 rounded-xl transition-all font-medium border border-blue-400/20"
            >
              Request Permission
            </button>
            <button
              onClick={handleSkip}
              className="px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs py-2 rounded-xl transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
