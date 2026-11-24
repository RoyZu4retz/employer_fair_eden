import { Building2, FileCheck2, Mail, MailCheck, MapPinCheck } from 'lucide-react';
import type { Office } from '../types';
import {
  isCvSubmitted,
  isEmailReplied,
  isEmailSent,
  isTourDone,
} from '../utils/officeHelpers';

interface SummaryStripProps {
  activeOffices: Office[];
  onQuickFilter: (preset: 'all' | 'cv' | 'emailSent' | 'emailReplied' | 'tourDone') => void;
}

export function SummaryStrip({ activeOffices, onQuickFilter }: SummaryStripProps) {
  const total = activeOffices.length;
  const cvCount = activeOffices.filter((o) => isCvSubmitted(o.cvStatus)).length;
  const emailSentCount = activeOffices.filter((o) => isEmailSent(o.emailStatus)).length;
  const emailRepliedCount = activeOffices.filter((o) => isEmailReplied(o.emailStatus)).length;
  const tourDoneCount = activeOffices.filter((o) => isTourDone(o.tourStatus)).length;

  const cards = [
    {
      id: 'all' as const,
      label: 'משרדים פעילים',
      value: total,
      sub: 'סה״כ במעקב',
      icon: Building2,
      ring: 'border-slate-200 bg-white hover:border-slate-300',
      iconWrap: 'bg-slate-100 text-slate-700',
      valueClass: 'text-slate-900',
    },
    {
      id: 'cv' as const,
      label: 'קו״ח הוגשו',
      value: cvCount,
      sub: `מתוך ${total}`,
      icon: FileCheck2,
      ring: 'border-violet-200/80 bg-violet-50/40 hover:border-violet-300',
      iconWrap: 'bg-violet-100 text-violet-700',
      valueClass: 'text-violet-950',
    },
    {
      id: 'emailSent' as const,
      label: 'נשלח מייל',
      value: emailSentCount,
      sub: `מתוך ${total}`,
      icon: Mail,
      ring: 'border-sky-200/80 bg-sky-50/40 hover:border-sky-300',
      iconWrap: 'bg-sky-100 text-sky-700',
      valueClass: 'text-sky-950',
    },
    {
      id: 'emailReplied' as const,
      label: 'ענו / התקבל עדכון',
      value: emailRepliedCount,
      sub: emailSentCount > 0 ? `מתוך ${emailSentCount} שנשלחו` : 'ממתין לשליחה',
      icon: MailCheck,
      ring: 'border-emerald-200/80 bg-emerald-50/40 hover:border-emerald-300',
      iconWrap: 'bg-emerald-100 text-emerald-700',
      valueClass: 'text-emerald-950',
    },
    {
      id: 'tourDone' as const,
      label: 'סיורים שבוצעו',
      value: tourDoneCount,
      sub: `מתוך ${total}`,
      icon: MapPinCheck,
      ring: 'border-indigo-200/80 bg-indigo-50/40 hover:border-indigo-300',
      iconWrap: 'bg-indigo-100 text-indigo-700',
      valueClass: 'text-indigo-950',
    },
  ];

  return (
    <section aria-label="סיכום עליון" className="mx-auto max-w-7xl px-3.5 pt-4 sm:px-6">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onQuickFilter(card.id)}
              className={`group flex items-center gap-3 rounded-2xl border p-3 text-right shadow-2xs transition active:scale-[0.98] ${card.ring}`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconWrap}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-bold text-slate-600">{card.label}</div>
                <div className={`text-xl leading-tight font-extrabold ${card.valueClass}`}>
                  {card.value}
                </div>
                <div className="truncate text-[10px] font-medium text-slate-500">{card.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
