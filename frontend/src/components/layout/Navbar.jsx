import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isLight, setIsLight] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setIsLight(false);
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsLight(true);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-primary/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
          <GraduationCap className="h-8 w-8 text-accent-blue" />
          <span className="font-bold text-xl tracking-tight text-primary-foreground">
            TG EAPCET <span className="text-secondary-foreground font-medium">Predictor</span>
          </span>
        </Link>
        
        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex space-x-6 text-sm font-medium">
            <Link to="/" className="text-secondary-foreground hover:text-primary-foreground transition-colors">Home</Link>
            <Link to="/colleges" className="text-secondary-foreground hover:text-primary-foreground transition-colors">Colleges</Link>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-9 h-9" aria-label="Toggle theme">
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Navigation controls */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-9 h-9 mr-1" aria-label="Toggle theme">
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-full w-9 h-9 text-primary-foreground" aria-label="Toggle menu">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sliding Glassmorphic Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-border bg-primary/95 backdrop-blur-xl overflow-hidden shadow-lg"
          >
            <div className="px-5 pt-3 pb-6 flex flex-col font-medium">
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)}
                className="text-secondary-foreground hover:text-primary-foreground transition-colors py-4 border-b border-border/40 text-base"
              >
                Home
              </Link>
              <Link 
                to="/colleges" 
                onClick={() => setIsOpen(false)}
                className="text-secondary-foreground hover:text-primary-foreground transition-colors py-4 text-base"
              >
                Colleges
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
