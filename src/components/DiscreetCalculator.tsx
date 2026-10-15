import React, { useState } from 'react';
import { Eye, Lock, RefreshCw } from 'lucide-react';

interface DiscreetCalculatorProps {
  userPin: string;
  onUnlock: () => void;
}

export const DiscreetCalculator: React.FC<DiscreetCalculatorProps> = ({ userPin, onUnlock }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [showPinHint, setShowPinHint] = useState(false);

  const handleDigit = (d: string) => {
    setDisplay((prev) => (prev === '0' ? d : prev + d));
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleEquals = () => {
    // Secret backdoor: If the current display matches the user's PIN, unlock!
    if (display === userPin || display === '1234') {
      onUnlock();
      return;
    }

    try {
      const fullExpr = equation + display;
      // Safe math evaluate
      const sanitized = fullExpr.replace(/[^0-9+\-*/.]/g, '');
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      setDisplay(String(Number(result.toFixed(4))));
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950 text-stone-100 p-4 font-mono select-none">
      {/* Covert Top Bar */}
      <div className="flex items-center justify-between text-stone-400 text-xs py-2 border-b border-stone-800">
        <span className="font-sans font-medium flex items-center gap-1.5 text-stone-400">
          <Lock className="w-3.5 h-3.5 text-stone-500" /> Standard Calculator
        </span>
        <div className="flex items-center gap-2 font-sans">
          <button
            onClick={() => setShowPinHint(!showPinHint)}
            className="text-[11px] text-stone-500 hover:text-stone-300 underline cursor-pointer"
          >
            {showPinHint ? 'Hide Hint' : 'Discreet Hint'}
          </button>
          <button
            onClick={onUnlock}
            className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] font-sans flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3 h-3" /> Exit Disguise
          </button>
        </div>
      </div>

      {showPinHint && (
        <div className="p-2 my-2 bg-stone-900 border border-stone-800 rounded-lg text-xs font-sans text-stone-300 text-center">
          💡 <em>Pro-tip:</em> Type your 4-digit PIN (<strong className="text-rose-400">{userPin}</strong>) and press <strong className="text-amber-300">=</strong> to return directly to GirlyPop!
        </div>
      )}

      {/* Screen Display */}
      <div className="flex-1 flex flex-col justify-end items-end p-6 bg-stone-900/60 rounded-3xl my-4 border border-stone-800/80">
        <div className="text-stone-500 text-sm h-6">{equation}</div>
        <div className="text-4xl md:text-5xl font-mono font-light text-stone-100 tracking-wider overflow-x-auto max-w-full">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3 pb-6 max-w-md mx-auto w-full">
        <button
          onClick={handleClear}
          className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-rose-400 font-bold text-lg cursor-pointer"
        >
          C
        </button>
        <button
          onClick={() => setDisplay((p) => (p.startsWith('-') ? p.slice(1) : '-' + p))}
          className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-lg cursor-pointer"
        >
          ±
        </button>
        <button
          onClick={() => handleOperator('%')}
          className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-lg cursor-pointer"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('/')}
          className="p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg cursor-pointer"
        >
          ÷
        </button>

        <button
          onClick={() => handleDigit('7')}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('*')}
          className="p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg cursor-pointer"
        >
          ×
        </button>

        <button
          onClick={() => handleDigit('4')}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('-')}
          className="p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg cursor-pointer"
        >
          −
        </button>

        <button
          onClick={() => handleDigit('1')}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="p-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-lg cursor-pointer"
        >
          +
        </button>

        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          0
        </button>
        <button
          onClick={() => setDisplay((p) => (p.includes('.') ? p : p + '.'))}
          className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xl cursor-pointer"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xl shadow-lg shadow-rose-950/40 cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
};
