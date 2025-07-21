import React, { useState } from 'react';
import { Text, View } from 'react-native';
import LoginScreen from './LoginScreen';
import AdminDrawer from './AdminDrawer';
import EmployeeDashboard from './EmployeeDashboard';
import PayrollOfficerDashboard from './PayrollOfficerDashboard';

export default function App() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleLogin = (userRole, userId) => {
    console.log('✅ Logged in as:', userRole, 'ID:', userId);
    setRole(userRole);
    setUserId(userId);
  };

  const handleLogout = () => {
    console.log('🚪 Logged out');
    setRole(null);
    setUserId(null);
  };

  if (!role) return <LoginScreen onLogin={handleLogin} />;

  if (role === 'Admin') {
    console.log('📂 Showing AdminDrawer');
    return <AdminDrawer onLogout={handleLogout} />;
  }

  if (role === 'Employee') {
    console.log('📂 Showing EmployeeDashboard');
    return <EmployeeDashboard onLogout={handleLogout} userId={userId} />;
  }

  if (role === 'PayrollOfficer') {
    console.log('📂 Showing PayrollOfficerDashboard');
    return <PayrollOfficerDashboard onLogout={handleLogout} />;
  }

  return (
    <View>
      <Text>❌ Unknown Role: {role}</Text>
    </View>
  );
}
