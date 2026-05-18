import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';

export default function Navbar() {
  const [isLight, setIsLight] = useState(false);

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
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-accent-blue" />
          <span className="font-bold text-xl tracking-tight text-primary-foreground">
            TG EAPCET <span className="text-secondary-foreground font-medium">Predictor</span>
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex space-x-6 text-sm font-medium">
            <Link to="/" className="text-secondary-foreground hover:text-primary-foreground transition-colors">Home</Link>
            <Link to="/colleges" className="text-secondary-foreground hover:text-primary-foreground transition-colors">Colleges</Link>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full w-9 h-9" aria-label="Toggle theme">
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </nav>
  );
}
