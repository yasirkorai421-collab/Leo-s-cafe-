// Single source of truth for Leo's Café opening hours

export const HOURS = {
  weekdays: {
    open: "12:01 PM",
    close: "11:30 PM",
  },
  friday: {
    open: "3:00 PM",
    close: "11:30 PM",
  },
} as const;

export const HOURS_TEXT = {
  short: `Daily: ${HOURS.weekdays.open} – ${HOURS.weekdays.close}`,
  friday: `Friday: ${HOURS.friday.open} – ${HOURS.friday.close}`,
  full: `Daily: ${HOURS.weekdays.open} – ${HOURS.weekdays.close} | Friday: ${HOURS.friday.open} – ${HOURS.friday.close}`,
} as const;

export const SCHEDULE = [
  { day: "Monday", open: HOURS.weekdays.open, close: HOURS.weekdays.close },
  { day: "Tuesday", open: HOURS.weekdays.open, close: HOURS.weekdays.close },
  { day: "Wednesday", open: HOURS.weekdays.open, close: HOURS.weekdays.close },
  { day: "Thursday", open: HOURS.weekdays.open, close: HOURS.weekdays.close },
  { day: "Friday", open: HOURS.friday.open, close: HOURS.friday.close },
  { day: "Saturday", open: HOURS.weekdays.open, close: HOURS.weekdays.close },
  { day: "Sunday", open: HOURS.weekdays.open, close: HOURS.weekdays.close },
] as const;
