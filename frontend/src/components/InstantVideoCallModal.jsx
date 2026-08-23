import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wrench,
  X,
  CreditCard,
  RefreshCw,
  Maximize2,
  Minimize2,
  Volume2,
  ChevronRight,
  HelpCircle,
  Camera,
  Layers,
  MessageSquare,
  Send,
  Zap,
} from 'lucide-react';

const ONLINE_EXPERTS = [
  {
    id: 'vikram',
    name: 'Vikram Malhotra',
    role: 'Senior Electrician & Wireman',
    category: 'Electrician',
    rating: 4.95,
    callsCompleted: 342,
    city: 'New Delhi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-a-fuse-box-41716-large.mp4',
    badge: 'Cooperative Master Pro',
    tips: [
      'Identify your main MCB isolator switch first.',
      'Check for any burning odor or blackened screw terminals.',
      'Do not touch exposed copper wires with wet hands.',
    ],
  },
  {
    id: 'ramesh',
    name: 'Ramesh Verma',
    role: 'Senior Plumber & Hydraulics',
    category: 'Plumber',
    rating: 4.98,
    callsCompleted: 512,
    city: 'Delhi NCR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    badge: 'Cooperative Master Pro',
    tips: [
      'Locate the clockwise shut-off angle valve under the sink.',
      'Wrap 4-5 rounds of Teflon tape clockwise on threads.',
      'Ensure the black rubber O-ring is seated flat in the joint.',
    ],
  },
  {
    id: 'sunita',
    name: 'Sunita Sharma',
    role: 'AC & Appliance Diagnostic Tech',
    category: 'Technician',
    rating: 4.92,
    callsCompleted: 289,
    city: 'Ghaziabad',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    badge: 'Certified Technician',
    tips: [
      'Turn off the AC remote and unplug the main 16A socket.',
      'Open front panel clips gently to inspect dust mesh.',
      'Check if condensate drain pipe has a downward slope.',
    ],
  },
];

const InstantVideoCallModal = ({ isOpen, onClose, preselectedCategory = 'Plumber', initialIssueTitle = '' }) => {
  const { user } = useAuth();

  // Call Lifecycle: 'preview' -> 'connecting' -> 'active' -> 'completed'
  const [callState, setCallState] = useState('preview');
  const [selectedCategory, setSelectedCategory] = useState(preselectedCategory || 'Plumber');
  const [activeExpert, setActiveExpert] = useState(ONLINE_EXPERTS[1]); // Default Ramesh (Plumber)
  const [callSeconds, setCallSeconds] = useState(15 * 60); // 15 mins
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'expert', text: 'Namaste! Main live video call par aapke sath jud gaya hoon. Camera ko problem ki taraf point karein.' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Pick expert based on category
  useEffect(() => {
    if (selectedCategory === 'Electrician') {
      setActiveExpert(ONLINE_EXPERTS[0]);
    } else if (selectedCategory === 'Technician' || selectedCategory === 'Painter') {
      setActiveExpert(ONLINE_EXPERTS[2]);
    } else {
      setActiveExpert(ONLINE_EXPERTS[1]);
    }
  }, [selectedCategory]);

  // Sync category if prop changes
  useEffect(() => {
    if (preselectedCategory) {
      setSelectedCategory(preselectedCategory);
    }
  }, [preselectedCategory]);

  // Call timer countdown when active
  useEffect(() => {
    let interval = null;
    if (callState === 'active' && callSeconds > 0) {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev - 1);
      }, 1000);
    } else if (callSeconds === 0 && callState === 'active') {
      setCallState('completed');
    }
    return () => clearInterval(interval);
  }, [callState, callSeconds]);

  // Clean up media streams on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCallState('preview');
      setCallSeconds(15 * 60);
      setIsMuted(false);
      setIsVideoOff(false);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable, using customer avatar feed fallback:', err.message);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const [underDevAlert, setUnderDevAlert] = useState(false);

  const handleStartCallFlow = () => {
    setUnderDevAlert(true);
    alert('This Instant 1-on-1 Video Call feature is currently under development. Stay tuned for full launch!');
  };

  const handleEndCall = () => {
    stopCamera();
    setCallState('completed');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: inputMessage.trim() }]);
    setInputMessage('');

    // Auto simulated technician advice reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'expert',
          text: 'Ji, maine dekh liya. Aap valve ko right side turn kijiye, paani band ho jayega.',
        },
      ]);
    }, 1500);
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-slate-900 text-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* =========================================================================
            STATE 1: PREVIEW & EXPERT MATCHING (Before Call Starts)
           ========================================================================= */}
        {callState === 'preview' && (
          <div>
            {/* Top Gradient Banner */}
            <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shadow-inner">
                  <Video className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                      Instant Video Call Assistance
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" /> 60s Connect
                    </span>
                  </div>
                  <p className="text-xs text-teal-200 mt-0.5">
                    Live 1-on-1 video guidance from a verified cooperative master technician for quick fixes & triage.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {underDevAlert && (
                <div className="p-4 bg-amber-500/20 border-2 border-amber-400 rounded-2xl text-amber-200 text-xs font-extrabold flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>This Instant 1-on-1 Video Call feature is currently under development. Stay tuned for full launch!</span>
                  </div>
                  <button onClick={() => setUnderDevAlert(false)} className="text-white hover:underline text-[10px] uppercase tracking-wider font-black shrink-0">
                    Dismiss
                  </button>
                </div>
              )}
              {/* Category Picker Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                  1. Select Service Category:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Plumber', label: '🚰 Plumbing & Water' },
                    { id: 'Electrician', label: '⚡ Electrical & MCB' },
                    { id: 'Technician', label: '❄️ AC & Appliances' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                        selectedCategory === cat.id
                          ? 'bg-teal-700 text-white border-teal-500 shadow-md ring-2 ring-teal-500/30'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched Live Online Master Expert Card */}
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Assigned Online Master Expert:
                  </span>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready to Connect
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={activeExpert.avatar}
                      alt={activeExpert.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900">
                      ✓
                    </div>
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-base text-white">{activeExpert.name}</h4>
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {activeExpert.rating}
                      </span>
                    </div>
                    <p className="text-xs text-teal-300 font-semibold">{activeExpert.role}</p>
                    <p className="text-[11px] text-slate-400">
                      📍 {activeExpert.city} • {activeExpert.callsCompleted}+ video assist sessions completed
                    </p>
                  </div>
                </div>

                {/* Common Guidance Points */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-teal-400" /> What you will get on this call:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>Step-by-step camera inspection of your problem & emergency safety triage.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>DIY repair guidance or verification of whether physical replacement is required.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pricing & 1-Click Pay & Connect */}
              <div className="p-4 bg-gradient-to-r from-teal-950 to-slate-900 rounded-2xl border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white">₹49</span>
                    <span className="text-xs text-slate-400 line-through">₹199</span>
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded uppercase">
                      75% OFF Video Pilot
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-300 mt-0.5 font-medium">
                    15-Minute Live Consultation • 95% goes directly to the cooperative worker
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartCallFlow}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Video className="w-4 h-4 fill-slate-950" />
                  <span>Start Live Video Call (₹49)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: CONNECTING / CALLING RING ANIMATION
           ========================================================================= */}
        {callState === 'connecting' && (
          <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[420px]">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-teal-500/30 flex items-center justify-center animate-ping absolute inset-0" />
              <img
                src={activeExpert.avatar}
                alt={activeExpert.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-teal-400 shadow-2xl relative z-10"
              />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Connecting with Master Technician...
              </span>
              <h3 className="text-xl font-black text-white">{activeExpert.name}</h3>
              <p className="text-xs text-slate-400">{activeExpert.role} • Ringing...</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold animate-pulse">
              <ShieldCheck className="w-4 h-4" /> End-to-End Encrypted SevaSetu Video Room
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 3: ACTIVE VIDEO CALL ROOM
           ========================================================================= */}
        {callState === 'active' && (
          <div className="relative h-[550px] bg-slate-950 flex flex-col justify-between overflow-hidden">
            {/* Top In-Call Header HUD */}
            <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-slate-950/90 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-teal-400/50 shrink-0">
                  <img src={activeExpert.avatar} alt={activeExpert.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-white">{activeExpert.name}</h4>
                    <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-full uppercase">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-300">{activeExpert.role}</p>
                </div>
              </div>

              {/* Timer HUD */}
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-xs font-mono font-black text-white">{formatTimer(callSeconds)}</span>
              </div>
            </div>

            {/* Main Stage: Remote Technician Video Stream */}
            <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
              <img
                src={activeExpert.avatar}
                alt="Live stream"
                className="w-full h-full object-cover opacity-90 filter brightness-95"
              />

              {/* Live Audio Waveform Indicator */}
              <div className="absolute top-20 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs text-teal-300">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Expert Audio Connected</span>
              </div>

              {/* Customer PIP (Picture in Picture) Local WebCam Video Feed */}
              <div className="absolute bottom-20 right-4 w-32 h-44 sm:w-40 sm:h-52 bg-slate-950 rounded-2xl overflow-hidden border-2 border-teal-400/60 shadow-2xl z-20 group">
                {isCameraActive && !isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-2 text-center">
                    <Camera className="w-6 h-6 mb-1 text-teal-400" />
                    <span className="text-[10px] font-bold text-white">Your Camera</span>
                  </div>
                )}
                <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded">
                  You
                </span>
              </div>

              {/* Chat Drawer Overlay */}
              {showChat && (
                <div className="absolute inset-y-16 left-4 w-72 bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3 z-30 flex flex-col justify-between shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-teal-300 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" /> In-Call Chat & Steps
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowChat(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 overflow-y-auto flex-1 py-2 text-xs">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-xl text-xs max-w-[85%] ${
                          msg.sender === 'expert'
                            ? 'bg-teal-900/80 text-white rounded-tl-none border border-teal-700'
                            : 'bg-slate-800 text-slate-200 ml-auto rounded-tr-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-1.5 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type a question..."
                      className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Bottom HUD Call Control Bar */}
            <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-center gap-4">
              {/* Mic Button */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-slate-800/90 text-white hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Video Button */}
              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800/90 text-white hover:bg-slate-700'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              {/* Chat Toggle */}
              <button
                type="button"
                onClick={() => setShowChat(!showChat)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  showChat ? 'bg-teal-600 text-white' : 'bg-slate-800/90 text-white hover:bg-slate-700'
                }`}
                title="Open Live Chat"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="px-6 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 4: CALL COMPLETED & RESOLUTION SUMMARY
           ========================================================================= */}
        {callState === 'completed' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Video Consultation Completed!</h3>
              <p className="text-xs text-slate-400">
                You successfully consulted with <strong>{activeExpert.name}</strong> ({activeExpert.role}).
              </p>
            </div>

            {/* Savings & Rating Card */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3 max-w-md mx-auto text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Consultation Fee Paid:</span>
                <span className="font-bold text-white">₹49</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Estimated Visit Charge Saved:</span>
                <span className="font-black text-emerald-400">₹190 - ₹240 Saved!</span>
              </div>

              <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-white">Rate your consultation:</span>
                <div className="flex text-amber-400 gap-1 text-sm">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstantVideoCallModal;
