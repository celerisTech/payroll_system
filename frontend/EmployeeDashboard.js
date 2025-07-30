import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function EmployeeDashboard({ userId, onLogout }) {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetch(`http://192.168.1.47:5000/api/employees/${userId}`)
      .then(res => res.json())
      .then(data => setEmployee(data))
      .catch(err => console.error(err));
  }, [userId]);

  if (!employee) {
    return (
      <View style={styles.container}>
        <Text>Loading your profile...</Text>
        <Button title="Logout 🔙" onPress={onLogout} color="#ff4d4d" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Employee Dashboard</Text>
      <Text>Name: {employee.PR_EMP_Full_Name}</Text>
      <Text>Email: {employee.PR_EMP_Email}</Text>
      <Text>Phone: {employee.PR_phoneNumber}</Text>
      <Text>Designation ID: {employee.designation_id}</Text>
      <Button title="Logout 🔙" onPress={onLogout} color="#ff4d4d" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#333' },
});
