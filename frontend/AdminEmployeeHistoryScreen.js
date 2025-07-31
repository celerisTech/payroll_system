import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Dimensions, Platform,
  Pressable
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { FontAwesome5, MaterialIcons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import { Backend_Url } from './Backend_url';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const screenWidth = Dimensions.get('window').width;
const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#6c5ce7'
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: 'rgba(0,0,0,0.1)',
    strokeDasharray: '0'
  },
  propsForLabels: {
    fontSize: 12
  }
};

export default function AdminEmployeeHistoryScreen({ route }) {
  const { PR_Emp_id } = route.params;
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');
  const [startMonth, setStartMonth] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('start');

  useEffect(() => {
    axios.get(`${Backend_Url}/api/employees/history/${PR_Emp_id}`)
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [PR_Emp_id]);

  const showPicker = (target) => {
    setPickerTarget(target);
    setDatePickerVisible(true);
  };

  const hidePicker = () => setDatePickerVisible(false);

  const handleConfirm = (date) => {
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (pickerTarget === 'start') {
      setStartMonth(formattedDate);
    } else {
      setEndMonth(formattedDate);
    }
    hidePicker();
  };

  const filterByMonthRange = (data, field) => {
    if (!startMonth || !endMonth) return data;
    const [startYear, startMonthNum] = startMonth.split('-').map(Number);
    const [endYear, endMonthNum] = endMonth.split('-').map(Number);
    const startDate = new Date(startYear, startMonthNum - 1);
    const endDate = new Date(endYear, endMonthNum);

    return data.filter(item => {
      const itemDate = new Date(item[field]);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const calcSalary = data => {
    const arr = data.map(s => parseFloat(s.PR_ST_Net_Salary) || 0);
    return {
      total: arr.length,
      average: arr.length ? Math.round(arr.reduce((a, b) => a + b) / arr.length) : 0,
      highest: arr.length ? Math.max(...arr) : 0,
      data: arr
    };
  };

  const calcAttendance = data => {
    const present = data.filter(a => a.status === 'Present').length;
    const absent = data.filter(a => a.status === 'Absent').length;
    const total = data.length;
    return { 
      present, 
      absent, 
      total, 
      percentage: total ? Math.round((present / total) * 100) : 0,
      data: [
        { name: 'Present', count: present, color: '#4CAF50', legendFontColor: '#7F7F7F' },
        { name: 'Absent', count: absent, color: '#F44336', legendFontColor: '#7F7F7F' }
      ]
    };
  };

  const calcLeave = data => {
    const approved = data.filter(l => l.leave_status === 'Approved').length;
    const pending = data.filter(l => l.leave_status === 'Pending').length;
    const rejected = data.filter(l => l.leave_status === 'Rejected').length;
    return { 
      approved, 
      pending, 
      rejected, 
      total: data.length,
      data: [
        { name: 'Approved', count: approved, color: '#4CAF50', legendFontColor: '#7F7F7F' },
        { name: 'Pending', count: pending, color: '#FFC107', legendFontColor: '#7F7F7F' },
        { name: 'Rejected', count: rejected, color: '#F44336', legendFontColor: '#7F7F7F' }
      ]
    };
  };

  const downloadPDF = async () => {
    try {
      const content = `
        <html><body>
        <h1 style="color: #6c5ce7;">Employee Report</h1>
        <p><strong>Employee ID:</strong> ${PR_Emp_id}</p>
        <p><strong>Date Range:</strong> ${startMonth || 'All'} to ${endMonth || 'All'}</p>
        <p><strong>Report Type:</strong> ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
        </body></html>
      `;
      const { uri } = await Print.printToFileAsync({ html: content });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6c5ce7" />
    </View>
  );

  const salaryData = filterByMonthRange(history?.salary || [], 'PR_ST_Month_Year');
  const attendanceData = filterByMonthRange(history?.attendance || [], 'date');
  const leaveData = filterByMonthRange(history?.leaves || [], 'created_at');

  const salaryStats = calcSalary(salaryData);
  const attendanceStats = calcAttendance(attendanceData);
  const leaveStats = calcLeave(leaveData);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-details" size={28} color="#6c5ce7" />
        <Text style={styles.headerTitle}>Employee History</Text>
      </View>
      <Text style={styles.subTitle}>ID: {PR_Emp_id}</Text>

      {/* Month Range Picker */}
      <View style={styles.dateRow}>
        <Pressable 
          style={styles.dateButton} 
          onPress={() => showPicker('start')}
        >
          <MaterialIcons name="date-range" size={20} color="#6c5ce7" />
          <Text style={styles.dateButtonText}>
            {startMonth ? startMonth : 'Select Start Month'}
          </Text>
        </Pressable>
        
        <Text style={styles.dateSeparator}>to</Text>
        
        <Pressable 
          style={styles.dateButton} 
          onPress={() => showPicker('end')}
        >
          <MaterialIcons name="date-range" size={20} color="#6c5ce7" />
          <Text style={styles.dateButtonText}>
            {endMonth ? endMonth : 'Select End Month'}
          </Text>
        </Pressable>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        display="spinner"
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        maximumDate={new Date()}
      />

      {/* Tab Switch */}
      <View style={styles.tabRow}>
        {[
          { key: 'attendance', icon: 'calendar-check' },
          { key: 'leave', icon: 'beach-access' },
          { key: 'salary', icon: 'attach-money' }
        ].map(tab => (
          <Pressable 
            key={tab.key} 
            onPress={() => setActiveTab(tab.key)} 
            style={({ pressed }) => [
              styles.tab, 
              activeTab === tab.key && styles.activeTab,
              pressed && styles.pressedTab
            ]}
          >
            <MaterialIcons 
              name={tab.icon} 
              size={24} 
              color={activeTab === tab.key ? '#6c5ce7' : '#555'} 
            />
            <Text style={activeTab === tab.key ? styles.activeTabText : styles.tabText}>
              {tab.key.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Download Button */}
      <Pressable 
        style={({ pressed }) => [
          styles.downloadButton,
          pressed && styles.pressedButton
        ]} 
        onPress={downloadPDF}
      >
        <MaterialIcons name="picture-as-pdf" size={24} color="white" />
        <Text style={styles.downloadButtonText}>Generate Report</Text>
      </Pressable>

      {/* Summary Cards with Charts */}
      {activeTab === 'attendance' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="calendar-alt" size={24} color="#6c5ce7" />
            <Text style={styles.cardTitle}>Attendance Overview</Text>
          </View>
          
          <PieChart
            data={attendanceStats.data}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
            hasLegend={true}
            avoidFalseZero={true}
          />

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{attendanceStats.percentage}%</Text>
              <Text style={styles.statLabel}>Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{attendanceStats.present}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{attendanceStats.absent}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{attendanceStats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'leave' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="beach-access" size={24} color="#FF9800" />
            <Text style={styles.cardTitle}>Leave Summary</Text>
          </View>
          
          <PieChart
            data={leaveStats.data}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
            hasLegend={true}
            avoidFalseZero={true}
          />

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{leaveStats.approved}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FFC107' }]}>{leaveStats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F44336' }]}>{leaveStats.rejected}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{leaveStats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'salary' && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Entypo name="wallet" size={24} color="#00B894" />
            <Text style={styles.cardTitle}>Salary Insights</Text>
          </View>
          
          <BarChart
            data={{
              labels: salaryData.map((_, i) => `Month ${i + 1}`),
              datasets: [{
                data: salaryStats.data
              }]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            fromZero
            style={styles.chart}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            showBarTops={true}
          />

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{salaryStats.average}</Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{salaryStats.highest}</Text>
              <Text style={styles.statLabel}>Highest</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{salaryStats.total}</Text>
              <Text style={styles.statLabel}>Payments</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10
  },
  subTitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    justifyContent: 'space-between'
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateButtonText: {
    marginLeft: 10,
    color: '#2d3436'
  },
  dateSeparator: {
    marginHorizontal: 10,
    color: '#7f8c8d',
    fontWeight: 'bold'
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#f1eaff'
  },
  pressedTab: {
    opacity: 0.8
  },
  tabText: {
    color: '#555',
    fontWeight: '500',
    marginTop: 5,
    fontSize: 12
  },
  activeTabText: {
    color: '#6c5ce7',
    fontWeight: 'bold',
    marginTop: 5,
    fontSize: 12
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#6c5ce7',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  pressedButton: {
    opacity: 0.8
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
    alignSelf: 'center',
    overflow: 'hidden'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6c5ce7',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d'
  }
});