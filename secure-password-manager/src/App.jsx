// src/App.jsx

import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
} from '@mui/material';
import Navbar from './components/Navbar';
import Login from './components/Login';
import MFAVerification from './components/MFAVerification';
import AddPassword from './components/AddPassword';
import PasswordList from './components/PasswordList';
import Settings from './components/Settings';
import generatePassword from './utils/PasswordGenerator';

function App() {
  // State variables
  const [masterPassword, setMasterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMasterPasswordSet, setIsMasterPasswordSet] = useState(null);
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [mfaToken, setMFAToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwords, setPasswords] = useState([]);
  const [form, setForm] = useState({
    site: '',
    username: '',
    password: '',
    notes: '',
    category: '',
  });
  const [qrCode, setQRCode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editEntryId, setEditEntryId] = useState(null);

  // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Password Generator Settings
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);

  const [currentTab, setCurrentTab] = useState(0); // 0: Add, 1: Passwords, 2: Settings

  const MFA_ENABLED = false; // Set to false to disable MFA globally

  useEffect(() => {
    async function checkMasterPassword() {
      const response = await window.electronAPI.isMasterPasswordSet();
      if (response.isSet) {
        setIsMasterPasswordSet(true);
      } else {
        setIsMasterPasswordSet(false);
      }
    }
    checkMasterPassword();
  }, []);

  const handleCopyPassword = async (password) => {
    try {
      const response = await window.electronAPI.copyToClipboard(password);
      if (response.status === 'success') {
        setSnackbarMessage('Password copied to clipboard. It will be cleared in 15 seconds.');
        setSnackbarOpen(true);
      } else {
        alert('Failed to copy password: ' + response.message);
      }
    } catch (error) {
      console.error('Error copying password:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSetMasterPassword = async () => {
    try {
      const response = await window.electronAPI.setMasterPassword(masterPassword);
      if (
        response.status === 'Master password set' ||
        response.status === 'Master password verified'
      ) {
        setErrorMessage('');
        if (MFA_ENABLED) {
          // Check if MFA is enabled
          const mfaResponse = await window.electronAPI.isMFAEnabled();
          if (mfaResponse.mfaEnabled) {
            setIsMFAEnabled(true);
          } else {
            setIsAuthenticated(true);
            fetchPasswords();
          }
        } else {
          setIsAuthenticated(true);
          fetchPasswords();
        }
      } else {
        setErrorMessage(response.error);
      }
    } catch (error) {
      console.error('Error setting/verifying master password:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleVerifyMFA = async () => {
    try {
      const response = await window.electronAPI.verifyMFA(mfaToken);
      if (response.status === 'MFA verified') {
        setIsAuthenticated(true);
        setErrorMessage('');
        fetchPasswords();
      } else {
        setErrorMessage(response.error);
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleSetupMFA = async () => {
    try {
      const response = await window.electronAPI.setupMFA();
      if (response.status === 'MFA setup') {
        setQRCode(`data:image/png;base64,${response.qr_code}`);
        setIsMFAEnabled(true);
        setSnackbarMessage('MFA has been enabled.');
        setSnackbarOpen(true);
      } else {
        alert(response.error);
      }
    } catch (error) {
      console.error('Error setting up MFA:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const fetchPasswords = async () => {
    try {
      const response = await window.electronAPI.getPasswords();
      if (response.passwords) {
        setPasswords(response.passwords);
      } else if (response.error) {
        alert(response.error);
      }
    } catch (error) {
      console.error('Error fetching passwords:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleAddPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await window.electronAPI.addPassword(form);
      if (response.status === 'Password added') {
        fetchPasswords();
        setForm({ site: '', username: '', password: '', notes: '', category: '' });
        setSnackbarMessage('Password added successfully.');
        setSnackbarOpen(true);
      } else {
        alert(response.error);
      }
    } catch (error) {
      console.error('Error adding password:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleEditPassword = (entry) => {
    setIsEditing(true);
    setEditEntryId(entry.id);
    setForm({
      site: entry.site,
      username: entry.username,
      password: entry.password,
      notes: entry.notes || '',
      category: entry.category || '',
    });
    setCurrentTab(0); // Switch to Add/Edit tab
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await window.electronAPI.updatePassword({
        id: editEntryId,
        ...form,
      });
      if (response.status === 'Password updated') {
        fetchPasswords();
        setForm({ site: '', username: '', password: '', notes: '', category: '' });
        setIsEditing(false);
        setEditEntryId(null);
        setSnackbarMessage('Password updated successfully.');
        setSnackbarOpen(true);
      } else {
        alert(response.error);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleDeletePassword = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await window.electronAPI.deletePassword({ id: entryId });
        if (response.status === 'Password deleted') {
          fetchPasswords();
          setSnackbarMessage('Password deleted successfully.');
          setSnackbarOpen(true);
        } else {
          alert(response.error);
        }
      } catch (error) {
        console.error('Error deleting password:', error);
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  const handleGeneratePassword = () => {
    const options = {
      length: passwordLength,
      uppercase: includeUppercase,
      lowercase: includeLowercase,
      numbers: includeNumbers,
      symbols: includeSymbols,
    };
    const newPassword = generatePassword(options);
    return newPassword;
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Define the `categories` variable
  const categories = [...new Set(passwords.map((entry) => entry.category).filter(Boolean))];

  if (isMasterPasswordSet === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    if (isMFAEnabled && MFA_ENABLED) {
      return (
        <MFAVerification
          mfaToken={mfaToken}
          setMFAToken={setMFAToken}
          handleVerifyMFA={handleVerifyMFA}
          errorMessage={errorMessage}
        />
      );
    } else {
      return (
        <Login
          masterPassword={masterPassword}
          setMasterPassword={setMasterPassword}
          handleSetMasterPassword={handleSetMasterPassword}
          isMasterPasswordSet={isMasterPasswordSet}
          errorMessage={errorMessage}
        />
      );
    }
  }

  return (
    <div>
      <Navbar currentTab={currentTab} handleChange={handleTabChange} />
      {currentTab === 0 && (
        <AddPassword
          form={form}
          setForm={setForm}
          handleAddPassword={handleAddPassword}
          handleUpdatePassword={handleUpdatePassword}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleGeneratePassword={handleGeneratePassword}
        />
      )}
      {currentTab === 1 && (
        <PasswordList
          passwords={passwords}
          handleCopyPassword={handleCopyPassword}
          handleEditPassword={handleEditPassword}
          handleDeletePassword={handleDeletePassword}
          categories={categories}
        />
      )}
      {currentTab === 2 && (
        <Settings
          passwordLength={passwordLength}
          setPasswordLength={setPasswordLength}
          includeUppercase={includeUppercase}
          setIncludeUppercase={setIncludeUppercase}
          includeLowercase={includeLowercase}
          setIncludeLowercase={setIncludeLowercase}
          includeNumbers={includeNumbers}
          setIncludeNumbers={setIncludeNumbers}
          includeSymbols={includeSymbols}
          setIncludeSymbols={setIncludeSymbols}
          handleSetupMFA={handleSetupMFA}
          isMFAEnabled={isMFAEnabled}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
