import type { Firm, FirmUserState } from '../types';

export function getFitBadgeClasses(level: string): string {
  switch (level) {
    case 'גבוה מאוד':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'גבוה':
    case 'בינוני-גבוה':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'בינוני':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'נמוך':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getPriorityBadgeClasses(priority: string): string {
  switch (priority) {
    case 'חובה!!!':
      return 'bg-rose-600 text-white border-rose-600 font-bold';
    case 'חשוב':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold';
    case 'אם יש זמן':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'מיותר':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getFloorBadgeClasses(floor: string): string {
  switch (floor) {
    case 'קומה 2':
      return 'bg-indigo-600/10 text-indigo-800 border-indigo-200/80';
    case 'קומה 1':
      return 'bg-sky-600/10 text-sky-800 border-sky-200/80';
    case 'קומה 0':
      return 'bg-emerald-600/10 text-emerald-800 border-emerald-200/80';
    case 'קומה 1-':
      return 'bg-purple-600/10 text-purple-800 border-purple-200/80';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getShortCityDistrict(firm: Firm): string {
  if (!firm.addressDetails) return firm.city;
  const beforeDash = firm.addressDetails.split('–')[0]?.trim();
  if (beforeDash && beforeDash.length <= 28) {
    return beforeDash;
  }
  return firm.city;
}

export function hasActiveNotesOrTags(state?: FirmUserState): boolean {
  if (!state) return false;
  return (
    state.tags.length > 0 ||
    state.partnerContact.trim().length > 0 ||
    state.notes.trim().length > 0
  );
}
