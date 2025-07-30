import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Backend_Url } from './Backend_url';
import { format } from 'date-fns';

export default function AttendanceMarkScreen() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const formattedDate = format(date, 'yyyy-MM-dd');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${Backend_Url}/api/employees?status=active`);
      const data = await res.json();
      if (res.ok) {
        const initialized = data.map(emp => ({ ...emp, status: 'Absent' }));
        setEmployees(initialized);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (index) => {
    const updated = [...employees];
    updated[index].status = updated[index].status === 'Present' ? 'Absent' : 'Present';
    setEmployees(updated);
  };

  const submitAttendance = async () => {
    try {
      const res = await fetch(`${Backend_Url}/api/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formattedDate,
          attendance: employees.map(e => ({
            employee_id: e.id,
            status: e.status
          }))
        })
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.error || 'Failed to mark attendance');
      }
    } catch (err) {
      Alert.alert('Error', 'Server error');
    }
  };

  return (
    <ScrollView className="flex-1 bg-purple-950 p-4">
      <Text className="text-white text-2xl font-bold mb-2">Mark Attendance</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="bg-purple-800 p-4 rounded-xl mb-4 flex-row justify-between items-center"
      >
        <Text className="text-white font-semibold">📅  Date:</Text>
        <Text className="text-white text-lg">{format(date, 'dd-MM-yyyy')}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        employees.map((emp, idx) => (
          <TouchableOpacity
            key={emp.id}
            onPress={() => toggleStatus(idx)}
            className="bg-purple-800 p-4 rounded-xl mb-3"
          >
            <Text className="text-white text-lg font-bold">{emp.PR_EMP_Full_Name}</Text>
            <Text className="text-purple-300 text-sm mb-2">ID: {emp.id}</Text>
            <Text className={`font-bold ${emp.status === 'Present' ? 'text-green-400' : 'text-red-400'}`}>
              {emp.status}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity
        onPress={submitAttendance}
        className="bg-green-600 p-4 rounded-xl mt-4"
      >
        <Text className="text-white text-center font-bold text-lg">Submit Attendance</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
