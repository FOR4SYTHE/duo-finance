"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Delete, Percent } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";

export function Calculator() {
    const {
        primaryCurrency,
        displayValue,
        exchangeRate,
        isLoadingRate,
        toggleCurrency,
        appendInput,
        clearInput,
        deleteLast,
        executeCalculation,
        syncRates,
    } = useCurrencyStore();

    // Sync exchange rates on component initialization
    useEffect(() => {
        syncRates();
    }, []);

    // Helper utility to safely compute the ghost line currency conversion in real time
    const computeGhostValue = (input: string, rate: number): string => {
        try {
            let sanitized = input;
            // Drop trailing operator symbols before performing structural math evaluation
            if (["+", "-", "*", "/"].includes(sanitized.slice(-1))) {
                sanitized = sanitized.slice(0, -1);
            }
            if (!sanitized || sanitized === "Error" || sanitized === "0") return "0.00";

            const parsedExpressionResult = new Function(`return ${sanitized}`)();
            if (isNaN(parsedExpressionResult) || !isFinite(parsedExpressionResult)) return "0.00";

            const convertedValue = parsedExpressionResult * rate;
            return Number(convertedValue.toFixed(2)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        } catch {
            return "0.00";
        }
    };

    const targetCurrency = primaryCurrency === "PHP" ? "ZAR" : "PHP";
    const primarySymbol = primaryCurrency === "PHP" ? "₱" : "R";
    const targetSymbol = targetCurrency === "PHP" ? "₱" : "R";

    const liveGhostConvertedAmount = computeGhostValue(displayValue, exchangeRate);

    // Key configurations for high-end tactical alignment
    const buttons = [
        { label: "AC", action: clearInput, type: "meta" },
        { label: "DEL", action: deleteLast, type: "meta", icon: <Delete className="w-5 h-5" /> },
        { label: "%", action: () => appendInput("%"), type: "operator", icon: <Percent className="w-5 h-5" /> },
        { label: "÷", action: () => appendInput("/"), type: "operator" },
        { label: "7", action: () => appendInput("7"), type: "num" },
        { label: "8", action: () => appendInput("8"), type: "num" },
        { label: "9", action: () => appendInput("9"), type: "num" },
        { label: "×", action: () => appendInput("*"), type: "operator" },
        { label: "4", action: () => appendInput("4"), type: "num" },
        { label: "5", action: () => appendInput("5"), type: "num" },
        { label: "6", action: () => appendInput("6"), type: "num" },
        { label: "-", action: () => appendInput("-"), type: "operator" },
        { label: "1", action: () => appendInput("1"), type: "num" },
        { label: "2", action: () => appendInput("2"), type: "num" },
        { label: "3", action: () => appendInput("3"), type: "num" },
        { label: "+", action: () => appendInput("+"), type: "operator" },
        { label: "0", action: () => appendInput("0"), type: "num", className: "col-span-2" },
        { label: ".", action: () => appendInput("."), type: "num" },
        { label: "=", action: executeCalculation, type: "action" },
    ];

    return (
        <div className="w-full flex flex-col h-full justify-between p-6">
            {/* DISPLAY LAYER: Typography-led data presentation */}
            <div className="flex flex-col items-end justify-end flex-1 min-h-[160px] pb-6 px-2 space-y-1 select-none">
                <div className="text-xs text-neutral-400 font-medium tracking-wider mb-2 self-start flex items-center gap-1.5 uppercase">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Exchange Rate: 1 {primaryCurrency} = {exchangeRate.toFixed(4)} {targetCurrency}
                </div>

                {/* Primary Input/Result Value */}
                <div className="w-full text-right overflow-x-auto whitespace-nowrap scrollbar-none text-4xl sm:text-5xl font-light tracking-tight transition-all duration-200">
                    <span className="text-neutral-400 dark:text-neutral-600 font-normal mr-1">{primarySymbol}</span>
                    {displayValue}
                </div>

                {/* Real-time Secondary Converted Ghost Line */}
                <div className="w-full text-right overflow-x-auto whitespace-nowrap scrollbar-none text-xl sm:text-2xl font-light text-neutral-400 dark:text-neutral-500 mt-1 transition-all duration-200">
                    <span className="text-neutral-300 dark:text-neutral-700 font-normal mr-1">{targetSymbol}</span>
                    {liveGhostConvertedAmount}
                </div>
            </div>

            {/* CURRENCY INTERCHANGE CONTROLLER CHIP */}
            <div className="flex justify-center mb-6">
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "var(--border)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleCurrency}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-medium tracking-wide border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 shadow-sm transition-all"
                >
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isLoadingRate ? "animate-spin" : ""}`} />
                    Swap Base Currency ({primaryCurrency})
                </motion.button>
            </div>

            {/* MATHEMATICAL GRID INTERFACE */}
            <div className="grid grid-cols-4 gap-2.5">
                <AnimatePresence>
                    {buttons.map((btn, index) => (
                        <motion.button
                            key={index}
                            whileTap={{ scale: 0.96 }}
                            onClick={btn.action}
                            className={`
                h-16 sm:h-20 rounded-2xl flex items-center justify-center text-xl font-normal transition-all outline-none relative overflow-hidden select-none
                ${btn.className || ""}
                ${btn.type === "num"
                                    ? "bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/50 text-neutral-900 dark:text-neutral-100 font-light"
                                    : btn.type === "operator"
                                        ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium"
                                        : btn.type === "meta"
                                            ? "bg-neutral-100/70 dark:bg-neutral-900/70 text-neutral-500 dark:text-neutral-400 text-base font-medium"
                                            : "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-medium shadow-md"
                                }
              `}
                        >
                            {btn.icon ? btn.icon : btn.label}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}