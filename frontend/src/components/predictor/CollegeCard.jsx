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
      <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        
        <div className="flex items-center gap-3 md:gap-4 md:w-[40%] shrink-0 min-w-0">
          {/* Checkbox & Priority */}
          <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 w-6 h-full">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-secondary-foreground text-accent-blue focus:ring-accent-blue focus:ring-offset-background bg-background cursor-pointer"
              checked={isSelected || false}
              onChange={() => onToggleSelect && onToggleSelect(data)}
            />
            {priority && (
              <span className="text-[10px] font-bold bg-accent-blue text-white w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {priority}
              </span>
            )}
          </div>

          {/* Probability Score Ring */}
          <div className="flex-shrink-0 flex items-center justify-center relative w-12 h-12 md:w-14 md:h-14 cursor-pointer" onClick={() => onToggleSelect && onToggleSelect(data)}>
            <svg className="w-12 h-12 md:w-14 md:h-14 transform -rotate-90">
              <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-secondary opacity-30" />
              <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="4" fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={`${251.2 * (1 - data.admissionChance / 100)}`} 
                      className={`${ringColor} transition-all duration-1000 ease-out`} />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] md:text-xs font-bold text-primary-foreground">{data.admissionChance}%</span>
            </div>
          </div>

          <div className="cursor-pointer min-w-0 flex-1" onClick={() => onToggleSelect && onToggleSelect(data)}>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded text-[10px] font-bold tracking-wider shrink-0">
                {data.collegeCode}
              </span>
              <Badge variant={badgeVariant} className="text-[9px] px-1.5 py-0 uppercase shrink-0">{data.prediction}</Badge>
            </div>
            <h3 className="font-semibold text-primary-foreground line-clamp-2 leading-tight text-sm break-words">
              {data.collegeName}
            </h3>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap md:items-center gap-x-4 gap-y-2 md:gap-x-6 md:gap-y-3 cursor-pointer min-w-0" onClick={() => onToggleSelect && onToggleSelect(data)}>
          <div className="flex items-center text-xs text-secondary-foreground min-w-0 sm:col-span-2 md:col-span-1">
            <BookOpen className="w-4 h-4 mr-1.5 shrink-0" />
            <span className="truncate font-medium flex-1">{data.branchName} ({data.branchCode})</span>
          </div>
          
          <div className="flex items-center text-xs text-secondary-foreground min-w-0 sm:col-span-2 md:col-span-1">
            <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
            <span className="truncate flex-1">{data.place}, {data.district}</span>
          </div>

          {data.tuitionFee && (
            <div className="flex items-center text-xs text-secondary-foreground">
              <Building2 className="w-4 h-4 mr-1.5 shrink-0" />
              <span>₹{(data.tuitionFee).toLocaleString()}/yr</span>
            </div>
          )}
          
          {data.averagePlacement && (
            <div className="flex items-center text-xs text-secondary-foreground">
              <GraduationCap className="w-4 h-4 mr-1.5 shrink-0" />
              <span>{data.averagePlacement} LPA</span>
            </div>
          )}
        </div>

        <div className="md:w-32 flex items-center justify-between md:flex-col md:items-end md:justify-center pt-3 md:pt-0 border-t md:border-t-0 border-border/50 shrink-0">
          <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-1 w-full md:w-auto mb-2 md:mb-0" onClick={() => onToggleSelect && onToggleSelect(data)}>
            <span className="text-[10px] text-secondary-foreground font-medium uppercase tracking-wider">2025 Cutoff</span>
            <span className="font-bold text-lg text-accent-yellow">{data.closingRank.toLocaleString()}</span>
          </div>
          
          <Link 
            to={`/colleges/${data.collegeCode}`}
            className="inline-flex items-center justify-center text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded transition-colors w-full md:w-auto md:mt-2"
          >
            View Details <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
        
      </CardContent>
    </Card>
  );
});

export default CollegeCard;
