import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Search } from 'lucide-react';
import { getDistricts, getBranches } from '../../services/api';

const CATEGORIES = ["OC","BC_A","BC_B","BC_C","BC_D","BC_E","SC_I","SC_II","SC_III","ST","EWS"];

export default function PredictorForm({ initialData = {}, onPredict }) {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [branchesList, setBranchesList] = useState([]);
  
  // Handle branches being an array from URL params or a single string
  const initialBranch = Array.isArray(initialData.branches) && initialData.branches.length > 0 
    ? initialData.branches[0] 
    : (initialData.branches || 'All');

  const [formData, setFormData] = useState({
    rank: initialData.rank || '',
    category: initialData.category || 'OC',
    gender: initialData.gender || 'BOYS',
    phase: initialData.phase || 'Final',
    district: initialData.district || 'All',
    branch: initialBranch, 
  });

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.rank) return;
    
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
      // Create clean object for API call
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
    <Card className="w-full shadow-lg border-border/50 bg-card/95 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl">Enter Your Details</CardTitle>
        <CardDescription>Find your best matches based on 2025 cutoffs.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary-foreground">EAPCET Rank</label>
            <Input 
              type="number" 
              inputMode="numeric"
              pattern="[0-9]*"
              name="rank"
              placeholder="e.g. 15000" 
              value={formData.rank}
              onChange={handleChange}
              required
              min="1"
              className="text-lg py-6"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-foreground">Category</label>
              <Select name="category" value={formData.category} onChange={handleChange}>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-foreground">Gender</label>
              <Select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="BOYS">Boys / General</option>
                <option value="GIRLS">Girls</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary-foreground">Phase</label>
            <Select name="phase" value={formData.phase} onChange={handleChange}>
              <option value="First">First Phase</option>
              <option value="Second">Second Phase</option>
              <option value="Final">Final Phase</option>
            </Select>
          </div>

          <div className="pt-2 border-t border-border mt-2">
            <p className="text-sm font-semibold mb-3">Optional Filters</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-foreground">District Preference</label>
                <Select name="district" value={formData.district} onChange={handleChange}>
                  <option value="All">All Districts</option>
                  {districts.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-foreground">Branch Preference</label>
                <Select name="branch" value={formData.branch} onChange={handleChange}>
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

          <Button type="submit" size="lg" className="w-full mt-4">
            <Search className="mr-2 h-5 w-5" />
            Predict Colleges
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
