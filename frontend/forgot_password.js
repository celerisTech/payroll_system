import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { Backend_Url } from './Backend_url';


export default function ForgotPassword({ navigation }) {
  const [step, setStep] = useState(1);
  const [PR_phoneNumber, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [PR_EMP_Password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [userId, setUserId] = useState('');

  // 🔹 Send OTP
  const handleSendOtp = async () => {
    if (!userId.trim() || !PR_phoneNumber || PR_phoneNumber.length < 10) {
      return Toast.show({
        type: 'error',
        text1: 'Missing Info',
        text2: '📱 Enter both User ID and valid 10-digit phone number',
      });
    }

    try {
      await axios.post(`${Backend_Url}/api/forgot/send-otp`, {
        PR_phoneNumber,
        PR_Emp_id: userId
      });

      Toast.show({
        type: 'success',
        text1: 'OTP Sent ✅',
        text2: 'Check your phone (mock)',
      });
      setStep(2);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'User Not Found ❌',
        text2: 'No match for this User ID and Phone number',
      });
    }
  };

  // 🔹 Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      return Toast.show({
        type: 'error',
        text1: 'Missing OTP',
        text2: 'Please enter the OTP sent to your phone',
      });
    }

    try {
      const res = await axios.post(`${Backend_Url}/api/forgot/verify-otp`, { otp });
      if (res.data.message === "OTP verified") {
        Toast.show({
          type: 'success',
          text1: 'Verified',
          text2: 'OTP verified successfully!',
        });
        setStep(3);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Invalid OTP',
          text2: 'The OTP you entered is incorrect',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not verify OTP',
      });
    }
  };

  // 🔹 Set Password
  const handleSetPassword = async () => {
    if (!PR_EMP_Password || !confirm) {
      return Toast.show({
        type: 'error',
        text1: 'Incomplete Fields',
        text2: 'Please fill both password fields',
      });
    }

    if (PR_EMP_Password.length < 6) {
      return Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password should be at least 6 characters',
      });
    }

    if (PR_EMP_Password !== confirm) {
      return Toast.show({
        type: 'error',
        text1: 'Mismatch',
        text2: 'Passwords do not match',
      });
    }

    try {
     await axios.post(`${Backend_Url}/api/forgot/reset-password`, { PR_phoneNumber, PR_EMP_Password });


      Toast.show({
        type: 'success',
        text1: '🎉 Success',
        text2: 'Password set successfully!',
      });

      // Optional navigation or form reset
      setTimeout(() => {
        setPhone('');
        setOtp('');
        setPassword('');
        setConfirm('');
        setUserId('');
        setStep(1);

        if (navigation) {
          navigation.navigate('LoginScreen'); // Uncomment if using navigation
        }
      }, 1000);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'There was a problem setting your password',
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {step === 1 && (
        <>
          <Text style={styles.label}>🆔 Enter Your User ID</Text>
          <TextInput
            placeholder="e.g. EMP123"
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
          />

          <Text style={styles.label}>📱 Enter Your Phone</Text>
          <TextInput
            placeholder="e.g. 9876543210"
            style={styles.input}
            keyboardType="phone-pad"
            value={PR_phoneNumber}
            onChangeText={setPhone}
          />

          <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.label}>🔐 Enter OTP</Text>
          <TextInput
            placeholder="e.g. 123456"
            style={styles.input}
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.label}>🔑 New Password</Text>
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={PR_EMP_Password}
            onChangeText={setPassword}
          />
          <Text style={styles.label}>🔁 Confirm Password</Text>
          <TextInput
            placeholder="Re-enter password"
            style={styles.input}
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
          <TouchableOpacity style={styles.button} onPress={handleSetPassword}>
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 🔔 Add Toast Component */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#3b3b3b',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
