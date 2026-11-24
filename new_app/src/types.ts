export interface Office {
  id: string;
  // Read-mostly office info (exact Excel columns)
  name: string;
  location: string;
  addressDetails: string;
  transitAccess: string;
  locationFit: string;
  firmSize: string;
  headcount: string;
  practiceAreas: string;
  dunsRanking: string;

  // User-editable tracking fields (exact Excel columns + separate free-text tour notes)
  profileFit: string;
  visitRelevance: string;
  cvStatus: string;
  emailStatus: string;
  department: string;
  tourStatus: string;
  tourNotesStatus: string; // Maps to "הערות מסיור בקובץ" (בוצע / טרם)
  tourFreeNotes: string; // Separate free-text field "הערות מסיור"
  primaryContact: string;
  secondaryContact: string;
  personalNotes: string;

  // App metadata
  archived: boolean;
  updatedAt?: string;
}

export interface TrackerDocument {
  version: number;
  updatedAt: string;
  departments: string[];
  offices: Office[];
}

export const PROFILE_FIT_OPTIONS = ['גבוה מאוד', 'גבוה', 'בינוני', 'נמוך'] as const;

export const VISIT_RELEVANCE_OPTIONS = ['חובה!!!', 'חשוב', 'אפשרי'] as const;

export const CV_STATUS_OPTIONS = [
  'בקודקס ופיזית',
  'קודקס בלבד',
  'פיזית בלבד',
  'טרם הגשתי',
] as const;

export const EMAIL_STATUS_OPTIONS = [
  'כן וקיבלתי עדכון',
  'כן טרם קיבלתי עדכון',
  'טרם',
] as const;

export const TOUR_STATUS_OPTIONS = [
  'הייתי',
  'יש לי בעתיד/קבעתי',
  'רוצה לקבוע',
  'מיותר',
] as const;

export const TOUR_NOTES_STATUS_OPTIONS = ['בוצע', 'טרם'] as const;

export const LOCATION_FIT_OPTIONS = ['גבוה מאוד', 'גבוה', 'בינוני', 'נמוך'] as const;

export type ViewTab = 'active' | 'archived';
export type ViewMode = 'table' | 'cards';

export type SortField =
  | 'default'
  | 'name'
  | 'visitRelevance'
  | 'profileFit'
  | 'cvStatus'
  | 'emailStatus'
  | 'tourStatus'
  | 'locationFit'
  | 'department';

export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  search: string;
  visitRelevance: string;
  profileFit: string;
  cvStatus: string;
  emailStatus: string;
  tourStatus: string;
  tourNotesStatus: string;
  department: string;
  locationFit: string;
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  visitRelevance: 'הכל',
  profileFit: 'הכל',
  cvStatus: 'הכל',
  emailStatus: 'הכל',
  tourStatus: 'הכל',
  tourNotesStatus: 'הכל',
  department: 'הכל',
  locationFit: 'הכל',
};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type StorageBackend = 'local-api' | 'browser-local';
