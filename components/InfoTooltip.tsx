"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  text: string;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1 group">
      <button 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-muted-foreground/40 hover:text-primary transition-colors focus:outline-none"
      >
        <Info size={12} />
      </button>
      
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface-high border border-primary/20 p-3 shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200">
          <p className="text-[10px] font-bold text-foreground leading-relaxed uppercase tracking-tight">
            {text}
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-surface-high" />
        </div>
      )}
    </div>
  );
}
