import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Dimensions
} from 'react-native';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Backend_Url } from './Backend_url';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function AdminDashboard() {
  const navigation = useNavigation();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    monthlyPayroll: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [totalRes, presentRes, absentRes, payrollRes] = await Promise.all([
        fetch(`${Backend_Url}/api/dashboard/total-employees`),
        fetch(`${Backend_Url}/api/dashboard/present-today`),
        fetch(`${Backend_Url}/api/dashboard/absent-today`),
        fetch(`${Backend_Url}/api/dashboard/monthly-payroll`),
      ]);

      const total = await totalRes.json();
      const present = await presentRes.json();
      const absent = await absentRes.json();
      const payroll = await payrollRes.json();

      setStats({
        totalEmployees: total.total,
        presentToday: present.count,
        absentToday: absent.count,
        monthlyPayroll: payroll.total,
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: <MaterialIcons name="people" size={28} color="#3b82f6" />,
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: <MaterialIcons name="check-circle" size={28} color="#3b82f6" />,
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: <MaterialIcons name="cancel" size={28} color="#3b82f6" />,
    },
    {
      title: 'Monthly Payroll',
      value: `₹${stats.monthlyPayroll.toLocaleString()}`,
      icon: <FontAwesome name="money" size={28} color="#3b82f6" />,
    },
  ];

  const quickActions = [
    {
      label: 'Add Employee',
      icon: <MaterialIcons name="person-add" size={24} color="#ffffff" />,
      navigateTo: 'Add Employee',
    },
    {
      label: 'Mark Attendance',
      icon: <MaterialCommunityIcons name="calendar-check" size={24} color="#ffffff" />,
      navigateTo: 'Mark Attendance',
    },
    {
      label: 'Today Attendance',
      icon: <Feather name="bar-chart-2" size={24} color="#ffffff" />,
      navigateTo: 'Attendance',
    },
    {
      label: 'Leave Approvals',
      icon: <MaterialIcons name="approval" size={24} color="#ffffff" />,
      navigateTo: 'Leave Approval',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Welcome back, System Administrator</Text>

      {/* Stat Cards */}
      <View style={styles.cardGrid}>
        {statCards.map((item, idx) => (
          <View key={idx} style={styles.statCard}>
            {item.icon}
            <Text style={styles.statTitle}>{item.title}</Text>
            <Text style={styles.statValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionButton}
              onPress={() => navigation.navigate(action.navigateTo)}
            >
              {action.icon}
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#254979ff',
    marginBottom: 40,
  },
  headerSub: {
    color: '#254979ff',
    marginBottom: 20,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: screenWidth / 2 - 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statTitle: {
    color: '#254979ff',
    fontSize: 14,
    marginTop: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#254979ff',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#254979ff',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: screenWidth / 2 - 30,
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: 'center',
    backgroundColor: '#4e8ff7ff',
  },
  actionLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    color: '#3b82f6',
    marginTop: 10,
    fontSize: 16,
  },
});
