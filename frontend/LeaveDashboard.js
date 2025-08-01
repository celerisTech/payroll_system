import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Button, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Calendar from 'react-native-calendars/src/calendar';
import { DateTimePicker } from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { Backend_Url } from './Backend_url';
// Add this import at the top of your file
import { StyleSheet } from 'react-native';

const LeaveDashboard = ({ onClose }) => {
  const [empId, setEmpId] = useState('');
  const [leaveData, setLeaveData] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('CL');
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [showFromTime, setShowFromTime] = useState(false);
  const [showToTime, setShowToTime] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchLeaveData = () => {
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
  };

  const applyLeave = () => {
    if (!empId || !leaveType) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please fill all fields' });
      return;
    }

    const fromDateTime = new Date(fromDate);
    fromDateTime.setHours(fromTime.getHours(), fromTime.getMinutes());

    const toDateTime = new Date(toDate);
    toDateTime.setHours(toTime.getHours(), toTime.getMinutes());

    if (toDateTime < fromDateTime) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'To Date/Time cannot be before From Date/Time' });
      return;
    }

    const formatTime = (dateObj) => {
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    axios.post(`${Backend_Url}/api/leaves/apply`, {
      PR_Emp_id: empId,
      leave_type: leaveType,
      from_date: fromDateTime.toISOString().split('T')[0],
      from_time: formatTime(fromTime),
      to_date: toDateTime.toISOString().split('T')[0],
      to_time: formatTime(toTime),
      leave_reason: leaveReason
    })
      .then((res) => {
        setShowApplyModal(false);
        setShowLeaveModal(false);
        Toast.show({ type: 'success', text1: 'Success', text2: res.data.message });
        fetchLeaveData();
      })
      .catch((err) => {
        setShowApplyModal(false);
        setShowLeaveModal(false);
        if (err.response?.data?.message) {
          Toast.show({ type: 'error', text1: 'Error', text2: err.response.data.message });
        } else {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to apply leave' });
        }
      });
  };

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
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onClose}>
        <Text style={styles.backButtonText}>← Back to Dashboard</Text>
      </TouchableOpacity>

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
          <BlurView
            intensity={Platform.OS === 'ios' ? 50 : 100}
            tint="light"
            style={styles.modalBox}
          > 
            <Text style={styles.modalTitle}>Leave Details</Text>
            {leaveData ? (
              <>
                <Text style={styles.inline}>User ID: {leaveData.PR_Emp_id}</Text>
                <Text style={styles.inline}>Year: {leaveData.year}</Text>
                <Text style={styles.subHeading}>Available Leave Balance</Text>
                <Text style={styles.inline}>CL Remaining: {leaveData.pr_cl_balance}</Text>
                <Text style={styles.inline}>PL Remaining: {leaveData.pr_pl_balance}</Text>
                <Text style={styles.inline}>SL Remaining: {leaveData.pr_sl_balance}</Text>
                <Text style={styles.subHeading}>Leaves Taken </Text>
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
          <BlurView
            intensity={Platform.OS === 'ios' ? 50 : 100}
            tint="light"
            style={styles.modalBox}
          >
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
                  <Text style={styles.inline}>Reason: {item.leave_reason || 'N/A'}</Text>
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
          <BlurView
            intensity={Platform.OS === 'ios' ? 50 : 100}
            tint="light"
            style={styles.modalBox}
          >
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
            <TouchableOpacity onPress={() => setShowFromTime(true)} style={styles.input}>
              <Text style={styles.inline}>{fromTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            {showFromTime && (
              <DateTimePicker
                value={fromTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowFromTime(false);
                  if (selectedTime) setFromTime(selectedTime);
                }}
              />
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
            <TouchableOpacity onPress={() => setShowToTime(true)} style={styles.input}>
              <Text style={styles.inline}>{toTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            {showToTime && (
              <DateTimePicker
                value={toTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowToTime(false);
                  if (selectedTime) setToTime(selectedTime);
                }}
              />
            )}

            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter reason for leave"
              value={leaveReason}
              onChangeText={setLeaveReason}
            />

            <TouchableOpacity
              style={[styles.Button, { backgroundColor: '#4e8ff7' }]}
              onPress={applyLeave}
            >
              <Text style={styles.ButtonText}>Submit Leave</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.Button, { backgroundColor: 'red' }]}
              onPress={() => setShowApplyModal(false)}
            >
              <Text style={styles.ButtonText}>Close</Text>
            </TouchableOpacity>
          </BlurView>
        </ScrollView>
      </Modal>
      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9fbff',
    padding: 20,
    paddingBottom: 60,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  backButtonText: {
    color: '#2b6cb0',
    fontWeight: '600',
    fontSize: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginBottom: 25,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginTop: 30,
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginTop: 15,
  },
  label: {
    color: '#2d3748',
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    backgroundColor: '#ffffff',
    color: '#2d3748',
    padding: 12,
    marginTop: 8,
    borderRadius: 10,
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a202ccc',
    padding: 20,
  },
  modalBox: {
    borderRadius: 16,
    padding: 20,
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginBottom: 20,
    textAlign: 'center',
  },
  inline: {
    color: '#2d3748',
    fontSize: 14,
    marginVertical: 2,
  },
  leaveTypeButton: {
    padding: 12,
    backgroundColor: '#e2e8f0',
    marginVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  calendar: {
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f0f4f8',
  },
  Button: {
    backgroundColor: '#2b6cb0',
    padding: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginVertical: 10,
  },
  ButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default LeaveDashboard;