"use client";

import { useEffect, useRef } from "react";
import { useBillsStore } from "@/store/useBillsStore";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useHouseholdStore } from "@/store/useHouseholdStore";
import { useCartifyStore } from "@/store/useCartifyStore";

export function useNotificationEngine() {
  const { bills } = useBillsStore();
  const { config, addNotification, _hasHydrated } = useBudgetStore();
  const { entries } = useSpendStore();
  const { scheduledTrips } = useHouseholdStore();
  const { savedTrips } = useCartifyStore();

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!_hasHydrated || hasRunRef.current) return;
    hasRunRef.current = true;

    // We use a sessionStorage key to make sure notifications only fire once per day per session
    const today = new Date();
    const todayKey = `duo-notif-fired-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    if (sessionStorage.getItem(todayKey)) return;

    let firedAny = false;
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Helper to request browser notification permission + send
    const sendBrowserNotification = (title: string, body: string) => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(title, { body });
            }
          });
        }
      }
    };

    // 1. Check Bills Due Today
    bills.forEach(bill => {
      if (bill.reminderEnabled && bill.dueDay === currentDay) {
        addNotification({
          title: "Bill Due Today",
          message: `${bill.name} is due today for ${bill.currency} ${bill.amount.toLocaleString()}.`,
          type: "alert",
          read: false,
          action: { label: "View Calendar", payload: { actionType: "view_calendar" } }
        });
        sendBrowserNotification("Bill Due Today", `${bill.name} is due today.`);
        firedAny = true;
      } else if (bill.reminderEnabled && bill.dueDay < currentDay && (bill.isRecurring || bill.dueDay > 0)) {
        // Quick overdue check (simplistic for current month)
         addNotification({
          title: "Overdue Bill",
          message: `${bill.name} was due on the ${bill.dueDay}th.`,
          type: "alert",
          read: false,
          action: { label: "View Calendar", payload: { actionType: "view_calendar" } }
        });
        firedAny = true;
      }
    });

    // 2. Budget Threshold Check
    const totalSpent = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const budgetTarget = config.targetAmount || 0;
    
    if (budgetTarget > 0) {
      const spentRatio = totalSpent / budgetTarget;
      if (spentRatio >= 1) {
        addNotification({
          title: "Budget Exceeded",
          message: `You have exceeded your ${config.period} budget target of ${budgetTarget.toLocaleString()}.`,
          type: "alert",
          read: false,
          action: { label: "View Budget", payload: { actionType: "view_budget" } }
        });
        sendBrowserNotification("Budget Exceeded", "You have exceeded your budget target.");
        firedAny = true;
      } else if (spentRatio >= 0.8) {
        addNotification({
          title: "Budget Warning",
          message: `You've used ${Math.round(spentRatio * 100)}% of your budget. Slow down!`,
          type: "system",
          read: false,
          action: { label: "View Budget", payload: { actionType: "view_budget" } }
        });
        firedAny = true;
      }
    }

    // 3. Cartify Scheduled Trips
    scheduledTrips.forEach(trip => {
      const d = new Date(trip.date);
      if (d.getDate() === currentDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        addNotification({
          title: "Trip Scheduled Today",
          message: `You have a Cartify trip scheduled for today.`,
          type: "system",
          read: false,
          action: { label: "Start Trip", payload: { actionType: "view_cartify" } }
        });
        firedAny = true;
      }
    });

    // 4. Cartify Saved Trips Reminder
    if (savedTrips.length > 0) {
      addNotification({
        title: "Saved Trips Waiting",
        message: `You have ${savedTrips.length} saved Cartify trip${savedTrips.length > 1 ? 's' : ''} waiting to be resumed.`,
        type: "system",
        read: false,
        action: { label: "View Trips", payload: { actionType: "view_cartify" } }
      });
      firedAny = true;
    }

    if (firedAny) {
      sessionStorage.setItem(todayKey, 'true');
    }

  }, [bills, config.targetAmount, config.period, entries, scheduledTrips, savedTrips, addNotification, _hasHydrated]);
}
