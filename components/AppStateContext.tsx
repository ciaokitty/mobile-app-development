import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, Switch, Platform } from 'react-native';
import { DEFAULT_SYMPTOMS } from '@/features/symptomUtils';
import { File, Paths } from 'expo-file-system';
// Use new File API for Expo SDK 54+
import { DateRange } from '@/features/DateRange';
import { DateRangeList } from '@/features/DateRangeList';
import { CycleUtils } from '@/features/CycleUtils';

// Types
export type WeightUnit = 'kg';
export interface WeightLog { value: number; unit: WeightUnit; }
export interface Symptom {
  name: string;
  icon: string;
}

export interface UserStats {
  averageCycleLength: number;
  minCycleLength: number;
  maxCycleLength: number;
  cycleLengths: number[];
  averagePeriodLength: number;
  minPeriodLength: number;
  maxPeriodLength: number;
  periodLengths: number[];
}

export interface AppState {
  // State variables / Generic app behavior
  weightUnit: WeightUnit;
  setWeightUnit: (u: WeightUnit) => void;

  allSymptoms: { name: string; icon: string }[];
  setAllSymptoms: React.Dispatch<React.SetStateAction<Symptom[]>>;

  autoAddPeriodDays: boolean;
  setAutoAddPeriodDays: React.Dispatch<React.SetStateAction<boolean>>;

  typicalPeriodLength: number;
  setTypicalPeriodLength: React.Dispatch<React.SetStateAction<number>>;

  showOvulation: boolean;
  setShowOvulation: React.Dispatch<React.SetStateAction<boolean>>;

  showFertileWindow: boolean;
  setShowFertileWindow: React.Dispatch<React.SetStateAction<boolean>>;

  themeName: 'peachy';

  // User logs
  weightLogs: { [date: string]: WeightLog };
  setWeightLogs: React.Dispatch<React.SetStateAction<{ [date: string]: WeightLog }>>;

  periodRanges: DateRangeList;
  setPeriodRanges: React.Dispatch<React.SetStateAction<DateRangeList>>;

  symptomLogs: { [date: string]: string[] };
  setSymptomLogs: React.Dispatch<React.SetStateAction<{ [date: string]: string[] }>>;

  textLogs: { [date: string]: string };
  setTextLogs: React.Dispatch<React.SetStateAction<{ [date: string]: string }>>;

  predictedFertileWindow: DateRange;
  setPredictedFertileWindow: React.Dispatch<React.SetStateAction<DateRange>>;

  predictedOvulationDay: Date | null;
  setPredictedOvulationDay: React.Dispatch<React.SetStateAction<Date | null>>;

  predictedPeriods: DateRangeList;
  setPredictedPeriods: React.Dispatch<React.SetStateAction<DateRangeList>>;

  sexLogs: { [date: string]: string[] };
  setSexLogs: React.Dispatch<React.SetStateAction<{ [date: string]: string[] }>>;

  moodLogs: { [date: string]: { mood: number; anxiety: number; depression: number } };
  setMoodLogs: React.Dispatch<React.SetStateAction<{ [date: string]: { mood: number; anxiety: number; depression: number } }>>;

  // Log visibility toggles
  showSymptomsLog: boolean;
  setShowSymptomsLog: React.Dispatch<React.SetStateAction<boolean>>;
  showMoodLog: boolean;
  setShowMoodLog: React.Dispatch<React.SetStateAction<boolean>>;
  showSexLog: boolean;
  setShowSexLog: React.Dispatch<React.SetStateAction<boolean>>;
  showWeightLog: boolean;
  setShowWeightLog: React.Dispatch<React.SetStateAction<boolean>>;
  showNotesLog: boolean;
  setShowNotesLog: React.Dispatch<React.SetStateAction<boolean>>;

  userStats: UserStats;
  setUserStats: React.Dispatch<React.SetStateAction<UserStats>>;

  dummyDataEnabled: boolean;
  setDummyDataEnabled: (enabled: boolean) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

// Use new File API for Expo SDK 54+
const DATA_FILE = new File(Paths.document, 'appState.json');

// Cross-platform storage helpers
const storage = {
  async load() {
    if (Platform.OS === 'web') {
      const data = window.localStorage.getItem('appState');
      return data ? JSON.parse(data) : null;
    } else {
      try {
        const file = await DATA_FILE.text();
        return JSON.parse(file);
      } catch {
        return null;
      }
    }
  },
  async save(data: any) {
    // Convert DateRange/DateRangeList to JSON-friendly format
    const toSave = {
      ...data,
      periodRanges: data.periodRanges?.toJSON ? data.periodRanges.toJSON() : data.periodRanges,
      predictedFertileWindow: data.predictedFertileWindow?.toJSON ? data.predictedFertileWindow.toJSON() : data.predictedFertileWindow,
      predictedPeriods: data.predictedPeriods?.toJSON ? data.predictedPeriods.toJSON() : data.predictedPeriods,
    };
    if (Platform.OS === 'web') {
      window.localStorage.setItem('appState', JSON.stringify(toSave));
    } else {
      await DATA_FILE.write(JSON.stringify(toSave));
    }
  }
};

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dummy data toggle
  const [dummyDataEnabled, setDummyDataEnabled] = useState(true);
  // State variables / Generic app behavior
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [allSymptoms, setAllSymptoms] = useState(DEFAULT_SYMPTOMS);
  const [autoAddPeriodDays, setAutoAddPeriodDays] = useState<boolean>(true);
  const [typicalPeriodLength, setTypicalPeriodLength] = useState<number>(5);
  const [showOvulation, setShowOvulation] = useState<boolean>(true);
  const [showFertileWindow, setShowFertileWindow] = useState<boolean>(true);
  const themeName = 'peachy';

  // Dummy data for demonstration (realistic, varied for 3 months)
  const dummyPeriodRanges = DateRangeList.fromJSON([
    { start: '2025-10-11', end: '2025-10-16' },
    { start: '2025-11-08', end: '2025-11-13' },
    { start: '2025-12-06', end: '2025-12-11' },
  ]);
  const dummySymptomLogs = {
    // October
    '2025-10-11': ['Cramps', 'Bloating'],
    '2025-10-12': ['Cramps', 'Back Pain'],
    '2025-10-13': ['Fatigue', 'Headache'],
    '2025-10-14': ['Tender Breasts'],
    '2025-10-15': ['Mood Swings', 'Irritability'],
    '2025-10-16': ['Mild Cramps'],
    // November
    '2025-11-08': ['Cramps', 'Bloating', 'Nausea'],
    '2025-11-09': ['Back Pain', 'Diarrhea'],
    '2025-11-10': ['Fatigue', 'Headache'],
    '2025-11-11': ['Tender Breasts', 'Mood Swings'],
    '2025-11-12': ['Mild Cramps', 'Food Cravings'],
    '2025-11-13': ['Improved Mood'],
    // December
    '2025-12-06': ['Cramps', 'Bloating', 'Acne'],
    '2025-12-07': ['Back Pain', 'Constipation'],
    '2025-12-08': ['Fatigue', 'Headache', 'Dizziness'],
    '2025-12-09': ['Mood Swings', 'Anxiety'],
    '2025-12-10': ['Tender Breasts', 'Food Cravings'],
    '2025-12-11': ['Mild Cramps', 'Improved Mood'],
  };
  const dummyWeightLogs: { [date: string]: WeightLog } = {
    // October
    '2025-10-11': { value: 59.8, unit: 'kg' },
    '2025-10-13': { value: 59.6, unit: 'kg' },
    '2025-10-16': { value: 59.9, unit: 'kg' },
    // November
    '2025-11-08': { value: 60.1, unit: 'kg' },
    '2025-11-10': { value: 60.3, unit: 'kg' },
    '2025-11-13': { value: 60.0, unit: 'kg' },
    // December
    '2025-12-06': { value: 60.2, unit: 'kg' },
    '2025-12-08': { value: 60.0, unit: 'kg' },
    '2025-12-11': { value: 60.3, unit: 'kg' },
  };
  const dummyMoodLogs = {
    // October
    '2025-10-11': { mood: 2, anxiety: 3, depression: 2 },
    '2025-10-12': { mood: 2, anxiety: 4, depression: 3 },
    '2025-10-13': { mood: 3, anxiety: 2, depression: 2 },
    '2025-10-14': { mood: 4, anxiety: 1, depression: 1 },
    '2025-10-15': { mood: 3, anxiety: 2, depression: 2 },
    '2025-10-16': { mood: 4, anxiety: 1, depression: 1 },
    // November
    '2025-11-08': { mood: 2, anxiety: 4, depression: 3 },
    '2025-11-09': { mood: 2, anxiety: 3, depression: 2 },
    '2025-11-10': { mood: 3, anxiety: 2, depression: 2 },
    '2025-11-11': { mood: 4, anxiety: 1, depression: 1 },
    '2025-11-12': { mood: 4, anxiety: 1, depression: 1 },
    '2025-11-13': { mood: 5, anxiety: 1, depression: 1 },
    // December
    '2025-12-06': { mood: 2, anxiety: 4, depression: 3 },
    '2025-12-07': { mood: 2, anxiety: 3, depression: 2 },
    '2025-12-08': { mood: 3, anxiety: 2, depression: 2 },
    '2025-12-09': { mood: 3, anxiety: 2, depression: 2 },
    '2025-12-10': { mood: 4, anxiety: 1, depression: 1 },
    '2025-12-11': { mood: 5, anxiety: 1, depression: 1 },
  };
  const dummyTextLogs = {
    // October
    '2025-10-11': 'Period started, cramps and bloating. Stayed home and rested.',
    '2025-10-12': 'Cramps continued, used heating pad. Back pain worse in the evening.',
    '2025-10-13': 'Felt tired, slight headache. Ate healthy snacks.',
    '2025-10-14': 'Breasts tender, mood a bit low. Went for a short walk.',
    '2025-10-15': 'Mood swings, felt irritable. Talked to a friend, felt better.',
    '2025-10-16': 'Period ending, mild cramps. Energy returning.',
    // November
    '2025-11-08': 'Period started, cramps and nausea. Stayed in bed most of the day.',
    '2025-11-09': 'Back pain and diarrhea. Drank lots of water.',
    '2025-11-10': 'Fatigue and headache. Took a nap in the afternoon.',
    '2025-11-11': 'Breasts tender, mood swings. Watched a movie to relax.',
    '2025-11-12': 'Mild cramps, food cravings. Baked cookies.',
    '2025-11-13': 'Period ending, mood improved. Went out for coffee.',
    // December
    '2025-12-06': 'Period started, cramps and acne breakout. Used face mask.',
    '2025-12-07': 'Back pain and constipation. Did some stretching.',
    '2025-12-08': 'Fatigue, headache, and dizziness. Slept in late.',
    '2025-12-09': 'Mood swings and anxiety. Journaled feelings.',
    '2025-12-10': 'Breasts tender, food cravings. Ate chocolate.',
    '2025-12-11': 'Period ending, mild cramps. Felt much better.',
  };

  // User logs
  const [weightLogs, setWeightLogs] = useState<{ [date: string]: WeightLog }>(dummyDataEnabled ? dummyWeightLogs : {});
  const [periodRanges, setPeriodRanges] = useState<DateRangeList>(dummyDataEnabled ? dummyPeriodRanges : new DateRangeList());
  const [symptomLogs, setSymptomLogs] = useState<{ [date: string]: string[] }>(dummyDataEnabled ? dummySymptomLogs : {});
  const [textLogs, setTextLogs] = useState<{ [date: string]: string }>(dummyDataEnabled ? dummyTextLogs : {});
  const [predictedFertileWindow, setPredictedFertileWindow] = useState<DateRange>(new DateRange(null, null));
  const [predictedOvulationDay, setPredictedOvulationDay] = useState<Date | null>(null);
  const [predictedPeriods, setPredictedPeriods] = useState<DateRangeList>(new DateRangeList());
  // sexLogs intentionally left empty for demo
  const [sexLogs, setSexLogs] = useState<{ [date: string]: string[] }>({});
  // Mood/Anxiety/Depression logs: 0 = no data, 1-5 = user value
  const [moodLogs, setMoodLogs] = useState<{ [date: string]: { mood: number; anxiety: number; depression: number } }>(dummyDataEnabled ? dummyMoodLogs : {});
  // Log visibility toggles
  const [showSymptomsLog, setShowSymptomsLog] = useState(true);
  const [showMoodLog, setShowMoodLog] = useState(true);
  const [showSexLog, setShowSexLog] = useState(true);
  const [showWeightLog, setShowWeightLog] = useState(true);
  const [showNotesLog, setShowNotesLog] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>(CycleUtils.computeUserStats(dummyDataEnabled ? dummyPeriodRanges : new DateRangeList()));

  // Effect: When dummyDataEnabled changes, update all logs accordingly
  React.useEffect(() => {
    if (dummyDataEnabled) {
      setWeightLogs(dummyWeightLogs);
      setPeriodRanges(dummyPeriodRanges);
      setSymptomLogs(dummySymptomLogs);
      setTextLogs(dummyTextLogs);
      setMoodLogs(dummyMoodLogs);
    } else {
      setWeightLogs({});
      setPeriodRanges(new DateRangeList());
      setSymptomLogs({});
      setTextLogs({});
      setMoodLogs({});
    }
  }, [dummyDataEnabled]);

  // Always recompute userStats from periodRanges
  React.useEffect(() => {
    setUserStats(CycleUtils.computeUserStats(periodRanges));
  }, [periodRanges]);

  // Load state from storage on mount
  useEffect(() => {
    (async () => {
      const data = await storage.load();
      if (!data) return;
      
      if (data.weightLogs) setWeightLogs(data.weightLogs);
      if (data.weightUnit) setWeightUnit(data.weightUnit);      
      if (data.periodRanges) {
        const periodRanges = DateRangeList.fromJSON(data.periodRanges);
        setPeriodRanges(periodRanges);
      }
      if (data.symptomLogs) setSymptomLogs(data.symptomLogs);
      if (data.allSymptoms) setAllSymptoms(data.allSymptoms);
      if (typeof data.autoAddPeriodDays === 'boolean') setAutoAddPeriodDays(data.autoAddPeriodDays);
      if (typeof data.typicalPeriodLength === 'number') setTypicalPeriodLength(data.typicalPeriodLength);
      if (typeof data.showOvulation === 'boolean') setShowOvulation(data.showOvulation);
      if (typeof data.showFertileWindow === 'boolean') setShowFertileWindow(data.showFertileWindow);      
  // themeName is now fixed to 'peachy', ignore persisted themeName
    // themeName is now fixed to 'peachy', ignore persisted themeName
      if (data.textLogs) setTextLogs(data.textLogs);
      if (data.predictedFertileWindow) {
        const predictedFertileWindow = DateRange.fromJSON(data.predictedFertileWindow);
        setPredictedFertileWindow(predictedFertileWindow);
      }
      if (data.predictedOvulationDay) setPredictedOvulationDay(data.predictedOvulationDay);
      if (data.predictedPeriods) {
        const predictedPeriods = DateRangeList.fromJSON(data.predictedPeriods);
        setPredictedPeriods(predictedPeriods);
      }
      if (data.sexLogs) setSexLogs(data.sexLogs);
      if (data.moodLogs) setMoodLogs(data.moodLogs);
      if (typeof data.showSymptomsLog === 'boolean') setShowSymptomsLog(data.showSymptomsLog);
      if (typeof data.showMoodLog === 'boolean') setShowMoodLog(data.showMoodLog);
      if (typeof data.showSexLog === 'boolean') setShowSexLog(data.showSexLog);
      if (typeof data.showWeightLog === 'boolean') setShowWeightLog(data.showWeightLog);
      if (typeof data.showNotesLog === 'boolean') setShowNotesLog(data.showNotesLog);
      if (data.userStats) setUserStats(data.userStats);
    })();
  }, []);  
  
  // Save state to storage whenever any part changes
  useEffect(() => {
    const data = { 
      weightUnit,
      allSymptoms, 
      autoAddPeriodDays, 
      typicalPeriodLength, 
      showOvulation, 
      showFertileWindow, 
      themeName,
      weightLogs, 
      periodRanges,
      symptomLogs, 
      textLogs,
      predictedFertileWindow, 
      predictedOvulationDay,
      predictedPeriods,
      sexLogs,
      moodLogs,
      showSymptomsLog,
      showMoodLog,
      showSexLog,
      showWeightLog,
      showNotesLog,
      userStats,
    };
    storage.save(data);
  }, [
    weightUnit, 
    allSymptoms, 
    autoAddPeriodDays, 
    typicalPeriodLength, 
    showOvulation, 
    showFertileWindow, 
    themeName,
    weightLogs, 
    periodRanges, 
    symptomLogs, 
    textLogs,
    predictedFertileWindow, 
    predictedOvulationDay,
    predictedPeriods,
    sexLogs,
    moodLogs,
    showSymptomsLog,
    showMoodLog,
    showSexLog,
    showWeightLog,
    showNotesLog,
    userStats,
  ]);
  
  // Compute predictions when a new period is logged
  React.useEffect(() => {    
    // Calculate fertility info based on the predicted period
    const { ovulationDay, fertileWindow } = CycleUtils.calculateFertileWindow(periodRanges);
    setPredictedOvulationDay(ovulationDay);
    setPredictedFertileWindow(fertileWindow);  

    // Compute all user stats and predictions
    const stats = CycleUtils.computeUserStats(periodRanges);
    setUserStats(stats);
    const predictedPeriodsList = CycleUtils.getAllPredictedPeriods(periodRanges, typicalPeriodLength, stats.averageCycleLength);
    setPredictedPeriods(predictedPeriodsList);
  }, [periodRanges, typicalPeriodLength]);
  
  return (
    <AppStateContext.Provider value={{
      weightUnit, setWeightUnit,
      allSymptoms, setAllSymptoms,
      autoAddPeriodDays, setAutoAddPeriodDays,
      typicalPeriodLength, setTypicalPeriodLength,
      showOvulation, setShowOvulation,
      showFertileWindow, setShowFertileWindow,
      themeName,
      weightLogs, setWeightLogs,
      periodRanges, setPeriodRanges,
      symptomLogs, setSymptomLogs,
      textLogs, setTextLogs,
      predictedFertileWindow, setPredictedFertileWindow,
      predictedOvulationDay, setPredictedOvulationDay,
      predictedPeriods, setPredictedPeriods,
      sexLogs, setSexLogs,
      moodLogs, setMoodLogs,
      showSymptomsLog, setShowSymptomsLog,
      showMoodLog, setShowMoodLog,
      showSexLog, setShowSexLog,
      showWeightLog, setShowWeightLog,
      showNotesLog, setShowNotesLog,
      userStats, setUserStats,
      dummyDataEnabled, setDummyDataEnabled,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
};
