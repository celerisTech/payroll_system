import React, { useState } from 'react';
import { Text, View } from 'react-native';
import LoginScreen from './LoginScreen';
import AdminDrawer from './AdminDrawer';
import PayrollOfficerDashboard from './PayrollOfficerDashboard';
import Toast from 'react-native-toast-message';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupScreen from './sign_up'; // adjust path
import EmployeeDashboard from './EmployeeDashboard';
import ForgotPasswordScreen from './forgot_password'; // ✅ Make sure path is correct


export default function App() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

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
    Toast.show({ type: 'info', text1: 'Logged Out' });
  };

  const Stack = createNativeStackNavigator();

  return (
    <>
      {!role ? (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            {/* ✅ Login screen (only define once) */}
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>

            {/* ✅ Signup screen */}
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />


            {/* ✅ ForgotPassword screen */}
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <>
          {role === 'Admin' && <AdminDrawer onLogout={handleLogout} />}
          {role === 'Employee' && (
            <EmployeeDashboard onLogout={handleLogout} userId={userId} />
          )}
          {role === 'PayrollOfficer' && (
            <PayrollOfficerDashboard onLogout={handleLogout} />
          )}
          {!['Admin', 'Employee', 'PayrollOfficer'].includes(role) && (
            <View><Text>❌ Unknown Role: {role}</Text></View>
          )}
        </>
      )}
      <Toast />
    </>
  );
}
