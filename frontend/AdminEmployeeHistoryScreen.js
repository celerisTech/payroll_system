import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, 
  Dimensions, TouchableOpacity, Modal, FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { Backend_Url } from './Backend_url';
import { AntDesign } from '@expo/vector-icons';
import moment from 'moment';

const AdminEmployeeHistoryScreen = ({ route }) => {
  const { PR_Emp_id } = route.params;
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [years, setYears] = useState([]);
  const months = moment.months();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${Backend_Url}/api/employees/history/${PR_Emp_id}`);
        setHistory(response.data);
        
        // Generate years array based on employee's joining date
        const startYear = response.data.basic?.PR_EMP_DOJ ? 
          moment(response.data.basic.PR_EMP_DOJ).year() : 
          moment().year() - 5;
        const currentYear = moment().year();
        const yearsArray = [];
        for (let year = startYear; year <= currentYear; year++) {
          yearsArray.push(year);
        }
        setYears(yearsArray);
        
        // Set default to current month/year
        setSelectedMonth(moment().month());
        setSelectedYear(moment().year());
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [PR_Emp_id]);

  const filterDataByMonthYear = (data, dateField) => {
    if (!selectedMonth || !selectedYear) return data;
    
    return data.filter(item => {
      const itemDate = moment(dateField === 'attendance' ? item.date : item.created_at);
      return itemDate.month() === selectedMonth && itemDate.year() === selectedYear;
    });
  };

  const calculateAttendanceStats = () => {
    if (!history?.attendance) return { percentage: 0, present: 0, absent: 0, total: 0 };
    
    const filteredData = filterDataByMonthYear(history.attendance, 'attendance');
    const present = filteredData.filter(a => a.status === 'Present').length;
    const absent = filteredData.filter(a => a.status === 'Absent').length;
    const total = filteredData.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { percentage, present, absent, total };
  };

  const calculateLeaveStats = () => {
    if (!history?.leaves) return { approved: 0, pending: 0, rejected: 0, total: 0 };
    
    const filteredData = filterDataByMonthYear(history.leaves, 'leave');
    const approved = filteredData.filter(l => l.leave_status === 'Approved').length;
    const pending = filteredData.filter(l => l.leave_status === 'Pending').length;
    const rejected = filteredData.filter(l => l.leave_status === 'Rejected').length;
    const total = filteredData.length;

    return { approved, pending, rejected, total };
  };

  const calculateSalaryStats = () => {
    if (!history?.salary) return { average: 0, highest: 0, total: 0 };
    
    const filteredData = filterDataByMonthYear(history.salary, 'salary');
    const total = filteredData.length;
    
    if (total === 0) return { average: 0, highest: 0, total: 0 };
    
    const amounts = filteredData.map(s => parseFloat(s.PR_ST_Net_Salary) || 0);
    const sum = amounts.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / total);
    const highest = Math.max(...amounts);

    return { average, highest, total };
  };

  const openDetailsModal = (data, type) => {
    const filteredData = filterDataByMonthYear(data, type);
    setSelectedData(filteredData);
    setModalVisible(true);
  };

  const handleMonthYearSelect = () => {
    setShowMonthPicker(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Loading employee history...</Text>
      </View>
    );
  }

  if (!history) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No history found for this employee</Text>
      </View>
    );
  }

  const attendanceStats = calculateAttendanceStats();
  const leaveStats = calculateLeaveStats();
  const salaryStats = calculateSalaryStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employee History</Text>
        <Text style={styles.headerSubtitle}>ID: {PR_Emp_id}</Text>
      </View>

      {/* Month/Year Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.monthFilterButton}
          onPress={() => setShowMonthPicker(!showMonthPicker)}
        >
          <AntDesign name="calendar" size={20} color="#6c5ce7" />
          <Text style={styles.monthFilterText}>
            {months[selectedMonth]} {selectedYear}
          </Text>
          <AntDesign 
            name={showMonthPicker ? "up" : "down"} 
            size={16} 
            color="#6c5ce7" 
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
      </View>

      {showMonthPicker && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerRow}>
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
              mode="dropdown"
            >
              {months.map((month, index) => (
                <Picker.Item key={index} label={month} value={index} />
              ))}
            </Picker>
            
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
              mode="dropdown"
            >
              {years.map((year) => (
                <Picker.Item key={year} label={year.toString()} value={year} />
              ))}
            </Picker>
          </View>
          
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={handleMonthYearSelect}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'attendance' && styles.activeTab]}
          onPress={() => setActiveTab('attendance')}
        >
          <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'leave' && styles.activeTab]}
          onPress={() => setActiveTab('leave')}
        >
          <Text style={[styles.tabText, activeTab === 'leave' && styles.activeTabText]}>Leave</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'salary' && styles.activeTab]}
          onPress={() => setActiveTab('salary')}
        >
          <Text style={[styles.tabText, activeTab === 'salary' && styles.activeTabText]}>Salary</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Attendance Summary */}
        {activeTab === 'attendance' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Attendance Summary</Text>
            <View style={styles.gridContainer}>
              <TouchableOpacity 
                style={[styles.summaryCard, styles.percentageCard]}
                onPress={() => openDetailsModal(history.attendance, 'attendance')}
              >
                <Text style={styles.summaryPercentage}>{attendanceStats.percentage}%</Text>
                <Text style={styles.summaryLabel}>Attendance Rate</Text>
                <View style={styles.viewDetails}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <AntDesign name="arrowright" size={16} color="#6c5ce7" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.summaryCard}
                onPress={() => openDetailsModal(
                  history.attendance.filter(a => a.status === 'Present'), 
                  'attendance'
                )}
              >
                <Text style={[styles.summaryNumber, styles.present]}>{attendanceStats.present}</Text>
                <Text style={styles.summaryLabel}>Present Days</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.summaryCard}
                onPress={() => openDetailsModal(
                  history.attendance.filter(a => a.status === 'Absent'), 
                  'attendance'
                )}
              >
                <Text style={[styles.summaryNumber, styles.absent]}>{attendanceStats.absent}</Text>
                <Text style={styles.summaryLabel}>Absent Days</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.summaryCard}
                onPress={() => openDetailsModal(history.attendance, 'attendance')}
              >
                <Text style={styles.summaryNumber}>{attendanceStats.total}</Text>
                <Text style={styles.summaryLabel}>Total Days</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Leave Summary */}
        {activeTab === 'leave' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Leave Summary</Text>
            <View style={styles.gridContainer}>
              <TouchableOpacity 
                style={[styles.summaryCard, styles.approvedCard]}
                onPress={() => openDetailsModal(
                  history.leaves.filter(l => l.leave_status === 'Approved'), 
                  'leave'
                )}
              >
                <Text style={[styles.summaryNumber, styles.approved]}>{leaveStats.approved}</Text>
                <Text style={styles.summaryLabel}>Approved</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.summaryCard, styles.pendingCard]}
                onPress={() => openDetailsModal(
                  history.leaves.filter(l => l.leave_status === 'Pending'), 
                  'leave'
                )}
              >
                <Text style={[styles.summaryNumber, styles.pending]}>{leaveStats.pending}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.summaryCard, styles.rejectedCard]}
                onPress={() => openDetailsModal(
                  history.leaves.filter(l => l.leave_status === 'Rejected'), 
                  'leave'
                )}
              >
                <Text style={[styles.summaryNumber, styles.rejected]}>{leaveStats.rejected}</Text>
                <Text style={styles.summaryLabel}>Rejected</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.summaryCard}
                onPress={() => openDetailsModal(history.leaves, 'leave')}
              >
                <Text style={styles.summaryNumber}>{leaveStats.total}</Text>
                <Text style={styles.summaryLabel}>Total Leaves</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Salary Summary */}
        {activeTab === 'salary' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Salary Summary</Text>
            <View style={styles.gridContainer}>
              <TouchableOpacity 
                style={[styles.summaryCard, styles.salaryHighlightCard]}
                onPress={() => openDetailsModal(history.salary, 'salary')}
              >
                <Text style={styles.summaryCurrency}>₹</Text>
                <Text style={styles.summaryBigNumber}>
                  {salaryStats.average > 0 ? salaryStats.average.toLocaleString() : 'N/A'}
                </Text>
                <Text style={styles.summaryLabel}>Avg. Salary</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.summaryCard}
                onPress={() => openDetailsModal(history.salary, 'salary')}
              >
                <Text style={styles.summaryCurrency}>₹</Text>
                <Text style={styles.summaryBigNumber}>
                  {salaryStats.highest > 0 ? salaryStats.highest.toLocaleString() : 'N/A'}
                </Text>
                <Text style={styles.summaryLabel}>Highest Salary</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.summaryCard}
                onPress={() => openDetailsModal(history.salary, 'salary')}
              >
                <Text style={styles.summaryNumber}>{salaryStats.total}</Text>
                <Text style={styles.summaryLabel}>Payments</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {activeTab === 'attendance' ? 'Attendance Details' : 
               activeTab === 'leave' ? 'Leave Details' : 'Salary Details'}
              {' - '}{months[selectedMonth]} {selectedYear}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <AntDesign name="close" size={24} color="#6c757d" />
            </TouchableOpacity>
          </View>

          {activeTab === 'attendance' && (
            <FlatList
              data={selectedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.detailCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{item.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[
                      styles.detailValue,
                      item.status === 'Present' ? styles.present : styles.absent
                    ]}>
                      {item.status}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Check In:</Text>
                    <Text style={styles.detailValue}>{item.check_in || '--:--'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Check Out:</Text>
                    <Text style={styles.detailValue}>{item.check_out || '--:--'}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No records found for selected month</Text>
                </View>
              }
            />
          )}

          {activeTab === 'leave' && (
            <FlatList
              data={selectedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.detailCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{item.leave_type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dates:</Text>
                    <Text style={styles.detailValue}>{item.from_date} to {item.to_date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={[
                      styles.detailValue,
                      item.leave_status === 'Approved' ? styles.approved :
                      item.leave_status === 'Rejected' ? styles.rejected : styles.pending
                    ]}>
                      {item.leave_status}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Applied On:</Text>
                    <Text style={styles.detailValue}>{item.created_at}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No records found for selected month</Text>
                </View>
              }
            />
          )}

          {activeTab === 'salary' && (
            <FlatList
              data={selectedData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.detailCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Month:</Text>
                    <Text style={styles.detailValue}>{item.PR_ST_Month_Year}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Basic:</Text>
                    <Text style={styles.detailValue}>₹{item.PR_ST_Basic}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>HRA:</Text>
                    <Text style={styles.detailValue}>₹{item.PR_ST_HRA}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Gross:</Text>
                    <Text style={[styles.detailValue, styles.grossSalary]}>₹{item.PR_ST_Gross_Salary}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Net Salary:</Text>
                    <Text style={[styles.detailValue, styles.netSalary]}>₹{item.PR_ST_Net_Salary}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No records found for selected month</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 60) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6c757d',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noDataText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#343a40',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  filterContainer: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  monthFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c5ce7',
  },
  monthFilterText: {
    marginLeft: 10,
    color: '#6c5ce7',
    fontWeight: '500',
    fontSize: 16,
  },
  dropdownIcon: {
    marginLeft: 'auto',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  picker: {
    width: '48%',
    height: 50,
  },
  applyButton: {
    backgroundColor: '#6c5ce7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6c5ce7',
  },
  tabText: {
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6c5ce7',
    fontWeight: '600',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6c5ce7',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: cardWidth,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageCard: {
    backgroundColor: '#f0f4ff',
    borderWidth: 2,
    borderColor: '#6c5ce7',
    width: '100%',
  },
  approvedCard: {
    backgroundColor: '#e6f7ee',
    borderWidth: 1,
    borderColor: '#28a745',
  },
  pendingCard: {
    backgroundColor: '#fff8e6',
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  rejectedCard: {
    backgroundColor: '#fce8e8',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  salaryHighlightCard: {
    backgroundColor: '#f0f4ff',
    borderWidth: 2,
    borderColor: '#6c5ce7',
    width: '100%',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#343a40',
    marginBottom: 5,
  },
  present: {
    color: '#28a745',
  },
  absent: {
    color: '#dc3545',
  },
  approved: {
    color: '#28a745',
  },
  pending: {
    color: '#ffc107',
  },
  rejected: {
    color: '#dc3545',
  },
  summaryPercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6c5ce7',
    marginBottom: 5,
  },
  summaryBigNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#343a40',
    marginBottom: 5,
  },
  summaryCurrency: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  viewDetailsText: {
    color: '#6c5ce7',
    marginRight: 5,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  emptyText: {
    color: '#868e96',
    fontStyle: 'italic',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343a40',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#6c757d',
    fontWeight: '500',
  },
  detailValue: {
    color: '#343a40',
    fontWeight: '600',
  },
  grossSalary: {
    color: '#28a745',
  },
  netSalary: {
    color: '#6c5ce7',
    fontWeight: '700',
  },
});

export default AdminEmployeeHistoryScreen;
