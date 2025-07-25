import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { Backend_Url } from './Backend_url';

const AdminGenerateSalaryScreen = () => {
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  const [monthYear, setMonthYear] = useState('');

  useEffect(() => {
    fetchEmployeesWithStructure();
  }, []);

  const fetchEmployeesWithStructure = async () => {
    try {
      const res = await axios.get(`${Backend_Url}/api/salary/structure-employees`);
      const list = res.data.data.map(emp => ({
        label: emp.name,
        value: String(emp.user_id)
      }));
      setItems(list);
    } catch (error) {
      console.error('❌ Error fetching structure-employees:', error);
      Alert.alert('Error', 'Could not load employees with salary structure.');
    }
  };

  const handleGenerateSalary = async () => {
    if (!monthYear) {
      Alert.alert('Validation', 'Please enter month and year (e.g., 2025-07)');
      return;
    }

    try {
      const res = await axios.post(`${Backend_Url}/api/salary/generate`, { monthYear });
      Alert.alert('Success', res.data.message || 'Salary generated successfully');
    } catch (err) {
      console.error("❌ Error generating salary:", err);
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Generate Salary</Text>

        <Text style={styles.label}>Select Month & Year (YYYY-MM)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2025-07"
          value={monthYear}
          onChangeText={setMonthYear}
        />

        <Text style={styles.label}>Defined Salary Employees</Text>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          placeholder="-- Select Employee --"
          containerStyle={{ marginBottom: 20 }}
          listMode="MODAL"
        />

        <Button title="Generate Salary" onPress={handleGenerateSalary} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdminGenerateSalaryScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    marginBottom: 5,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5
  }
});
