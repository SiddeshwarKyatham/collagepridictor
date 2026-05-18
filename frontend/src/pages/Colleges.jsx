import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { getColleges } from '../services/api';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Loader2, Search, MapPin, Building2, ExternalLink, Map, LayoutGrid } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import CollegesMap from '../components/predictor/CollegesMap';

export default function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // We could fetch dynamic districts/types here, but simple lists are fine
  const districts = [...new Set(colleges.map(c => c.district))].sort();
  const types = [...new Set(colleges.map(c => c.collegeType))].sort();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // Fetch base colleges without phase filter to get all distinct
        const res = await getColleges({ search, district: districtFilter, collegeType: typeFilter });
        if (res.success) {
          setColleges(res.colleges);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    // Debounce the fetch
    const timeoutId = setTimeout(fetchAll, 300);
    return () => clearTimeout(timeoutId);
  }, [search, districtFilter, typeFilter]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-secondary border-b border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Colleges Directory
          </h1>
          <p className="text-secondary-foreground max-w-2xl mx-auto">
            Browse through {colleges.length > 0 ? colleges.length : 'all'} engineering colleges in Telangana. Search by name, district, or college type to find the perfect institution for your future.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-8">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="grid md:grid-cols-3 gap-4 bg-card p-4 rounded-xl shadow-sm border border-border flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-secondary-foreground" />
              <Input 
                placeholder="Search college name or code..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <Select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
                <option value="All">All Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
            <div>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="All">All Types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
          </div>
          
          <div className="flex bg-card border border-border p-1 rounded-xl h-[72px] lg:h-auto items-center shrink-0">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              className={`flex-1 lg:flex-none ${viewMode === 'grid' ? 'bg-accent-blue hover:bg-blue-600' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Grid
            </Button>
            <Button 
              variant={viewMode === 'map' ? 'default' : 'ghost'} 
              size="sm" 
              className={`flex-1 lg:flex-none ${viewMode === 'map' ? 'bg-accent-blue hover:bg-blue-600' : ''}`}
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4 mr-2" /> Map
            </Button>
          </div>
        </div>

        {/* List / Map */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <p className="text-secondary-foreground">No colleges found matching your criteria.</p>
          </div>
        ) : viewMode === 'map' ? (
          <CollegesMap colleges={colleges} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map(college => (
              <Link to={`/colleges/${college.collegeCode}`} key={college.collegeCode} className="group">
                <Card className="h-full hover:border-accent-blue/50 hover:shadow-md transition-all duration-300">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-accent-blue/10 text-accent-blue px-2.5 py-1 rounded text-xs font-bold tracking-wider">
                        {college.collegeCode}
                      </span>
                      <ExternalLink className="w-4 h-4 text-secondary-foreground group-hover:text-accent-blue transition-colors" />
                    </div>
                    <h3 className="font-semibold text-lg text-primary-foreground mb-3 line-clamp-2 group-hover:text-accent-blue transition-colors">
                      {college.collegeName}
                    </h3>
                    
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center text-sm text-secondary-foreground">
                        <MapPin className="w-3.5 h-3.5 mr-2 shrink-0" />
                        <span className="truncate">{college.place}, {college.district}</span>
                      </div>
                      <div className="flex items-center text-sm text-secondary-foreground">
                        <Building2 className="w-3.5 h-3.5 mr-2 shrink-0" />
                        <span className="truncate">{college.collegeType} • {college.coEducation}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
