import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, ScrollView,
  StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { Backend_Url } from './Backend_url';
import { useIsFocused } from '@react-navigation/native';

export default function AdminActiveEmployees() {
  const [employees, setEmployees] = useState([]);
  const isFocused = useIsFocused();

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${Backend_Url}/api/employees`);
      const data = await res.json();
      setEmployees(data);
    } catch {
      Alert.alert('❌ Failed to fetch employees');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const res = await fetch(`${Backend_Url}/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      Alert.alert('🛑', data.message);
      fetchEmployees();
    } catch {
      Alert.alert('❌ Failed to deactivate');
    }
  };

  useEffect(() => {
    if (isFocused) fetchEmployees();
  }, [isFocused]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>✅ Active Employees</Text>

      {employees.map(emp => (
        <View key={emp.id} style={styles.card}>
          <Text style={styles.name}>{emp.name}</Text>
          <Text style={styles.detail}>📧 {emp.email}</Text>
          <Text style={styles.detail}>📞 {emp.phone}</Text>

          <TouchableOpacity
            style={styles.deactivateButton}
            onPress={() => handleDeactivate(emp.id)}
          >
            <Text style={styles.deactivateText}>Deactivate</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  detail: {
    color: '#c4b5fd',
    fontSize: 14,
    marginBottom: 4,
  },
  deactivateButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deactivateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
