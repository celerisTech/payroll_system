import LeaveDashboard from './LeaveDashboard';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Backend_Url } from './Backend_url';

export default function EmployeeDashboard({ userId, onLogout }) {
  const [showLeaveDashboard, setShowLeaveDashboard] = useState(false);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    fetch(`${Backend_Url}/api/employees/history/${userId}`)
      .then(res => res.json())
      .then(data => {
        setEmployee(data);
        console.log("📦 Employee fetched:", data);
      })
      .catch(err => console.error("❌ Error fetching employee:", err));
  }, [userId]);

  if (!employee || !employee.basic) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your profile...</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={onLogout}>
          <Text style={styles.secondaryButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { basic, attendance, leaves, salary } = employee;

  return (
    <>
      {showLeaveDashboard ? (
        <LeaveDashboard onClose={() => setShowLeaveDashboard(false)} />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Employee Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back, {basic.PR_EMP_Full_Name}</Text>
          </View>

          {/* Basic Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👤 Basic Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name:</Text>
              <Text style={styles.infoValue}>{basic.PR_EMP_Full_Name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{basic.PR_EMP_Email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{basic.PR_phoneNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Designation:</Text>
              <Text style={styles.infoValue}>{basic.PR_EMP_Designation_ID}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoValue}>{basic.PR_EMP_Department_ID}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text
                style={[
                  styles.infoValue,
                  basic.PR_EMP_STATUS === 'Active'
                    ? styles.activeStatus
                    : styles.inactiveStatus,
                ]}
              >
                {basic.PR_EMP_STATUS}
              </Text>
            </View>
          </View>

          {/* Attendance Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📅 Attendance ({attendance.length})</Text>
            {attendance.length === 0 ? (
              <Text style={styles.noRecords}>No attendance records found</Text>
            ) : (
              attendance.slice(0, 5).map((a, index) => (
                <View key={index} style={styles.recordItem}>
                  <Text style={styles.recordDate}>{a.date?.slice(0, 10)}</Text>
                  <Text
                    style={[
                      styles.recordStatus,
                      a.status === 'Present'
                        ? styles.presentStatus
                        : styles.absentStatus,
                    ]}
                  >
                    {a.status}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Leave Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌴 Leave Records ({leaves.length})</Text>
            {leaves.length === 0 ? (
              <Text style={styles.noRecords}>No leave records found</Text>
            ) : (
              leaves.slice(0, 3).map((l, index) => (
                <View key={index} style={styles.recordItem}>
                  <Text style={styles.recordMainText}>{l.leave_type}</Text>
                  <Text style={styles.recordDateText}>
                    {l.from_date?.slice(0, 10)} to {l.to_date?.slice(0, 10)}
                  </Text>
                  <Text
                    style={[
                      styles.recordStatus,
                      l.leave_status === 'Approved'
                        ? styles.approvedStatus
                        : l.leave_status === 'Pending'
                        ? styles.pendingStatus
                        : styles.rejectedStatus,
                    ]}
                  >
                    {l.leave_status}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Salary Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💰 Salary Records ({salary.length})</Text>
            {salary.length === 0 ? (
              <Text style={styles.noRecords}>No salary records found</Text>
            ) : (
              salary.map((s, index) => (
                <View key={index} style={styles.salaryItem}>
                  <Text style={styles.salaryMonth}>{s.PR_ST_Month_Year}</Text>
                  <Text style={styles.salaryAmount}>
                    ₹{s.PR_ST_Net_Salary.toLocaleString()}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Button Container */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowLeaveDashboard(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>🌴 Leave Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#7f8c8d',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  activeStatus: {
    color: '#27ae60',
    fontWeight: '600',
  },
  inactiveStatus: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  recordDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  recordMainText: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
  },
  recordDateText: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
    marginLeft: 10,
  },
  recordStatus: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
    minWidth: 80,
  },
  presentStatus: {
    backgroundColor: '#e8f8f0',
    color: '#27ae60',
  },
  absentStatus: {
    backgroundColor: '#fde8e8',
    color: '#e74c3c',
  },
  approvedStatus: {
    backgroundColor: '#e8f8f0',
    color: '#27ae60',
  },
  pendingStatus: {
    backgroundColor: '#fff9e6',
    color: '#f39c12',
  },
  rejectedStatus: {
    backgroundColor: '#fde8e8',
    color: '#e74c3c',
  },
  salaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  salaryMonth: {
    fontSize: 15,
    color: '#2c3e50',
    fontWeight: '500',
  },
  salaryAmount: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
  },
  noRecords: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    paddingVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
    gap: 15,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2980b9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});