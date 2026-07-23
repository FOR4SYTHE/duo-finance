"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { formatCurrency } from "@/lib/format";

export function AnimatedCounter({ 
  value, 
  prefix = "",
}: { 
  value: number;
  prefix?: string;
}) {
  const spring = useSpring(0, {
    stiffness: 40,
    damping: 15, // Low damping gives a nice crypto-ticker smooth slowdown
    mass: 0.8,
  });

  useEffect(() => {
    // Adding a tiny delay to ensure the UI has mounted and the user sees the start of the roll
    const timeout = setTimeout(() => {
      spring.set(value);
    }, 100);
    return () => clearTimeout(timeout);
  }, [spring, value]);

  // Transform the raw number into a beautifully formatted currency string
  const display = useTransform(spring, (current) => {
    return prefix + formatCurrency(Math.round(current));
  });

  return <motion.span>{display}</motion.span>;
}
