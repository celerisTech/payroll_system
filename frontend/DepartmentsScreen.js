import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { Backend_Url } from './Backend_url';

export default function DepartmentsScreen() {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${Backend_Url}/api/departments`);
      const data = await res.json();
      setDepartments(data);
    } catch (error) {
      console.error('Fetch departments error:', error);
    }
  };

  const addDepartment = async () => {
    if (!newDept.trim()) {
      Alert.alert('Validation', 'Please enter department name.');
      return;
    }
    try {
      const res = await fetch(`${Backend_Url}/api/departments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PR_DEP_Name: newDept }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        Alert.alert('Error', errorData.message || 'Failed to add department.');
        return;
      }

      const data = await res.json();
      Alert.alert('Success', data.message);
      setNewDept('');
      fetchDepartments();
    } catch (error) {
      console.error('Add department error:', error);
      Alert.alert('Error', 'Server error while adding department.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Departments</Text>

      <FlatList
        data={departments}
        keyExtractor={(item) => item.PR_DEP_ID.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.PR_DEP_Name}</Text>
        )}
      />

      <TextInput
        placeholder="New Department"
        placeholderTextColor="#6b7280"
        value={newDept}
        onChangeText={setNewDept}
        style={styles.input}
      />
      <View style={styles.buttonWrapper}>
        <Button title="Add Department" color="#4e8ff7" onPress={addDepartment} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#254979ff',
    textAlign: 'center',
  },
  item: {
    fontSize: 18,
    paddingVertical: 8,
    color: '#254979ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  buttonWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
