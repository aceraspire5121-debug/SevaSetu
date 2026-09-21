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
  Volume2,
  Camera,
  MessageSquare,
  Send,
  Droplets,
  Zap,
  Wind,
} from 'lucide-react';

const ONLINE_EXPERTS = [
  {
    id: 'vikram',
    name: 'Vikram Malhotra',
    role: 'Senior electrician & MCB expert',
    category: 'Electrician',
    rating: 4.95,
    callsCompleted: 342,
    experienceYears: 10,
    city: 'New Delhi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
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
    role: 'Senior plumber & hydraulics expert',
    category: 'Plumber',
    rating: 4.9,
    callsCompleted: 512,
    experienceYears: 12,
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
    role: 'AC & appliance diagnostic expert',
    category: 'Technician',
    rating: 4.92,
    callsCompleted: 289,
    experienceYears: 8,
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

const CATEGORY_LIST = [
  { id: 'Plumber', label: 'Plumbing & water', icon: <Droplets className="w-4 h-4 text-teal-700 shrink-0" /> },
  { id: 'Electrician', label: 'Electrical & MCB', icon: <Zap className="w-4 h-4 text-amber-600 shrink-0" /> },
  { id: 'Technician', label: 'AC & appliances', icon: <Wind className="w-4 h-4 text-sky-600 shrink-0" /> },
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
  const [underDevAlert, setUnderDevAlert] = useState(false);
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
      setUnderDevAlert(false);
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

  const handleStartCallFlow = () => {
    setUnderDevAlert(true);
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white text-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* =========================================================================
            STATE 1: PREVIEW & EXPERT MATCHING (Clean Modern White Layout)
           ========================================================================= */}
        {callState === 'preview' && (
          <div className="p-6 sm:p-7 relative space-y-5">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Under Development Banner */}
            {underDevAlert && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs font-semibold flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This Instant 1-on-1 Video Call feature is currently under development. Stay tuned!</span>
                </div>
                <button
                  onClick={() => setUnderDevAlert(false)}
                  className="text-amber-950 hover:underline text-[10px] uppercase font-bold shrink-0 ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* SECTION 1: What do you need help with? */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  What do you need help with?
                </h3>
              </div>

              {/* Service List */}
              <div className="space-y-2">
                {CATEGORY_LIST.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full p-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 transition-all cursor-pointer border text-left ${
                        isSelected
                          ? 'bg-[#e6f0eb] border-[#0f766e]/40 text-slate-900 font-bold shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* SECTION 2: Your available expert */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Your available expert
                </h3>
              </div>

              {/* Expert Card */}
              <div className="p-3.5 bg-[#f4f7f5] rounded-2xl border border-slate-100 flex items-center gap-3.5">
                <img
                  src={activeExpert.avatar}
                  alt={activeExpert.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                />

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {activeExpert.name}
                    </h4>
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {activeExpert.rating}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#0d7a68] truncate">
                    {activeExpert.role}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activeExpert.experienceYears}+ years experience · {activeExpert.callsCompleted} video sessions
                  </p>
                </div>
              </div>
            </div>

            {/* Price & Action Row */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-2xl font-black text-slate-900 leading-tight">
                  ₹49
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  15-minute consultation
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartCallFlow}
                className="px-5 py-3 bg-black hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Start video call</span>
              </button>
            </div>

            {/* Footer Trust Note */}
            <p className="text-center text-[11px] text-slate-400 font-medium pt-1">
              Pay securely before connecting. If no expert joins, you won't be charged.
            </p>
          </div>
        )}

        {/* =========================================================================
            STATE 2: CONNECTING / CALLING RING ANIMATION
           ========================================================================= */}
        {callState === 'connecting' && (
          <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-teal-500/30 flex items-center justify-center animate-ping absolute inset-0" />
              <img
                src={activeExpert.avatar}
                alt={activeExpert.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-teal-500 shadow-xl relative z-10"
              />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-xs font-bold uppercase tracking-wider">
                Connecting with Expert...
              </span>
              <h3 className="text-lg font-black text-slate-900">{activeExpert.name}</h3>
              <p className="text-xs text-slate-500">{activeExpert.role} • Ringing...</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold animate-pulse">
              <ShieldCheck className="w-4 h-4" /> End-to-End Encrypted Video Room
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 3: ACTIVE VIDEO CALL ROOM
           ========================================================================= */}
        {callState === 'active' && (
          <div className="relative h-[520px] bg-slate-950 flex flex-col justify-between overflow-hidden">
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

            {/* Main Stage: Remote Video */}
            <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
              <img
                src={activeExpert.avatar}
                alt="Live stream"
                className="w-full h-full object-cover opacity-90 filter brightness-95"
              />

              <div className="absolute top-20 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs text-teal-300">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Expert Audio Connected</span>
              </div>

              {/* Customer PIP */}
              <div className="absolute bottom-20 right-4 w-28 h-36 sm:w-36 sm:h-48 bg-slate-950 rounded-2xl overflow-hidden border-2 border-teal-400/60 shadow-2xl z-20 group">
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
                      <MessageSquare className="w-3.5 h-3.5" /> In-Call Chat
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
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-slate-800/90 text-white hover:bg-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800/90 text-white hover:bg-slate-700'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setShowChat(!showChat)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  showChat ? 'bg-teal-600 text-white' : 'bg-slate-800/90 text-white hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all cursor-pointer"
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
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Video Consultation Completed!</h3>
              <p className="text-xs text-slate-500">
                You successfully consulted with <strong>{activeExpert.name}</strong> ({activeExpert.role}).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 max-w-sm mx-auto text-left text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-bold text-slate-900">₹49</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Visit Charge Saved:</span>
                <span className="font-black text-emerald-700">₹190 - ₹240 Saved!</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="font-bold text-slate-800">Rate consultation:</span>
                <span className="text-amber-500 text-sm">⭐⭐⭐⭐⭐</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Close & Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstantVideoCallModal;
