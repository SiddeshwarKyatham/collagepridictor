import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { getCollegeDetail } from '../services/api';
import { Loader2, MapPin, Building2, BookOpen, ExternalLink, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function CollegeDetail() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await getCollegeDetail(code, { phase: 'Final' });
        if (res.success) {
          setData(res.college);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-2xl font-bold mb-2">College Not Found</h2>
          <p className="text-secondary-foreground mb-6">We couldn't find data for college code {code}.</p>
          <Link to="/" className="text-accent-blue hover:underline inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Predictor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Header Banner */}
      <div className="bg-secondary border-b border-border py-12">
        <div className="container mx-auto px-4">
          <Link to={-1} className="text-secondary-foreground hover:text-primary-foreground inline-flex items-center mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="flex gap-6 items-start">
              {data.profile?.logoUrl && (
                <div className="hidden sm:block shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-card border border-border">
                  <img src={data.profile.logoUrl} alt={`${data.collegeCode} Logo`} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="bg-accent-blue/20 text-accent-blue px-3 py-1 rounded-md text-sm font-bold tracking-wider">
                    {data.collegeCode}
                  </span>
                  <Badge variant="outline">{data.collegeType}</Badge>
                  <Badge variant="outline">{data.coEducation}</Badge>
                  {data.profile?.establishedYear && (
                    <Badge variant="default" className="bg-primary text-secondary-foreground border border-border">
                      Est. {data.profile.establishedYear}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 leading-tight">
                  {data.collegeName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-foreground mb-4">
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {data.place}, {data.district}</div>
                  <div className="flex items-center"><Building2 className="w-4 h-4 mr-1.5" /> Affiliated to {data.affiliatedTo}</div>
                </div>

                {data.profile?.description && (
                  <p className="text-secondary-foreground max-w-3xl leading-relaxed text-sm md:text-base mb-4">
                    {data.profile.description}
                  </p>
                )}

                {(data.profile?.tuitionFee || data.profile?.averagePlacement) && (
                  <div className="flex flex-wrap gap-4 mt-6">
                    {data.profile.tuitionFee && (
                      <div className="bg-card border border-border px-4 py-3 rounded-xl flex items-center gap-3">
                        <div className="bg-accent-green/10 p-2 rounded-lg text-accent-green">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-secondary-foreground font-medium uppercase tracking-wider">Tuition Fee</p>
                          <p className="font-bold text-lg text-primary-foreground">₹{(data.profile.tuitionFee).toLocaleString()} <span className="text-sm font-normal text-secondary-foreground">/ yr</span></p>
                        </div>
                      </div>
                    )}
                    {data.profile.averagePlacement && (
                      <div className="bg-card border border-border px-4 py-3 rounded-xl flex items-center gap-3">
                        <div className="bg-accent-blue/10 p-2 rounded-lg text-accent-blue">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0l-9-5v-6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-secondary-foreground font-medium uppercase tracking-wider">Avg Placement</p>
                          <p className="font-bold text-lg text-primary-foreground">{data.profile.averagePlacement} <span className="text-sm font-normal text-secondary-foreground">LPA</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-6 border-t border-border/50 pt-4">
                  {data.profile?.websiteUrl ? (
                    <div>
                      <a href={data.profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-accent-blue hover:text-blue-400 font-medium text-sm transition-colors">
                        <ExternalLink className="w-4 h-4 mr-1.5" /> Official Website
                      </a>
                      <p className="text-xs text-secondary-foreground/70 mt-1 italic">
                        Note: This website link was automatically derived and may not be 100% accurate. Please verify independently.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-secondary-foreground/70 italic">
                      No official website on record for this institution.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-accent-blue" /> Branch Cutoffs ({data.phase} Phase, {data.year})
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {data.branches.map(branch => (
            <Card key={branch.branchCode} className="overflow-hidden">
              <div className="bg-secondary/50 p-4 border-b border-border">
                <h3 className="font-semibold text-lg text-primary-foreground">
                  {branch.branchCode} <span className="text-secondary-foreground text-sm font-normal ml-2">{branch.branchName}</span>
                </h3>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/30 text-secondary-foreground border-b border-border text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Gender</th>
                        <th className="px-4 py-3 font-medium text-right">Closing Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {branch.cutoffs.map((cutoff, idx) => (
                        <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-primary-foreground">{cutoff.category.replace('_', ' ')}</td>
                          <td className="px-4 py-3 text-secondary-foreground">{cutoff.gender}</td>
                          <td className="px-4 py-3 font-semibold text-right text-accent-yellow">{cutoff.closingRank.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
