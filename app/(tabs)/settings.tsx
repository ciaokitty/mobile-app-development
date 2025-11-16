import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { exportLogsToCSV } from '@/features/ExportUtils';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput, Modal, Switch, Pressable, StyleSheet, Platform } from 'react-native';
import { useAppState } from '@/components/AppStateContext';
import { useTheme } from '@/components/theme';
import { DEFAULT_SYMPTOMS } from '@/features/symptomUtils';
import { DateRangeList } from '@/features/DateRangeList';
import { CommonStyles } from '@/components/CommonStyles';

export default function SettingsScreen () {
  // Export logs as CSV
  const handleExportCSV = async () => {
    const csv = exportLogsToCSV({
      periodRanges: appState.periodRanges,
      symptomLogs: appState.symptomLogs,
      weightLogs: appState.weightLogs,
      textLogs: appState.textLogs,
      moodLogs: appState.moodLogs,
    });
    
    if (Platform.OS === 'web') {
      // Web: Create blob and download
      if (typeof document !== 'undefined') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'period-tracker-export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } else {
      // Mobile: Use FileSystem and Sharing
      const fileUri = FileSystem.cacheDirectory + 'period-tracker-export.csv';
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' });
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export Logs as CSV' });
    }
  };
  const appState = useAppState();
  const { weightUnit, setWeightUnit, setWeightLogs, 
    setPeriodRanges, setSymptomLogs, setAllSymptoms, 
    autoAddPeriodDays, setAutoAddPeriodDays, 
    typicalPeriodLength, setTypicalPeriodLength, 
    showOvulation, setShowOvulation, 
    showFertileWindow, setShowFertileWindow,
    setTextLogs } = useAppState();
  const { theme } = useTheme();

  const [showSymptomAdded, setShowSymptomAdded] = useState(false);
  const [showAppState, setShowAppState] = useState(false);

  useEffect(() => {
    if (showSymptomAdded) {
      const timer = setTimeout(() => setShowSymptomAdded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSymptomAdded]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
      {/* --- Export Data --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Export Data</Text>
      <View style={{ width: '90%', marginBottom: 16 }}>
        <TouchableOpacity
          style={{ backgroundColor: theme.accent, borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 8 }}
          onPress={handleExportCSV}
        >
          <Text style={{ color: theme.fabText, fontWeight: 'bold', fontSize: 16 }}>Export as CSV</Text>
        </TouchableOpacity>
        {/* Excel export can be added here in the future */}
      </View>

      {/* --- Dummy Data Toggle --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Demo / Dummy Data</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%', backgroundColor: theme.card, borderRadius: 8, padding: 12, shadowColor: theme.accent, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>
          Show demo data for testing and preview
        </Text>
        <Switch
          value={appState.dummyDataEnabled}
          onValueChange={appState.setDummyDataEnabled}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={appState.dummyDataEnabled ? theme.accent : theme.card}
        />
      </View>
      <Text style={[CommonStyles.heading, { color: theme.text }]}>Settings</Text>
    
      {/* --- Weight Unit Selection --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginBottom: 8 }}>Weight Unit</Text>
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <TouchableOpacity style={{ backgroundColor: theme.accent, borderRadius: 8, padding: 12 }}>
          <Text style={{ color: theme.fabText, fontWeight: 'bold' }}>kg</Text>
        </TouchableOpacity>
      </View>


      {/* --- Period Logging Preference --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Period Logging</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>
          Auto-add all period days after logging the first day
        </Text>
        <Switch
          value={autoAddPeriodDays}
          onValueChange={setAutoAddPeriodDays}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={autoAddPeriodDays ? theme.accent : theme.card}
        />
      </View>

      {/* --- Period Auto-Log Length Picker --- */}
      {autoAddPeriodDays && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>
            Typical period length (days):
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              onPress={() => setTypicalPeriodLength(l => Math.max(1, l - 1))}
              style={{ backgroundColor: theme.card, borderRadius: 8, padding: 8, marginRight: 8 }}
            >
              <Text style={{ color: theme.text, fontSize: 20 }}>-</Text>
            </Pressable>
            <Text style={{ color: theme.text, fontSize: 18, minWidth: 32, textAlign: 'center' }}>{typicalPeriodLength}</Text>
            <Pressable
              onPress={() => setTypicalPeriodLength(l => Math.min(14, l + 1))}
              style={{ backgroundColor: theme.card, borderRadius: 8, padding: 8, marginLeft: 8 }}
            >
              <Text style={{ color: theme.text, fontSize: 20 }}>+</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* --- Ovulation and Fertile Window Toggles --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Calendar Settings</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Show Ovulation Day</Text>
        <Switch
          value={showOvulation}
          onValueChange={setShowOvulation}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={showOvulation ? theme.accent : theme.card}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Show Fertile Window</Text>
        <Switch
          value={showFertileWindow}
          onValueChange={setShowFertileWindow}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor={showFertileWindow ? theme.accent : theme.card}
        />
      </View>

      {/* --- Log Type Visibility Toggles --- */}
      <Text style={{ color: theme.text, fontSize: 18, marginTop: 32, marginBottom: 8 }}>Show Log Types</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, width: '90%' }}>
        <Text style={{ color: theme.text, fontSize: 16, marginBottom: 8 }}>
          This won't delete existing logs, but will hide these inputs on the log entry page.
        </Text>
      </View>
      <View style={{ width: '90%', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Symptoms</Text>
          <Switch
            value={appState.showSymptomsLog}
            onValueChange={appState.setShowSymptomsLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showSymptomsLog ? theme.accent : theme.card}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Weight</Text>
          <Switch
            value={appState.showWeightLog}
            onValueChange={appState.setShowWeightLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showWeightLog ? theme.accent : theme.card}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Sex</Text>
          <Switch
            value={appState.showSexLog}
            onValueChange={appState.setShowSexLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showSexLog ? theme.accent : theme.card}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Mood & Mental Health</Text>
          <Switch
            value={appState.showMoodLog}
            onValueChange={appState.setShowMoodLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showMoodLog ? theme.accent : theme.card}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>Notes</Text>
          <Switch
            value={appState.showNotesLog}
            onValueChange={appState.setShowNotesLog}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={appState.showNotesLog ? theme.accent : theme.card}
          />
        </View>
      </View>

      {/* --- Show App Storage --- */}
        <TouchableOpacity onPress={() => setShowAppState(s => !s)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: theme.accent, fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>
            {showAppState ? '▼' : '▶'}
          </Text>
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: 'bold'  }}>{showAppState ? 'Hide' : 'Show'} App Storage</Text>
        </TouchableOpacity>
        {showAppState && (
          <View style={[styles.stateBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.stateText, { color: theme.text }]} selectable>
              {JSON.stringify(appState, (key, value) => {
                if (typeof value === 'function') return undefined;
                return value;
              }, 2)}
            </Text>
          </View>
        )}

      {/* --- Delete All Data Button --- */}
      <TouchableOpacity
        style={{ marginTop: 32, backgroundColor: theme.error, borderRadius: 8, padding: 14, alignSelf: 'stretch', marginHorizontal: 24 }}
        onPress={async () => {
          if (Platform.OS === 'web') {
            const confirmed = window.confirm('Are you sure you want to delete all your logged data? This action is NOT reversible.');
            if (!confirmed) return;
            setWeightLogs({});

            setPeriodRanges(new DateRangeList());
            setSymptomLogs({});
            setAllSymptoms(DEFAULT_SYMPTOMS);
            setPeriodRanges(new DateRangeList());
            setAutoAddPeriodDays(true);
            setTypicalPeriodLength(5);
            setShowOvulation(true);
            setShowFertileWindow(true);
            setTextLogs({});
          } else {
            Alert.alert(
              'Delete All Logs',
              'Are you sure you want to delete all your logged data? This action is NOT reversible.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                      const filePath = `${FileSystem.documentDirectory}appState.json`;
                      await FileSystem.deleteAsync(filePath, { idempotent: true });
                    } catch {}
                    setWeightLogs({});

                    setPeriodRanges(new DateRangeList());
                    setSymptomLogs({});
                    setAllSymptoms(DEFAULT_SYMPTOMS);
                    setPeriodRanges(new DateRangeList());
                    setAutoAddPeriodDays(true);
                    setTypicalPeriodLength(5);
                    setShowOvulation(true);
                    setShowFertileWindow(true);
                    setTextLogs({});
                  }
                }
              ]
            );
          }
        }}
      >
        <Text style={{ color: theme.background, fontWeight: 'bold', textAlign: 'center' }}>Delete All Logs</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#fff', // To be replaced with theme.text
    fontSize: 16,
  },
  stateBox: {
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    maxWidth: 400,
  },
  stateText: {
    color: '#fff', // To be replaced with theme.text
    fontSize: 13,
    fontFamily: 'monospace',
  },
});