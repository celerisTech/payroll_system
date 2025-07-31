import React, { useState } from 'react';
import { Text, View } from 'react-native';
import LoginScreen from './LoginScreen';
import AdminDrawer from './AdminDrawer';
import EmployeeDashboard from './EmployeeDashboard';
import PayrollOfficerDashboard from './PayrollOfficerDashboard';
import Toast from 'react-native-toast-message';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignupScreen from './sign_up'; // adjust path
export default function App() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const Stack = createNativeStackNavigator();
  const handleLogin = (userRole, userId) => {
    console.log('✅ Logged in as:', userRole, 'ID:', userId);
    setRole(userRole);
    setUserId(userId);
    Toast.show({
      type: 'success',
      text1: 'Login Successful',
      text2: `Welcome ${userRole}`,
    });
  };

  const handleLogout = () => {
    console.log('🚪 Logged out');
    setRole(null);
    setUserId(null);
    Toast.show({
      type: 'info',
      text1: 'Logged Out',
    });
  };

  return (
    <>
      {!role ? (
        // Not logged in: show login/signup stack
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        // Logged in: show dashboard based on role
        <>
          {role === 'Admin' && <AdminDrawer onLogout={handleLogout} />}
          {role === 'Employee' && (
            <EmployeeDashboard onLogout={handleLogout} userId={userId} />
          )}
          {role === 'PayrollOfficer' && (
            <PayrollOfficerDashboard onLogout={handleLogout} />
          )}
          {role !== 'Admin' && role !== 'Employee' && role !== 'PayrollOfficer' && (
            <View>
              <Text>❌ Unknown Role: {role}</Text>
            </View>
          )}
        </>
      )}
  
      {/* Toast notifications */}
      <Toast />
    </>
  );
};  