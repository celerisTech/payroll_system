import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet,
  Alert, ScrollView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Backend_Url } from './Backend_url';



export default function AdminAddEmployee({ onEmployeeAdded }) {
  const [form, setForm] = useState({
    user_id: '', name: '', email: '', phone: '', dob: '',
    gender: '', department_id: '', designation_id: '',
    doj: '', work_location_id: ''
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (form.department_id) {
      fetchDesignationsByDepartment(form.department_id);
    } else {
      setDesignations([]);
    }
  }, [form.department_id]);

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const res = await fetch(`${Backend_Url}/api/departments`);
      const data = await res.json();
      console.log('Departments fetched:', data);
      if (Array.isArray(data)) setDepartments(data);
    } catch (error) {
      console.error('Department fetch error:', error);
    }
  };

  const fetchDesignationsByDepartment = async (depId) => {
    try {
      console.log('Fetching designations for department:', depId);
      const res = await fetch(`${Backend_Url}/api/designations/by-department/${depId}`);
      const data = await res.json();
      console.log('Designations fetched:', data);
      if (Array.isArray(data)) setDesignations(data);
      else setDesignations([]);
    } catch (error) {
      console.error('Designation fetch error:', error);
    }
  };

  const handleSubmit = async () => {
    const emptyField = Object.entries(form).find(([_, val]) => !val.trim());
    if (emptyField) {
      Alert.alert('Missing Field', `Please fill ${emptyField[0]} field.`);
      return;
    }

    try {
      const res = await fetch(`${Backend_Url}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      console.log("Backend_Url is:", Backend_Url);

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to add.');
        return;
      }
      Alert.alert('Success', data.message);
      setForm({
        user_id: '', name: '', email: '', phone: '', dob: '',
        gender: '', department_id: '', designation_id: '',
        doj: '', work_location_id: ''
      });
      onEmployeeAdded?.();
    } catch {
      Alert.alert('Server Error', 'Could not connect to backend.');
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="person-add" size={28} color="#ffffff" />
        <Text style={styles.header}>Add New Employee</Text>
      </View>

      <View style={styles.glassBox}>
        {[
          ['User ID', 'user_id'], ['Name', 'name'], ['Email', 'email'],
          ['Phone', 'phone'], ['DOB (YYYY-MM-DD)', 'dob'], ['Gender', 'gender'],
          ['Joining Date', 'doj'], ['Work Location ID', 'work_location_id']
        ].map(([label, key]) => (
          <View key={key} style={styles.inputContainer}>
            <MaterialIcons
              name={getIconForField(key)}
              size={20}
              color="#a78bfa"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={label}
              value={form[key]}
              onChangeText={(text) => handleChange(key, text)}
              style={styles.input}
              placeholderTextColor="#c4b5fd"
            />
          </View>
        ))}

        {/* Department Picker */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="business" size={20} color="#a78bfa" style={styles.inputIcon} />
          <Picker
            selectedValue={form.department_id}
            style={styles.picker}
            dropdownIconColor="#c4b5fd"
            onValueChange={(itemValue) => handleChange('department_id', itemValue)}
          >
            <Picker.Item label="Select Department" value="" />
            {departments.length > 0 ? departments.map((dept) => (
              <Picker.Item
                key={dept.PR_DEP_ID}
                label={dept.PR_DEP_Name}
                value={dept.PR_DEP_ID.toString()}
              />
            )) : <Picker.Item label="No departments available" value="" />}
          </Picker>
        </View>

        {/* Designation Picker */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="work" size={20} color="#a78bfa" style={styles.inputIcon} />
          <Picker
            selectedValue={form.designation_id}
            style={styles.picker}
            dropdownIconColor="#c4b5fd"
            enabled={designations.length > 0}
            onValueChange={(itemValue) => handleChange('designation_id', itemValue)}
          >
            <Picker.Item label={designations.length > 0 ? "Select Designation" : "No designations available"} value="" />
            {designations.length > 0 && designations.map((desig) => (
              <Picker.Item
                key={desig.PR_DESIG_ID}
                label={desig.PR_DESIG_Name}
                value={desig.PR_DESIG_ID.toString()}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="Add Employee" color="#10b981" onPress={handleSubmit} />
        </View>
      </View>
    </ScrollView>
  );
}

const getIconForField = (field) => {
  switch (field) {
    case 'user_id': return 'badge';
    case 'name': return 'person';
    case 'email': return 'email';
    case 'phone': return 'phone';
    case 'dob': return 'cake';
    case 'gender': return 'wc';
    case 'doj': return 'event';
    case 'work_location_id': return 'place';
    default: return 'info';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1b4b', padding: 20 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginLeft: 10 },
  glassBox: { backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: 16, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, borderColor: '#6b21a8', borderWidth: 1, borderRadius: 8, padding: 12, color: '#fff', backgroundColor: 'rgba(255,255,255,0.04)' },
  picker: { flex: 1, height: 50, color: '#000', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, borderColor: '#6b21a8', borderWidth: 1 },
  buttonWrapper: { marginTop: 10, borderRadius: 8, overflow: Platform.OS === 'android' ? 'hidden' : 'visible' },
});
