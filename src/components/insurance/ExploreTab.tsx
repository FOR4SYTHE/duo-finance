"use client";

import { useExploreStore } from "@/store/useExploreStore";
import { useInsuranceStore } from "@/store/useInsuranceStore";
import { formatCurrency } from "@/lib/format";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { BriefcaseMedical, TrendingUp, Sun, Plus, X, Activity, Users, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "border-beam";

interface ExploreTabProps {
    onLogPlan?: (plan?: any) => void;
}

export function ExploreTab({ onLogPlan }: ExploreTabProps) {
    const { primarySymbol, getPrimaryValue } = useDualCurrency();
    
    // Global Store State
    const { 
        step, setStep, results, setResults,
        coverageType, setCoverageType, myAge, setMyAge, location, setLocation, goal, setGoal,
        hasPartner, setHasPartner, partnerAge, setPartnerAge,
        children, setChildren,
        hasMother, setHasMother, motherAge, setMotherAge,
        hasFather, setHasFather, fatherAge, setFatherAge,
        resetSearch
    } = useExploreStore();

    // Insurance Store for Bookmarks
    const policies = useInsuranceStore(state => state.policies);
    const bookmarkedPlans = policies.filter(p => p.status === 'Bookmarked');

    const handleGenerate = async () => {
        if (!myAge || !location) {
            import('@/store/useBudgetStore').then(({ useBudgetStore }) => {
                useBudgetStore.getState().addNotification({
                    title: 'Missing Info',
                    message: 'Please enter your age and location.',
                    read: false,
                    type: 'alert'
                });
            });
            return;
        }

        setStep('loading');

        const profile = {
            coverageType,
            primaryAge: myAge,
            location,
            primaryGoal: goal,
            family: coverageType === 'Family' ? {
                partnerAge: hasPartner ? partnerAge : undefined,
                children: children.map(c => ({ relation: c.type, age: c.age })),
                motherAge: hasMother ? motherAge : undefined,
                fatherAge: hasFather ? fatherAge : undefined,
            } : undefined
        };

        const bookmarkedNames = bookmarkedPlans.map(b => b.policyName);

        try {
            const res = await fetch('/api/ai/explore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile, bookmarkedNames })
            });

            if (!res.ok) throw new Error('Failed to generate recommendations');
            const data = await res.json();
            setResults(data);
            setStep('results');
        } catch (error) {
            console.error(error);
            setStep('form');
            import('@/store/useBudgetStore').then(({ useBudgetStore }) => {
                useBudgetStore.getState().addNotification({
                    title: 'AI Engine Error',
                    message: 'Could not fetch recommendations right now.',
                    read: false,
                    type: 'alert'
                });
            });
        }
    };

    const addChild = (type: 'Son' | 'Daughter') => {
        setChildren([...children, { id: Math.random().toString(36).substring(7), type, age: '' }]);
    };

    const updateChildAge = (id: string, age: string) => {
        setChildren(children.map(c => c.id === id ? { ...c, age } : c));
    };

    const removeChild = (id: string) => {
        setChildren(children.filter(c => c.id !== id));
    };

    const handleBookmark = (plan: any) => {
        const existingBookmark = bookmarkedPlans.find(b => b.policyName === plan.name);
        
        if (existingBookmark) {
            useInsuranceStore.getState().removePolicy(existingBookmark.id);
        } else {
            if (bookmarkedPlans.length >= 3) {
                import('@/store/useBudgetStore').then(({ useBudgetStore }) => {
                    useBudgetStore.getState().addNotification({
                        title: 'Bookmark Limit Reached',
                        message: 'You can only save up to 3 AI suggestions at a time.',
                        read: false,
                        type: 'alert'
                    });
                });
                return;
            }

            useInsuranceStore.getState().addPolicy({
                household_id: '', // Supabase handles this via RLS / backend
                provider: plan.provider,
                policyName: plan.name,
                type: plan.type,
                status: 'Bookmarked',
                policyNumber: '',
                coveredMembers: [],
                premium: plan.premiumEst,
                paymentFrequency: 'Monthly',
                coverage: plan.coverage,
                startDate: '',
                expiryDate: '',
                dueDate: '',
                roomCategory: '',
                outpatientLimit: 0,
                deductible: 0,
                hotline: '',
                agentName: '',
                agentNumber: '',
                notes: plan.description,
                updated_at: new Date().toISOString()
            });
        }
    };

    const handleRemoveBookmark = (id: string) => {
        useInsuranceStore.getState().removePolicy(id);
    };

    const GOALS = ['Everyday Health (HMO)', 'Premium Medical / Catastrophic', 'Critical Illness (Lump Sum)', 'Life Insurance + Savings (VUL)', 'Pure Term Life'];

    const getGoalDescription = (g: string) => {
        switch(g) {
            case 'Everyday Health (HMO)': return 'Best for routine check-ups, lab tests, and minor hospitalizations. Operates via cashless networks (like Maxicare in PH or Medical Aids in SA).';
            case 'Premium Medical / Catastrophic': return 'High-limit global coverage (₱50M+) designed for major surgeries, cancer treatments, and severe emergencies in the PH, SA, or worldwide.';
            case 'Critical Illness (Lump Sum)': return 'Pays a direct cash lump sum if diagnosed with a major illness (e.g., stroke, heart attack). Cash can be used for anything, anywhere.';
            case 'Life Insurance + Savings (VUL)': return 'Combines life protection with investment funds. A popular dual-purpose tool in the PH and SA for long-term wealth building.';
            case 'Pure Term Life': return "Maximum life coverage for the lowest premium. Pure protection for your family's financial security without the investment component.";
            default: return '';
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
                {step === 'form' && (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col gap-6"
                    >
                        <div>
                            <h2 className="text-2xl text-white font-black tracking-tight mb-2">Explore & Compare</h2>
                            <p className="text-white/50 text-[13px] font-medium leading-relaxed">
                                Let DUO AI find the exact policies available for you in the Philippines today.
                            </p>
                        </div>

                        {/* Form Body */}
                        <div className="bg-[#1A1A1A] rounded-[28px] p-6 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)] flex flex-col gap-6">
                            
                            {/* Coverage Type */}
                            <div className="flex flex-col gap-3">
                                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest pl-1">Who is this for?</span>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setCoverageType('Individual')}
                                        className={`py-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${coverageType === 'Individual' ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.07]'}`}
                                    >
                                        <Activity className="w-5 h-5" />
                                        <span className="text-[13px] font-bold">Just Me</span>
                                    </button>
                                    <button 
                                        onClick={() => setCoverageType('Family')}
                                        className={`py-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${coverageType === 'Family' ? 'bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.07]'}`}
                                    >
                                        <Users className="w-5 h-5" />
                                        <span className="text-[13px] font-bold">My Family</span>
                                    </button>
                                </div>
                            </div>

                            {/* Basic Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest pl-1">Your Age</span>
                                    <input 
                                        type="number" 
                                        inputMode="numeric" 
                                        pattern="[0-9]*"
                                        value={myAge}
                                        onChange={(e) => setMyAge(e.target.value)}
                                        placeholder="e.g. 30"
                                        className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5 text-white text-[15px] font-medium outline-none focus:border-[#D4AF37]/50 focus:bg-[#151515] transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest pl-1">Location</span>
                                    <input 
                                        type="text" 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="City, Province"
                                        className="w-full bg-[#111] border border-white/10 rounded-2xl px-4 py-3.5 text-white text-[15px] font-medium outline-none focus:border-[#D4AF37]/50 focus:bg-[#151515] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Family Details */}
                            <AnimatePresence>
                                {coverageType === 'Family' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex flex-col gap-4 border-t border-white/5 pt-4 overflow-hidden"
                                    >
                                        <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest pl-1">Family Members</span>
                                        
                                        {/* Partner */}
                                        <div className="flex items-center justify-between gap-4">
                                            <button 
                                                onClick={() => setHasPartner(!hasPartner)}
                                                className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-between transition-all ${hasPartner ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/50'}`}
                                            >
                                                <span className="text-[13px] font-bold">Partner</span>
                                                {hasPartner && <span className="w-2 h-2 rounded-full bg-[#30D158]" />}
                                            </button>
                                            {hasPartner && (
                                                <input 
                                                    type="number" 
                                                    inputMode="numeric" 
                                                    pattern="[0-9]*"
                                                    value={partnerAge}
                                                    onChange={(e) => setPartnerAge(e.target.value)}
                                                    placeholder="Age"
                                                    className="w-24 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] text-center outline-none focus:border-[#D4AF37]/50 transition-all"
                                                />
                                            )}
                                        </div>

                                        {/* Children List */}
                                        {children.map(child => (
                                            <div key={child.id} className="flex items-center justify-between gap-4">
                                                <div className="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                                                    <span className="text-[13px] font-bold text-white">{child.type}</span>
                                                    <button onClick={() => removeChild(child.id)} className="text-white/40 hover:text-[#FF453A]"><X className="w-4 h-4" /></button>
                                                </div>
                                                <input 
                                                    type="number" 
                                                    inputMode="numeric" 
                                                    pattern="[0-9]*"
                                                    value={child.age}
                                                    onChange={(e) => updateChildAge(child.id, e.target.value)}
                                                    placeholder="Age"
                                                    className="w-24 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] text-center outline-none focus:border-[#D4AF37]/50 transition-all"
                                                />
                                            </div>
                                        ))}
                                        
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => addChild('Son')} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[12px] font-bold transition-all flex items-center justify-center gap-1">
                                                <Plus className="w-3.5 h-3.5" /> Son
                                            </button>
                                            <button onClick={() => addChild('Daughter')} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[12px] font-bold transition-all flex items-center justify-center gap-1">
                                                <Plus className="w-3.5 h-3.5" /> Daughter
                                            </button>
                                        </div>

                                        {/* Parents */}
                                        <div className="flex items-center justify-between gap-4 mt-2">
                                            <button onClick={() => setHasMother(!hasMother)} className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-between transition-all ${hasMother ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/50'}`}>
                                                <span className="text-[13px] font-bold">Mother</span>
                                            </button>
                                            {hasMother && <input type="number" inputMode="numeric" pattern="[0-9]*" value={motherAge} onChange={(e) => setMotherAge(e.target.value)} placeholder="Age" className="w-24 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] text-center outline-none" />}
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <button onClick={() => setHasFather(!hasFather)} className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-between transition-all ${hasFather ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-white/50'}`}>
                                                <span className="text-[13px] font-bold">Father</span>
                                            </button>
                                            {hasFather && <input type="number" inputMode="numeric" pattern="[0-9]*" value={fatherAge} onChange={(e) => setFatherAge(e.target.value)} placeholder="Age" className="w-24 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] text-center outline-none" />}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Goal */}
                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest pl-1">Primary Goal</span>
                                <div className="flex flex-wrap gap-2">
                                    {GOALS.map(g => (
                                        <button 
                                            key={g}
                                            onClick={() => setGoal(g)}
                                            className={`px-4 py-2.5 rounded-full text-[12px] font-bold transition-all ${goal === g ? 'bg-white/10 border-white/20 text-white border' : 'bg-white/5 border border-white/5 text-white/50 hover:bg-white/10'}`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <p className="text-white/60 text-[12px] font-medium leading-relaxed">
                                        {getGoalDescription(goal)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Submit Button */}
                            <button 
                                onClick={handleGenerate}
                                className="w-full mt-2 py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-bold text-[15px] transition-all active:scale-[0.98] shadow-[0_8px_24px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 relative overflow-hidden group"
                            >
                                <div className="px-1.5 py-0.5 rounded bg-black/10 flex items-center justify-center mr-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-black/80">DUO AI</span>
                                </div>
                                Find Best Plans
                            </button>
                        </div>
                        
                        {/* Bookmarked Plans outside form */}
                        {bookmarkedPlans.length > 0 && (
                            <div className="flex flex-col gap-4 mt-2">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[#D4AF37] text-[13px] font-black uppercase tracking-[0.15em] flex items-center gap-2">
                                        <BookmarkCheck className="w-4 h-4" /> BOOKMARKED PLANS
                                    </span>
                                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{bookmarkedPlans.length}/3</span>
                                </div>
                                
                                <div className="flex flex-col gap-3">
                                    {bookmarkedPlans.map((bp) => {
                                        let iconColor = "text-[#D4AF37]";
                                        let bgIcon = "bg-[#D4AF37]/10";
                                        let borderIcon = "border-[#D4AF37]/20";
                                        let badgeColor = "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20";
                                        let Icon = BriefcaseMedical;

                                        if (bp.type.includes('Life')) { Icon = Sun; } 
                                        else if (bp.type.includes('VUL') || bp.type.includes('Investment')) { Icon = TrendingUp; }

                                        return (
                                            <div key={bp.id} className="bg-[#D4AF37]/5 rounded-[24px] p-5 border border-[#D4AF37]/30 shadow-[0_4px_12px_rgba(212,175,55,0.05)]">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`w-10 h-10 rounded-xl ${bgIcon} flex items-center justify-center border ${borderIcon}`}>
                                                        <Icon className={`w-5 h-5 ${iconColor}`} />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`px-2.5 py-1 rounded-full border ${badgeColor} text-[10px] font-bold uppercase tracking-widest`}>
                                                            {bp.type}
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRemoveBookmark(bp.id)}
                                                            className="p-1.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-all"
                                                        >
                                                            <BookmarkCheck className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <h3 className="text-white font-bold text-[17px] tracking-tight mb-0.5">{bp.policyName}</h3>
                                                <span className="text-[#D4AF37]/70 text-[12px] font-bold uppercase tracking-widest block mb-3">{bp.provider}</span>
                                                
                                                <p className="text-white/60 text-[13px] font-medium leading-relaxed mb-5">
                                                    {bp.notes}
                                                </p>
                                                
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#D4AF37]/20">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[#D4AF37]/50 text-[10px] font-bold uppercase tracking-widest">Est. Coverage</span>
                                                        <div className="flex items-baseline gap-1 mt-0.5">
                                                            <span className="text-white font-black text-[18px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(bp.coverage))}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[#D4AF37]/50 text-[10px] font-bold uppercase tracking-widest">Est. Premium</span>
                                                        <div className="flex items-baseline gap-1 mt-0.5">
                                                            <span className="text-white font-black text-[18px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(bp.premium))}</span>
                                                            <span className="text-white/40 text-[12px] font-medium">/mo</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-3 mt-6">
                                                    <button 
                                                        onClick={() => onLogPlan && onLogPlan(bp)}
                                                        className="flex-1 py-4 rounded-full bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[13px] transition-all active:scale-[0.98] border border-[#D4AF37]/20"
                                                    >
                                                        Add to My Plans
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            const query = encodeURIComponent(`${bp.provider} ${bp.policyName} official ph`);
                                                            window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
                                                        }}
                                                        className="flex-1 py-4 rounded-full bg-transparent hover:bg-white/5 text-white/70 hover:text-white font-bold text-[13px] transition-all active:scale-[0.98] border border-white/10 flex justify-center items-center gap-1.5"
                                                    >
                                                        Learn More
                                                        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {step === 'loading' && (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 px-6 text-center"
                    >
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 rounded-3xl bg-[#D4AF37]/5" />
                            <BorderBeam size="md" colorVariant="sunset" strength={1} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[13px] font-black uppercase tracking-wider bg-[linear-gradient(110deg,#D4AF37,#E5E4E2,#D4AF37)] text-transparent bg-clip-text animate-pulse">DUO AI</span>
                            </div>
                        </div>
                        <h3 className="text-white font-bold text-[22px] tracking-tight mb-3">Analyzing Market...</h3>
                        <p className="text-white/50 text-[14px] font-medium leading-relaxed max-w-[260px]">
                            Reviewing current insurance products available in the Philippines to find your perfect match.
                        </p>
                    </motion.div>
                )}

                {step === 'results' && (
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="px-2 py-1 rounded bg-[#D4AF37]/10 inline-flex items-center gap-1.5 mb-3 border border-[#D4AF37]/20">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-[#D4AF37]">DUO AI Suggestions</span>
                                </div>
                                <h2 className="text-2xl text-white font-black tracking-tight mb-1">Your Top Matches</h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => { setResults([]); resetSearch(); }} className="text-white/40 hover:text-white text-[13px] font-bold transition-colors pb-1 border-b border-white/20 hover:border-white">
                                    New Search
                                </button>
                                <button onClick={() => setStep('form')} className="text-white/40 hover:text-white text-[13px] font-bold transition-colors pb-1 border-b border-white/20 hover:border-white">
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {results.map((result, i) => {
                                let iconColor = "text-blue-400";
                                let bgIcon = "bg-blue-500/10";
                                let borderIcon = "border-blue-500/20";
                                let badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                                let Icon = BriefcaseMedical;

                                if (result.type.includes('Life')) {
                                    iconColor = "text-[#D4AF37]";
                                    bgIcon = "bg-[#D4AF37]/10";
                                    borderIcon = "border-[#D4AF37]/20";
                                    badgeColor = "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20";
                                    Icon = Sun;
                                } else if (result.type.includes('VUL') || result.type.includes('Investment')) {
                                    iconColor = "text-emerald-400";
                                    bgIcon = "bg-emerald-500/10";
                                    borderIcon = "border-emerald-500/20";
                                    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                                    Icon = TrendingUp;
                                }

                                const existingBookmark = bookmarkedPlans.find(b => b.policyName === result.name);

                                return (
                                    <div key={i} className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-10 h-10 rounded-xl ${bgIcon} flex items-center justify-center border ${borderIcon}`}>
                                                <Icon className={`w-5 h-5 ${iconColor}`} />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2.5 py-1 rounded-full border ${badgeColor} text-[10px] font-bold uppercase tracking-widest`}>
                                                    {result.type}
                                                </div>
                                                <button 
                                                    onClick={() => handleBookmark(result)}
                                                    className={`p-1.5 rounded-lg border transition-all ${existingBookmark ? 'bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                                >
                                                    {existingBookmark ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-white font-bold text-[17px] tracking-tight mb-0.5">{result.name}</h3>
                                        <span className="text-white/40 text-[12px] font-bold uppercase tracking-widest block mb-3">{result.provider}</span>
                                        
                                        <p className="text-white/60 text-[13px] font-medium leading-relaxed mb-6">
                                            {result.description}
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-6 pt-5 border-t border-white/5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Est. Coverage</span>
                                                <div className="flex items-baseline gap-1 mt-0.5">
                                                    <span className="text-white font-black text-[20px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(result.coverage))}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Est. Premium</span>
                                                <div className="flex items-baseline gap-1 mt-0.5">
                                                    <span className="text-white font-black text-[20px] tracking-tight">{primarySymbol}{formatCurrency(getPrimaryValue(result.premiumEst))}</span>
                                                    <span className="text-white/40 text-[12px] font-medium">/mo</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => onLogPlan && onLogPlan(result)}
                                                className="flex-1 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-[13px] transition-all active:scale-[0.98] border border-white/5"
                                            >
                                                Add to My Plans
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const query = encodeURIComponent(`${result.provider} ${result.name} official ph`);
                                                    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
                                                }}
                                                className="flex-1 py-4 rounded-full bg-transparent hover:bg-white/5 text-white/70 hover:text-white font-bold text-[13px] transition-all active:scale-[0.98] border border-white/10 flex justify-center items-center gap-1.5"
                                            >
                                                Learn More
                                                <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
