import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, Alert
} from 'react-native';
import { Backend_Url } from './Backend_url';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${Backend_Url}/api/users`);
      const users = await response.json();

      const matchedUser = users.find(
        (user) => user.username === username && user.password === password
      );

      if (matchedUser) {
        onLogin(matchedUser.role, matchedUser.id);
        setMessage(`✅ Welcome ${matchedUser.role}`);
        if (Platform.OS !== 'web') Alert.alert('Login Success', `✅ Welcome ${matchedUser.role}`);
      } else {
        setMessage('❌ Invalid credentials');
        if (Platform.OS !== 'web') Alert.alert('Login Failed', '❌ Invalid credentials');
      }
    } catch {
      setMessage('🔥 Error connecting to server');
      if (Platform.OS !== 'web') Alert.alert('Server Error', '🔥 Error connecting to server');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>🔐 Payroll Login</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#254979"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#254979"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {message !== '' && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // white background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginBox: {
    backgroundColor: 'rgba(37,73,121,0.06)', // subtle translucent card using button color with opacity
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 26,
    color: '#254979',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(37,73,121,0.08)', // input box background with opacity
    color: '#254979',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderColor: '#254979', // input border same as button color
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#4e8ff7', // dark blue button
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    color: '#254979',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
});
