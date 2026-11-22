export type Sector = 'private' | 'public';

export interface Firm {
  id: string;
  name: string;
  fairLocation: string;
  floor: string;
  city: string;
  addressDetails: string;
  transitAccess: string;
  locationFit: string;
  sizeCategory: string;
  headcount: string;
  practiceAreas: string;
  dunsRanking: string;
  profileFit: string;
  fairStatus: string;
  initialNotes: string;
  visitPriority: string;
  sector: Sector;
}

export type QuickTagId =
  | 'submitted_cv'
  | 'partner_contact'
  | 'long_queue'
  | 'return_later'
  | 'great_chat'
  | 'linkedin_followup';

export interface QuickTagMeta {
  id: QuickTagId;
  label: string;
  activeClass: string;
  idleClass: string;
}

export const QUICK_TAGS: QuickTagMeta[] = [
  {
    id: 'submitted_cv',
    label: 'הגשתי טפסים / קו"ח',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    idleClass: 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80',
  },
  {
    id: 'partner_contact',
    label: 'קיבלתי שם/מייל של שותף',
    activeClass: 'bg-indigo-600 text-white border-indigo-600 shadow-xs',
    idleClass: 'bg-indigo-50/70 text-indigo-800 border-indigo-200 hover:bg-indigo-100/80',
  },
  {
    id: 'great_chat',
    label: 'שיחה מעולה',
    activeClass: 'bg-violet-600 text-white border-violet-600 shadow-xs',
    idleClass: 'bg-violet-50/70 text-violet-800 border-violet-200 hover:bg-violet-100/80',
  },
  {
    id: 'long_queue',
    label: 'ממתינה יותר מדי / תור ארוך',
    activeClass: 'bg-amber-600 text-white border-amber-600 shadow-xs',
    idleClass: 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100/80',
  },
  {
    id: 'return_later',
    label: 'לחזור בהמשך',
    activeClass: 'bg-orange-600 text-white border-orange-600 shadow-xs',
    idleClass: 'bg-orange-50/70 text-orange-800 border-orange-200 hover:bg-orange-100/80',
  },
  {
    id: 'linkedin_followup',
    label: 'פולואפ בלינקדאין',
    activeClass: 'bg-sky-600 text-white border-sky-600 shadow-xs',
    idleClass: 'bg-sky-50/70 text-sky-800 border-sky-200 hover:bg-sky-100/80',
  },
];

export interface FirmUserState {
  completed: boolean;
  completedAt?: string;
  tags: QuickTagId[];
  partnerContact: string;
  notes: string;
  updatedAt?: string;
}

export type TrackerState = Record<string, FirmUserState>;

export type StatusFilter = 'all' | 'pending' | 'noted' | 'completed';

export interface FilterState {
  sector: Sector;
  search: string;
  floor: string;
  profileFit: string;
  locationFit: string;
  priority: string;
  status: StatusFilter;
}

export const FLOOR_OPTIONS = ['הכל', 'קומה 2', 'קומה 1', 'קומה 0', 'קומה 1-'] as const;
export const PROFILE_FIT_OPTIONS = ['הכל', 'גבוה מאוד', 'גבוה', 'בינוני', 'נמוך'] as const;
export const LOCATION_FIT_OPTIONS = ['הכל', 'גבוה מאוד', 'גבוה', 'בינוני', 'נמוך'] as const;
export const PRIORITY_OPTIONS = ['הכל', 'חובה!!!', 'חשוב', 'אם יש זמן', 'מיותר'] as const;
export const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'pending', label: 'ממתינים לביקור' },
  { id: 'noted', label: 'בעלי הערות/תגיות' },
  { id: 'completed', label: 'הושלמו' },
];
