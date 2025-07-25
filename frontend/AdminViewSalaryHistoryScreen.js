import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { Backend_Url } from './Backend_url';

import * as Print from 'expo-print';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const AdminViewSalaryHistoryScreen = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchSalaryHistory(selectedEmployee);
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${Backend_Url}/api/salary/history-employees`);
      setEmployees(res.data.data);
      setDropdownItems(res.data.data.map(emp => ({
        label: emp.name,
        value: emp.user_id
      })));
    } catch (err) {
      Alert.alert("Error", "Failed to load employees.");
    }
  };

  const fetchSalaryHistory = async (user_id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${Backend_Url}/api/salary/history/${user_id}`);
      setSalaryHistory(res.data.data);
    } catch (err) {
      setSalaryHistory([]);
      Alert.alert("Error", "No salary history found.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    let dataToPrint = [];

    if (selectedEmployee) {
      const emp = employees.find(e => e.user_id === selectedEmployee);
      dataToPrint = salaryHistory.map(item => ({ ...item, employee_name: emp?.name }));
    } else {
      const allEmpRes = await axios.get(`${Backend_Url}/api/salary/history-employees`);
      const allData = [];

      for (const emp of allEmpRes.data.data) {
        try {
          const res = await axios.get(`${Backend_Url}/api/salary/history/${emp.user_id}`);
          res.data.data.forEach(sal => {
            allData.push({ ...sal, employee_name: emp.name });
          });
        } catch {}
      }

      dataToPrint = allData;
    }

    if (dataToPrint.length === 0) {
      Alert.alert("No data", "No salary records to download.");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { text-align: center; }
            .item { border-bottom: 1px solid #ccc; padding: 10px 0; }
            .item strong { display: inline-block; width: 120px; }
          </style>
        </head>
        <body>
          <h1>Salary Report</h1>
          ${dataToPrint.map(item => `
            <div class="item">
              <strong>Employee:</strong> ${item.employee_name}<br/>
              <strong>Month:</strong> ${item.PR_ST_Month_Year}<br/>
              <strong>Basic:</strong> ₹${item.PR_ST_Basic}<br/>
              <strong>HRA:</strong> ₹${item.PR_ST_HRA}<br/>
              <strong>Other:</strong> ₹${item.PR_ST_Other_Allow}<br/>
              <strong>Gross:</strong> ₹${item.PR_ST_Gross_Salary}<br/>
              <strong>Deductions:</strong> ₹${item.PR_ST_Deductions}<br/>
              <strong>Net:</strong> ₹${item.PR_ST_Net_Salary}<br/>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow media permissions to save PDF.');
        return;
      }

      // Move to document directory (more stable)
      const fileName = uri.split('/').pop();
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: newPath });

      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(newPath);
      await MediaLibrary.createAlbumAsync('PayrollPDFs', asset, false);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath);
      }

      Alert.alert('Success', 'PDF saved and ready to share.');
    } catch (err) {
      console.error("PDF generation error:", err);
      Alert.alert("Error", "Failed to generate PDF.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>View Salary History</Text>

      <DropDownPicker
        open={open}
        value={selectedEmployee}
        items={dropdownItems}
        setOpen={setOpen}
        setValue={setSelectedEmployee}
        setItems={setDropdownItems}
        placeholder="Select an Employee"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={1000}
        zIndexInverse={3000}
      />

      <TouchableOpacity onPress={generatePDF} style={styles.downloadBtn}>
        <Text style={styles.downloadText}>Download PDF</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : salaryHistory.length > 0 ? (
        <FlatList
          data={salaryHistory}
          keyExtractor={(item) => item.PR_ST_ID.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.month}>{item.PR_ST_Month_Year}</Text>
              <Text>Basic: ₹{item.PR_ST_Basic}</Text>
              <Text>HRA: ₹{item.PR_ST_HRA}</Text>
              <Text>Other Allow: ₹{item.PR_ST_Other_Allow}</Text>
              <Text>Gross: ₹{item.PR_ST_Gross_Salary}</Text>
              <Text>Deductions: ₹{item.PR_ST_Deductions}</Text>
              <Text style={styles.net}>Net Salary: ₹{item.PR_ST_Net_Salary}</Text>
            </View>
          )}
        />
      ) : selectedEmployee && !loading ? (
        <Text style={styles.noData}>No salary history available.</Text>
      ) : null}
    </View>
  );
};

export default AdminViewSalaryHistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  dropdown: { marginBottom: 20, borderColor: '#ccc' },
  dropdownContainer: { borderColor: '#ccc' },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  month: { fontWeight: 'bold', marginBottom: 4 },
  net: { fontWeight: 'bold', color: 'green', marginTop: 4 },
  noData: { textAlign: 'center', color: '#666', marginTop: 20 },
  downloadBtn: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15
  },
  downloadText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
