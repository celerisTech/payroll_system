import React, { useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet
} from 'react-native';
import { MaterialIcons, FontAwesome5, Entypo, Feather } from '@expo/vector-icons';

// Screens
import AdminDashboard from './AdminDashboard';
import AdminAddEmployee from './AdminAddEmployee';
import AdminActiveEmployees from './AdminActiveEmployees';
import AdminInactiveEmployees from './AdminInactiveEmployees';
import AdminAttendanceScreen from './AdminAttendanceScreen';
import MarkAttendanceScreen from './MarkAttendanceScreen';
import LogoutScreen from './LogoutScreen';
import DepartmentsScreen from './DepartmentsScreen';
import DesignationsScreen from './DesignationsScreen';
import AdminGenerateSalaryScreen from './AdminGenerateSalaryScreen';
import AdminDefineSalaryStructureScreen from './AdminDefineSalaryStructureScreen';
import AdminViewSalaryHistoryScreen from './AdminViewSalaryHistoryScreen';
import LeaveDashboard from './LeaveDashboard';
import ManagerApproval from './ManagerApproval';
import AdminEmployeeHistoryScreen from './AdminEmployeeHistoryScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation }) {
  const [openSection, setOpenSection] = useState(null); // ⬅️ Only one section open at a time

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const DrawerSection = ({ title, icon, children }) => (
    <View style={styles.sectionGroup}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(title)}>
        <MaterialIcons name={icon} size={22} color="#254979" />
        <Text style={styles.sectionText}>{title}</Text>
        <MaterialIcons
          name={openSection === title ? 'expand-less' : 'expand-more'}
          size={20}
          color="#254979"
          style={{ marginLeft: 'auto' }}
        />
      </TouchableOpacity>
      {openSection === title && <View style={styles.sectionChildren}>{children}</View>}
    </View>
  );

  const DrawerItem = ({ label, screen, icon, isDashboard = false }) => (
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={() => navigation.navigate(screen)}
    >
      <View style={styles.drawerItemRow}>
        {icon}
        <Text style={isDashboard ? styles.dashboardItemText : styles.drawerItemText}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DrawerItem
        label="Dashboard"
        screen="Dashboard"
        icon={<FontAwesome5 name="tachometer-alt" size={25} color="#254979" marginTop="30" />}
        isDashboard={true}
      />

      <DrawerSection title="Employee Management" icon="people">
        <DrawerItem label="Add Employee" screen="Add Employee" icon={<MaterialIcons name="person-add" size={18} color="#254979" />} />
        <DrawerItem label="Active Employees" screen="Active Employees" icon={<MaterialIcons name="check-circle" size={18} color="#254979" />} />
        <DrawerItem label="Inactive Employees" screen="Inactive Employees" icon={<MaterialIcons name="remove-circle" size={18} color="#254979" />} />
      </DrawerSection>

      <DrawerSection title="Attendance Management" icon="schedule">
        <DrawerItem label="Mark Attendance" screen="Mark Attendance" icon={<Entypo name="calendar" size={18} color="#254979" />} />
        <DrawerItem label="Attendance" screen="Attendance" icon={<Feather name="clock" size={18} color="#254979" />} />
      </DrawerSection>

      <DrawerSection title="Department Setup" icon="business">
        <DrawerItem label="Departments" screen="Departments" icon={<MaterialIcons name="apartment" size={18} color="#254979" />} />
        <DrawerItem label="Designations" screen="Designations" icon={<MaterialIcons name="work" size={18} color="#254979" />} />
      </DrawerSection>

      <DrawerSection title="Leave Management" icon="event-note">
        <DrawerItem label="Leave Apply" screen="Leave apply" icon={<MaterialIcons name="event-available" size={18} color="#254979" />} />
        <DrawerItem label="Leave Approval" screen="Leave Approval" icon={<MaterialIcons name="thumb-up" size={18} color="#254979" />} />
      </DrawerSection>

      <DrawerSection title="Salary Management" icon="attach-money">
        <DrawerItem label="Define Salary Structure" screen="Define Salary Structure" icon={<FontAwesome5 name="file-invoice-dollar" size={16} color="#254979" />} />
        <DrawerItem label="Generate Salary" screen="Generate Salary" icon={<FontAwesome5 name="calculator" size={16} color="#254979" />} />
        <DrawerItem label="View Salary" screen="View Salary" icon={<MaterialIcons name="visibility" size={18} color="#254979" />} />
      </DrawerSection>

      <TouchableOpacity
        style={[styles.drawerItem, { marginTop: 20, borderTopWidth: 1, borderColor: '#ccc' }]}
        onPress={() => navigation.navigate('Logout')}
      >
        <View style={styles.drawerItemRow}>
          <MaterialIcons name="logout" size={20} color="#c0392b" />
          <Text style={[styles.drawerItemText, { color: '#c0392b' }]}>Logout</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function AdminDrawer({ onLogout }) {
  return (
    <NavigationContainer independent={true}>
      <Drawer.Navigator
        initialRouteName="Dashboard"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          headerStyle: { backgroundColor: '#254979' },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
              <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                <MaterialIcons name="menu" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={{ color: '#fff', marginLeft: 8, fontSize: 16, fontWeight: 'bold' }}>
                Menu
              </Text>
            </View>
          ),
        })}
      >
        <Drawer.Screen name="Dashboard" component={AdminDashboard} />
        <Drawer.Screen name="Add Employee" component={AdminAddEmployee} />
        <Drawer.Screen name="Active Employees" component={AdminActiveEmployees} />
        <Drawer.Screen name="Inactive Employees" component={AdminInactiveEmployees} />
        <Drawer.Screen name="Departments" component={DepartmentsScreen} />
        <Drawer.Screen name="Designations" component={DesignationsScreen} />
        <Drawer.Screen name="Leave apply" component={LeaveDashboard} />
        <Drawer.Screen name="Leave Approval" component={ManagerApproval} />
        <Drawer.Screen name="Generate Salary" component={AdminGenerateSalaryScreen} />
        <Drawer.Screen name="Define Salary Structure" component={AdminDefineSalaryStructureScreen} />
        <Drawer.Screen name="View Salary" component={AdminViewSalaryHistoryScreen} />
        <Drawer.Screen name="Attendance" component={AdminAttendanceScreen} />
        <Drawer.Screen name="Mark Attendance" component={MarkAttendanceScreen} />
        <Drawer.Screen name="Logout" component={LogoutScreen} initialParams={{ onLogout }} />
        <Drawer.Screen name="AdminEmployeeHistoryScreen" component={AdminEmployeeHistoryScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sectionGroup: { marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#eef3fb',
    borderBottomWidth: 1,
    borderColor: '#d0dce7',
  },
  sectionText: { marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#254979' },
  sectionChildren: { paddingLeft: 24, backgroundColor: '#f8faff' },
  drawerItem: { paddingVertical: 16, paddingHorizontal: 20 },
  drawerItemText: { fontSize: 18, fontWeight: 'normal', color: '#254979ff' },
  dashboardItemText: { fontSize: 32, fontWeight: 'bold', color: '#254979', marginTop: 30 },
  drawerItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
