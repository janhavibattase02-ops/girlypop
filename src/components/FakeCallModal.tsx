import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Volume2, UserCheck, Sparkles } from 'lucide-react';
import { startFakeCallRingtone, stopFakeCallRingtone, speakText, stopSpeaking } from '../utils/audioAlert';

interface FakeCallModalProps {
  onClose: () => void;
  callerName?: string;
  userName?: string;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({
  onClose,
  callerName = 'Mom ❤️',
  userName = 'Maya',
}) => {
  const [callState, setCallState] = useState<'incoming' | 'active'>('incoming');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    startFakeCallRingtone();
    return () => {
      stopFakeCallRingtone();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (callState === 'active') {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  const handleAccept = () => {
    stopFakeCallRingtone();
    setCallState('active');

    // Simulate realistic voice speaking through phone speaker
    const callScript = `Hey ${userName}! Where are you right now? I'm waiting in the car right outside with the hazards on. Come right out, I see you!`;
    setTimeout(() => {
      speakText(callScript);
    }, 400);
  };

  const handleDeclineOrHangup = () => {
    stopFakeCallRingtone();
    stopSpeaking();
    onClose();
  };

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-stone-950/95 text-white p-8 select-none backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-col items-center justify-center pt-10 space-y-2">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-rose-800 to-amber-700 p-1 flex items-center justify-center shadow-2xl">
          <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center text-3xl font-bold font-serif text-rose-200">
            {callerName.slice(0, 1)}
          </div>
        </div>

        <h1 className="text-3xl font-serif font-bold text-stone-100 tracking-wide mt-2">
          {callerName}
        </h1>

        <p className="text-sm font-medium text-rose-300">
          {callState === 'incoming' ? (
            <span className="animate-pulse">Incoming Call • Mobile</span>
          ) : (
            <span className="font-mono text-emerald-400">{formatCallTime(duration)}</span>
          )}
        </p>

        {callState === 'active' && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-xs text-rose-200 mt-2">
            <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Voice Audio Active: "I am waiting outside..."</span>
          </div>
        )}
      </div>

      {/* Realistic Interactive Call Controls */}
      {callState === 'active' && (
        <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto my-auto w-full">
          <div className="flex flex-col items-center gap-1 text-xs text-stone-400">
            <div className="p-4 rounded-full bg-stone-800 text-stone-200">
              <Mic className="w-6 h-6" />
            </div>
            <span>Mute</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-xs text-stone-400">
            <div className="p-4 rounded-full bg-stone-800 text-stone-200">
              <Volume2 className="w-6 h-6" />
            </div>
            <span>Speaker</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-xs text-stone-400">
            <div className="p-4 rounded-full bg-stone-800 text-stone-200">
              <UserCheck className="w-6 h-6" />
            </div>
            <span>Contacts</span>
          </div>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="pb-8 max-w-sm mx-auto w-full">
        {callState === 'incoming' ? (
          <div className="flex items-center justify-around">
            {/* Decline */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleDeclineOrHangup}
                className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-900/50 transition active:scale-95 cursor-pointer"
                aria-label="Decline"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <span className="text-xs text-stone-300 font-medium">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAccept}
                className="w-18 h-18 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-900/50 transition active:scale-95 animate-bounce cursor-pointer"
                aria-label="Accept"
              >
                <Phone className="w-8 h-8" />
              </button>
              <span className="text-xs text-stone-300 font-medium">Accept</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleDeclineOrHangup}
              className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-900/60 transition active:scale-95 cursor-pointer"
              aria-label="End Call"
            >
              <PhoneOff className="w-9 h-9" />
            </button>
            <span className="text-xs text-stone-400 font-medium">End Call & Return to Safety OS</span>
          </div>
        )}
      </div>
    </div>
  );
};
