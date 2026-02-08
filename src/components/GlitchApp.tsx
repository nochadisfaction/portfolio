import { useState, useEffect } from 'react';
import { FiTerminal, FiX } from 'react-icons/fi';

interface GlitchAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlitchApp({ isOpen, onClose }: GlitchAppProps) {
  const [phase, setPhase] = useState<'normal' | 'glitch' | 'revealed'>('normal');

  useEffect(() => {
    if (isOpen && phase === 'normal') {
      // Start glitch sequence
      setPhase('glitch');
      const timer = setTimeout(() => {
        setPhase('revealed');
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      setPhase('normal');
    }
  }, [isOpen, phase]);

  if (!isOpen) return null;

  if (phase === 'glitch') {
    return (
      <div className="fixed inset-0 bg-[#0078D7] z-[9999] flex items-center justify-center">
        <div className="text-white font-mono text-center">
          <div className="text-6xl mb-4">:(</div>
          <div className="text-xl mb-2">CRITICAL_SYSTEM_FAILURE</div>
          <div className="text-sm opacity-70">Your PC ran into a problem and needs to restart.</div>
          <div className="text-sm opacity-70">We're just collecting some error info, and then we'll restart for you.</div>
          <div className="mt-8 text-2xl animate-pulse">0% complete</div>
          <div className="mt-4 text-xs opacity-50">
            Stop code: CRITICAL_PROCESS_DIED<br />
            What failed: VIVI.EXE
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'revealed') {
    return (
      <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
        <div className="relative max-w-lg w-full bg-gray-900 border border-gray-700 rounded-lg p-6 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <FiTerminal className="text-green-400" size={24} />
            <h2 className="text-lg font-mono text-green-400">SYSTEM_RECOVERY_COMPLETE</h2>
          </div>
          
          <div className="font-mono text-sm text-gray-300 space-y-3">
            <p className="text-yellow-400">Just kidding. ;)</p>
            <p>
              You really thought I'd let Windows-style crashes happen here? 
              This is a Linux household.
            </p>
            <p>
              Here's something real instead:
            </p>
            <blockquote className="border-l-2 border-green-400 pl-4 italic text-gray-400">
              "The best systems are built by people who question the systems 
              they're building. Every line of code is a political act."
            </blockquote>
            <p className="text-xs text-gray-500 mt-4">
              — Vivi, from the digital manifesto
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs text-gray-600">Hidden feature #001</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-mono text-sm rounded transition-colors"
            >
              [ DISMISS ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
