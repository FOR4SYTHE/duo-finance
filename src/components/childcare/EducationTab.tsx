"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useChildCareStore } from "@/store/useChildCareStore";
import { Calendar, GraduationCap, MapPin, CheckCircle2, Info, Plus, X } from "lucide-react";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { formatCurrency } from "@/lib/format";

export function EducationTab() {
  const { cachedData, configuration, selectSchool, addCustomSchool } = useChildCareStore();
  const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [customSchool, setCustomSchool] = useState({
    name: '',
    type: 'Custom Entry',
    monthlyTuition: '',
    annualTuition: '',
    enrollmentFee: '',
    books: '',
    uniform: '',
    transportation: '',
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sort schools: Selected first, then by whatever default (assuming distance-based in mock)
  const sortedSchools = [...cachedData.schools].sort((a, b) => {
    if (a.id === configuration.selectedSchoolId) return -1;
    if (b.id === configuration.selectedSchoolId) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Growth Timeline Component */}
      <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#FF7B54]" />
          <h4 className="font-bold text-white text-[15px]">Growth Timeline</h4>
        </div>
        
        <div className="flex flex-col gap-0 relative">
          <div className="absolute left-3 -translate-x-1/2 top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#FF7B54] via-white/10 to-transparent" />
          
          {[
            { age: 6, label: "Kindergarten", status: "current" },
            { age: 7, label: "Primary School", status: "next" },
            { age: 10, label: "Sports & Clubs", status: "future" },
            { age: 13, label: "Junior High", status: "future" },
          ].map((milestone, idx) => (
            <div key={idx} className="flex gap-4 items-center relative py-2">
              <div className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center relative z-10 ${
                milestone.status === 'current' ? 'bg-[#FF7B54] shadow-[0_0_10px_rgba(255,123,84,0.4)]' : 
                milestone.status === 'next' ? 'bg-[#1A1A1A] border-2 border-[#FF7B54]' : 'bg-[#1A1A1A] border-2 border-white/10'
              }`}>
                {milestone.status === 'current' && <span className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className="flex flex-col">
                <span className={`text-[14px] font-bold ${milestone.status === 'current' ? 'text-white' : 'text-white/60'}`}>
                  {milestone.label}
                </span>
                <span className="text-[11px] font-bold text-[#FF7B54]/80 uppercase tracking-widest">
                  Age {milestone.age}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schools Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-bold text-white text-[15px]">Schools & Institutions</h4>
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Sort: Relevance</span>
        </div>

        {!configuration.selectedSchoolId && (
          <div className="bg-[#FF7B54]/10 border border-[#FF7B54]/20 rounded-2xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-[#FF7B54] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white leading-tight">No school selected</span>
              <span className="text-[12px] text-white/70 mt-1 leading-snug">Estimated monthly education costs are currently based on averages for nearby schools.</span>
            </div>
          </div>
        )}

        {sortedSchools.map((school) => {
          const isSelected = school.id === configuration.selectedSchoolId;
          const zarTuition = Math.round(school.monthlyTuition * 0.27);
          return (
            <div 
              key={school.id} 
              className={`bg-[#1A1A1A] rounded-[24px] p-5 relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all duration-300 ${
                isSelected ? 'border-2 border-emerald-400' : 'border border-white/5'
              }`}
            >
              {/* Decorative Corner Shape */}
              <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] bg-[#B9E0F2]/10 rounded-full blur-[20px] pointer-events-none" />
              <div className={`absolute top-0 right-0 w-[80px] h-[80px] rounded-bl-full pointer-events-none ${isSelected ? 'bg-emerald-400/10' : 'bg-[#FF7B54]/5'}`} />
    
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#B9E0F2] flex items-center justify-center flex-shrink-0 shadow-inner">
                      <GraduationCap className="w-6 h-6 text-[#0A0A0A]" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-white text-[15px] leading-tight pr-4">{school.name}</h4>
                      <p className="text-[12px] font-medium text-white/50 mt-1">{school.type}</p>
                    </div>
                  </div>
                  {school.distance && (
                    <div className="flex items-center gap-1 text-white/40 bg-white/5 px-2 py-1 rounded-full text-[10px] font-bold">
                      <MapPin className="w-3 h-3" />
                      {school.distance}
                    </div>
                  )}
                </div>

                {/* Chips */}
                {school.chips && (
                  <div className="flex flex-wrap gap-2">
                    {school.chips.map((chip, i) => (
                      <span key={i} className="text-[10px] font-bold tracking-wide text-[#B9E0F2] bg-[#B9E0F2]/10 border border-[#B9E0F2]/20 px-2 py-1 rounded-full">
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
    
                <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Est. Yearly Tuition</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-[#FF7B54]">{primarySymbol}{formatCurrency(getPrimaryValue(school.monthlyTuition * 12))}</span>
                        <span className="text-[12px] font-medium text-white/50">/ {secondarySymbol}{formatCurrency(getSecondaryValue(school.monthlyTuition * 12))}</span>
                      </div>
                      <div className="text-[10px] text-white/30 mt-0.5">{primarySymbol}{formatCurrency(getPrimaryValue(school.monthlyTuition))} / mo</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 text-[11px] font-bold border border-white/5 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        Budget
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => selectSchool(isSelected ? null : school.id)}
                    className={`w-full py-3.5 rounded-full font-bold text-[14px] transition-all flex items-center justify-center gap-2 ${
                      isSelected 
                        ? 'bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20' 
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Selected
                      </>
                    ) : (
                      "Select School"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Custom Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 mt-2 rounded-[24px] border-2 border-dashed border-white/10 text-white/50 font-bold flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Custom School
        </button>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 pointer-events-auto">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div 
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-[#1A1A1A] rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
                  <h3 className="text-xl font-black text-white">Add Custom School</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/50" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-white/80 ml-1">School Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Local Preparatory"
                      value={customSchool.name}
                      onChange={(e) => setCustomSchool({...customSchool, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-white placeholder-white/20 focus:outline-none focus:border-[#FF7B54]/50 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-white/80 ml-1">Monthly Tuition ({primarySymbol})</label>
                    <input 
                      type="number"
                      placeholder="e.g. 5000"
                      value={customSchool.monthlyTuition}
                      onChange={(e) => setCustomSchool({...customSchool, monthlyTuition: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-white placeholder-white/20 focus:outline-none focus:border-[#FF7B54]/50 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-white/80 ml-1">Annual Enrollment Fee (Optional, {primarySymbol})</label>
                    <input 
                      type="number"
                      placeholder="e.g. 15000"
                      value={customSchool.enrollmentFee}
                      onChange={(e) => setCustomSchool({...customSchool, enrollmentFee: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-white placeholder-white/20 focus:outline-none focus:border-[#FF7B54]/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold text-white/80 ml-1">Books/Supplies</label>
                      <input 
                        type="number"
                        placeholder={primarySymbol}
                        value={customSchool.books}
                        onChange={(e) => setCustomSchool({...customSchool, books: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[14px] font-semibold text-white placeholder-white/20 focus:outline-none focus:border-[#FF7B54]/50 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold text-white/80 ml-1">Uniforms</label>
                      <input 
                        type="number"
                        placeholder={primarySymbol}
                        value={customSchool.uniform}
                        onChange={(e) => setCustomSchool({...customSchool, uniform: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[14px] font-semibold text-white placeholder-white/20 focus:outline-none focus:border-[#FF7B54]/50 transition-all"
                      />
                    </div>
                  </div>

                </div>

                <div className="p-6 border-t border-white/5 flex-shrink-0">
                  <button 
                    onClick={() => {
                      if (!customSchool.name || !customSchool.monthlyTuition) return;
                      addCustomSchool({
                        name: customSchool.name,
                        type: customSchool.type,
                        monthlyTuition: Number(customSchool.monthlyTuition) || 0,
                        suppliesPerTerm: Number(customSchool.books) || 0,
                        annualTuition: Number(customSchool.annualTuition) || 0,
                        enrollmentFee: Number(customSchool.enrollmentFee) || 0,
                        books: Number(customSchool.books) || 0,
                        uniform: Number(customSchool.uniform) || 0,
                        transportation: Number(customSchool.transportation) || 0,
                        notes: customSchool.notes
                      });
                      setIsModalOpen(false);
                      setCustomSchool({ name: '', type: 'Custom Entry', monthlyTuition: '', annualTuition: '', enrollmentFee: '', books: '', uniform: '', transportation: '', notes: '' });
                    }}
                    disabled={!customSchool.name || !customSchool.monthlyTuition}
                    className="w-full py-4 rounded-full bg-[#FF7B54] text-white font-bold text-[15px] shadow-[0_8px_24px_rgba(255,123,84,0.3)] disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    Save & Select
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
