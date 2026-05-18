import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/25 backdrop-blur-md mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          {/* Brand section */}
          <div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent tracking-wide">
              TG EAPCET COLLEGE PREDICTOR
            </h3>
            <p className="text-xs text-secondary-foreground mt-1.5 max-w-sm leading-relaxed">
              A premium, data-driven utility built to guide students toward their dream engineering careers.
            </p>
          </div>

          {/* Developer Credits Section */}
          <div className="flex flex-col items-center md:items-end gap-2.5">
            <div className="text-xs text-secondary-foreground flex items-center gap-1.5">
              <span>Developed with</span> 
              <Heart className="w-3.5 h-3.5 text-accent-red fill-accent-red animate-pulse" /> 
              <span>by</span>
              <span className="font-semibold text-primary-foreground hover:text-accent-blue transition-colors">
                Siddeshwar Kyatham
              </span>
            </div>
            
            <a 
              href="https://www.linkedin.com/in/siddeshwar-kyatham" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-accent-blue hover:text-blue-400 bg-accent-blue/10 hover:bg-accent-blue/20 px-4 py-2 rounded-full transition-all border border-accent-blue/20 hover:border-accent-blue/40 shadow-sm"
            >
              <svg 
                className="w-3.5 h-3.5 shrink-0" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span>Let's connect on LinkedIn!</span>
            </a>
          </div>
          
        </div>
        
        {/* Fine print row */}
        <div className="mt-8 pt-4 border-t border-border/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-secondary-foreground">
          <div>© {new Date().getFullYear()} TG EAPCET Predictor. All rights reserved.</div>
          <div>All predictions are references based on 2025 cutoff metrics. Actual cutoffs may vary.</div>
        </div>
      </div>
    </footer>
  );
}
