import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PredictorForm from '../components/predictor/PredictorForm';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, TrendingUp, Users } from 'lucide-react';
import { getStats, incrementVisitor } from '../services/api';

export default function Landing() {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const handleStats = async () => {
      try {
        const isRegistered = localStorage.getItem('tgeapcet_visitor_registered');
        if (!isRegistered) {
          const res = await incrementVisitor();
          if (res.success) {
            setVisitorCount(res.visitorCount);
            localStorage.setItem('tgeapcet_visitor_registered', 'true');
          }
        } else {
          const res = await getStats();
          if (res.success) {
            setVisitorCount(res.visitorCount);
          }
        }
      } catch (err) {
        console.error('Error handling stats:', err);
      }
    };
    handleStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-6 pb-16 lg:pt-32 lg:pb-40">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-blue/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-8 items-center">
              
              {/* Left text content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary-foreground leading-tight mb-6">
                  Find the Best TG EAPCET Colleges for Your Rank
                </h1>
                <p className="text-lg text-secondary-foreground mb-8 leading-relaxed max-w-xl">
                  Stop guessing. Get professional, data-driven college predictions based on authentic 2025 cutoff data. Filter by district, branch, and see your exact chances of admission.
                </p>

                {/* Glassmorphic Stats Counter */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-accent-blue/10 to-accent-green/10 border border-accent-blue/20 backdrop-blur-md rounded-2xl p-4 px-5 mb-8 max-w-xl shadow-lg shadow-accent-blue/5">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-primary-foreground tracking-tight flex items-baseline gap-2">
                      <span>{visitorCount.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Students Helped & Guided
                      </span>
                    </div>
                    <div className="text-xs text-secondary-foreground mt-0.5">
                      Genuine dynamic calculation of unique students guided through our prediction system.
                    </div>
                  </div>
                </div>

                {/* Premium Disclaimer Callout */}
                <div className="relative overflow-hidden bg-gradient-to-br from-accent-yellow/10 to-transparent border border-accent-yellow/20 backdrop-blur-md shadow-lg shadow-accent-yellow/5 rounded-2xl p-5 mb-8 max-w-xl">
                  {/* Subtle glow orb */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-yellow/20 blur-[30px] rounded-full pointer-events-none" />
                  
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-accent-yellow/20 text-accent-yellow">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-accent-yellow mb-1 text-sm tracking-wide uppercase">Predictions Disclaimer</h3>
                      <p className="text-sm text-secondary-foreground leading-relaxed">
                        These are solely predictions based on the <strong>2025 counseling cutoffs</strong>. 
                        We cannot guarantee admission. The actual real-world cutoffs may vary, but they will likely fall near these estimates. Use this tool as a reference, not a final guarantee.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm font-medium text-secondary-foreground">
                  <div className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-accent-green" /> Authentic Data</div>
                  <div className="flex items-center"><Target className="mr-2 h-5 w-5 text-accent-blue" /> Smart Categorization</div>
                  <div className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-accent-yellow" /> Branch Trends</div>
                </div>
              </motion.div>

              {/* Right form card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full max-w-md mx-auto lg:ml-auto lg:mr-0"
              >
                <PredictorForm />
              </motion.div>
              
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
