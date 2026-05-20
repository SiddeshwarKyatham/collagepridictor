import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Search, AlertTriangle } from 'lucide-react';
import { getDistricts, getBranches } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ["OC","BC_A","BC_B","BC_C","BC_D","BC_E","SC_I","SC_II","SC_III","ST","EWS"];

export default function PredictorForm({ initialData = {}, onPredict }) {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [branchesList, setBranchesList] = useState([]);
  const [errors, setErrors] = useState({});
  const [shakingFields, setShakingFields] = useState({});
  
  // Extract primitive values from initialData to prevent infinite loop / keystroke resets
  const initialRank = initialData.rank || '';
  const initialCategory = initialData.category || '';
  const initialGender = initialData.gender || '';
  const initialPhase = initialData.phase || '';
  const initialDistrict = initialData.district || 'All';
  const initialBranch = Array.isArray(initialData.branches) && initialData.branches.length > 0 
    ? initialData.branches[0] 
    : (initialData.branches || 'All');

  const [formData, setFormData] = useState({
    rank: initialRank,
    category: initialCategory,
    gender: initialGender,
    phase: initialPhase,
    district: initialDistrict,
    branch: initialBranch, 
  });

  // Sync state ONLY when primitive values actually change (avoiding resets on every keystroke)
  useEffect(() => {
    setFormData({
      rank: initialRank,
      category: initialCategory,
      gender: initialGender,
      phase: initialPhase,
      district: initialDistrict,
      branch: initialBranch,
    });
    setErrors({});
  }, [initialRank, initialCategory, initialGender, initialPhase, initialDistrict, initialBranch]);

  useEffect(() => {
    // Fetch available filters
    getDistricts().then(res => {
      if (res.success) setDistricts(res.districts);
    }).catch(console.error);

    getBranches().then(res => {
      if (res.success) setBranchesList(res.branches);
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field once user interacts with it
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Detailed client-side validation for required fields
    const newErrors = {};
    if (!formData.rank || parseInt(formData.rank) <= 0) {
      newErrors.rank = "Please enter a valid rank (greater than 0).";
    }
    if (!formData.category) {
      newErrors.category = "Please select your Category.";
    }
    if (!formData.gender) {
      newErrors.gender = "Please select your Gender.";
    }
    if (!formData.phase) {
      newErrors.phase = "Please select a Counseling Phase.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      
      // Trigger shake animation for fields that are missing
      const fieldsToShake = {};
      Object.keys(newErrors).forEach(field => {
        fieldsToShake[field] = true;
      });
      setShakingFields(fieldsToShake);
      
      // Clear shake after animation completes (400ms)
      setTimeout(() => {
        setShakingFields({});
      }, 400);
      return;
    }

    // If valid, proceed!
    setErrors({});
    
    const params = new URLSearchParams();
    params.append('rank', formData.rank);
    params.append('category', formData.category);
    params.append('gender', formData.gender);
    params.append('phase', formData.phase);
    
    if (formData.district && formData.district !== 'All') {
      params.append('district', formData.district);
    }
    
    if (formData.branch && formData.branch !== 'All') {
      // Send as array so backend predictionService still works
      params.append('branches[]', formData.branch);
    }

    if (onPredict) {
      const apiData = {
        rank: formData.rank,
        category: formData.category,
        gender: formData.gender,
        phase: formData.phase,
        district: formData.district,
        branches: formData.branch !== 'All' ? [formData.branch] : []
      };
      onPredict(apiData);
    } else {
      navigate(`/results?${params.toString()}`);
    }
  };

  return (
    <Card className="w-full shadow-lg border-border/50 bg-card/95 backdrop-blur relative overflow-hidden">
      {/* Visual background gradient pulse */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-[50px] rounded-full pointer-events-none" />
      
      <CardHeader>
        <CardTitle className="text-2xl">Enter Your Details</CardTitle>
        <CardDescription>Find your best matches based on 2025 cutoffs.</CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Dynamic Cool Custom Error Toast inside the form card */}
        <AnimatePresence>
          {Object.keys(errors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -15 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-accent-red/10 border border-accent-red/35 rounded-2xl p-4 mb-5 text-accent-red text-sm font-medium relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-accent-red/20 flex items-center justify-center text-accent-red">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-accent-red">Missing Required Information</p>
                  <p className="text-xs text-secondary-foreground leading-relaxed">
                    To prevent misleading prediction results, please fill in all requested fields:
                  </p>
                  <ul className="list-disc list-inside text-xs text-secondary-foreground mt-2 space-y-1">
                    {Object.values(errors).map((err, idx) => (
                      <li key={idx} className="text-secondary-foreground/90 font-medium">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-red/5 to-transparent pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className={`space-y-2 transition-all duration-300 ${shakingFields.rank ? 'animate-shake' : ''}`}>
            <label className="text-sm font-medium text-secondary-foreground">EAPCET Rank</label>
            <Input 
              type="number" 
              inputMode="numeric"
              pattern="[0-9]*"
              name="rank"
              placeholder="e.g. 15000" 
              value={formData.rank}
              onChange={handleChange}
              min="1"
              className={`text-lg py-6 transition-all duration-200 ${
                errors.rank ? 'border-error-glow ring-1 ring-accent-red/30' : ''
              }`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className={`space-y-2 transition-all duration-300 ${shakingFields.category ? 'animate-shake' : ''}`}>
              <label className="text-sm font-medium text-secondary-foreground">Category</label>
              <Select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                className={`transition-all duration-200 ${
                  errors.category ? 'border-error-glow ring-1 ring-accent-red/30' : ''
                } ${formData.category === '' ? 'text-secondary-foreground/70' : 'text-primary-foreground'}`}
              >
                <option value="" disabled hidden>Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
              </Select>
            </div>
            
            <div className={`space-y-2 transition-all duration-300 ${shakingFields.gender ? 'animate-shake' : ''}`}>
              <label className="text-sm font-medium text-secondary-foreground">Gender</label>
              <Select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                className={`transition-all duration-200 ${
                  errors.gender ? 'border-error-glow ring-1 ring-accent-red/30' : ''
                } ${formData.gender === '' ? 'text-secondary-foreground/70' : 'text-primary-foreground'}`}
              >
                <option value="" disabled hidden>Select Gender</option>
                <option value="BOYS">Boys / General</option>
                <option value="GIRLS">Girls</option>
              </Select>
            </div>
          </div>

          <div className={`space-y-2 transition-all duration-300 ${shakingFields.phase ? 'animate-shake' : ''}`}>
            <label className="text-sm font-medium text-secondary-foreground">Phase</label>
            <Select 
              name="phase" 
              value={formData.phase} 
              onChange={handleChange}
              className={`transition-all duration-200 ${
                errors.phase ? 'border-error-glow ring-1 ring-accent-red/30' : ''
              } ${formData.phase === '' ? 'text-secondary-foreground/70' : 'text-primary-foreground'}`}
            >
              <option value="" disabled hidden>Select Phase</option>
              <option value="First">First Phase</option>
              <option value="Second">Second Phase</option>
              <option value="Final">Final Phase</option>
            </Select>
          </div>

          <div className="pt-2 border-t border-border/70 mt-2">
            <p className="text-sm font-semibold mb-3 text-primary-foreground">Optional Preferences</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-foreground">District Preference</label>
                <Select 
                  name="district" 
                  value={formData.district} 
                  onChange={handleChange}
                  className="transition-all duration-200 text-primary-foreground"
                >
                  <option value="All">All Districts</option>
                  {districts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-foreground">Branch Preference</label>
                <Select 
                  name="branch" 
                  value={formData.branch} 
                  onChange={handleChange}
                  className="transition-all duration-200 text-primary-foreground"
                >
                  <option value="All">All Branches</option>
                  {branchesList.map(b => (
                    <option key={b.branchCode} value={b.branchCode}>
                      {b.branchCode} - {b.branchName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full mt-4 bg-gradient-to-r from-accent-blue to-blue-600 hover:from-blue-600 hover:to-accent-blue text-white shadow-md shadow-accent-blue/15 border-none cursor-pointer transition-all duration-300">
            <Search className="mr-2 h-5 w-5" />
            Predict Colleges
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
