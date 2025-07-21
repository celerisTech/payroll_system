import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

const DesignationsScreen = () => {
  const [designations, setDesignations] = useState([]);
  const [newDesignation, setNewDesignation] = useState(''); // ✅ FIXED VARIABLE NAME

  const fetchDesignations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/designations');
      setDesignations(response.data);
    } catch (error) {
      console.error('Error fetching designations:', error);
    }
  };

  const handleAdd = async () => {
    if (!newDesignation) return;
    try {
      await axios.post('http://localhost:5000/api/designations/add', { PR_DESIG_Name: newDesignation });
      setNewDesignation('');
      fetchDesignations();
    } catch (error) {
      console.error('Error adding designation:', error);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Designations</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new designation"
        value={newDesignation}
        onChangeText={setNewDesignation}
      />
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add Designation</Text>
      </TouchableOpacity>
      <FlatList
        data={designations}
        keyExtractor={(item) => item.PR_DESIG_ID.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.PR_DESIG_Name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 },
  button: { backgroundColor: '#007bff', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center' },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }
});

export default DesignationsScreen;
