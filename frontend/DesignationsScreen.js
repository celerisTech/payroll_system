import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, FlatList, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Backend_Url } from './Backend_url';

export default function DesignationsScreen() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [designations, setDesignations] = useState([]);
  const [newDesig, setNewDesig] = useState('');

  // Dropdown state
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptItems, setDeptItems] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      fetchDesignations(selectedDept);
    } else {
      setDesignations([]);
    }
  }, [selectedDept]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${Backend_Url}/api/departments`);
      const data = await res.json();
      setDepartments(data);
      setDeptItems(
        data.map(dept => ({
          label: dept.PR_DEP_Name,
          value: dept.PR_DEP_ID.toString(),
        }))
      );
    } catch (error) {
      console.error('Fetch departments error:', error);
    }
  };

  const fetchDesignations = async (depId) => {
    try {
      const res = await fetch(`${Backend_Url}/api/designations/by-department/${depId}`);
      const data = await res.json();
      setDesignations(data);
    } catch (error) {
      console.error('Fetch designations error:', error);
    }
  };

  const addDesignation = async () => {
    if (!newDesig.trim() || !selectedDept) {
      Alert.alert('Validation', 'Please select department and enter designation.');
      return;
    }
    try {
      const res = await fetch(`${Backend_Url}/api/designations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PR_DESIG_Name: newDesig,
          PR_DESIG_DEP_ID: selectedDept
        }),
      });
      const data = await res.json();
      Alert.alert('Success', data.message);
      setNewDesig('');
      fetchDesignations(selectedDept);
    } catch (error) {
      console.error('Add designation error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.header}>Designations</Text>

      <DropDownPicker
        open={deptOpen}
        value={selectedDept}
        items={deptItems}
        setOpen={setDeptOpen}
        setValue={setSelectedDept}
        setItems={setDeptItems}
        placeholder="Select Department"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownBox}
        zIndex={1000}
      />

      <FlatList
        data={designations}
        keyExtractor={(item) => item.PR_DESIG_ID.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.PR_DESIG_Name}</Text>
        )}
        style={styles.list}
      />

      <TextInput
        placeholder="New Designation"
        placeholderTextColor="#6b7280"
        value={newDesig}
        onChangeText={setNewDesig}
        style={styles.input}
      />

      <View style={styles.buttonWrapper}>
        <Button title="Add Designation" color="#4e8ff7" onPress={addDesignation} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#254979ff',
    textAlign: 'center',
  },
  dropdown: {
    borderColor: '#4e8ff7',
    borderRadius: 8,
    marginBottom: 12,
  },
  dropdownBox: {
    borderColor: '#4e8ff7',
  },
  list: {
    marginBottom: 10,
  },
  item: {
    fontSize: 18,
    paddingVertical: 8,
    color: '#111827',
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
