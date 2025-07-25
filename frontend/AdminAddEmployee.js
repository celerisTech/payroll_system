import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { Backend_Url } from './Backend_url';

export default function AdminAddEmployee({ onEmployeeAdded }) {
  const [form, setForm] = useState({
    user_id: '', name: '', email: '', phone: '', dob: '',
    gender: '', department_id: '', designation_id: '',
    doj: '', work_location_id: '', PR_EMP_STATUS: 'Active'
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [genderOpen, setGenderOpen] = useState(false);
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [designationOpen, setDesignationOpen] = useState(false);

  const [genderItems] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ]);

  const [departmentItems, setDepartmentItems] = useState([]);
  const [designationItems, setDesignationItems] = useState([]);

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (form.department_id) {
      fetchDesignationsByDepartment(form.department_id);
    } else {
      setDesignationItems([]);
    }
  }, [form.department_id]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${Backend_Url}/api/departments`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDepartments(data);
        setDepartmentItems(data.map(dep => ({
          label: dep.PR_DEP_Name,
          value: dep.PR_DEP_ID.toString(),
        })));
      }
    } catch (error) {
      console.error('Department fetch error:', error);
    }
  };

  const fetchDesignationsByDepartment = async (depId) => {
    try {
      const res = await fetch(`${Backend_Url}/api/designations/by-department/${depId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDesignations(data);
        setDesignationItems(data.map(desig => ({
          label: desig.PR_DESIG_Name,
          value: desig.PR_DESIG_ID.toString(),
        })));
      } else {
        setDesignationItems([]);
      }
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

      const data = await res.json();
      if (!res.ok) {
        Alert.alert('Error', data.message || 'Failed to add.');
        return;
      }
      Alert.alert('Success', data.message);
      setForm({
        user_id: '', name: '', email: '', phone: '', dob: '',
        gender: '', department_id: '', designation_id: '',
        doj: '', work_location_id: '', PR_EMP_STATUS: 'Active'
      });
      onEmployeeAdded?.();
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Server Error', error.message || 'Could not connect to backend.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerContainer}>
        <MaterialIcons name="person-add" size={28} color="#254979ff" />
        <Text style={styles.header}>Add New Employee</Text>
      </View>

      <View style={styles.formBox}>
        {[
          ['User ID', 'user_id'], ['Name', 'name'], ['Email', 'email'],
          ['Phone', 'phone'], ['DOB (YYYY-MM-DD)', 'dob'],
          ['Joining Date', 'doj'], ['Work Location ID', 'work_location_id']
        ].map(([label, key]) => (
          <View key={key} style={styles.inputContainer}>
            <MaterialIcons
              name={getIconForField(key)}
              size={20}
              color="#4e8ff7"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={label}
              value={form[key]}
              onChangeText={(text) => handleChange(key, text)}
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />
          </View>
        ))}

        {/* Gender Dropdown */}
        <DropDownPicker
          open={genderOpen}
          value={form.gender}
          items={genderItems}
          setOpen={setGenderOpen}
          setValue={value => handleChange('gender', value())}
          placeholder="Select Gender"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
          zIndex={3000}
        />

        {/* Department Dropdown */}
        <DropDownPicker
          open={departmentOpen}
          value={form.department_id}
          items={departmentItems}
          setOpen={setDepartmentOpen}
          setValue={value => handleChange('department_id', value())}
          placeholder="Select Department"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
          zIndex={2000}
        />

        {/* Designation Dropdown */}
        <DropDownPicker
          open={designationOpen}
          value={form.designation_id}
          items={designationItems}
          setOpen={setDesignationOpen}
          setValue={value => handleChange('designation_id', value())}
          placeholder={designationItems.length > 0 ? "Select Designation" : "No Designations Available"}
          disabled={designationItems.length === 0}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
          zIndex={1000}
        />

        <View style={styles.buttonWrapper}>
          <Button title="Add Employee" color="#4e8ff7" onPress={handleSubmit} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const getIconForField = (field) => {
  switch (field) {
    case 'user_id': return 'badge';
    case 'name': return 'person';
    case 'email': return 'email';
    case 'phone': return 'phone';
    case 'dob': return 'cake';
    case 'doj': return 'event';
    case 'work_location_id': return 'place';
    default: return 'info';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#254979ff',
    marginLeft: 10,
  },
  formBox: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderColor: '#4e8ff7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  dropdown: {
    borderColor: '#4e8ff7',
    borderRadius: 8,
    marginBottom: 12,
  },
  dropdownBox: {
    borderColor: '#4e8ff7',
  },
  buttonWrapper: {
    marginTop: 10,
    borderRadius: 8,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
});
