// frontend/screens/EmpCreatePasswordScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';

export default function EmpCreatePasswordScreen({ route, navigation }) {
  const { userId } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('http://192.168.1.47:5000/api/emp/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('Password created successfully');
        navigation.navigate('EmpLoginWithPasswordScreen');
      } else {
        Alert.alert('Failed to set password');
      }
    } catch (err) {
      console.error('Set password error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button title="Set Password" onPress={handleSetPassword} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
});
