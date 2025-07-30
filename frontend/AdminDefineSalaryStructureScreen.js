import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { Backend_Url } from './Backend_url';

const AdminDefineSalaryStructureScreen = () => {
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);

  const [basic, setBasic] = useState('');
  const [hra, setHra] = useState('');
  const [other, setOther] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${Backend_Url}/api/employees/active`);
      const employeeList = response.data.map(emp => ({
        label: emp.PR_EMP_Full_Name + ` (ID: ${emp.PR_Emp_id})`, // 👀 Helpful for debugging
        value: String(emp.PR_Emp_id), // ✅ Use user_id as value
      }));
      setItems(employeeList);
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load employees');
    }
  };

  const handleSave = async () => {
    if (!value || !basic || !hra || !other) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const payload = {
      employee_id: value,
      basic,
      hra,
      other_allow: other
    };

    console.log("📤 Saving Structure Payload:", payload);

    try {
      const response = await axios.post(`${Backend_Url}/api/salary/structure`, payload);

      Alert.alert('Success', response.data.message || 'Salary structure saved');

      // Reset form
      setValue(null);
      setBasic('');
      setHra('');
      setOther('');
    } catch (error) {
      console.error("❌ Error saving structure:", error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Define Salary Structure</Text>

        <Text style={styles.label}>Select Employee</Text>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          placeholder="-- Select Employee --"
          containerStyle={{ marginBottom: 20 }}
          zIndex={1000}
          zIndexInverse={3000}
          listMode="MODAL"
          onChangeValue={(val) => {
            console.log("👤 Selected Employee ID:", val);
            setValue(val);
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Basic Salary"
          keyboardType="numeric"
          value={basic}
          onChangeText={setBasic}
        />
        <TextInput
          style={styles.input}
          placeholder="HRA"
          keyboardType="numeric"
          value={hra}
          onChangeText={setHra}
        />
        <TextInput
          style={styles.input}
          placeholder="Other Allowances"
          keyboardType="numeric"
          value={other}
          onChangeText={setOther}
        />

        <Button title="Save Structure" onPress={handleSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdminDefineSalaryStructureScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  }
});
