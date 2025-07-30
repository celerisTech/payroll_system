// frontend/screens/EmpLoginScreen.js

import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';

export default function EmpLoginScreen({ navigation }) {
  const [userId, setUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (userId && phone) {
      handleVerifyInputs();
    } else {
      setIsVerified(false);
    }
  }, [userId, phone]);

  const handleVerifyInputs = async () => {
    try {
      const res = await fetch('http://192.168.1.47:5000/api/emp/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone }),
      });

      const data = await res.json();
      setIsVerified(data.match);
    } catch (err) {
      console.error('Error verifying user:', err);
      setIsVerified(false);
    }
  };

  const handleSendOtp = () => {
    Alert.alert('OTP Verified');
    navigation.navigate('EmpCreatePasswordScreen', { userId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Login</Text>
      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <Button title="Send OTP" onPress={handleSendOtp} disabled={!isVerified} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
});
