import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { Backend_Url } from './Backend_url';
import Toast from 'react-native-toast-message';

import { Picker } from '@react-native-picker/picker';

export default function ManagerApproval() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = () => {
    axios.get(`${Backend_Url}/api/manager/leave-requests`)
      .then(res => setRequests(res.data))
      .catch(() => Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch leave requests'
      }));
  };
  const handleAction = (transaction_id, action, updatedLeaveType) => {
    axios.post(`${Backend_Url}/api/manager/leave-approve`, {
      transaction_id,
      action,
      leave_type: updatedLeaveType
    })
    
      .then(() => {
        Toast.show({
          type: 'success',
          text1: `Leave ${action}`,
          text2: `Leave ${action.toLowerCase()} successfully`
        });
        fetchRequests();
      })
    
      
      .catch((err) => {
        const message = err.response?.data?.message || 'Action failed';
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: message
        });
      });
  };

  useEffect(() => {
    fetchRequests();
    // Fetch every 5 seconds
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Manager Approval Panel</Text>

      {requests.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.common}>No Pending Requests</Text>
        </View>
      ) : (
        requests.map(req => (
          <View key={req.transaction_id} style={styles.card}>
            <Text style={styles.inline}>User ID: {req.PR_Emp_id}</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Leave Type:</Text>
              <Picker
                selectedValue={req.updatedLeaveType || req.leave_type}
                onValueChange={(newType) => {
                  const updated = requests.map(r =>
                    r.transaction_id === req.transaction_id
                      ? { ...r, updatedLeaveType: newType }
                      : r
                  );
                  setRequests(updated);
                }}
                style={styles.picker}
                dropdownIconColor="#6b7280" // gray-500
              >
                <Picker.Item label="Casual Leave (CL)" value="CL" />
                <Picker.Item label="Paid Leave (PL)" value="PL" />
                <Picker.Item label="Sick Leave (SL)" value="SL" />
              </Picker>
            </View>

            <Text style={styles.inline}>From: {req.from_date} {req.from_time}</Text>
            <Text style={styles.inline}>To: {req.to_date} {req.to_time}</Text>
            <Text style={styles.inline}>Reason: {req.leave_reason || 'N/A'}</Text>
            <View style={styles.buttonRow}>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Approve"
                  color="#22c55e"
                  onPress={() => handleAction(req.transaction_id, 'Approved', req.updatedLeaveType || req.leave_type)}

                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Reject"
                  color="#ef4444"
                 onPress={() => handleAction(req.transaction_id, 'Rejected', req.updatedLeaveType || req.leave_type)}

                />
              </View>
            </View>
          </View>
        ))
      )}
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4f46e5',  // Indigo-600
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#f9fafb',  // Gray-50
    padding: 18,
    marginVertical: 12,
    
    
    borderWidth: 1,
    borderColor: '#e5e7eb',  // Gray-200
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inline: {
    color: '#374151',  // Gray-700
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  common: {
    fontSize: 24,
    color: '#111827',  // Gray-900
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#374151', // gray-700
    marginBottom: 8,
    fontWeight: '500',
  },
  picker: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
    borderRadius: 8,
    color: '#111827', // gray-900
    padding: 12,
  },
});