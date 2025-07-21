import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker'; // ✅ Web only
import 'react-datepicker/dist/react-datepicker.css'; // ✅ Required for web
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
    if (isFocused) {
      fetchAttendanceForDate();
    }
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

  const toggleStatus = (user_id) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.user_id === user_id
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
          user_id: e.user_id,
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
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Mark Attendance</Text>

      {/* Date Picker */}
      <View style={styles.datePicker}>
        <Text style={styles.datePickerText}>📅 Select Date</Text>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === 'web') return;
            setShowPicker(true);
          }}
        >
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
        <View style={{ backgroundColor: 'white', padding: 10, borderRadius: 10 }}>
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
          <ActivityIndicator color="#fff" size="large" />
        </View>
      ) : (
        employees.map(emp => (
          <TouchableOpacity
            key={emp.user_id}
            onPress={() => toggleStatus(emp.user_id)}
            style={[
              styles.employeeCard,
              emp.status === 'Present' ? styles.statusPresent : styles.statusAbsent
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.employeeName}>{emp.name} ({emp.user_id})</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Status: {emp.status}</Text>
              <Text style={styles.toggleHint}>Tap to toggle</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Submit Button */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a47',
    padding: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  datePicker: {
    backgroundColor: '#2e1065',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerText: {
    color: '#e9d5ff',
    fontWeight: '600',
    fontSize: 16,
  },
  datePickerDate: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  loadingContainer: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeCard: {
    backgroundColor: '#2e1065',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  statusPresent: {
    borderColor: '#4ade80',
  },
  statusAbsent: {
    borderColor: '#f87171',
  },
  employeeName: {
    color: '#ffffff',
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
    color: '#c4b5fd',
    fontSize: 14,
  },
  toggleHint: {
    color: '#a78bfa',
    fontSize: 12,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#4d7c0f',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
