export const COST_DATA = {
    'Makati / BGC': { 
        baseRent: 15000, rentPerExtraAdult: 5000, 
        baseUtilities: 3000, utilPerExtraAdult: 1000,
        baseFood: 8000, foodPerExtraAdult: 4000, kidFoodMultiplier: 0.5,
        baseMisc: 2000, miscPerExtraAdult: 1000
    },
    'Quezon City': { 
        baseRent: 10000, rentPerExtraAdult: 4000, 
        baseUtilities: 2500, utilPerExtraAdult: 800,
        baseFood: 7000, foodPerExtraAdult: 3500, kidFoodMultiplier: 0.5,
        baseMisc: 1500, miscPerExtraAdult: 800
    },
    'Ortigas': { 
        baseRent: 12000, rentPerExtraAdult: 4500, 
        baseUtilities: 2800, utilPerExtraAdult: 900,
        baseFood: 7500, foodPerExtraAdult: 3800, kidFoodMultiplier: 0.5,
        baseMisc: 1800, miscPerExtraAdult: 900
    },
    'Provincial': { 
        baseRent: 6000, rentPerExtraAdult: 2000, 
        baseUtilities: 1500, utilPerExtraAdult: 500,
        baseFood: 5000, foodPerExtraAdult: 2500, kidFoodMultiplier: 0.5,
        baseMisc: 1000, miscPerExtraAdult: 500
    },
} as const;

export type Area = keyof typeof COST_DATA;
export const AREAS = Object.keys(COST_DATA) as Area[];

// 4% annual inflation (Updated: July 2026)
export const PH_INFLATION_RATE = 0.04;
