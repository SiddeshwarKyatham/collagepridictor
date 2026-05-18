import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PredictorForm from '../components/predictor/PredictorForm';
import CollegeCard from '../components/predictor/CollegeCard';
import { predictColleges, getDistricts } from '../services/api';
import { Loader2, SlidersHorizontal, X, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PredictorResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedColleges, setSelectedColleges] = useState([]); // Changed to Array to track order (priority)
  const [sortOrder, setSortOrder] = useState('safe-to-dream');

  // Parse branches correctly from searchParams since they might be arrays
  const branchParams = searchParams.getAll('branches[]');
  
  const currentParams = {
    rank: searchParams.get('rank') || '',
    category: searchParams.get('category') || 'OC',
    gender: searchParams.get('gender') || 'BOYS',
    phase: searchParams.get('phase') || 'Final',
    district: searchParams.get('district') || 'All',
    branches: branchParams.length > 0 ? branchParams : undefined
  };

  useEffect(() => {
    if (currentParams.rank) {
      fetchPredictions(currentParams);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPredictions = async (params) => {
    setLoading(true);
    try {
      const res = await predictColleges(params);
      setResults(res);
      setSelectedColleges([]); // Reset selections on new search
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = useCallback((college) => {
    setSelectedColleges(prev => {
      if (prev.includes(college.id)) {
        return prev.filter(id => id !== college.id);
      } else {
        return [...prev, college.id];
      }
    });
  }, []);

  const getPriority = useCallback((collegeId) => {
    const index = selectedColleges.indexOf(collegeId);
    return index !== -1 ? index + 1 : null;
  }, [selectedColleges]);

  const sortedResults = useMemo(() => {
    if (!results?.results) return [];
    return [...results.results].sort((a, b) => {
      if (sortOrder === 'safe-to-dream') {
        return b.admissionChance - a.admissionChance;
      } else {
        return a.admissionChance - b.admissionChance;
      }
    });
  }, [results, sortOrder]);

  const downloadPDF = () => {
    if (selectedColleges.length === 0) return;
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('My TGEAPCET Option Entry Priorities', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated for Rank: ${currentParams.rank} | Category: ${currentParams.category}`, 14, 30);
    
    doc.setFontSize(9);
    doc.setTextColor(220, 38, 38); // Red warning color
    doc.text('* Disclaimer: These are predictions based on 2025 cutoffs. Real cutoffs may vary.', 14, 36);
    
    // Map items strictly by the order they were selected (Priority 1, 2, 3...)
    const itemsToExport = selectedColleges.map(id => results.results.find(c => c.id === id)).filter(Boolean);
    
    const tableData = itemsToExport.map((item, index) => [
      index + 1, // Priority Order
      item.collegeCode,
      item.collegeName,
      item.branchCode,
      item.place,
      item.tuitionFee ? `Rs ${item.tuitionFee.toLocaleString()}` : '-',
      item.averagePlacement ? `${item.averagePlacement} LPA` : '-',
      item.closingRank
    ]);

    autoTable(doc, {
      startY: 42,
      head: [['Priority', 'Code', 'College Name', 'Branch', 'Place', 'Fee', 'Placement', 'Cutoff']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });

    doc.save('TGEAPCET_Priority_Options.pdf');
  };

  const handlePredict = (newData) => {
    // Convert to flat URL params
    const params = new URLSearchParams();
    params.append('rank', newData.rank);
    params.append('category', newData.category);
    params.append('gender', newData.gender);
    params.append('phase', newData.phase);
    
    if (newData.district && newData.district !== 'All') {
      params.append('district', newData.district);
    }
    
    if (newData.branches && newData.branches.length > 0) {
      newData.branches.forEach(b => params.append('branches[]', b));
    }
    
    setSearchParams(params);
    setIsMobileFiltersOpen(false);
  };

  // Count Safe/Moderate/Dream for summary cards
  const summary = { safe: 0, moderate: 0, dream: 0 };
  if (results && results.results) {
    results.results.forEach(r => {
      if (r.prediction === 'Safe') summary.safe++;
      else if (r.prediction === 'Moderate') summary.moderate++;
      else if (r.prediction === 'Dream') summary.dream++;
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">Prediction Results</h1>
          <Button variant="outline" size="sm" onClick={() => setIsMobileFiltersOpen(true)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-8">
            <h2 className="text-lg font-semibold mb-4 text-primary-foreground flex items-center">
              <SlidersHorizontal className="w-5 h-5 mr-2 text-secondary-foreground" /> Adjust Parameters
            </h2>
            <PredictorForm initialData={currentParams} onPredict={handlePredict} />
          </div>

          {/* Mobile Filters Drawer */}
          <AnimatePresence>
            {isMobileFiltersOpen && (
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-xl lg:hidden overflow-y-auto"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Adjust Parameters</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)}>
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                  <PredictorForm initialData={currentParams} onPredict={handlePredict} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Area */}
          <div className="lg:col-span-3">
            {!currentParams.rank ? (
              <div className="text-center py-20 text-secondary-foreground">
                <p>Please enter your rank to see predictions.</p>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
              </div>
            ) : results ? (
              <div className="space-y-6">
                
                {/* Premium Glassmorphic Disclaimer */}
                <div className="relative overflow-hidden bg-gradient-to-br from-accent-yellow/10 to-transparent border border-accent-yellow/20 backdrop-blur-md shadow-lg shadow-accent-yellow/5 rounded-2xl p-5">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-yellow/20 blur-[30px] rounded-full pointer-events-none" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="shrink-0 mt-1 flex items-center justify-center w-9 h-9 rounded-full bg-accent-yellow/20 text-accent-yellow font-bold text-base">
                      ⚠️
                    </div>
                    <div>
                      <h3 className="font-bold text-accent-yellow mb-1 text-sm tracking-wide uppercase">Predictions Disclaimer</h3>
                      <p className="text-sm text-secondary-foreground leading-relaxed">
                        These are solely predictions based on the <strong className="text-primary-foreground">2025 counseling cutoffs</strong>.
                        We cannot guarantee admission — the actual real-world cutoffs may vary, but they will likely fall near these estimates. Use this tool as a reference, not a final guarantee.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-accent-green/10 to-transparent border border-accent-green/20 shadow-sm">
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-accent-green/20 blur-xl rounded-full pointer-events-none" />
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-accent-green">Safe Options</div>
                    <div className="text-4xl font-bold text-primary-foreground">{summary.safe}</div>
                    <div className="text-xs text-secondary-foreground mt-1">&gt; 75% chance</div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-accent-yellow/10 to-transparent border border-accent-yellow/20 shadow-sm">
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-accent-yellow/20 blur-xl rounded-full pointer-events-none" />
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-accent-yellow">Moderate</div>
                    <div className="text-4xl font-bold text-primary-foreground">{summary.moderate}</div>
                    <div className="text-xs text-secondary-foreground mt-1">50–75% chance</div>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-accent-red/10 to-transparent border border-accent-red/20 shadow-sm">
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-accent-red/20 blur-xl rounded-full pointer-events-none" />
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-accent-red">Dream</div>
                    <div className="text-4xl font-bold text-primary-foreground">{summary.dream}</div>
                    <div className="text-xs text-secondary-foreground mt-1">&lt; 50% chance</div>
                  </div>
                </div>

                {/* College List */}
                <div className="mt-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-border pb-4 gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">All Possible Colleges</h3>
                      <span className="text-sm text-secondary-foreground">Showing {results.meta.totalShown} realistic options</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <select 
                        className="bg-secondary/80 backdrop-blur-sm border border-border text-sm rounded-xl px-3 py-2 text-primary-foreground focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue focus:outline-none w-full sm:w-auto transition-all"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                      >
                        <option value="safe-to-dream">⬆ Safe to Dream</option>
                        <option value="dream-to-safe">⬇ Dream to Safe</option>
                      </select>
                    </div>
                  </div>
                  
                  {!results.results || results.results.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-xl">
                      <p className="text-secondary-foreground">No colleges found matching these criteria.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 pb-24">
                      {sortedResults.map(college => (
                        <CollegeCard 
                          key={college.id} 
                          data={college} 
                          isSelected={selectedColleges.includes(college.id)}
                          priority={getPriority(college.id)}
                          onToggleSelect={handleToggleSelect}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : null}
          </div>

        </div>
      </main>

      {/* Floating Download Button */}
      <AnimatePresence>
        {selectedColleges.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none"
          >
            <div className="pointer-events-auto bg-card/80 backdrop-blur-xl border border-border shadow-2xl shadow-black/30 rounded-full px-6 py-3 flex items-center gap-4">
              <div className="text-sm font-medium">
                <span className="bg-gradient-to-r from-accent-blue to-blue-400 text-white text-xs px-2.5 py-1 rounded-full mr-2 font-bold shadow-sm">{selectedColleges.length}</span>
                <span className="text-secondary-foreground">options selected</span>
              </div>
              <div className="h-6 w-px bg-border"></div>
              <Button onClick={downloadPDF} className="bg-gradient-to-r from-accent-blue to-blue-500 hover:from-blue-500 hover:to-accent-blue text-white rounded-full shadow-md shadow-accent-blue/20 border-0 transition-all">
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
