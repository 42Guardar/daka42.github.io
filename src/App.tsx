import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Volume2, VolumeX, RefreshCw, HeartCrack } from 'lucide-react';

// Ambient stars configuration for the background decoration
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stars, setStars] = useState<Star[]>([]);

  // Page 7 (Step 6) - Interactive buttons state
  const [tambienPos, setTambienPos] = useState({ top: 35, left: 50, isInitial: true });
  const [noPos, setNoPos] = useState({ top: 60, left: 50, isInitial: true });
  const [noClickCount, setNoClickCount] = useState(0);
  const [showTambienConfirm, setShowTambienConfirm] = useState(false);
  const [showNoFinalModal, setShowNoFinalModal] = useState(false);

  // Container reference to constrain button movement inside the card
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate background starts
  useEffect(() => {
    const generatedStars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 4,
    }));
    setStars(generatedStars);
  }, []);

  // Web Audio API Synth Sound Generator for cute mobile physical feedback
  const playChime = (freq = 523.25, type: 'sine' | 'triangle' | 'square' = 'sine', duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Soft sound envelope
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored if browser restricts early audio state
    }
  };

  // Pre-configured warm tones
  const triggerTick = () => playChime(587.33, 'sine', 0.1); // D5 chime
  const triggerSuccess = () => {
    playChime(523.25, 'sine', 0.1);
    setTimeout(() => playChime(659.25, 'sine', 0.15), 100);
    setTimeout(() => playChime(783.99, 'sine', 0.2), 200);
  };
  const triggerSad = () => {
    playChime(392.00, 'triangle', 0.2); // G4
    setTimeout(() => playChime(311.13, 'triangle', 0.35), 150); // Eb4
  };

  // Moves the "A MI NO" button to a random position within safe container bounds
  const moveNoButton = () => {
    if (noClickCount < 4) {
      triggerTick();
      
      // Let's keep position away from edges (between 15% and 80%) to make sure it's fully visible and tapable
      let newLeft = Math.floor(Math.random() * 65) + 15;
      let newTop = Math.floor(Math.random() * 60) + 15;

      // Make sure it doesn't land exactly on the TAMBIEN button position
      const distFromTambien = Math.hypot(newLeft - tambienPos.left, newTop - tambienPos.top);
      if (distFromTambien < 18) {
        newLeft = (newLeft + 30) % 70 + 15;
        newTop = (newTop + 30) % 65 + 15;
      }

      setNoPos({ top: newTop, left: newLeft, isInitial: false });
      setNoClickCount(prev => prev + 1);
    } else {
      // 5th tap: Trigger final modal
      triggerSad();
      setNoClickCount(5);
      setShowNoFinalModal(true);
    }
  };

  // Handles the "TAMBIEN" button interaction
  const handleTambienClick = () => {
    if (tambienPos.isInitial) {
      // First click: Move the button, and show confirmation dialogue
      triggerTick();
      
      let newLeft = Math.floor(Math.random() * 65) + 15;
      let newTop = Math.floor(Math.random() * 60) + 15;
      
      // Keep away from current NO button position
      const distFromNo = Math.hypot(newLeft - noPos.left, newTop - noPos.top);
      if (distFromNo < 18) {
        newLeft = (newLeft + 35) % 70 + 15;
        newTop = (newTop + 35) % 65 + 15;
      }

      setTambienPos({ top: newTop, left: newLeft, isInitial: false });
      setShowTambienConfirm(true);
    } else {
      // Second click: Redirect to WhatsApp successfully!
      triggerSuccess();
      window.location.href = "https://wa.me/593969288780?text=A%20MI%20TAMBIEN";
    }
  };

  // Proceed page state helper
  const nextStep = () => {
    triggerTick();
    setStep(prev => prev + 1);
  };

  // Reset the interactive step if requested by user
  const resetGame = () => {
    triggerTick();
    setTambienPos({ top: 35, left: 50, isInitial: true });
    setNoPos({ top: 60, left: 50, isInitial: true });
    setNoClickCount(0);
    setShowTambienConfirm(false);
    setShowNoFinalModal(false);
  };

  const restartAll = () => {
    triggerSuccess();
    setStep(0);
    resetGame();
  };

  // Pre-defined values for all 7 steps (0 to 6)
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-between h-full py-16 px-6 text-center"
          >
            <div className="flex-1 flex flex-col justify-center items-center gap-1.5 relative">
              <div className="absolute -inset-6 bg-pink-300/20 rounded-full blur-2xl pointer-events-none"></div>
              <span className="text-pink-550 text-sm md:text-base font-extrabold uppercase tracking-[0.25em] drop-shadow-sm relative z-10">
                HOLA :)
              </span>
              <h1 className="text-slate-800 text-6xl md:text-8xl font-black tracking-normal uppercase py-1 select-none font-sans filter drop-shadow-[0_4px_12px_rgba(236,72,153,0.12)] leading-none relative z-10">
                DOME
              </h1>
            </div>

            <div className="w-full max-w-xs z-10">
              <button
                id="btn-continuar-0"
                onClick={nextStep}
                className="w-full py-4 px-8 bg-gradient-to-r from-pink-500 to-rose-450 text-white rounded-2xl font-bold text-lg select-none tracking-[0.1em] uppercase transition-all duration-300 transform active:scale-95 shadow-md shadow-pink-200 hover:shadow-lg cursor-pointer hover:opacity-95"
              >
                CONTINUAR
              </button>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-between h-full py-16 px-6 text-center"
          >
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="absolute -inset-8 bg-purple-300/15 rounded-full blur-2xl pointer-events-none"></div>
              <h2 className="text-slate-800 text-2xl md:text-4xl font-extrabold uppercase tracking-wide leading-snug px-4 select-none relative z-10">
                NO SABIA COMO <br />
                DECIRLO ASI QUE <br />
                PENSE EN ESTO
              </h2>
            </div>
            
            <div className="w-full max-w-xs z-10">
              <button
                id="btn-continuar-1"
                onClick={nextStep}
                className="w-full py-4 px-8 bg-gradient-to-r from-pink-500 to-rose-450 text-white rounded-2xl font-bold text-lg select-none tracking-[0.1em] uppercase transition-all duration-300 transform active:scale-95 shadow-md shadow-pink-200 hover:shadow-lg cursor-pointer hover:opacity-95"
              >
                CONTINUAR
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-between h-full py-16 px-4 text-center"
          >
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="absolute -inset-8 bg-indigo-300/15 rounded-full blur-2xl pointer-events-none"></div>
              <h2 className="text-slate-800 text-2xl md:text-4xl font-extrabold uppercase tracking-wide leading-snug select-none relative z-10">
                ESTOY NERVIOSO <br />
                COMO ESTABAS EL <br />
                DIA QUE GRABAMOS
              </h2>
            </div>

            <div className="w-full max-w-xs z-10">
              <button
                id="btn-continuar-2"
                onClick={nextStep}
                className="w-full py-4 px-8 bg-gradient-to-r from-pink-500 to-rose-450 text-white rounded-2xl font-bold text-lg select-none tracking-[0.1em] uppercase transition-all duration-300 transform active:scale-95 shadow-md shadow-pink-200 hover:shadow-lg cursor-pointer hover:opacity-95"
              >
                CONTINUAR
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-between h-full py-16 px-6 text-center"
          >
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="absolute -inset-8 bg-pink-300/15 rounded-full blur-2xl pointer-events-none"></div>
              <h2 className="text-slate-800 text-2xl md:text-4xl font-extrabold uppercase tracking-wide leading-snug select-none relative z-10">
                ES UN POCO <br />
                INUSUAL ESTA <br />
                FORMA
              </h2>
            </div>

            <div className="w-full max-w-xs z-10">
              <button
                id="btn-continuar-3"
                onClick={nextStep}
                className="w-full py-4 px-8 bg-gradient-to-r from-pink-500 to-rose-450 text-white rounded-2xl font-bold text-lg select-none tracking-[0.1em] uppercase transition-all duration-300 transform active:scale-95 shadow-md shadow-pink-200 hover:shadow-lg cursor-pointer hover:opacity-95"
              >
                CONTINUAR
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-between h-full py-16 px-6 text-center"
          >
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="absolute -inset-8 bg-pink-300/15 rounded-full blur-2xl pointer-events-none"></div>
              <h2 className="text-slate-800 text-5xl md:text-7xl font-extrabold uppercase tracking-widest select-none relative z-10">
                PERO...
              </h2>
            </div>

            <div className="w-full max-w-xs z-10">
              <button
                id="btn-continuar-4"
                onClick={nextStep}
                className="w-full py-4 px-8 bg-gradient-to-r from-pink-500 to-rose-450 text-white rounded-2xl font-bold text-lg select-none tracking-[0.1em] uppercase transition-all duration-300 transform active:scale-95 shadow-md shadow-pink-200 hover:shadow-lg cursor-pointer hover:opacity-95"
              >
                CONTINUAR
              </button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, flex: 1, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-between h-full py-16 px-6 text-center"
          >
            <div className="flex-1 flex flex-col justify-center items-center gap-4 relative">
              <div className="absolute -inset-10 bg-pink-400/25 rounded-full blur-3xl pointer-events-none"></div>
              <h2 className="text-slate-800 text-4xl md:text-6xl font-black uppercase tracking-wider relative z-10 drop-shadow-[0_2px_10px_rgba(244,63,94,0.1)]">
                ME GUSTAS
              </h2>
              <motion.div
                animate={{ scale: [1, 1.25, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="text-pink-500 text-6xl drop-shadow-[0_0_15px_rgba(244,63,94,0.45)] relative z-10 cursor-pointer"
              >
                ♥
              </motion.div>
            </div>

            <div className="w-full max-w-xs z-10">
              <button
                id="btn-responder"
                onClick={nextStep}
                className="w-full py-4 px-8 bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-95 text-white font-extrabold text-lg tracking-[0.1em] uppercase transition-all duration-300 transform active:scale-95 shadow-lg shadow-pink-200/60 cursor-pointer select-none rounded-2xl"
              >
                RESPONDER
              </button>
            </div>
          </motion.div>
        );

      case 6:
        // Interactive step with TAMBIEN and A MI NO buttons.
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full py-8 px-4 flex-1 justify-between select-none"
          >
            {/* Top Prompt info */}
            <div className="text-center pt-2">
              <span className="text-pink-500/80 text-xs uppercase tracking-widest font-bold block">
                Selecciona una respuesta:
              </span>
              <h3 className="text-slate-500 font-semibold text-[10px] font-mono mt-1">
                {noClickCount > 0 && `${noClickCount}/5`}
              </h3>
            </div>

            {/* Container for absolute random positioning of the interactive buttons */}
            <div
              ref={containerRef}
              className="relative w-full h-[380px] md:h-[400px] bg-white/25 rounded-3xl border border-white/50 overflow-hidden my-4 shadow-inner shadow-white/20"
            >
              {/* Drifting subtle hint */}
              {tambienPos.isInitial && noPos.isInitial && (
                <div className="absolute inset-0 flex items-center justify-center text-center p-4 pointer-events-none">
                  <p className="text-pink-400/40 text-xs uppercase tracking-wider font-semibold">
                    ¿Qué sientes tú?
                  </p>
                </div>
              )}

              {/* "TAMBIEN" Button */}
              <motion.button
                id="btn-interactive-tambien"
                onClick={handleTambienClick}
                layoutId="btn-tambien"
                style={{
                  position: 'absolute',
                  top: `${tambienPos.top}%`,
                  left: `${tambienPos.left}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`py-4 px-8 rounded-2xl text-white font-extrabold text-xl tracking-[0.05em] uppercase select-none cursor-pointer transition-all duration-300 ${
                  tambienPos.isInitial
                    ? 'bg-gradient-to-r from-pink-500 to-rose-455 hover:opacity-95 active:scale-95 w-[200px]'
                    : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white border-2 border-white animate-bounce shadow-lg shadow-pink-300 w-[180px]'
                } shadow-xl shadow-pink-200/50`}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                TAMBIEN
              </motion.button>

              {/* "A MI NO" Button */}
              <motion.button
                id="btn-interactive-nomi"
                onClick={moveNoButton}
                layoutId="btn-nomi"
                style={{
                  position: 'absolute',
                  top: `${noPos.top}%`,
                  left: `${noPos.left}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`py-4 px-8 rounded-2xl font-extrabold text-xl tracking-[0.05em] uppercase select-none cursor-pointer transition-all duration-300 ${
                  noPos.isInitial
                    ? 'bg-white/60 border border-white/70 text-slate-700 hover:bg-white/80 active:scale-95 w-[200px]'
                    : 'bg-white/85 border border-white/90 text-slate-600 active:scale-90 w-[180px]'
                } shadow-xl shadow-indigo-100/30`}
                transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              >
                A MI NO
              </motion.button>

              {/* Interactive Confirm overlay for TAMBIEN clicks */}
              <AnimatePresence>
                {showTambienConfirm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 border border-white"
                  >
                    <div className="bg-pink-100 p-3.5 rounded-full mb-3">
                      <Heart className="w-8 h-8 text-pink-500 fill-pink-400" />
                    </div>
                    <h4 className="text-pink-600 text-2xl font-black uppercase tracking-wider mb-6">
                      ¿Estas Segura?
                    </h4>
                    <div className="flex flex-col gap-3 w-full max-w-[220px]">
                      <button
                        onClick={() => {
                          triggerSuccess();
                          window.location.href = "https://wa.me/593969288780?text=A%20MI%20TAMBIEN";
                        }}
                        className="py-3 px-5 bg-gradient-to-r from-pink-500 to-rose-450 hover:opacity-95 text-white rounded-xl text-base font-extrabold tracking-wider uppercase transition-all shadow-md shadow-pink-200 cursor-pointer active:scale-95"
                      >
                        SI A MI TAMBIEN
                      </button>
                      <button
                        onClick={() => setShowTambienConfirm(false)}
                        className="py-2 px-4 text-slate-400 hover:text-slate-600 text-xs font-bold tracking-wider uppercase transition-colors"
                      >
                        Volver
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* "Esta bien lo entiendo" Final Modal for No counts */}
              <AnimatePresence>
                {showNoFinalModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 border border-white"
                  >
                    <div className="bg-rose-50 text-rose-500 p-3.5 rounded-full mb-3 shadow-inner">
                      <HeartCrack className="w-8 h-8" />
                    </div>
                    <h4 className="text-slate-800 text-xl font-bold uppercase tracking-wider mb-4 leading-relaxed">
                      Esta bien lo entiendo
                    </h4>
                    <p className="text-slate-500 text-xs max-w-[240px] mb-8 leading-normal">
                      Gracias por ser sincera. Los mejores deseos siempre para ti, Dome. ✨
                    </p>
                    <button
                      onClick={resetGame}
                      className="flex items-center gap-2 py-2.5 px-5 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-md shadow-pink-200"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Volver a intentar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hint Reset Footer */}
            <div className="text-center">
              <button
                onClick={resetGame}
                className="text-pink-500/40 hover:text-pink-500/70 active:scale-95 transition-colors text-[11px] font-mono uppercase tracking-[0.15em] py-2 px-4 rounded-full border border-pink-200/20 bg-pink-50/10 cursor-pointer"
              >
                Reiniciar decisión
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans bg-[#FDF2F8]">
      
      {/* Absolute Ambient Soft Radial Gradient Canvas Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <div 
          className="w-full h-full"
          style={{
            background: 'radial-gradient(circle at 10% 20%, #FDF2F8 0%, #FAE8FF 50%, #EEF2FF 100%)'
          }}
        />
      </div>

      {/* Floating Ethereal Soft Blur Circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none z-0"></div>

      {/* Ambient drifting decorative stars (soft magenta-pink tints) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-pink-300 opacity-30 pulse-glow"
            style={{
              top: `${star.y}%`,
              left: `${star.x}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Top action header for global sound toggle or restarting */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 px-2 max-w-sm mx-auto">
        <button
          onClick={() => {
            setSoundEnabled(prev => !prev);
            triggerTick();
          }}
          className="p-2.5 rounded-full bg-white/60 border border-white/50 shadow-sm backdrop-blur-md hover:bg-white/85 text-slate-700 active:scale-95 transition-all text-xs flex items-center gap-2 cursor-pointer"
          title={soundEnabled ? "Desactivar Chime" : "Activar Chime"}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-pink-500" />
              <span className="font-mono text-[10px] text-pink-600 font-bold">AUDIO: SI</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-[10px] text-slate-400 font-semibold">AUDIO: NO</span>
            </>
          )}
        </button>

        {step > 0 && (
          <button
            onClick={restartAll}
            className="py-1 px-3 rounded-full bg-white/60 border border-white/50 shadow-sm backdrop-blur-md hover:bg-white/85 text-slate-500 hover:text-slate-800 text-[10px] font-mono tracking-widest uppercase transition-all flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Inicio
          </button>
        )}
      </div>

      {/* Mobile Frame Container: optimizes viewports on both tall desktop screens and fully responsive on absolute mobile views */}
      <div className="relative z-10 w-full max-w-[350px] h-[95dvh] lg:h-[90dvh] flex flex-col justify-between overflow-hidden glass-container rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(219,39,119,0.12)] my-4">
        
        {/* Simple thin top progress indicator line */}
        <div className="w-full bg-pink-100/40 h-[3px] mt-16 px-8 rounded-full">
          <div 
            className="bg-gradient-to-r from-pink-500 to-rose-450 h-full transition-all duration-500 ease-out rounded-full shadow-sm"
            style={{ width: `${((step + 1) / 7) * 100}%` }}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Humorous persistent signature footer at the bottom of each view */}
        <div className="w-full text-center py-6 select-none z-10 pointer-events-none">
          <p className="text-pink-600/60 text-[9px] font-black tracking-[0.16em] uppercase transition-all">
            *ESTO NO SE HIZO EN HORARIO LABORAL JJSJS*
          </p>
        </div>
      </div>
    </div>
  );
}

