import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker'; // ✅ Web only
import 'react-datepicker/dist/react-datepicker.css'; // ✅ Required for web
import { Backend_Url } from './Backend_url';
import { format } from 'date-fns';
import { useIsFocused } from '@react-navigation/native';

export default function AdminAttendanceScreen() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFocused = useIsFocused();
  const formattedDate = format(date, 'yyyy-MM-dd');

  useEffect(() => {
    if (isFocused) {
      fetchAttendance(formattedDate);
    }
  }, [isFocused, date]);

  const fetchAttendance = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`${Backend_Url}/api/attendance?date=${date}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAttendance(data);
      } else {
        console.error("⚠️ Unexpected API response:", data);
        setAttendance([]);
      }
    } catch (err) {
      console.error("❌ Attendance fetch error:", err);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Management</Text>
        <Text style={styles.headerSubtitle}>Select date and view employee attendance</Text>
      </View>

      {/* Date Picker */}
      {Platform.OS === 'web' ? (
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
      ) : (
        <>
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={styles.datePicker}
            activeOpacity={0.8}
          >
            <Text style={styles.datePickerText}>📅 Select Date:</Text>
            <Text style={styles.datePickerDate}>{format(date, 'dd-MM-yyyy')}</Text>
          </TouchableOpacity>

          {showPicker && (
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
        </>
      )}

      {/* Attendance List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4e8ff7" size="large" />
        </View>
      ) : attendance.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No attendance data for this date.</Text>
        </View>
      ) : (
        attendance.map((emp, idx) => (
          <View key={idx} style={styles.attendanceCard}>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>Name: {emp.name}</Text>
              <Text style={styles.employeeId}>User ID: {emp.user_id}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[
                styles.statusValue,
                emp.status === 'Present' ? styles.statusPresent :
                emp.status === 'Absent' ? styles.statusAbsent : styles.statusOther
              ]}>
                {emp.status === 'Present' || emp.status === 'Absent' ? emp.status : 'Not Marked'}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 20 },
  header: { marginBottom: 24 },
  headerTitle: {
    color: '#254979ff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#254979ff',
    fontSize: 15,
    textAlign: 'center',
  },
  webDatePicker: {
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 10,
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
  loadingContainer: {
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 30,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  attendanceCard: {
    backgroundColor: '#f9fafb',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  employeeInfo: { marginBottom: 12 },
  employeeName: {
    color: '#254979ff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  employeeId: {
    color: '#254979ff',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    color: '#254979ff',
    fontSize: 15,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusPresent: { color: '#10b981' }, // ✅ Green
  statusAbsent: { color: '#ef4444' },  // ✅ Red
  statusOther: { color: '#f59e0b' },   // ✅ Yellow
});
