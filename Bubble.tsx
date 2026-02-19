import React, { useState, useRef } from 'react';
import { Message, FateCard } from '../types';
import { deleteMessage } from '../services/supabase';

interface BubbleProps {
  msg: Message;
  isMe: boolean;
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
}

const AudioPlayer: React.FC<{ url: string, isMe: boolean }> = ({ url, isMe }) => {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setPlaying(!playing);
    };

    const handleTimeUpdate = () => {
        if(audioRef.current) {
            const curr = audioRef.current.currentTime;
            const dur = audioRef.current.duration;
            if(dur && dur !== Infinity) setProgress((curr/dur) * 100);
        }
    };

    const handleMetadata = () => {
        if(audioRef.current) {
             const dur = audioRef.current.duration;
             if(dur && dur !== Infinity) setDuration(dur);
        }
    };

    const formatTime = (t: number) => {
        if(!t || t === Infinity || isNaN(t)) return "0:00";
        const m = Math.floor(t/60);
        const s = Math.floor(t%60);
        return `${m}:${s<10?'0':''}${s}`;
    };

    return (
        <div className={`flex flex-col gap-1 min-w-[200px] py-1`}>
            <div className={`flex items-center gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <button 
                    onClick={togglePlay} 
                    className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95 border ${
                        playing ? 'bg-gold text-black border-gold' : 'bg-gold/10 text-gold border-gold/30'
                    }`}
                >
                    {playing ? (
                        <span className="font-bold text-xs">||</span>
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    )}
                </button>
                
                <div className="flex flex-col flex-1 justify-center h-8 relative">
                    {/* Visual Waveform */}
                    <div className="flex items-center gap-[2px] h-full w-full opacity-90">
                        {[...Array(30)].map((_, i) => {
                            const barPos = (i / 30) * 100;
                            const isPlayed = barPos < progress;
                            return (
                                <div key={i} 
                                     className={`w-[3px] rounded-full transition-all duration-150 ${
                                         isPlayed 
                                             ? (isMe ? 'bg-gold' : 'bg-white') 
                                             : (isMe ? 'bg-gold/20' : 'bg-white/20')
                                     }`}
                                     style={{ 
                                         height: playing ? `${Math.max(20, Math.random() * 90)}%` : `${30 + Math.sin(i*0.5)*50}%`
                                     }}
                                ></div>
                            );
                        })}
                    </div>
                </div>
                <audio 
                    ref={audioRef} 
                    src={url} 
                    onEnded={() => { setPlaying(false); setProgress(0); }} 
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleMetadata}
                    className="hidden" 
                />
            </div>
            <div className={`text-[9px] font-mono opacity-60 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                {formatTime(duration)}
            </div>
        </div>
    );
};

const FateCardDisplay: React.FC<{ raw: string }> = ({ raw }) => {
    try {
        const d: FateCard = JSON.parse(raw);
        let type = d.type || "FATE";
        let content = d.content;
        
        if(content.startsWith("TRUTH:")) { type = "TRUTH"; content = content.replace("TRUTH:", "").trim(); }
        else if(content.startsWith("DARE:")) { type = "DARE"; content = content.replace("DARE:", "").trim(); }
        else if(content.startsWith("WILD:")) { type = "WILDCARD"; content = content.replace("WILD:", "").trim(); }
        else if(content.startsWith("CHOICE:")) { type = "CHOICE"; content = content.replace("CHOICE:", "").trim(); }

        const getStyles = (t: string) => {
            const upper = t.toUpperCase();
            switch (upper) {
                case 'DARE': return { border: 'border-red-500', text: 'text-red-500', shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]', bg: 'bg-gradient-to-br from-red-950/90 via-black to-black', icon: '🔥' };
                case 'CHAOS': return { border: 'border-rose-600', text: 'text-rose-500', shadow: 'shadow-[0_0_40px_rgba(225,29,72,0.25)]', bg: 'bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-rose-950/80 via-zinc-950 to-black', icon: '⚡' };
                case 'DEEP': return { border: 'border-indigo-400', text: 'text-indigo-300', shadow: 'shadow-[0_0_30px_rgba(129,140,248,0.15)]', bg: 'bg-gradient-to-br from-indigo-950/90 via-black to-black', icon: '🌊' };
                case 'LIGHT': return { border: 'border-sky-300', text: 'text-sky-300', shadow: 'shadow-[0_0_30px_rgba(125,211,252,0.15)]', bg: 'bg-gradient-to-br from-sky-950/90 via-black to-black', icon: '✨' };
                case 'WILDCARD':
                case 'WILD': return { border: 'border-purple-500', text: 'text-purple-400', shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]', bg: 'bg-gradient-to-br from-purple-950/90 via-black to-black', icon: '🃏' };
                case 'CHOICE': return { border: 'border-amber-500', text: 'text-amber-400', shadow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]', bg: 'bg-gradient-to-br from-amber-950/90 via-black to-black', icon: '⚖️' };
                case 'TRUTH': return { border: 'border-cyan-500', text: 'text-cyan-400', shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]', bg: 'bg-gradient-to-br from-cyan-950/90 via-black to-black', icon: '👁️' };
                default: return { border: 'border-zinc-500', text: 'text-zinc-400', shadow: 'shadow-[0_0_20px_rgba(113,113,122,0.15)]', bg: 'bg-gradient-to-br from-zinc-900 to-black', icon: '🎴' };
            }
        };

        const s = getStyles(type);

        return (
            <>
                <style>{`
                    @keyframes cardShimmer {
                        0% { transform: translateX(-150%) skewX(-20deg); }
                        100% { transform: translateX(200%) skewX(-20deg); }
                    }
                    .group:hover .animate-card-shimmer {
                        animation: cardShimmer 1.2s infinite linear;
                    }
                `}</style>
                <div className={`mx-auto my-3 p-6 rounded-2xl text-center border ${s.border} ${s.shadow} ${s.bg} relative overflow-hidden max-w-[300px] group transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1`}>
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:10px_10px]"></div>
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="animate-card-shimmer absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-[150%] skew-x-[-20deg]"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center mb-4">
                        <div className={`text-2xl mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] filter brightness-110`}>{s.icon}</div>
                        <p className={`text-[10px] font-header ${s.text} uppercase tracking-[6px] opacity-90 border-b border-white/10 pb-2`}>
                            {type === 'WILDCARD' ? 'WILD CARD' : type}
                        </p>
                    </div>
                    <p className="relative z-10 font-mystic text-white/95 italic text-lg leading-relaxed mb-6 drop-shadow-md px-2">"{content}"</p>
                    <div className="relative z-10 flex items-center justify-center gap-3 opacity-40 group-hover:opacity-70 transition-opacity">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                        <p className="text-[9px] text-zinc-300 uppercase tracking-widest font-header">Invoked by {d.invoker}</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                    </div>
                </div>
            </>
        );
    } catch (e) {
        return <div className="text-red-500 text-[10px] border border-red-500/50 p-2 rounded bg-black/50">Data Takdir Rusak</div>;
    }
};

const Bubble: React.FC<BubbleProps> = ({ msg, isMe, onReply, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [dragX, setDragX] = useState(0);
  const touchStart = useRef<number | null>(null);

  // --- SWIPE LOGIC (Low Sensitivity) ---
  const handleTouchStart = (e: React.TouchEvent) => {
      touchStart.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (touchStart.current === null) return;
      const currentX = e.touches[0].clientX;
      const diff = currentX - touchStart.current;

      // Only allow drag right (positive diff)
      // Multiply by 0.5 for resistance (makes it feel "heavier")
      if (diff > 0 && diff < 150) { 
          setDragX(diff * 0.5); 
      }
  };

  const handleTouchEnd = () => {
      // Threshold is 60px (actual drag) which means about 120px physical movement due to resistance
      if (dragX > 60) {
          onReply(msg);
          if (navigator.vibrate) navigator.vibrate(20);
      }
      // Reset with animation handled by CSS transition
      setDragX(0);
      touchStart.current = null;
  };

  // --- ROBUST MESSAGE PARSING ---
  const parseMessage = () => {
      let raw = msg.teks;
      let reply = null;

      if (raw.startsWith(">>REPLY|")) {
          const parts = raw.split(">>");
          if (parts.length >= 3) {
              const meta = parts[1].split("|");
              reply = { sender: meta[1], text: meta.slice(2).join("|") };
              raw = parts.slice(2).join(">>");
          }
      }

      if (msg.nama === "ORACLE") return { type: 'FATE', content: raw, reply };
      if (raw.startsWith("[VO][IMG]")) return { type: 'VO_IMG', content: raw.replace("[VO][IMG]", ""), reply };
      if (raw.startsWith("[VO]")) return { type: 'VO_TEXT', content: raw.replace("[VO]", ""), reply };
      if (raw.startsWith("[VN]")) return { type: 'AUDIO', content: raw.replace("[VN]", ""), reply };
      if (raw.startsWith("[IMG]")) return { type: 'IMAGE', content: raw.replace("[IMG]", ""), reply };
      
      return { type: 'TEXT', content: raw, reply };
  };

  const { type, content, reply } = parseMessage();

  const renderContent = () => {
    switch (type) {
        case 'FATE': return <FateCardDisplay raw={content} />;
        case 'VO_IMG':
            return (
                <div className="flex flex-col items-center justify-center gap-2 py-4 px-6 cursor-pointer group select-none">
                    <div className="relative">
                        <div className="text-2xl animate-pulse group-active:scale-90 transition-transform blur-[1px] group-hover:blur-0">👁️‍🗨️</div>
                        <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-[9px] font-header text-red-400 uppercase tracking-[0.2em] border-b border-red-500/20 pb-1">Hidden Visual</div>
                    <div className="text-[7px] text-red-500/50 italic font-mono">Tap to reveal • Self-destruct</div>
                </div>
            );
        case 'VO_TEXT':
            return (
                <div className="flex items-center gap-4 py-2 pl-1 pr-4 cursor-pointer select-none">
                    <div className="w-8 h-8 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center text-lg animate-pulse">🔒</div>
                    <div className="flex flex-col">
                        <span className="text-[9px] text-red-400 font-bold uppercase tracking-[0.15em]">Secret Message</span>
                        <span className="text-[7px] text-red-500/40 font-mono">Encrypted • Tap to read</span>
                    </div>
                </div>
            );
        case 'AUDIO': return <AudioPlayer url={content} isMe={isMe} />;
        case 'IMAGE':
            const [imgSrc, caption] = content.split("|");
            return (
                <div className="flex flex-col">
                    <div className="relative overflow-hidden rounded-lg border border-white/10">
                         <img src={imgSrc} alt="attachment" className="max-w-[240px] max-h-[300px] object-cover" />
                    </div>
                    {caption && <p className="text-xs mt-2 opacity-90 font-mystic italic px-1">{caption}</p>}
                </div>
            );
        case 'TEXT':
        default:
            return <div className="font-mystic text-[15px] leading-relaxed whitespace-pre-wrap break-words">{content}</div>;
    }
  };

  const getBubbleStyle = () => {
      if (type === 'VO_IMG' || type === 'VO_TEXT') 
          return "bg-gradient-to-r from-red-950/20 to-black border border-red-900/40 text-red-100 hover:border-red-500/40 transition-colors";
      if (isMe) 
          return "bg-gradient-to-br from-zinc-900 to-black border border-gold/30 text-gold/90 rounded-br-sm";
      return "bg-zinc-900/60 border border-white/10 text-white/90 rounded-bl-sm";
  };

  return (
    <div 
        id={`m-${msg.id}`}
        className={`px-1 flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4 animate-fade-in relative group`}
    >
      <div className={`flex items-baseline gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{msg.nama}</span>
          <span className="text-[6px] text-zinc-700 font-mono">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
      </div>
      
      {/* Reply Trigger Icon (Visible when swiping) */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 text-gold/50 transition-opacity duration-200"
        style={{ 
            opacity: dragX > 20 ? 1 : 0,
            transform: `translateX(${dragX - 30}px)` 
        }}
      >
        ↩️
      </div>

      <div 
        className={`p-3 max-w-[90%] md:max-w-[70%] relative shadow-lg backdrop-blur-md rounded-2xl ${getBubbleStyle()}`}
        style={{ 
            transform: `translateX(${dragX}px)`,
            transition: dragX === 0 ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            touchAction: 'pan-y' // Allow vertical scroll but capture horizontal
        }}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        onClick={() => { if(type !== 'VO_IMG' && type !== 'VO_TEXT') setShowMenu(!showMenu); }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {reply && (
          <div className="text-[9px] text-white/40 bg-black/30 border-l-2 border-gold/40 p-2 mb-2 rounded-r flex flex-col gap-1">
            <span className="font-bold text-gold/70 tracking-wider">{reply.sender}</span>
            <span className="italic truncate line-clamp-1 font-serif">{reply.text}</span>
          </div>
        )}
        
        {renderContent()}
      </div>

      {showMenu && (
        <>
            <div className="fixed inset-0 z-[50]" onClick={() => setShowMenu(false)}></div>
            <div className={`absolute top-full mt-2 z-[60] bg-zinc-950 border border-gold/20 w-36 rounded-xl shadow-2xl py-1 flex flex-col overflow-hidden backdrop-blur-xl ring-1 ring-black/50 ${isMe ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}`}>
                <button onClick={() => { onReply(msg); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-[9px] text-white hover:bg-white/5 border-b border-white/5 tracking-wider uppercase transition-colors">Reply</button>
                <button onClick={() => { navigator.clipboard.writeText(content); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-[9px] text-white hover:bg-white/5 border-b border-white/5 tracking-wider uppercase transition-colors">Copy Text</button>
                {isMe && msg.nama !== 'ORACLE' && !['VO_IMG','VO_TEXT','AUDIO'].includes(type) && (
                     <button onClick={() => { onEdit(msg); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-[9px] text-blue-400 hover:bg-white/5 border-b border-white/5 tracking-wider uppercase transition-colors">Edit</button>
                )}
                {isMe && (
                    <button onClick={() => { deleteMessage(msg.id); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-[9px] text-red-500 hover:bg-red-500/10 tracking-wider uppercase transition-colors">Delete</button>
                )}
            </div>
        </>
      )}
    </div>
  );
};

export default Bubble;
