const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const COUNT_WORDS = [
  "None yet.",
  "One walk.",
  "Two walks.",
  "Three walks.",
  "Four walks.",
  "Five walks.",
  "Six walks.",
  "Seven walks.",
];

export type WalkState = {
  today: string;
  view: string;
  marks: string[];
};

export function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(iso: string, days: number): string {
  const date = parseIso(iso);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

export function windowDays(today: string): string[] {
  return Array.from({ length: 8 }, (_, index) => addDays(today, index - 6));
}

export function emptyWalk(today: string): WalkState {
  return { today, view: today, marks: [] };
}

export function dayName(iso: string): string {
  return DAY_NAMES[parseIso(iso).getDay()];
}

export function dayLine(iso: string): string {
  const date = parseIso(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}.`;
}

export function isFuture(state: WalkState): boolean {
  return state.view > state.today;
}

export function isMarked(state: WalkState): boolean {
  return state.marks.includes(state.view);
}

export function weekCount(state: WalkState): number {
  const days = new Set(windowDays(state.today).filter((day) => day <= state.today));
  return state.marks.filter((day) => days.has(day)).length;
}

export function countLabel(state: WalkState): string {
  return COUNT_WORDS[weekCount(state)];
}

export function markLabel(state: WalkState): string {
  if (isFuture(state)) return "Later";
  return isMarked(state) ? "Marked" : "Open";
}

export function noteFor(state: WalkState): string {
  if (isFuture(state)) return "Still ahead.";
  return isMarked(state) ? "Walked." : "Not yet.";
}

export function hasProgress(state: WalkState): boolean {
  return state.marks.length > 0 || state.view !== state.today;
}

function isIso(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseWalk(raw: string | null, today: string): WalkState {
  const empty = emptyWalk(today);
  if (!raw) return empty;
  let value: { today?: unknown; view?: unknown; marks?: unknown };
  try {
    value = JSON.parse(raw);
  } catch {
    return empty;
  }
  if (!value || typeof value !== "object" || !Array.isArray(value.marks) || !value.marks.every(isIso)) return empty;
  const allowed = new Set(windowDays(today).filter((day) => day <= today));
  const marks = [...new Set(value.marks)].filter((day) => allowed.has(day));
  const sameDay = value.today === today;
  const view = sameDay && isIso(value.view) && windowDays(today).includes(value.view) ? value.view : today;
  return { today, view, marks };
}

export function toggleWalk(state: WalkState): { state: WalkState; note: string } {
  if (isFuture(state)) return { state, note: "Still ahead." };
  if (isMarked(state)) {
    return {
      state: { ...state, marks: state.marks.filter((day) => day !== state.view) },
      note: "Walk removed.",
    };
  }
  return { state: { ...state, marks: [...state.marks, state.view] }, note: "Walked." };
}

export function dayBefore(state: WalkState): { state: WalkState; note: string } {
  const days = windowDays(state.today);
  const index = days.indexOf(state.view);
  if (index <= 0) return { state, note: "First day." };
  const view = days[index - 1];
  const next = { ...state, view };
  return { state: next, note: noteFor(next) };
}

export function dayAfter(state: WalkState): { state: WalkState; note: string } {
  const days = windowDays(state.today);
  const index = days.indexOf(state.view);
  if (index < 0 || index >= days.length - 1) return { state, note: "Last day." };
  const view = days[index + 1];
  const next = { ...state, view };
  return { state: next, note: noteFor(next) };
}

export function clearWeek(state: WalkState): { state: WalkState; note: string } {
  return { state: emptyWalk(state.today), note: "Week cleared." };
}
