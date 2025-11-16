// ExportUtils.ts
// Utility functions to export app data to CSV or Excel format
//
// Exports: exportLogsToCSV, exportLogsToExcel

import { DateRangeList } from '@/features/DateRangeList';
import { WeightLog } from '@/components/AppStateContext';

export function exportLogsToCSV({
  periodRanges,
  symptomLogs,
  weightLogs,
  textLogs,
  moodLogs,
}: {
  periodRanges: DateRangeList;
  symptomLogs: Record<string, string[]>;
  weightLogs: Record<string, WeightLog>;
  textLogs: Record<string, string>;
  moodLogs: Record<string, { mood: number; anxiety: number; depression: number }>;
}) {
  // Build CSV header
  const header = [
    'Date',
    'Period',
    'Symptoms',
    'Weight (kg)',
    'Mood',
    'Anxiety',
    'Depression',
    'Notes',
  ];
  // Collect all unique dates
  const dateSet = new Set<string>();
  if (periodRanges && periodRanges.ranges) {
    periodRanges.ranges.forEach((r) => {
      if (r.start && r.end) {
        let d = new Date(r.start);
        d.setHours(0,0,0,0);
        while (r.end && d <= r.end) {
          dateSet.add(d.toISOString().slice(0,10));
          d.setDate(d.getDate() + 1);
        }
      }
    });
  }
  Object.keys(symptomLogs).forEach(d => dateSet.add(d));
  Object.keys(weightLogs).forEach(d => dateSet.add(d));
  Object.keys(textLogs).forEach(d => dateSet.add(d));
  Object.keys(moodLogs).forEach(d => dateSet.add(d));
  // Sort dates
  const dates = Array.from(dateSet).sort();
  // Build rows
  const rows = dates.map(date => {
    const isPeriod = periodRanges && periodRanges.containsDate && periodRanges.containsDate(new Date(date));
    const symptoms = symptomLogs[date] ? symptomLogs[date].join('; ') : '';
    const weight = weightLogs[date] ? weightLogs[date].value : '';
    const mood = moodLogs[date] ? moodLogs[date].mood : '';
    const anxiety = moodLogs[date] ? moodLogs[date].anxiety : '';
    const depression = moodLogs[date] ? moodLogs[date].depression : '';
    const notes = textLogs[date] || '';
    return [date, isPeriod ? 'Yes' : '', symptoms, weight, mood, anxiety, depression, notes];
  });
  // Combine header and rows
  const csv = [header, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  return csv;
}

// Excel export can be added with a library like xlsx if needed
export function exportLogsToExcel() {
  // Not implemented in this demo
  return null;
}
