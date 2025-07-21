import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const SalaryScreen = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [basic, setBasic] = useState('');
  const [hra, setHRA] = useState('');
  const [bonus, setBonus] = useState('');
  const [deductions, setDeductions] = useState('');
  const [salaryList, setSalaryList] = useState([]);

  const API_BASE = 'http://localhost:5000/api'; // Change to your IP if on device

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/employees/active`);
      setEmployees(res.data);
    } catch (err) {
      Alert.alert('Error fetching employees');
    }
  };

  const fetchSalaries = async () => {
    try {
      const res = await axios.get(`${API_BASE}/salarystructures`);
      setSalaryList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !basic || !hra || !bonus || !deductions) {
      Alert.alert('Please fill all fields');
      return;
    }

    const payload = {
      PR_SAL_EMPLOYEE_ID: parseInt(selectedEmployee),
      PR_SAL_BASIC: parseFloat(basic),
      PR_SAL_HRA: parseFloat(hra),
      PR_SAL_BONUS: parseFloat(bonus),
      PR_SAL_DEDUCTIONS: parseFloat(deductions)
    };

    try {
      await axios.post(`${API_BASE}/salarystructures`, payload);
      Alert.alert('Success', 'Salary structure added');
      fetchSalaries();
    } catch (err) {
      console.log(err);
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchSalaries();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Salary Structure</Text>

      <Picker
        selectedValue={selectedEmployee}
        onValueChange={(value) => setSelectedEmployee(value)}
        style={styles.input}
      >
        <Picker.Item label="Select Employee" value="" />
        {employees.map(emp => (
          <Picker.Item key={emp.PR_EMP_ID} label={emp.PR_EMP_NAME} value={emp.PR_EMP_ID.toString()} />
        ))}
      </Picker>

      <TextInput placeholder="Basic" keyboardType="numeric" value={basic} onChangeText={setBasic} style={styles.input} />
      <TextInput placeholder="HRA" keyboardType="numeric" value={hra} onChangeText={setHRA} style={styles.input} />
      <TextInput placeholder="Bonus" keyboardType="numeric" value={bonus} onChangeText={setBonus} style={styles.input} />
      <TextInput placeholder="Deductions" keyboardType="numeric" value={deductions} onChangeText={setDeductions} style={styles.input} />

      <Button title="Submit" onPress={handleSubmit} />

      <Text style={styles.subtitle}>Salary Structures</Text>
      <FlatList
        data={salaryList}
        keyExtractor={(item) => item.PR_SAL_ID.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Emp ID: {item.PR_SAL_EMPLOYEE_ID}</Text>
            <Text>Basic: ₹{item.PR_SAL_BASIC}</Text>
            <Text>HRA: ₹{item.PR_SAL_HRA}</Text>
            <Text>Bonus: ₹{item.PR_SAL_BONUS}</Text>
            <Text>Deductions: ₹{item.PR_SAL_DEDUCTIONS}</Text>
            <Text>Total: ₹{item.PR_SAL_Tot_Salary}</Text>
            <Text>Net: ₹{item.PR_SAL_Net_Salary}</Text>
            <Text>Status: {item.PR_SAL_Status}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { marginTop: 20, fontSize: 16, fontWeight: '600' },
  input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 5 },
  item: { padding: 10, borderBottomWidth: 1, marginBottom: 5 }
});

export default SalaryScreen;
