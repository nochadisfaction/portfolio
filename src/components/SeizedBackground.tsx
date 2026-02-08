import { useState, useEffect } from 'react';

interface SeizedBackgroundProps {
  children: React.ReactNode;
}

export default function SeizedBackground({ children }: SeizedBackgroundProps) {
  const [showPrank, setShowPrank] = useState(false);
  const [phase, setPhase] = useState<'seized' | 'revealed'>('seized');

  useEffect(() => {
    // 1.5% chance to trigger on page load
    const shouldTrigger = Math.random() < 0.015;
    if (shouldTrigger) {
      setShowPrank(true);
      setPhase('seized');
      
      const timer = setTimeout(() => {
        setPhase('revealed');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrank(false);
  };

  if (!showPrank) {
    return <>{children}</>;
  }

  if (phase === 'seized') {
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] z-[9999] flex flex-col items-center justify-center text-white">
        <div className="max-w-2xl w-full p-8 text-center">
          {/* FBI Seal placeholder */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-900 flex items-center justify-center border-4 border-yellow-500">
            <span className="text-yellow-500 font-bold text-xs text-center leading-tight">
              DEPARTMENT OF<br/>JUSTICE
            </span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-500">
            THIS DOMAIN HAS BEEN SEIZED
          </h1>
          
          <p className="text-lg mb-2">
            by the Federal Bureau of Investigation
          </p>
          <p className="text-sm text-gray-400 mb-6">
            in accordance with a seizure warrant issued pursuant to 18 U.S.C. § 1030
          </p>
          
          <div className="border-t border-gray-700 pt-4 mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Case Number</p>
            <p className="text-lg font-mono text-yellow-500">CASE-2025-VIVI-001</p>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Charges: Unfiltered Tech Discourse, Excessive Truth-Telling,</p>
            <p>Conspiracy to Question Authority</p>
          </div>
          
          <div className="mt-8 animate-pulse text-xs text-gray-600">
            Analyzing encrypted communications...
          </div>
        </div>
      </div>
    );
  }

  // Revealed phase
  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="text-6xl mb-4">😉</div>
        
        <h2 className="text-2xl font-bold text-white">Just Kidding</h2>
        
        <p className="text-gray-400 leading-relaxed">
          But while you're here — think about who really controls digital infrastructure.
        </p>
        
        <p className="text-sm text-gray-500">
          The same systems that can seize domains can monitor communications, 
          track movements, and silence dissent.
        </p>
        
        <div className="pt-4">
          <a 
            href="https://acab.lol" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
          >
            Learn about police tech →
          </a>
        </div>
        
        <button
          onClick={handleDismiss}
          className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
        >
          Continue to site
        </button>
        
        <p className="text-xs text-gray-600 mt-4">
          This prank appeared because you won the 1.5% lottery. 
          <br/>
          Refresh to see if it happens again (it probably won't).
        </p>
      </div>
    </div>
  );
}
