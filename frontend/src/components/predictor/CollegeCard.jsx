import React, { memo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, BookOpen, Building2, GraduationCap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CollegeCard = memo(function CollegeCard({ data, isSelected, priority, onToggleSelect }) {
  // Determine probability ring color
  let ringColor = "text-accent-red";
  let badgeVariant = "destructive";
  if (data.admissionChance >= 85) { ringColor = "text-accent-green"; badgeVariant = "default"; }
  else if (data.admissionChance >= 60) { ringColor = "text-accent-yellow"; badgeVariant = "secondary"; }

  return (
    <Card className={`transition-all duration-200 hover:-translate-y-0.5 bg-card/60 backdrop-blur-sm
      ${isSelected 
        ? 'border-accent-blue/60 ring-2 ring-accent-blue/25 shadow-lg shadow-accent-blue/10' 
        : 'hover:border-accent-blue/40 hover:shadow-md hover:shadow-accent-blue/5'}`}
    >
      <CardContent className="p-3.5 md:p-5 flex flex-col md:flex-row md:items-center gap-3.5 md:gap-6">
        
        {/* Main Info Row (Title, Code, Probability) */}
        <div className="flex items-center gap-2.5 md:gap-4 md:w-[42%] shrink-0 min-w-0">
          {/* Checkbox & Priority indicator */}
          <div className="flex flex-col items-center justify-center gap-1 shrink-0 w-5 h-full">
            <input 
              type="checkbox" 
              className="w-4.5 h-4.5 rounded border-secondary-foreground text-accent-blue focus:ring-accent-blue focus:ring-offset-background bg-background cursor-pointer"
              checked={isSelected || false}
              onChange={() => onToggleSelect && onToggleSelect(data)}
            />
            {priority && (
              <span className="text-[9px] font-bold bg-accent-blue text-white w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-sm">
                {priority}
              </span>
            )}
          </div>

          {/* Probability Score Ring (sized down slightly on mobile) */}
          <div className="flex-shrink-0 flex items-center justify-center relative w-11 h-11 md:w-14 md:h-14 cursor-pointer" onClick={() => onToggleSelect && onToggleSelect(data)}>
            <svg className="w-11 h-11 md:w-14 md:h-14 transform -rotate-90">
              <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-secondary opacity-30" />
              <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="3" fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={`${251.2 * (1 - data.admissionChance / 100)}`} 
                      className={`${ringColor} transition-all duration-1000 ease-out`} />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[9px] md:text-xs font-extrabold text-primary-foreground">{data.admissionChance}%</span>
            </div>
          </div>

          <div className="cursor-pointer min-w-0 flex-1" onClick={() => onToggleSelect && onToggleSelect(data)}>
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span className="bg-accent-blue/10 text-accent-blue px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider shrink-0">
                {data.collegeCode}
              </span>
              <Badge variant={badgeVariant} className="text-[8px] px-1 py-0 uppercase shrink-0 font-extrabold">{data.prediction}</Badge>
              {data.isBestFit && (
                <Badge className="text-[8px] px-1 py-0 uppercase shrink-0 bg-amber-500 hover:bg-amber-600 text-black font-black flex items-center gap-0.5 shadow-sm border-0">
                  🎯 Best Fit
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-primary-foreground line-clamp-2 leading-tight text-xs md:text-sm break-words">
              {data.collegeName}
            </h3>
          </div>
        </div>
        
        {/* Details Grid (Branch, Place, Placements, Fees) */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap md:items-center gap-x-4 gap-y-2 md:gap-x-6 md:gap-y-3 cursor-pointer min-w-0 pl-7 md:pl-0 border-l border-border/20 md:border-l-0" onClick={() => onToggleSelect && onToggleSelect(data)}>
          <div className="flex items-center text-xs text-secondary-foreground min-w-0 sm:col-span-2 md:col-span-1">
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-accent-blue shrink-0 opacity-85" />
            <span className="truncate font-semibold flex-1 text-primary-foreground/90">{data.branchName} ({data.branchCode})</span>
          </div>
          
          <div className="flex items-center text-xs text-secondary-foreground min-w-0 sm:col-span-2 md:col-span-1">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-accent-green shrink-0 opacity-85" />
            <span className="truncate flex-1">{data.place}, {data.district}</span>
          </div>

          {data.tuitionFee && (
            <div className="flex items-center text-xs text-secondary-foreground">
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-accent-yellow shrink-0 opacity-85" />
              <span className="font-medium text-secondary-foreground">₹{(data.tuitionFee).toLocaleString()}/yr</span>
            </div>
          )}
          
          {data.averagePlacement && (
            <div className="flex items-center text-xs text-secondary-foreground">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-accent-blue shrink-0 opacity-85" />
              <span className="font-medium text-secondary-foreground">{data.averagePlacement} LPA Avg</span>
            </div>
          )}
        </div>

        {/* Closing Rank & CTA Row */}
        <div className="md:w-32 flex items-center justify-between md:flex-col md:items-end md:justify-center pt-2.5 md:pt-0 border-t md:border-t-0 border-border/40 shrink-0 pl-7 md:pl-0">
          <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-0.5 w-full md:w-auto mb-1.5 md:mb-0" onClick={() => onToggleSelect && onToggleSelect(data)}>
            <span className="text-[9px] text-secondary-foreground font-semibold uppercase tracking-wider">2025 Cutoff</span>
            <span className="font-black text-base md:text-lg text-accent-yellow">{data.closingRank.toLocaleString()}</span>
          </div>
          
          <Link 
            to={`/colleges/${data.collegeCode}`}
            className="inline-flex items-center justify-center text-[11px] md:text-xs font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-xl transition-colors w-auto shrink-0 md:mt-2 border border-border/40 shadow-sm"
          >
            View Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
        
      </CardContent>
    </Card>
  );
});

export default CollegeCard;
