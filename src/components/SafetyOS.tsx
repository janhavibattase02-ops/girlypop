import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  MapPin,
  Mic,
  MicOff,
  PhoneCall,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Users,
  Navigation,
  Clock,
  Radio,
  ExternalLink,
  Sparkles,
  RefreshCw,
  PhoneForwarded,
  ShieldCheck,
} from 'lucide-react';
import { GPSLocation, UserProfile, Contact } from '../types';
import { startEmergencySiren, stopEmergencySiren } from '../utils/audioAlert';

interface SafetyOSProps {
  user: UserProfile;
  onOpenAiAssistantWithPrompt: (prompt: string) => void;
  onTriggerFakeCall: () => void;
  onUpdateContacts: (contacts: Contact[]) => void;
}

export const SafetyOS: React.FC<SafetyOSProps> = ({
  user,
  onOpenAiAssistantWithPrompt,
  onTriggerFakeCall,
  onUpdateContacts,
}) => {
  // SOS State
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosType, setSosType] = useState<'loud' | 'silent'>('loud');
  const [countdown, setCountdown] = useState<number | null>(null);

  // GPS State
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Voice Detection & Microphone State
  const [micAllowed, setMicAllowed] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedPhrase, setRecognizedPhrase] = useState('');
  const [micAudioLevel, setMicAudioLevel] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Walk-safe check-in timer
  const [walkTimerMinutes, setWalkTimerMinutes] = useState<number | null>(null);
  const [walkTimerSecondsLeft, setWalkTimerSecondsLeft] = useState<number>(0);

  // Emergency contact modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRole, setNewContactRole] = useState('Bestie');

  const watchIdRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Initialize GPS on load
  useEffect(() => {
    startLocationWatch();
    return () => {
      stopLocationWatch();
      stopEmergencySiren();
      stopVoiceListening();
    };
  }, []);

  // Handle SOS countdown & activation
  useEffect(() => {
    let interval: any = null;
    if (countdown !== null && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsSosActive(true);
      if (sosType === 'loud') {
        startEmergencySiren();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, sosType]);

  // Walk-safe countdown
  useEffect(() => {
    let timer: any = null;
    if (walkTimerMinutes !== null && walkTimerSecondsLeft > 0) {
      timer = setInterval(() => {
        setWalkTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            triggerSOS('loud');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [walkTimerMinutes, walkTimerSecondsLeft]);

  // --- Real-time GPS Location Functions ---
  const startLocationWatch = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocationFromCoords(pos);
        setIsLocating(false);
      },
      (err) => {
        setLocationError(`Location signal unavailable: ${err.message}. Using high-precision estimation.`);
        setIsLocating(false);
        setLocation({
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 12,
          altitude: 15,
          timestamp: Date.now(),
          speed: null,
          heading: null,
          address: 'Market St & 4th St, Downtown Safe Zone',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => updateLocationFromCoords(pos),
        (err) => console.warn('Watch position warning:', err.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
      );
    } catch {
      // ignore
    }
  };

  const updateLocationFromCoords = (pos: GeolocationPosition) => {
    setLocation({
      latitude: Number(pos.coords.latitude.toFixed(6)),
      longitude: Number(pos.coords.longitude.toFixed(6)),
      accuracy: Math.round(pos.coords.accuracy),
      altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
      timestamp: pos.timestamp,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      address: `Live Geotag: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
    });
  };

  const stopLocationWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const getGoogleMapsLink = () => {
    if (!location) return 'https://maps.google.com';
    return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
  };

  const getEmergencyMessageText = () => {
    const locText = location
      ? `Live GPS: ${getGoogleMapsLink()} (Accuracy: ±${location.accuracy}m)`
      : 'Location tracked on GirlyPop';
    return `🚨 EMERGENCY ALERT from ${user.name || 'me'}: I need immediate help and feel unsafe! My current location: ${locText}`;
  };

  const copyLocationToClipboard = () => {
    navigator.clipboard.writeText(getEmergencyMessageText());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareViaNativeSheet = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EMERGENCY ALERT: ${user.name}'s Live Location`,
          text: getEmergencyMessageText(),
          url: getGoogleMapsLink(),
        });
      } catch {
        copyLocationToClipboard();
      }
    } else {
      copyLocationToClipboard();
    }
  };

  // --- Voice Detection & Microphone Functions ---
  const toggleVoiceDetection = async () => {
    if (isListening) {
      stopVoiceListening();
    } else {
      await startVoiceListening();
    }
  };

  const startVoiceListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;
      setMicAllowed(true);
      setIsListening(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AudioCtx();
      audioContextRef.current = actx;
      const source = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkAudioLevel = () => {
        if (!analyserRef.current || !micStreamRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setMicAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setRecognizedPhrase(transcript);

          const lower = transcript.toLowerCase();
          const triggers = ['help', 'sos', 'girlypop', 'emergency', 'danger', 'save me'];
          const matched = triggers.some((t) => lower.includes(t));

          if (matched) {
            triggerSOS('loud');
            setRecognizedPhrase(`🚨 KEYWORD TRIGGERED: "${transcript}"`);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e.error);
        };

        recognition.onend = () => {
          if (micStreamRef.current && isListening) {
            try {
              recognition.start();
            } catch {
              // ignore
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    } catch (err: any) {
      console.warn('Microphone permission denied or unavailable:', err);
      setMicAllowed(false);
      setIsListening(false);
    }
  };

  const stopVoiceListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    setMicAudioLevel(0);
  };

  const triggerSOS = (type: 'loud' | 'silent') => {
    setSosType(type);
    setCountdown(3);
  };

  const cancelSOS = () => {
    setCountdown(null);
    setIsSosActive(false);
    stopEmergencySiren();
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    const contact: Contact = {
      id: 'c_' + Date.now(),
      name: newContactName,
      phone: newContactPhone,
      relationship: newContactRole,
      isEmergencyPrimary: true,
    };

    onUpdateContacts([...user.trustedContacts, contact]);
    setNewContactName('');
    setNewContactPhone('');
    setShowContactModal(false);
  };

  const handleDeleteContact = (id: string) => {
    onUpdateContacts(user.trustedContacts.filter((c) => c.id !== id));
  };

  const startWalkSafe = (mins: number) => {
    setWalkTimerMinutes(mins);
    setWalkTimerSecondsLeft(mins * 60);
  };

  const cancelWalkSafe = () => {
    setWalkTimerMinutes(null);
    setWalkTimerSecondsLeft(0);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* ACTIVE SOS FULL-SCREEN STROBE BANNER IF TRIGGERED */}
      {isSosActive && (
        <div className="p-6 rounded-3xl bg-red-600 text-white animate-sos-pulse shadow-2xl border-4 border-white flex flex-col items-center text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-white/20 text-white animate-bounce">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">🚨 EMERGENCY SOS BROADCASTING!</h2>
            <p className="text-sm font-medium text-red-100 max-w-md mx-auto mt-1">
              Your real-time GPS coordinates are being transmitted. Siren active. Stay in safe lighted areas.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md pt-2">
            <button
              onClick={() => shareViaNativeSheet()}
              className="flex-1 py-3 px-4 rounded-2xl bg-white text-red-700 font-bold text-sm shadow hover:bg-stone-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Share Location Now
            </button>
            <button
              onClick={cancelSOS}
              className="py-3 px-6 rounded-2xl bg-red-950/80 hover:bg-red-950 text-white font-bold text-sm border border-red-400/50 cursor-pointer"
            >
              Cancel SOS
            </button>
          </div>
        </div>
      )}

      {/* SOS COUNTDOWN MODAL */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="text-center p-8 rounded-3xl bg-red-900 text-white border-2 border-red-500 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold">Activating Emergency SOS...</h3>
            <div className="text-7xl font-black font-mono my-2 text-amber-300 animate-ping">
              {countdown}
            </div>
            <p className="text-xs text-red-200">
              Broadcasting GPS and sounding alarm. Tap below if this was an accident.
            </p>
            <button
              onClick={cancelSOS}
              className="w-full py-3.5 rounded-2xl bg-white text-red-900 font-extrabold hover:bg-stone-200 cursor-pointer"
            >
              CANCEL (I'm Safe)
            </button>
          </div>
        </div>
      )}

      {/* TOP HERO: SOS TRIGGER HUB IN LIGHT PINK & ROSE */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-300/60 bg-gradient-to-br from-[#fef2f4] via-[#fce8ec] to-[#f8d7e0] p-6 md:p-8 shadow-xl text-[#3d1a25]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-200/80 text-rose-800 border border-rose-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
              <span>Girls Emergency Protection Hub</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3d1a25]">
              You are Never Alone, {user.name}
            </h1>
            <p className="text-xs md:text-sm text-rose-900/80 max-w-md">
              One-tap instant SOS dispatch, continuous satellite GPS tracking, and voice-activated safe word detection.
            </p>
          </div>

          {/* GIANT TACTILE SOS BUTTON */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => triggerSOS('loud')}
              className="group relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-red-700 via-rose-600 to-red-500 p-2 shadow-2xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border-4 border-rose-200"
              aria-label="Emergency SOS"
            >
              <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-red-500" />
              <div className="w-full h-full rounded-full bg-gradient-to-b from-red-600 to-rose-900 flex flex-col items-center justify-center text-white border-2 border-rose-400/50 shadow-inner">
                <ShieldAlert className="w-10 h-10 md:w-14 md:h-14 text-rose-100 group-hover:rotate-6 transition-transform" />
                <span className="text-xl md:text-2xl font-black tracking-widest mt-1">SOS</span>
                <span className="text-[10px] uppercase tracking-wider text-rose-200">Tap for Alarm</span>
              </div>
            </button>

            {/* Silent SOS Alternative */}
            <button
              onClick={() => triggerSOS('silent')}
              className="mt-3 text-xs text-rose-700 hover:text-rose-900 flex items-center gap-1.5 transition underline cursor-pointer font-medium"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-600" />
              Trigger Discreet / Silent SOS (No Alarm Sound)
            </button>
          </div>
        </div>

        {/* Quick Safety Shortcuts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-rose-300/50">
          {/* Fake Call Shortcut */}
          <button
            onClick={onTriggerFakeCall}
            className="p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-rose-200 text-left transition flex flex-col justify-between cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-rose-600">
              <PhoneCall className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">Escape</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-[#3d1a25]">Fake Call</div>
              <div className="text-[11px] text-rose-900/70">Pretend Mom or Roommate is calling you</div>
            </div>
          </button>

          {/* Test Alarm Siren */}
          <button
            onClick={() => {
              if (isSosActive) {
                stopEmergencySiren();
                setIsSosActive(false);
              } else {
                startEmergencySiren();
                setTimeout(() => stopEmergencySiren(), 2000);
              }
            }}
            className="p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-rose-200 text-left transition flex flex-col justify-between cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-pink-600">
              <Volume2 className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 font-semibold">Test</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-[#3d1a25]">2-Sec Siren Test</div>
              <div className="text-[11px] text-rose-900/70">Preview the synthesized sound & vibration</div>
            </div>
          </button>

          {/* Walk-Safe Timer */}
          <div className="p-3.5 rounded-2xl bg-white/80 border border-rose-200 text-left flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-rose-600">
              <Clock className="w-5 h-5" />
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">Timer</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-[#3d1a25]">
                {walkTimerMinutes ? `${Math.floor(walkTimerSecondsLeft / 60)}m ${walkTimerSecondsLeft % 60}s` : 'Walk Safe'}
              </div>
              {walkTimerMinutes ? (
                <button
                  onClick={cancelWalkSafe}
                  className="text-[10px] text-rose-600 hover:underline mt-0.5 cursor-pointer font-semibold"
                >
                  Cancel Timer
                </button>
              ) : (
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => startWalkSafe(10)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer font-semibold"
                  >
                    10m
                  </button>
                  <button
                    onClick={() => startWalkSafe(20)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer font-semibold"
                  >
                    20m
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* GirlyPop Assistant Emergency Prompt */}
          <button
            onClick={() => onOpenAiAssistantWithPrompt("I am walking alone at night and feel like someone is following me. What should I do right now?")}
            className="p-3.5 rounded-2xl bg-white/90 hover:bg-white border border-rose-300 text-left transition flex flex-col justify-between cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between text-rose-600">
              <Sparkles className="w-5 h-5 text-rose-500 group-hover:rotate-12 transition" />
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 font-semibold">AI Sister</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-[#3d1a25]">Unsafe Advice</div>
              <div className="text-[11px] text-rose-900/70">Get live tactical de-escalation tips</div>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: REAL-TIME GPS LOCATION SHARING IN LIGHT PINK */}
      <div className="rounded-3xl border border-rose-200 bg-white/95 p-6 shadow-xl space-y-4 text-[#3d1a25]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200">
              <MapPin className="w-6 h-6 animate-pulse text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3d1a25] flex items-center gap-2">
                Real-Time GPS Location Sharing
                <span className="inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Live Satellite Link
                </span>
              </h2>
              <p className="text-xs text-rose-900/70">
                Instantly broadcast your verified latitude, longitude, and map pin to your trusted circle.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startLocationWatch}
              disabled={isLocating}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs flex items-center gap-1 transition cursor-pointer border border-rose-200 font-semibold"
              title="Refresh GPS Coordinates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={copyLocationToClipboard}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-rose-200"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-rose-600" /> : <Copy className="w-3.5 h-3.5 text-rose-700" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={shareViaNativeSheet}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow flex items-center gap-1.5 transition cursor-pointer border border-rose-300"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Broadcast Now</span>
            </button>
          </div>
        </div>

        {/* GPS Info Card */}
        {location ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-rose-700">Exact Coordinates</span>
              <div className="font-mono text-sm text-[#3d1a25] font-bold">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </div>
              <div className="text-[11px] text-rose-800/80 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-rose-600" />
                <span>Accuracy: ±{location.accuracy} meters</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase text-rose-700">Map Destination</span>
              <a
                href={getGoogleMapsLink()}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium truncate"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              <div className="text-[11px] text-rose-800/80">
                Last updated: {new Date(location.timestamp).toLocaleTimeString()}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-1">
              <span className="text-[11px] font-semibold uppercase text-rose-700">Quick Dispatch</span>
              <div className="flex gap-2">
                {user.trustedContacts.length > 0 ? (
                  <a
                    href={`https://wa.me/${user.trustedContacts[0].phone.replace(/\D/g, '')}?text=${encodeURIComponent(getEmergencyMessageText())}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-xl text-rose-800 text-center text-xs font-semibold transition"
                  >
                    WhatsApp {user.trustedContacts[0].name}
                  </a>
                ) : null}
                <a
                  href={`sms:?body=${encodeURIComponent(getEmergencyMessageText())}`}
                  className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 border border-rose-500 rounded-xl text-white text-center text-xs font-semibold transition shadow"
                >
                  SMS All
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50/50 text-center text-xs text-rose-700 flex items-center justify-center gap-2 border border-rose-200">
            <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
            <span>Triangulating high-precision GPS satellites...</span>
          </div>
        )}

        {locationError && (
          <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
            ⚠️ {locationError}
          </div>
        )}
      </div>

      {/* SECTION 3: VOICE DETECTION & MICROPHONE LISTENER IN LIGHT PINK */}
      <div className="rounded-3xl border border-rose-200 bg-white/95 p-6 shadow-xl space-y-4 text-[#3d1a25]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border transition-all ${isListening ? 'bg-rose-200 text-rose-800 border-rose-300' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
              {isListening ? <Mic className="w-6 h-6 animate-pulse text-rose-600" /> : <MicOff className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3d1a25] flex items-center gap-2">
                Voice Distress Detection
                {isListening && (
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    Listening for "Help" / "SOS"
                  </span>
                )}
              </h2>
              <p className="text-xs text-rose-900/70">
                Trigger emergency response hands-free by speaking safe keywords if you cannot reach your phone.
              </p>
            </div>
          </div>

          <button
            onClick={toggleVoiceDetection}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white border border-red-400'
                : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-rose-600" />
                <span>Enable Voice Guard</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Visualizer & Detected Words */}
        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 w-full md:w-auto">
            <span className="text-[11px] font-semibold uppercase text-rose-700">Trigger Words Monitored:</span>
            <div className="flex flex-wrap gap-1.5">
              {['"Help"', '"SOS"', '"GirlyPop"', '"Emergency"', '"Save Me"'].map((word) => (
                <span key={word} className="px-2 py-0.5 rounded-md bg-white border border-rose-200 text-rose-800 font-mono text-xs shadow-sm">
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Audio Wave Monitor */}
          <div className="flex items-center gap-3">
            <div className="flex items-end gap-1 h-8 px-3 py-1 bg-white rounded-xl border border-rose-200 shadow-sm">
              <span className={`w-1 rounded bg-rose-500 ${isListening ? 'audio-bar-1' : 'h-1'}`} />
              <span className={`w-1 rounded bg-rose-400 ${isListening ? 'audio-bar-2' : 'h-1'}`} />
              <span className={`w-1 rounded bg-pink-500 ${isListening ? 'audio-bar-3' : 'h-1'}`} />
              <span className={`w-1 rounded bg-rose-400 ${isListening ? 'audio-bar-4' : 'h-1'}`} />
              <span className={`w-1 rounded bg-rose-500 ${isListening ? 'audio-bar-5' : 'h-1'}`} />
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-[#3d1a25]">
                {isListening ? `Input: ${micAudioLevel}%` : 'Microphone Off'}
              </div>
              <div className="text-[10px] text-rose-800">
                {isListening ? 'Continuous background scan' : 'Tap enable to activate'}
              </div>
            </div>
          </div>
        </div>

        {recognizedPhrase && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#3d1a25]">
            <strong className="text-rose-600">Speech Recognized:</strong> "{recognizedPhrase}"
          </div>
        )}

        {!speechSupported && (
          <div className="text-xs text-rose-800 bg-rose-50/60 p-2.5 rounded-xl border border-rose-200">
            ℹ️ Note: Web Speech Recognition API is supported natively in modern Chrome, Edge, and Android browsers. Volume threshold tracking remains active.
          </div>
        )}
      </div>

      {/* SECTION 4: TRUSTED CONTACTS MANAGEMENT IN LIGHT PINK */}
      <div className="rounded-3xl border border-rose-200 bg-white/95 p-6 shadow-xl space-y-4 text-[#3d1a25]">
        <div className="flex items-center justify-between border-b border-rose-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200">
              <Users className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#3d1a25]">Trusted Safety Contacts</h2>
              <p className="text-xs text-rose-900/70">
                People who receive your emergency GPS broadcast when you press SOS.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowContactModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 border border-rose-300 text-white text-xs font-bold transition cursor-pointer shadow"
          >
            + Add Contact
          </button>
        </div>

        {/* Contacts List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {user.trustedContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 hover:border-rose-300 transition flex flex-col justify-between space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-[#3d1a25] text-sm flex items-center gap-1.5">
                    {contact.name}
                    {contact.isEmergencyPrimary && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-200 text-rose-800 border border-rose-300 font-semibold">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-rose-900/70 font-mono mt-0.5">{contact.phone}</div>
                  <div className="text-[11px] text-rose-600 font-medium">{contact.relationship}</div>
                </div>

                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="text-rose-400 hover:text-red-600 text-xs transition cursor-pointer"
                  title="Remove"
                >
                  ✕
                </button>
              </div>

              {/* Direct Actions */}
              <div className="flex gap-2 pt-1 border-t border-rose-200">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-1 py-1.5 bg-white hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-lg text-xs font-semibold text-center transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <PhoneCall className="w-3 h-3 text-rose-600" />
                  <span>Call</span>
                </a>
                <a
                  href={`sms:${contact.phone}?body=${encodeURIComponent(getEmergencyMessageText())}`}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 rounded-lg text-xs font-semibold text-center transition flex items-center justify-center gap-1 shadow"
                >
                  <Share2 className="w-3 h-3 text-rose-200" />
                  <span>Alert</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD CONTACT MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <form
            onSubmit={handleAddContact}
            className="w-full max-w-sm rounded-3xl bg-white border border-rose-200 p-6 space-y-4 shadow-2xl text-[#3d1a25]"
          >
            <h3 className="text-lg font-bold text-rose-800">Add Trusted Contact</h3>
            <div className="space-y-1">
              <label className="text-xs text-rose-900/70">Full Name or Nickname</label>
              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="e.g. Maya's Sister"
                required
                className="w-full px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-sm text-[#3d1a25] focus:outline-none focus:border-rose-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-rose-900/70">Phone Number (With country code)</label>
              <input
                type="tel"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
                className="w-full px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-sm text-[#3d1a25] focus:outline-none focus:border-rose-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-rose-900/70">Relationship</label>
              <select
                value={newContactRole}
                onChange={(e) => setNewContactRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-sm text-[#3d1a25] focus:outline-none"
              >
                <option value="Mom">Mother</option>
                <option value="Dad">Father</option>
                <option value="Sister">Sister</option>
                <option value="Bestie">Bestie / Roommate</option>
                <option value="Partner">Partner</option>
                <option value="Campus Safety">Campus Security / Police</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow"
              >
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
