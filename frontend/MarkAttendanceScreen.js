import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useIsFocused } from '@react-navigation/native';
import { Backend_Url } from './Backend_url';

export default function MarkAttendanceScreen() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isFocused = useIsFocused();
  const formattedDate = format(date, 'yyyy-MM-dd');

  useEffect(() => {
    if (isFocused) fetchAttendanceForDate();
  }, [isFocused, date]);

  const fetchAttendanceForDate = async () => {
    setLoading(true);
    setSubmitted(false);
    try {
      const res = await fetch(`${Backend_Url}/api/attendance/?date=${formattedDate}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const updated = data.map(emp => ({
          ...emp,
          status: emp.status === 'Not Marked' ? 'Absent' : emp.status,
        }));
        setEmployees(updated);
      } else {
        Alert.alert('Error', 'Failed to load attendance');
      }
    } catch (err) {
      console.error('Fetch error', err);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (PR_Emp_id) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.PR_Emp_id === PR_Emp_id
          ? { ...emp, status: emp.status === 'Present' ? 'Absent' : 'Present' }
          : emp
      )
    );
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    try {
      const payload = {
        date: formattedDate,
        attendance: employees.map(e => ({
          PR_Emp_id: e.PR_Emp_id,
          status: e.status,
        })),
      };
      const res = await fetch(`${Backend_Url}/api/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        Alert.alert('✅ Success', 'Attendance submitted');
      } else {
        Alert.alert('❌ Error', data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.headerTitle}>Mark Attendance</Text>

          {/* Date Picker */}
          <View style={styles.datePicker}>
            <Text style={styles.datePickerText}>📅 Select Date</Text>
            <TouchableOpacity onPress={() => { if (Platform.OS !== 'web') setShowPicker(true); }}>
              <Text style={styles.datePickerDate}>{format(date, 'dd-MM-yyyy')}</Text>
            </TouchableOpacity>

            {Platform.OS !== 'web' && showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(_, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </View>

          {Platform.OS === 'web' && (
            <View style={styles.webDatePicker}>
              <DatePicker
                selected={date}
                onChange={(selectedDate) => selectedDate && setDate(selectedDate)}
                maxDate={new Date()}
                dateFormat="dd-MM-yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </View>
          )}

          {/* Employee List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#4e8ff7" size="large" />
            </View>
          ) : (
            employees.map(emp => (
              <TouchableOpacity
                key={emp.PR_Emp_id}
                onPress={() => toggleStatus(emp.PR_Emp_id)}
                style={[
                  styles.employeeCard,
                  emp.status === 'Present' ? styles.statusPresent : styles.statusAbsent
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.employeeName}>{emp.PR_EMP_Full_Name} ({emp.PR_Emp_id})</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusText}>Status: {emp.status}</Text>
                  <Text style={styles.toggleHint}>Tap to toggle</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Submit Button - fixed at bottom */}
        {!loading && (
          <TouchableOpacity
            onPress={submitAttendance}
            disabled={submitting || submitted}
            style={[
              styles.submitButton,
              (submitting || submitted) && styles.submitButtonDisabled
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {submitted
                ? '✅ Submitted'
                : submitting
                ? 'Submitting...'
                : 'Submit Attendance'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  headerTitle: {
    color: '#4e8ff7',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  datePicker: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  datePickerText: {
    color: '#4e8ff7',
    fontWeight: '600',
    fontSize: 16,
  },
  datePickerDate: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '500',
  },
  webDatePicker: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 20,
    borderWidth: 2,
  },
  statusPresent: { borderColor: '#10b981' },
  statusAbsent: { borderColor: '#ef4444' },
  employeeName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    color: '#6b7280',
    fontSize: 14,
  },
  toggleHint: {
    color: '#9ca3af',
    fontSize: 12,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    margin: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#4ade80',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
