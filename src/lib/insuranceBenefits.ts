import React from 'react';
import { Activity, HeartPulse, Stethoscope, Pill, Syringe, Eye, Settings, BriefcaseMedical, Shield } from 'lucide-react';

export interface DetailedBenefit {
    category: string;
    title: string;
    coverage: string;
    description: string;
    icon: React.ElementType;
    status: 'covered' | 'partial' | 'limit';
}

const AXA_BENEFITS: DetailedBenefit[] = [
    {
        category: 'Dental',
        title: 'Routine Dental Care',
        coverage: '2x/year Covered',
        description: 'Includes cleaning, oral exam, and basic extraction.',
        icon: BriefcaseMedical,
        status: 'covered'
    },
    {
        category: 'Outpatient',
        title: 'Specialist Consultations',
        coverage: '100% Covered',
        description: 'Access to AXA accredited specialists nationwide.',
        icon: Stethoscope,
        status: 'covered'
    },
    {
        category: 'Medications',
        title: 'Prescription Drugs',
        coverage: 'Up to ₱15,000/year',
        description: 'Reimbursement for prescribed maintenance medications.',
        icon: Pill,
        status: 'limit'
    },
    {
        category: 'Optical',
        title: 'Vision Care',
        coverage: 'Up to ₱5,000/year',
        description: 'Frames and lenses reimbursement.',
        icon: Eye,
        status: 'limit'
    },
    {
        category: 'Preventive',
        title: 'Annual Physical Exam',
        coverage: '100% Covered',
        description: 'Complete blood count, X-ray, ECG, and urinalysis.',
        icon: Activity,
        status: 'covered'
    }
];

const MAXICARE_BENEFITS: DetailedBenefit[] = [
    {
        category: 'Outpatient',
        title: 'Unlimited Consultations',
        coverage: '100% Covered',
        description: 'At any Maxicare Primary Care Clinic (PCC).',
        icon: Stethoscope,
        status: 'covered'
    },
    {
        category: 'Preventive',
        title: 'Annual Checkup',
        coverage: 'Basic Package',
        description: 'Routine APE at designated clinics.',
        icon: Activity,
        status: 'covered'
    },
    {
        category: 'Dental',
        title: 'Basic Dental Care',
        coverage: '1x/year Prophylaxis',
        description: 'Covered at accredited dental clinics.',
        icon: BriefcaseMedical,
        status: 'covered'
    },
    {
        category: 'Diagnostics',
        title: 'Lab & Diagnostics',
        coverage: 'Up to limit',
        description: 'X-rays, blood tests prescribed by physician.',
        icon: Syringe,
        status: 'limit'
    }
];

const SUNLIFE_BENEFITS: DetailedBenefit[] = [
    {
        category: 'Critical Illness',
        title: 'Major Illness Benefit',
        coverage: '100% of Face Amount',
        description: 'Lump sum upon diagnosis of covered illnesses.',
        icon: HeartPulse,
        status: 'covered'
    },
    {
        category: 'Hospital Income',
        title: 'Daily Hospital Cash',
        coverage: '₱2,000/day',
        description: 'Cash benefit for every day of confinement.',
        icon: Activity,
        status: 'limit'
    },
    {
        category: 'Life',
        title: 'Life Insurance',
        coverage: '100% Guaranteed',
        description: 'Guaranteed death benefit to beneficiaries.',
        icon: Shield,
        status: 'covered'
    }
];

const DEFAULT_BENEFITS: DetailedBenefit[] = [
    {
        category: 'Preventive',
        title: 'Annual Physical Exam',
        coverage: 'Subject to policy',
        description: 'Basic health checkup and diagnostics.',
        icon: Activity,
        status: 'limit'
    },
    {
        category: 'Outpatient',
        title: 'Doctor Consultations',
        coverage: 'Per visit limit',
        description: 'Consultations with accredited physicians.',
        icon: Stethoscope,
        status: 'partial'
    },
    {
        category: 'Emergency',
        title: 'ER Coverage',
        coverage: '100% Covered',
        description: 'Emergency room treatment for accidents or sudden illness.',
        icon: HeartPulse,
        status: 'covered'
    }
];

export function getDetailedBenefits(providerName: string): DetailedBenefit[] {
    if (!providerName) return DEFAULT_BENEFITS;
    
    const lower = providerName.toLowerCase();
    if (lower.includes('axa')) return AXA_BENEFITS;
    if (lower.includes('maxicare')) return MAXICARE_BENEFITS;
    if (lower.includes('sun') || lower.includes('sunlife')) return SUNLIFE_BENEFITS;
    if (lower.includes('pru')) return SUNLIFE_BENEFITS; // Pru Life similar structure for prototype
    
    return DEFAULT_BENEFITS;
}
