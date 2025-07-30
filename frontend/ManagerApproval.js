import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { Backend_Url } from './Backend_url';
import Toast from 'react-native-toast-message';

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

  const handleAction = (transaction_id, action) => {
    axios.post(`${Backend_Url}/api/manager/leave-approve`, { transaction_id, action })
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
            <Text style={styles.inline}>Leave Type: {req.leave_type}</Text>
            <Text style={styles.inline}>From: {req.from_date} {req.from_time}</Text>
            <Text style={styles.inline}>To: {req.to_date} {req.to_time}</Text>
            <View style={styles.buttonRow}>
              <View style={styles.buttonWrapper}>
                <Button 
                  title="Approve" 
                  color="#22c55e" 
                  onPress={() => handleAction(req.transaction_id, 'Approved')} 
                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button 
                  title="Reject" 
                  color="#ef4444" 
                  onPress={(


                    
                  ) => handleAction(req.transaction_id, 'Rejected')} 
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
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffffff',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a78bfa',
  },
  inline: {
    color: '#000000ff',
    fontSize: 16,
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  common: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
