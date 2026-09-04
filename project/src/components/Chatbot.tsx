import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Send, Zap, Sparkles, Trash2, Cpu, Wifi, Mic, Image as ImageIcon, Paperclip, X, FileText, Square } from 'lucide-react';
import { generateResponse, generateImageResponse, generateFileResponse, generateVoiceResponse, SUGGESTED_QUESTIONS, AttachmentContext } from '@/lib/sarcasticEngine';
import Logo from '@/components/Logo';

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  displayedText: string;
  isTyping: boolean;
  attachment?: {
    type: 'image' | 'file' | 'voice';
    name: string;
    previewUrl?: string;
    size?: number;
  };
}

let messageCounter = 0;

// Minimal type declarations for Web Speech API (not in standard TS DOM lib)
interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): SpeechRecognitionInstance | null {
  const w = window as unknown as {
    SpeechRecognition?: { new (): SpeechRecognitionInstance };
    webkitSpeechRecognition?: { new (): SpeechRecognitionInstance };
  };
  const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
  return SR ? new SR() : null;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: messageCounter++,
      role: 'bot',
      text: "ugh, you're back. fine. ask me something so I can not answer it.",
      displayedText: "ugh, you're back. fine. ask me something so I can not answer it.",
      isTyping: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Message['attachment'] | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [inIframe, setInIframe] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    try {
      setInIframe(window.self !== window.top);
    } catch {
      setInIframe(true);
    }
    const timer = setTimeout(() => setBootComplete(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearAllTimers = () => {
    typingTimers.current.forEach((t) => clearTimeout(t));
    typingTimers.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (recognitionRef.current) recognitionRef.current.abort();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const animateBotMessage = useCallback((msgId: number, fullText: string) => {
    let charIndex = 0;
    const typeNext = () => {
      if (charIndex >= fullText.length) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, isTyping: false } : m))
        );
        return;
      }
      charIndex++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, displayedText: fullText.slice(0, charIndex) } : m
        )
      );
      const timer = setTimeout(typeNext, 18 + Math.random() * 30);
      typingTimers.current.push(timer);
    };
    const startTimer = setTimeout(typeNext, 100);
    typingTimers.current.push(startTimer);
  }, []);

  const sendMessage = (text: string, attachment?: Message['attachment']) => {
    const trimmed = text.trim();
    if ((!trimmed && !attachment) || isThinking) return;

    clearAllTimers();

    const userMsg: Message = {
      id: messageCounter++,
      role: 'user',
      text: trimmed || (attachment ? `[${attachment.type}]` : ''),
      displayedText: trimmed,
      isTyping: false,
      attachment,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setPendingAttachment(null);
    setIsThinking(true);

    const delay = 600 + Math.random() * 700;
    const timer = setTimeout(() => {
      let responseText: string;

      if (attachment?.type === 'image') {
        const ctx: AttachmentContext = {
          type: 'image',
          fileName: attachment.name,
          fileSize: attachment.size,
        };
        if (attachment.previewUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.imageWidth = img.naturalWidth;
            ctx.imageHeight = img.naturalHeight;
          };
          img.src = attachment.previewUrl;
        }
        responseText = generateImageResponse(trimmed, ctx);
      } else if (attachment?.type === 'file') {
        const ctx: AttachmentContext = {
          type: 'file',
          fileName: attachment.name,
          fileSize: attachment.size,
        };
        responseText = generateFileResponse(trimmed, ctx);
      } else if (attachment?.type === 'voice') {
        const ctx: AttachmentContext = {
          type: 'voice',
          transcript: trimmed,
        };
        responseText = generateVoiceResponse(trimmed, ctx);
      } else {
        responseText = generateResponse(trimmed);
      }

      const botMsg: Message = {
        id: messageCounter++,
        role: 'bot',
        text: responseText,
        displayedText: '',
        isTyping: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
      animateBotMessage(botMsg.id, responseText);
    }, delay);
    typingTimers.current.push(timer);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, pendingAttachment ?? undefined);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, pendingAttachment ?? undefined);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    setPendingAttachment({
      type: 'image',
      name: file.name,
      previewUrl: url,
      size: file.size,
    });
    e.target.value = '';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAttachment({
      type: 'file',
      name: file.name,
      size: file.size,
    });
    e.target.value = '';
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setInterimText('');
  };

  const handleVoiceToggle = () => {
    if (isThinking) return;

    if (isRecording) {
      stopRecording();
      return;
    }

    setVoiceError(null);
    setInterimText('');

    if (inIframe) {
      setVoiceError('MIC IS BLOCKED IN EMBEDDED PREVIEWS. OPEN THE APP IN A NEW TAB TO USE VOICE.');
      return;
    }

    const recognition = getSpeechRecognition();

    if (recognition) {
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        if (interim) setInterimText(interim);
        if (final) {
          setInput(final);
          setInterimText('');
          setPendingAttachment({ type: 'voice', name: 'voice-input.wav' });
          setIsRecording(false);
          inputRef.current?.focus();
        }
      };

      recognition.onerror = (event: Event) => {
        const errEvent = event as unknown as { error?: string };
        const errType = errEvent.error || 'unknown';
        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setVoiceError('MIC PERMISSION DENIED. CHECK YOUR BROWSER SETTINGS, BABE.');
        } else if (errType === 'no-speech') {
          setVoiceError('I HEARD NOTHING. DID YOU ACTUALLY TALK? TRY AGAIN.');
        } else if (errType === 'network') {
          setVoiceError('NETWORK ISSUE. YOUR WIFI IS AS UNRELIABLE AS YOUR QUESTIONS.');
        } else {
          setVoiceError(`VOICE ERROR: ${errType.toUpperCase()}. TYPICAL.`);
        }
        setIsRecording(false);
        setInterimText('');
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsRecording(true);
      } catch {
        setVoiceError('VOICE ENGINE FAILED TO START. RUDE.');
        setIsRecording(false);
      }
    } else {
      // Fallback: use MediaRecorder to capture audio as a voice attachment
      startMediaRecorderFallback();
    }
  };

  const startMediaRecorderFallback = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceError('YOUR BROWSER DOESN\'T SUPPORT VOICE INPUT. UPGRADE OR TYPE LIKE THE REST OF US.');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        recorder.ondataavailable = (e: BlobEvent) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          objectUrlsRef.current.push(url);
          setPendingAttachment({
            type: 'voice',
            name: 'voice-input.webm',
            previewUrl: url,
            size: blob.size,
          });
          stream.getTracks().forEach((t) => t.stop());
          setIsRecording(false);
          setInterimText('');
          setVoiceError('VOICE RECORDED (NO SPEECH-TO-TEXT IN THIS BROWSER). TYPE YOUR QUESTION AND SEND IT WITH THE CLIP.');
          inputRef.current?.focus();
        };

        recorder.onerror = () => {
          setVoiceError('RECORDING FAILED. YOUR MIC IS PROBABLY OFF OR SOMETHING.');
          setIsRecording(false);
          setInterimText('');
          stream.getTracks().forEach((t) => t.stop());
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
      })
      .catch(() => {
        setVoiceError('MIC ACCESS DENIED. ALLOW MIC PERMISSION AND TRY AGAIN, BABE.');
        setIsRecording(false);
      });
  };

  const handleReset = () => {
    clearAllTimers();
    if (isRecording) stopRecording();
    messageCounter = 0;
    setMessages([
      {
        id: messageCounter++,
        role: 'bot',
        text: "k we're starting over. ask me something. or don't. idc.",
        displayedText: '',
        isTyping: true,
      },
    ]);
    setInput('');
    setPendingAttachment(null);
    setIsThinking(false);
    setVoiceError(null);
    setInterimText('');
    inputRef.current?.focus();
    setTimeout(() => animateBotMessage(0, "k we're starting over. ask me something. or don't. idc."), 200);
  };

  const removeAttachment = () => {
    if (pendingAttachment?.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setPendingAttachment(null);
  };

  return (
    <div className="relative z-10 w-full max-w-2xl px-4">
      {/* Header / Branding */}
      <div className={`mb-6 text-center transition-all duration-700 ${bootComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="mb-2 flex items-center justify-center gap-3">
          <Logo className="h-10 w-10 animate-flicker sm:h-12 sm:w-12" />
          <h1 className="font-display text-3xl font-black tracking-[0.2em] text-accent text-glow-strong sm:text-5xl">
            ASK-O-TRON
          </h1>
          <Logo className="h-10 w-10 animate-flicker sm:h-12 sm:w-12" />
        </div>
        <p className="font-mono text-sm tracking-[0.3em] text-accent-light/80 text-glow sm:text-base">
          SASSY AND USELESS
        </p>
      </div>

      {/* Chat panel */}
      <div
        className={`retro-panel crt-screen rounded-lg overflow-hidden transition-all duration-700 relative ${bootComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ animation: bootComplete ? 'boot-up 0.6s ease-out' : 'none' }}
      >
        {/* Slowly moving gradient glow border overlay */}
        <div
          className="gradient-glow pointer-events-none absolute inset-0 z-0 rounded-lg"
          style={{ padding: '2px', maskImage: 'linear-gradient(black, black)', WebkitMaskComposite: 'xor', mixBlendMode: 'screen' }}
        />

        {/* Status bar */}
        <div className="relative z-20 flex items-center justify-between border-b-2 border-accent/40 bg-retro-panel-light px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-retro-teal animate-glow-pulse" style={{ boxShadow: '0 0 8px #36e2c4' }} />
            <span className="font-mono text-[10px] tracking-widest text-retro-teal text-glow-teal sm:text-xs">
              SYS::ONLINE
            </span>
          </div>
          <div className="hidden font-mono text-[10px] tracking-widest text-accent/70 sm:block sm:text-xs">
            V3.0.0-SASSY
          </div>
          <button
            onClick={handleReset}
            className="group flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-accent/70 transition-colors hover:text-accent sm:text-xs"
            aria-label="Clear chat"
          >
            <Trash2 className="h-3.5 w-3.5 transition-all group-hover:rotate-12 group-hover:scale-110" />
            CLEAR
          </button>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="retro-inset relative z-20 h-[38vh] min-h-[300px] overflow-y-auto p-4 sm:p-6"
        >
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isThinking && <ThinkingIndicator />}
          </div>
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && !isThinking && (
          <div className="relative z-20 border-t border-accent/30 bg-retro-panel/50 p-3">
            <p className="mb-2 font-mono text-[10px] tracking-widest text-retro-cream/40 sm:text-xs">
              &gt; SUGGESTED_INPUTS:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.slice(0, 5).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded border border-accent/40 bg-retro-panel-light px-3 py-1.5 font-mono text-[10px] text-retro-cream/70 transition-all hover:border-accent hover:bg-accent/20 hover:text-accent-glow sm:text-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pending attachment preview */}
        {pendingAttachment && (
          <div className="relative z-20 flex items-center gap-3 border-t border-accent/30 bg-retro-panel/60 px-4 py-2.5">
            {pendingAttachment.type === 'image' && pendingAttachment.previewUrl ? (
              <img
                src={pendingAttachment.previewUrl}
                alt={pendingAttachment.name}
                className="h-12 w-12 rounded border border-accent/40 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded border border-accent/40 bg-retro-panel">
                {pendingAttachment.type === 'voice' ? (
                  <Mic className="h-5 w-5 text-retro-teal" />
                ) : (
                  <FileText className="h-5 w-5 text-accent/70" />
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-xs text-retro-cream/80">
                {pendingAttachment.name}
              </p>
              <p className="font-mono text-[10px] tracking-widest text-accent/60 uppercase">
                {pendingAttachment.type} attached
              </p>
            </div>
            <button
              onClick={removeAttachment}
              className="flex h-6 w-6 items-center justify-center rounded border border-accent/40 text-accent/70 transition-colors hover:border-accent hover:text-accent-glow"
              aria-label="Remove attachment"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="relative z-20 flex items-center gap-2 border-t border-retro-teal/30 bg-retro-panel/60 px-4 py-2.5">
            <span className="flex h-5 items-center gap-0.5">
              <span className="waveform-bar" style={{ animationDelay: '0s' }} />
              <span className="waveform-bar" style={{ animationDelay: '0.15s' }} />
              <span className="waveform-bar" style={{ animationDelay: '0.3s' }} />
              <span className="waveform-bar" style={{ animationDelay: '0.45s' }} />
            </span>
            <span className="font-mono text-[10px] tracking-widest text-retro-teal text-glow-teal sm:text-xs">
              {interimText ? `"${interimText}"` : 'LISTENING... SPEAK NOW (OR DON\'T, IDK)'}
            </span>
          </div>
        )}

        {/* Voice error message */}
        {voiceError && !isRecording && (
          <div className="relative z-20 flex items-center gap-2 border-t border-red-500/30 bg-retro-panel/60 px-4 py-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
            <span className="font-mono text-[10px] tracking-widest text-red-400 sm:text-xs">
              {voiceError}
            </span>
            {inIframe && (
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 shrink-0 rounded border border-retro-teal/50 px-2 py-0.5 font-mono text-[10px] tracking-widest text-retro-teal transition-colors hover:bg-retro-teal/20"
              >
                OPEN IN NEW TAB
              </a>
            )}
            <button
              onClick={() => setVoiceError(null)}
              className="ml-auto shrink-0 text-red-400/70 hover:text-red-400"
              aria-label="Dismiss error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="relative z-20 flex items-center gap-2 border-t-2 border-accent/40 bg-retro-panel-light p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 font-mono text-accent">
            <Zap className="h-4 w-4 animate-flicker" />
            <span className="text-sm">&gt;</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ask me something... if you must"
            className="flex-1 bg-transparent font-mono text-sm text-retro-cream placeholder:text-retro-cream/30 focus:outline-none sm:text-base"
            autoFocus={bootComplete}
            disabled={isThinking || isRecording}
          />
          {/* Hidden file inputs */}
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.csv,.json,.doc,.docx" className="hidden" onChange={handleFileSelect} />

          {/* Attachment icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isThinking}
              aria-label="Voice input"
              title="Voice input"
              className={`group flex h-8 w-8 items-center justify-center rounded border transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
                isRecording
                  ? 'border-retro-teal bg-retro-teal/20 animate-glow-pulse'
                  : 'border-accent/30 bg-retro-panel hover:border-accent hover:bg-accent/20'
              }`}
            >
              {isRecording ? (
                <Square className="h-3.5 w-3.5 text-retro-teal" />
              ) : (
                <Mic className="h-4 w-4 text-accent/70 transition-colors group-hover:text-accent-glow" />
              )}
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isThinking}
              aria-label="Attach photo"
              title="Upload image"
              className="group flex h-8 w-8 items-center justify-center rounded border border-accent/30 bg-retro-panel transition-all hover:border-accent hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ImageIcon className="h-4 w-4 text-accent/70 transition-colors group-hover:text-accent-glow" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isThinking}
              aria-label="Attach file"
              title="Upload PDF or text file"
              className="group flex h-8 w-8 items-center justify-center rounded border border-accent/30 bg-retro-panel transition-all hover:border-accent hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Paperclip className="h-4 w-4 text-accent/70 transition-colors group-hover:text-accent-glow" />
            </button>
          </div>
          <button
            type="submit"
            disabled={(!input.trim() && !pendingAttachment) || isThinking}
            className="retro-btn rounded px-4 py-2 text-xs sm:text-sm"
          >
            <Send className="inline h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Futuristic footer */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 text-center">
          <Cpu className="h-3.5 w-3.5 text-accent/50" />
          <p className="font-mono text-[10px] tracking-[0.25em] text-retro-cream/40 sm:text-xs">
            NEURAL_SNARK_ENGINE_v3 // POWERED_BY_SPITE
          </p>
          <Wifi className="h-3.5 w-3.5 text-accent/50" />
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent/40" />
          <p className="font-mono text-[9px] tracking-[0.3em] text-retro-cream/25 sm:text-[10px]">
            ZERO_USEFUL_INFORMATION_PROCESSED
          </p>
          <span className="h-1 w-1 rounded-full bg-accent/40" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`mb-1 flex items-center gap-1.5 font-mono text-[10px] tracking-widest sm:text-xs ${
            isUser ? 'justify-end text-retro-teal' : 'text-accent/70'
          }`}
        >
          {!isUser && <Sparkles className="h-3 w-3" />}
          {isUser ? 'YOU' : 'ASK-O-TRON'}
          {isUser && <Sparkles className="h-3 w-3" />}
        </div>

        {/* Attachment preview in message */}
        {message.attachment && (
          <div className={`mb-1.5 overflow-hidden rounded-lg border ${
            isUser ? 'border-retro-teal/40' : 'border-accent/50'
          }`}>
            {message.attachment.type === 'image' && message.attachment.previewUrl ? (
              <img
                src={message.attachment.previewUrl}
                alt={message.attachment.name}
                className="max-h-40 w-auto max-w-full object-cover"
              />
            ) : (
              <div className="flex items-center gap-2 bg-retro-panel-light px-3 py-2">
                {message.attachment.type === 'voice' ? (
                  <Mic className="h-4 w-4 text-retro-teal" />
                ) : (
                  <FileText className="h-4 w-4 text-accent/70" />
                )}
                <span className="font-mono text-xs text-retro-cream/70">
                  {message.attachment.name}
                </span>
              </div>
            )}
          </div>
        )}

        <div
          className={`rounded-lg border px-4 py-2.5 font-mono text-sm leading-relaxed sm:text-base ${
            isUser
              ? 'border-retro-teal/40 bg-retro-teal/10 text-retro-cream'
              : 'border-accent/50 bg-accent/10 text-retro-cream'
          }`}
        >
          {isUser ? (
            <span>{message.displayedText}</span>
          ) : (
            <span className="whitespace-pre-wrap text-glow">
              {message.displayedText}
              {message.isTyping && (
                <span className="ml-0.5 inline-block w-2 h-4 bg-accent animate-blink align-middle" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex animate-fade-in justify-start">
      <div className="max-w-[85%]">
        <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-accent/70 sm:text-xs">
          <Sparkles className="h-3 w-3" />
          ASK-O-TRON
        </div>
        <div className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: '0s' }} />
            <span className="h-2 w-2 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: '0.2s' }} />
            <span className="h-2 w-2 rounded-full bg-accent animate-typing-dot" style={{ animationDelay: '0.4s' }} />
            <span className="ml-2 font-mono text-[10px] tracking-widest text-accent/60 sm:text-xs">
              PROCESSING_SNARK...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
