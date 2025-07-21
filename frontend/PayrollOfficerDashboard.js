import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function PayrollOfficerDashboard({ onLogout }) {
  const [salaries, setSalaries] = useState([]);

  useEffect(() => {
    fetch('http://192.168.1.47:5000/api/salarystructures')
      .then(res => res.json())
      .then(data => setSalaries(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>💰 Payroll Officer Dashboard</Text>
      {salaries.map(s => (
        <View key={s.id} style={styles.card}>
          <Text>Employee ID: {s.employee_id}</Text>
          <Text>Basic: ₹{s.basic}</Text>
          <Text>Bonus: ₹{s.bonus}</Text>
          <Text>Deductions: ₹{s.deductions}</Text>
        </View>
      ))}
      <Button title="Logout " onPress={onLogout} color="#ff4d4d" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
    borderColor: '#ddd',
    borderWidth: 1,
  },
});
