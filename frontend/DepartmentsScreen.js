import axios from 'axios';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DepartmentsScreen = () => {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState('');

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async () => {
    if (!newDept) return;
    try {
      await axios.post('http://localhost:5000/api/departments/add', { PR_DEP_Name: newDept });
      setNewDept('');
      fetchDepartments(); 
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f6f6f6' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Departments</Text>

      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TextInput
          value={newDept}
          onChangeText={setNewDept}
          placeholder="Add Department"
          style={{
            flex: 1,
            borderColor: '#aaa',
            borderWidth: 1,
            padding: 10,
            borderRadius: 8,
            backgroundColor: '#fff'
          }}
        />
        <TouchableOpacity onPress={handleAdd} style={{ marginLeft: 10, backgroundColor: '#4caf50', padding: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {departments.map((dept, index) => (
          <View key={index} style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 10 }}>
            <Text>{dept.PR_DEP_Name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default DepartmentsScreen;
