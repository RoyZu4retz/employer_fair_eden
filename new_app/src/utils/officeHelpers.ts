import {
  CV_STATUS_OPTIONS,
  EMAIL_STATUS_OPTIONS,
  LOCATION_FIT_OPTIONS,
  PROFILE_FIT_OPTIONS,
  TOUR_STATUS_OPTIONS,
  VISIT_RELEVANCE_OPTIONS,
  type Office,
  type SortDirection,
  type SortField,
} from '../types';

/**
 * Ensures any unknown/custom value imported from Excel is preserved verbatim
 * in dropdowns and filters instead of being lost or overwritten.
 */
export function buildSelectOptions(
  predefined: readonly string[],
  currentValue?: string,
  extraValues: string[] = []
): string[] {
  const result: string[] = [...predefined];
  const pushUnique = (val?: string) => {
    const clean = (val ?? '').trim();
    if (clean && !result.includes(clean)) {
      result.push(clean);
    }
  };
  extraValues.forEach(pushUnique);
  pushUnique(currentValue);
  return result;
}

function rankInList(value: string, list: readonly string[]): number {
  const idx = list.indexOf((value ?? '').trim());
  return idx === -1 ? list.length + 1 : idx;
}

export function sortOffices(
  offices: Office[],
  field: SortField,
  direction: SortDirection
): Office[] {
  const factor = direction === 'asc' ? 1 : -1;

  return [...offices].sort((a, b) => {
    if (field === 'default') {
      const relDiff =
        rankInList(a.visitRelevance, VISIT_RELEVANCE_OPTIONS) -
        rankInList(b.visitRelevance, VISIT_RELEVANCE_OPTIONS);
      if (relDiff !== 0) return relDiff;

      const fitDiff =
        rankInList(a.profileFit, PROFILE_FIT_OPTIONS) -
        rankInList(b.profileFit, PROFILE_FIT_OPTIONS);
      if (fitDiff !== 0) return fitDiff;

      return a.name.localeCompare(b.name, 'he');
    }

    let cmp = 0;
    switch (field) {
      case 'name':
        cmp = a.name.localeCompare(b.name, 'he');
        break;
      case 'visitRelevance':
        cmp =
          rankInList(a.visitRelevance, VISIT_RELEVANCE_OPTIONS) -
          rankInList(b.visitRelevance, VISIT_RELEVANCE_OPTIONS);
        break;
      case 'profileFit':
        cmp =
          rankInList(a.profileFit, PROFILE_FIT_OPTIONS) -
          rankInList(b.profileFit, PROFILE_FIT_OPTIONS);
        break;
      case 'cvStatus':
        cmp =
          rankInList(a.cvStatus, CV_STATUS_OPTIONS) -
          rankInList(b.cvStatus, CV_STATUS_OPTIONS);
        break;
      case 'emailStatus':
        cmp =
          rankInList(a.emailStatus, EMAIL_STATUS_OPTIONS) -
          rankInList(b.emailStatus, EMAIL_STATUS_OPTIONS);
        break;
      case 'tourStatus':
        cmp =
          rankInList(a.tourStatus, TOUR_STATUS_OPTIONS) -
          rankInList(b.tourStatus, TOUR_STATUS_OPTIONS);
        break;
      case 'locationFit':
        cmp =
          rankInList(a.locationFit, LOCATION_FIT_OPTIONS) -
          rankInList(b.locationFit, LOCATION_FIT_OPTIONS);
        break;
      case 'department':
        cmp = (a.department || 'תתת').localeCompare(b.department || 'תתת', 'he');
        break;
    }

    if (cmp !== 0) return cmp * factor;
    return a.name.localeCompare(b.name, 'he');
  });
}

export function getVisitRelevanceClasses(value: string): string {
  switch (value.trim()) {
    case 'חובה!!!':
      return 'bg-rose-600 text-white border-rose-600 font-bold shadow-2xs';
    case 'חשוב':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold';
    case 'אפשרי':
      return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getRowAccentClasses(value: string): string {
  switch (value.trim()) {
    case 'חובה!!!':
      return 'bg-rose-50/35 hover:bg-rose-50/75 border-r-4 border-r-rose-500';
    case 'חשוב':
      return 'bg-white hover:bg-indigo-50/35 border-r-4 border-r-indigo-400';
    case 'אפשרי':
      return 'bg-white hover:bg-slate-50 border-r-4 border-r-slate-200';
    default:
      return 'bg-white hover:bg-slate-50 border-r-4 border-r-transparent';
  }
}

export function getFitBadgeClasses(value: string): string {
  switch (value.trim()) {
    case 'גבוה מאוד':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'גבוה':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'בינוני':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'נמוך':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getCvBadgeClasses(value: string): string {
  switch (value.trim()) {
    case 'בקודקס ופיזית':
      return 'bg-emerald-600 text-white border-emerald-600';
    case 'קודקס בלבד':
      return 'bg-sky-50 text-sky-800 border-sky-200';
    case 'פיזית בלבד':
      return 'bg-violet-50 text-violet-800 border-violet-200';
    case 'טרם הגשתי':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    default:
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
  }
}

export function getEmailBadgeClasses(value: string): string {
  switch (value.trim()) {
    case 'כן וקיבלתי עדכון':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'כן טרם קיבלתי עדכון':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'טרם':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    default:
      return 'bg-sky-50 text-sky-800 border-sky-200';
  }
}

export function getTourBadgeClasses(value: string): string {
  switch (value.trim()) {
    case 'הייתי':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'יש לי בעתיד/קבעתי':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'רוצה לקבוע':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'מיותר':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getTourNotesStatusClasses(value: string): string {
  switch (value.trim()) {
    case 'בוצע':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'טרם':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function isCvSubmitted(cvStatus: string): boolean {
  const clean = (cvStatus ?? '').trim();
  return clean.length > 0 && clean !== 'טרם הגשתי';
}

export function isEmailSent(emailStatus: string): boolean {
  const clean = (emailStatus ?? '').trim();
  return clean === 'כן וקיבלתי עדכון' || clean === 'כן טרם קיבלתי עדכון';
}

export function isEmailReplied(emailStatus: string): boolean {
  return (emailStatus ?? '').trim() === 'כן וקיבלתי עדכון';
}

export function isTourDone(tourStatus: string): boolean {
  return (tourStatus ?? '').trim() === 'הייתי';
}

export function extractEmailAddress(contact: string): string | null {
  const match = contact.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
}

export function createEmptyOffice(partial?: Partial<Office>): Office {
  return {
    id: `office-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    location: 'ת״א',
    addressDetails: '',
    transitAccess: '',
    locationFit: 'גבוה',
    firmSize: '',
    headcount: '',
    practiceAreas: '',
    dunsRanking: '',
    profileFit: 'גבוה',
    visitRelevance: 'חשוב',
    cvStatus: 'טרם הגשתי',
    emailStatus: 'טרם',
    department: '',
    tourStatus: 'רוצה לקבוע',
    tourNotesStatus: 'טרם',
    tourFreeNotes: '',
    primaryContact: '',
    secondaryContact: '',
    personalNotes: '',
    archived: false,
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}
