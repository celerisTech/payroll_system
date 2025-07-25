import React, { useState } from 'react';
import { View, Text, Button, TextInput, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Backend_Url } from './Backend_url';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';

export default function LeaveDashboard() {
  const [empId, setEmpId] = useState('');
  const [leaveData, setLeaveData] = useState(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);

  const [fromHour, setFromHour] = useState('09');
  const [fromMinute, setFromMinute] = useState('00');
  const [fromAmPm, setFromAmPm] = useState('AM');

  const [toHour, setToHour] = useState('09');
  const [toMinute, setToMinute] = useState('00');
  const [toAmPm, setToAmPm] = useState('AM');

  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  function fetchLeaveData() {
    if (!empId) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please enter Employee ID' });
      return;
    }

    axios.get(`${Backend_Url}/api/leaves/${empId}`)
      .then((res) => {
        setLeaveData(res.data);
        setShowLeaveModal(true);
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch leave data' });
      });
  }

  function convertTo24Hour(hour, ampm) {
    let hr = parseInt(hour, 10);
    if (ampm === 'PM' && hr !== 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;
    return hr;
  }
console.log('🟢 applyLeave() triggered');

  function applyLeave() {
    if (!empId || !leaveType) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please fill all fields' });
      return;
    }

    const fromDateTime = new Date(fromDate);
    fromDateTime.setHours(convertTo24Hour(fromHour, fromAmPm), parseInt(fromMinute, 10));

    const toDateTime = new Date(toDate);
    toDateTime.setHours(convertTo24Hour(toHour, toAmPm), parseInt(toMinute, 10));

    if (toDateTime < fromDateTime) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'To Date/Time cannot be before From Date/Time' });
      return;
    }

    axios.post(`${Backend_Url}/api/leaves/apply`, {
      user_id: empId,
      leave_type: leaveType,
      from_date: fromDateTime.toISOString().split('T')[0],
      from_time: fromHour + ':' + fromMinute + ' ' + fromAmPm,
      to_date: toDateTime.toISOString().split('T')[0],
      to_time: toHour + ':' + toMinute + ' ' + toAmPm
    })
      .then((res) => {
        console.log('✅ Response:', res.data);
        setShowApplyModal(false);
        setShowLeaveModal(false);
        Toast.show({ type: 'success', text1: 'Success', text2: res.data.message });
        fetchLeaveData();
      })
      .catch((err) => {
        console.log('❌ Error:', err); // Add this
        setShowApplyModal(false);
        setShowLeaveModal(false);
        if (err.response?.data?.message) {
          Toast.show({ type: 'error', text1: 'Error', text2: err.response.data.message });
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to apply leave' });
        }
      });
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

   const fetchLeaveHistory = () => {
    if (!empId) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please enter Employee ID' });
      return;
    }

    axios
      .get(`${Backend_Url}/api/leaves/history/${empId}`)
      .then((res) => {
        setLeaveHistory(res.data);
        setShowHistoryModal(true);
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to fetch leave history' });
      });
  };

  return (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.heading}>Leave Management</Text>

    <Text style={styles.sectionTitle}>User ID</Text>
    <TextInput
      style={styles.input}
      value={empId}
      onChangeText={setEmpId}
      placeholder="Enter User ID"
      keyboardType="numeric"
    />

    <TouchableOpacity style={styles.Button} onPress={fetchLeaveData}>
      <Text style={styles.ButtonText}>Get Leave Balance</Text>
    </TouchableOpacity>

    <Text style={styles.sectionTitle}>Leave Apply & View Leave History</Text>

    <TouchableOpacity style={styles.Button} onPress={() => setShowApplyModal(true)}>
      <Text style={styles.ButtonText}>Apply for Leave</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.Button} onPress={fetchLeaveHistory}>
      <Text style={styles.ButtonText}>Leave History</Text>
    </TouchableOpacity>

    {/* Leave Balance Modal */}
    <Modal visible={showLeaveModal} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <BlurView intensity={50} tint="light" style={styles.modalBox}>
          <Text style={styles.modalTitle}>Leave Details</Text>
          {leaveData ? (
            <>
              <Text style={styles.inline}>User ID: {leaveData.user_id}</Text>
              <Text style={styles.inline}>Year: {leaveData.year}</Text>
              <Text style={styles.subHeading}>Available Leave Balance</Text>
              <Text style={styles.inline}>CL Remaining: {leaveData.pr_cl_balance}</Text>
              <Text style={styles.inline}>PL Remaining: {leaveData.pr_pl_balance}</Text>
              <Text style={styles.inline}>SL Remaining: {leaveData.pr_sl_balance}</Text>
              <Text style={styles.subHeading}>Leaves Taken</Text>
              <Text style={styles.inline}>CL Taken: {leaveData.cl_taken || 0}</Text>
              <Text style={styles.inline}>PL Taken: {leaveData.pl_taken || 0}</Text>
              <Text style={styles.inline}>SL Taken: {leaveData.sl_taken || 0}</Text>
            </>
          ) : (
            <Text>No Leave Data Found</Text>
          )}
          <Button title="Close" onPress={() => setShowLeaveModal(false)} />
        </BlurView>
      </View>
    </Modal>

    {/* Leave History Modal */}
    <Modal visible={showHistoryModal} transparent animationType="slide">
      <ScrollView contentContainerStyle={styles.modalContainer}>
        <BlurView intensity={50} tint="light" style={styles.modalBox}>
          <Text style={styles.modalTitle}>Leave History</Text>

          {leaveHistory.length === 0 ? (
            <Text>No Leave History Found</Text>
          ) : (
            leaveHistory.map((item, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={styles.inline}>Type: {item.leave_type}</Text>
                <Text style={styles.inline}>
                  From: {item.from_date} {item.from_time}
                </Text>
                <Text style={styles.inline}>
                  To: {item.to_date} {item.to_time}
                </Text>
                <Text style={styles.inline}>Status: {item.leave_status}</Text>
                <Text style={styles.inline}>
                  Applied On: {new Date(item.created_at).toLocaleString()}
                </Text>
                <View
                  style={{ height: 1, backgroundColor: '#ccc', marginVertical: 5 }}
                />
              </View>
            ))
          )}

          <Button title="Close" onPress={() => setShowHistoryModal(false)} />
        </BlurView>
      </ScrollView>
    </Modal>

    {/* Apply Modal */}
    <Modal visible={showApplyModal} transparent animationType="slide">
      <ScrollView contentContainerStyle={styles.modalContainer}>
        <BlurView intensity={50} tint="light" style={styles.modalBox}>
          <Text style={styles.modalTitle}>Apply Leave</Text>

          {['CL', 'PL', 'SL'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.leaveTypeButton,
                leaveType === type && { backgroundColor: '#4e8ff7ff' },
              ]}
              onPress={() => setLeaveType(type)}
            >
              <Text style={{ color: leaveType === type ? 'white' : '#ccc' }}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}

          {/* FROM DATE */}
          <Text style={styles.label}>From Date</Text>
          <TouchableOpacity
            onPress={() => setShowFromCalendar(!showFromCalendar)}
            style={styles.input}
          >
            <Text style={styles.inline}>{formatDate(fromDate)}</Text>
          </TouchableOpacity>
          {showFromCalendar && (
            <Calendar
              onDayPress={(day) => {
                setFromDate(new Date(day.dateString));
                setShowFromCalendar(false);
              }}
              markedDates={{ [formatDate(fromDate)]: { selected: true } }}
              minDate={formatDate(new Date())}
              style={styles.calendar}
            />
          )}

          {/* FROM TIME */}
          <Text style={styles.label}>From Time</Text>
          <TouchableOpacity
            onPress={() => setShowFromTimePicker(!showFromTimePicker)}
            style={styles.input}
          >
            <Text style={styles.inline}>
              {fromHour + ':' + fromMinute + ' ' + fromAmPm}
            </Text>
          </TouchableOpacity>
          {showFromTimePicker && (
            <View style={styles.pickerContainer}>
              <Picker selectedValue={fromHour} style={styles.picker} onValueChange={setFromHour}>
                {hours.map((h) => <Picker.Item key={h} label={h} value={h} />)}
              </Picker>
              <Picker selectedValue={fromMinute} style={styles.picker} onValueChange={setFromMinute}>
                {minutes.map((m) => <Picker.Item key={m} label={m} value={m} />)}
              </Picker>
              <Picker selectedValue={fromAmPm} style={styles.picker} onValueChange={setFromAmPm}>
                <Picker.Item label="AM" value="AM" />
                <Picker.Item label="PM" value="PM" />
              </Picker>
              <Button title="Set Time" onPress={() => setShowFromTimePicker(false)} />
            </View>
          )}

          {/* TO DATE */}
          <Text style={styles.label}>To Date</Text>
          <TouchableOpacity
            onPress={() => setShowToCalendar(!showToCalendar)}
            style={styles.input}
          >
            <Text style={styles.inline}>{formatDate(toDate)}</Text>
          </TouchableOpacity>
          {showToCalendar && (
            <Calendar
              onDayPress={(day) => {
                setToDate(new Date(day.dateString));
                setShowToCalendar(false);
              }}
              markedDates={{ [formatDate(toDate)]: { selected: true } }}
              minDate={formatDate(fromDate)}
              style={styles.calendar}
            />
          )}

          {/* TO TIME */}
          <Text style={styles.label}>To Time</Text>
          <TouchableOpacity
            onPress={() => setShowToTimePicker(!showToTimePicker)}
            style={styles.input}
          >
            <Text style={styles.inline}>
              {toHour + ':' + toMinute + ' ' + toAmPm}
            </Text>
          </TouchableOpacity>
          {showToTimePicker && (
            <View style={styles.pickerContainer}>
              <Picker selectedValue={toHour} style={styles.picker} onValueChange={setToHour}>
                {hours.map((h) => <Picker.Item key={h} label={h} value={h} />)}
              </Picker>
              <Picker selectedValue={toMinute} style={styles.picker} onValueChange={setToMinute}>
                {minutes.map((m) => <Picker.Item key={m} label={m} value={m} />)}
              </Picker>
              <Picker selectedValue={toAmPm} style={styles.picker} onValueChange={setToAmPm}>
                <Picker.Item label="AM" value="AM" />
                <Picker.Item label="PM" value="PM" />
              </Picker>
              <Button title="Set Time" onPress={() => setShowToTimePicker(false)} />
            </View>
          )}

          <Button title="Submit Leave" color=" #254979ff"  onPress={applyLeave} />
          <Button title="Close" color="red" onPress={() => setShowApplyModal(false)} />
        </BlurView>
      </ScrollView>
    </Modal>

    <Toast />
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    padding: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4e8ff7ff',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000000ff',
    marginTop: 30,
    fontWeight: 'bold',
  },
  subHeading: {
    fontWeight: 'bold',
    color: '#000000ff',
    marginTop: 15,
    fontSize: 16,
  },
  label: {
    color: '#ffffffff',
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000000ff',
    backgroundColor: 'rgba(69, 75, 77, 0.08)',
    color: '#000000ff',
    padding: 12,
    marginTop: 8,
    borderRadius: 12,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e2020aa',
    padding: 20,
  },
  modalBox: {
    borderRadius: 20,
    padding: 20,
    width: '85%',
    backgroundColor: 'transparent',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 15,
    color: '#000000ff',
    textAlign: 'center',
  },
  inline: {
    color: '#ffffffff',
  },
  leaveTypeButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  calendar: {
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  picker: {
    width: 80,
    height: 50,
    color: '#ff0202ff',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
  },
  Button: {
    backgroundColor: '#4e8ff7ff',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    marginVertical: 10,
  },
  ButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    
  },
});