import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Alert, TouchableOpacity
} from 'react-native';
import { Backend_Url } from './Backend_url';
import { useIsFocused } from '@react-navigation/native';

export default function AdminInactiveEmployees() {
  const [employees, setEmployees] = useState([]);
  const isFocused = useIsFocused();

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${Backend_Url}/api/employees/all`);
      const data = await res.json();
      setEmployees(data.filter(emp => emp.is_active === 0));
    } catch {
      Alert.alert('❌ Failed to fetch employees');
    }
  };

  const handleReactivate = async (id) => {
    try {
      const res = await fetch(`${Backend_Url}/api/employees/reactivate/${id}`, {
        method: 'PUT',
      });
      const data = await res.json();
      Alert.alert('✅', data.message);
      fetchEmployees();
    } catch {
      Alert.alert('❌ Failed to reactivate');
    }
  };

  useEffect(() => {
    if (isFocused) fetchEmployees();
  }, [isFocused]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Inactive Employees</Text>

      {employees.map(emp => (
        <View key={emp.id} style={styles.card}>
          <Text style={styles.name}>{emp.name}</Text>
          <Text style={styles.detail}>📧 {emp.email}</Text>
          <Text style={styles.detail}>📞 {emp.phone}</Text>

          <TouchableOpacity
            style={styles.reactivateButton}
            onPress={() => handleReactivate(emp.id)}
          >
            <Text style={styles.reactivateText}>Reactivate</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#254979ff',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#254979ff',
    marginBottom: 4,
  },
  detail: {
    color: '#254979ff',
    fontSize: 14,
    marginBottom: 4,
  },
  reactivateButton: {
    marginTop: 12,
    backgroundColor: '#4e8ff7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  reactivateText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
