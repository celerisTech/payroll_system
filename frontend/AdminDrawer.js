import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

// ✅ Screens
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
const Drawer = createDrawerNavigator();

export default function AdminDrawer({ onLogout }) {
  return (
    <NavigationContainer independent={true}>
      <Drawer.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: { backgroundColor: '#254979ff' },
          headerTintColor: '#fff',
          drawerStyle: { backgroundColor: '#f5f5f5' },
          drawerActiveTintColor: '#4B0082',
          drawerInactiveTintColor: '#333',
          drawerLabelStyle: { fontWeight: 'bold' },
        }}
      >
        {/* 📊 Dashboard */}
        <Drawer.Screen name="Dashboard" component={AdminDashboard} />

        {/* 👥 Employee Management */}
        <Drawer.Screen name="Add Employee" component={AdminAddEmployee} />
        <Drawer.Screen name="Active Employees" component={AdminActiveEmployees} />
        <Drawer.Screen name="Inactive Employees" component={AdminInactiveEmployees} />
        <Drawer.Screen name="Departments" component={DepartmentsScreen} />
        <Drawer.Screen name="Designations" component={DesignationsScreen} />
        <Drawer.Screen name="Leave Approval" component={ManagerApproval} />
        <Drawer.Screen name="Leave apply" component={LeaveDashboard} />

        {/* 💰 Salary Management */}
        <Drawer.Screen name="Generate Salary" component={AdminGenerateSalaryScreen} />
        <Drawer.Screen name="Define Salary Structure" component={AdminDefineSalaryStructureScreen} />
        <Drawer.Screen name="View Salary" component={AdminViewSalaryHistoryScreen} />


        {/* 🕒 Attendance Management */}
        <Drawer.Screen name="Attendance" component={AdminAttendanceScreen} />
        <Drawer.Screen name="Mark Attendance" component={MarkAttendanceScreen} />
        
        {/* 🔓 Logout */}
        <Drawer.Screen
          name="Logout"
          component={LogoutScreen}
          initialParams={{ onLogout }}
          options={{ drawerLabel: 'Logout' }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
