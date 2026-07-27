"use client";

import { useState, useMemo, useEffect } from "react";
import { useChildCareStore } from "@/store/useChildCareStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingUp, AlertCircle, BookOpen, HeartPulse, Palette } from "lucide-react";

export function GrowthCostForecast() {
  const { profile, cachedData, configuration } = useChildCareStore();
  
  // Baseline age
  const baseAge = profile.age || 6;
  
  // Local state for interactive timeline
  const [selectedAge, setSelectedAge] = useState(baseAge);
  
  // What-If Scenarios (used only for estimates)
  const [isPrivateSchool, setIsPrivateSchool] = useState(true);
  const [isPremiumHealth, setIsPremiumHealth] = useState(false);
  const [hasActivities, setHasActivities] = useState(true);

  // Configured Data Lookups
  const selectedSchool = cachedData.schools.find(s => s.id === configuration.selectedSchoolId);
  const selectedActivitiesCost = cachedData.summerActivities
    .filter(a => configuration.selectedActivities.includes(a.id))
    .reduce((sum, a) => sum + (a.cost || 0), 0);

  // Milestones
  const milestones = [
    { age: 6, label: "Kindergarten" },
    { age: 7, label: "Elementary" },
    { age: 10, label: "Sports & Clubs" },
    { age: 13, label: "Junior High" },
    { age: 16, label: "Senior High" },
    { age: 18, label: "University Prep" }
  ];

  // Helper to calculate costs based on age and scenarios
  const getCostForAge = (age: number) => {
    let monthly = 5000; // Base essentials
    
    // Education (scales with age if estimated, fixed if configured)
    if (age >= 6 && age < 18) {
      if (selectedSchool) {
        monthly += selectedSchool.monthlyTuition;
      } else {
        monthly += isPrivateSchool ? 8000 + (age * 300) : 1500 + (age * 100);
      }
    }
    
    // Healthcare
    if (configuration.selectedHealthcareProviders.length > 0) {
      monthly += 2500; // Configured average
    } else {
      monthly += isPremiumHealth ? 3000 : 1000;
    }
    
    // Activities
    if (configuration.selectedActivities.length > 0) {
      // Amortize summer cost over 12 months
      monthly += Math.round(selectedActivitiesCost / 12);
    } else if (hasActivities && age >= 7 && age <= 16) {
      monthly += 2000 + (age === 10 ? 1500 : 0);
    }
    
    return monthly;
  };

  // Compute graph points
  const graphPoints = useMemo(() => {
    const points = [];
    const minAge = 6;
    const maxAge = 18;
    const width = 300;
    const height = 100;
    
    let maxCost = 0;
    let minCost = 999999;
    
    // Calculate raw points
    for (let i = minAge; i <= maxAge; i++) {
      const cost = getCostForAge(i);
      points.push({ age: i, cost });
      if (cost > maxCost) maxCost = cost;
      if (cost < minCost) minCost = cost;
    }
    
    // Map to SVG coordinates
    return points.map(p => {
      const x = ((p.age - minAge) / (maxAge - minAge)) * width;
      // Invert Y so higher cost = higher up
      const y = height - (((p.cost - (minCost * 0.8)) / (maxCost - (minCost * 0.8))) * height);
      return { ...p, x, y };
    });
  }, [isPrivateSchool, isPremiumHealth, hasActivities]);

  // Generate SVG Path
  const svgPath = useMemo(() => {
    if (graphPoints.length === 0) return "";
    const d = graphPoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");
    return d;
  }, [graphPoints]);

  // Current selected metrics
  const activeCost = getCostForAge(selectedAge);
  const activeYearly = activeCost * 12;
  const lifetimeEstimate = useMemo(() => {
    let total = 0;
    for (let i = baseAge; i <= 18; i++) {
      total += getCostForAge(i) * 12;
    }
    return total;
  }, [baseAge, isPrivateSchool, isPremiumHealth, hasActivities]);

  // Breakdown for selected age
  const breakdown = [
    { 
      id: "edu", label: "Education", 
      amount: selectedAge >= 6 && selectedAge < 18 ? (selectedSchool ? selectedSchool.monthlyTuition : (isPrivateSchool ? 8000 + (selectedAge * 300) : 1500 + (selectedAge * 100))) : 0, 
      icon: BookOpen 
    },
    { 
      id: "health", label: "Healthcare", 
      amount: configuration.selectedHealthcareProviders.length > 0 ? 2500 : (isPremiumHealth ? 3000 : 1000), 
      icon: HeartPulse 
    },
    { 
      id: "act", label: "Activities", 
      amount: configuration.selectedActivities.length > 0 ? Math.round(selectedActivitiesCost / 12) : (hasActivities && selectedAge >= 7 && selectedAge <= 16 ? 2000 + (selectedAge === 10 ? 1500 : 0) : 0), 
      icon: Palette 
    },
    { 
      id: "ess", label: "Essentials & Buffer", 
      amount: 5000, 
      icon: Plus 
    }
  ];

  return (
    <div className="flex flex-col gap-6 mt-4 w-full">
      {/* Title */}
      <div className="flex flex-col px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-black text-white">Growth Cost Forecast</h3>
          {configuration.selectedSchoolId ? (
            <span className="bg-emerald-400/20 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-400/20">Configured</span>
          ) : (
            <span className="bg-[#FF7B54]/20 text-[#FF7B54] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-[#FF7B54]/20">Estimated</span>
          )}
        </div>
        <p className="text-[13px] font-medium text-white/50 leading-snug mt-1">
          See how your child's estimated monthly and yearly expenses evolve over time.
        </p>
      </div>

      {/* Primary Card */}
      <div className="bg-[#1A1A1A] rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/5 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-[#FF7B54]/20 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10 mb-6">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-1">Current Age Focus</span>
            <span className="text-2xl font-black text-white">{selectedAge} Years Old</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-bold text-[#FF7B54]/80 tracking-widest uppercase mb-1">Projected To Age 18</span>
            <span className="text-lg font-black text-[#FF7B54]">₱{(lifetimeEstimate / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-white/40">Monthly</span>
            <motion.span 
              key={activeCost}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[38px] leading-none font-black tracking-tighter text-white"
            >
              ₱{activeCost.toLocaleString()}
            </motion.span>
          </div>
          <div className="flex items-baseline gap-2 pl-[60px]">
            <span className="text-sm font-bold text-white/40">Yearly</span>
            <span className="text-[18px] font-bold text-white/70">₱{activeYearly.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="flex flex-col gap-3">
        <h4 className="text-[14px] font-bold text-white pl-1">Select Milestone</h4>
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2 px-1 -mx-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {milestones.map((m) => {
            const isActive = selectedAge === m.age;
            return (
              <button
                key={m.age}
                onClick={() => setSelectedAge(m.age)}
                className={`flex flex-col items-center flex-shrink-0 w-24 p-3 rounded-[20px] transition-all border ${
                  isActive 
                    ? 'bg-[#FF7B54] border-[#FF7B54]' 
                    : 'bg-[#1A1A1A] border-white/5 hover:bg-white/5'
                }`}
              >
                <span className={`text-2xl font-black mb-1 ${isActive ? 'text-white' : 'text-white/40'}`}>{m.age}</span>
                <span className={`text-[10px] font-bold text-center leading-tight uppercase ${isActive ? 'text-white/90' : 'text-white/30'}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Forecast Graph */}
      <div className="bg-[#1A1A1A] rounded-[32px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/5 flex flex-col gap-2 relative">
        <h4 className="text-[14px] font-bold text-white mb-2 z-10">Cost Trajectory</h4>
        
        {/* SVG Graph Container */}
        <div className="w-full h-[120px] relative z-10 pr-2">
          <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none" className="overflow-visible">
            {/* Defs for gradient */}
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF7B54" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#FFBCA7" stopOpacity="1" />
                <stop offset="100%" stopColor="#FF7B54" stopOpacity="1" />
              </linearGradient>
            </defs>
            
            {/* The animated line */}
            <motion.path
              d={svgPath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1, d: svgPath }}
              transition={{ type: "spring", stiffness: 60, damping: 20 }}
            />
            
            {/* Dots for points */}
            {graphPoints.map((p) => {
              const isActive = p.age === selectedAge;
              const isMilestone = milestones.find(m => m.age === p.age);
              if (!isMilestone && !isActive) return null;
              
              return (
                <motion.circle
                  key={p.age}
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 6 : 4}
                  fill={isActive ? "#fff" : "#1A1A1A"}
                  stroke="#FF7B54"
                  strokeWidth={isActive ? 3 : 2}
                  animate={{ cx: p.x, cy: p.y, r: isActive ? 6 : 4 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
              );
            })}
          </svg>
          
          {/* Active Tooltip overlay */}
          <AnimatePresence>
            {graphPoints.map((p) => {
              if (p.age === selectedAge) {
                return (
                  <motion.div
                    key={`tooltip-${p.age}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bg-white text-black px-2 py-1 rounded-md text-[10px] font-bold shadow-lg transform -translate-x-1/2 -translate-y-full whitespace-nowrap"
                    style={{ left: `${(p.x / 300) * 100}%`, top: `calc(${(p.y / 100) * 100}% - 12px)` }}
                  >
                    ₱{(p.cost / 1000).toFixed(1)}k
                  </motion.div>
                );
              }
              return null;
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="flex flex-col gap-3 mt-2">
        <h4 className="text-[14px] font-bold text-white pl-1">Breakdown at Age {selectedAge}</h4>
        <div className="flex flex-col gap-2">
          {breakdown.filter(b => b.amount > 0).map((item) => {
            const percent = Math.round((item.amount / activeCost) * 100);
            return (
              <div key={item.id} className="bg-white/5 rounded-[20px] p-4 flex items-center justify-between border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-white/10 shadow-inner">
                    <item.icon className="w-4 h-4 text-[#FF7B54]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-white">{item.label}</span>
                    <span className="text-[11px] font-medium text-white/50">₱{(item.amount * 12).toLocaleString()}/yr</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[15px] font-black text-white">₱{item.amount.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-[#FF7B54] bg-[#FF7B54]/10 px-2 py-0.5 rounded-full mt-1">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What-If Planner (Only show if School is not configured) */}
      {!configuration.selectedSchoolId && (
        <div className="bg-[#1A1A1A] rounded-[32px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-[#FF7B54]/20 flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-2">
            <h4 className="text-[14px] font-bold text-white">What-If Planner</h4>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl">
              <span className="text-[14px] font-bold text-white pl-1">Private School</span>
              <div 
                onClick={() => setIsPrivateSchool(!isPrivateSchool)}
                className={`w-[50px] h-[30px] rounded-full p-[4px] cursor-pointer transition-colors duration-300 ease-in-out ${isPrivateSchool ? 'bg-[#FF7B54]' : 'bg-[#2C2C2E]'}`}
              >
                <motion.div 
                  animate={{ x: isPrivateSchool ? 20 : 0 }} 
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-[22px] h-[22px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl">
              <span className="text-[14px] font-bold text-white pl-1">Premium Healthcare</span>
              <div 
                onClick={() => setIsPremiumHealth(!isPremiumHealth)}
                className={`w-[50px] h-[30px] rounded-full p-[4px] cursor-pointer transition-colors duration-300 ease-in-out ${isPremiumHealth ? 'bg-[#FF7B54]' : 'bg-[#2C2C2E]'}`}
              >
                <motion.div 
                  animate={{ x: isPremiumHealth ? 20 : 0 }} 
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-[22px] h-[22px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart AI Insights */}
      <div className="flex flex-col gap-3 mt-2">
        <h4 className="text-[14px] font-bold text-white pl-1">Smart Insights</h4>
        <div className="flex flex-col gap-3">
          <div className="bg-[#B9E0F2]/10 rounded-[24px] p-5 border border-[#B9E0F2]/20 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#B9E0F2] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-white/80 font-medium leading-relaxed">
              Tuition is expected to become your largest expense from age 7, making up over 50% of monthly overhead if you remain in Private School.
            </p>
          </div>
          <div className="bg-emerald-400/10 rounded-[24px] p-5 border border-emerald-400/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-white/80 font-medium leading-relaxed">
              Healthcare spending stabilizes after age 8. Consider shifting that extra buffer into the education savings goal.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
