import React, { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  LinearProgress,
  Grid2,
} from '@mui/material';
import { Visibility, VisibilityOff, Edit, Delete, ContentCopy as ContentCopyIcon, } from '@mui/icons-material';
// import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2

function App() {
  // Existing state variables
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
  const [searchQuery, setSearchQuery] = useState('');

  // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Password Generator State
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const [showPasswords, setShowPasswords] = useState(false);

  const MFA_ENABLED = true; // Set to false to disable MFA globally

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
        } else {
          alert(response.error);
        }
      } catch (error) {
        console.error('Error deleting password:', error);
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  const generatePassword = () => {
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let characterPool = '';
    if (includeUppercase) characterPool += upperCaseChars;
    if (includeLowercase) characterPool += lowerCaseChars;
    if (includeNumbers) characterPool += numberChars;
    if (includeSymbols) characterPool += symbolChars;

    if (characterPool === '') {
      alert('Please select at least one character type');
      return;
    }

    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      const randomChar = characterPool.charAt(Math.floor(Math.random() * characterPool.length));
      password += randomChar;
    }

    setGeneratedPassword(password);
  };

  // **Define the `categories` variable**
  const categories = [...new Set(passwords.map((entry) => entry.category).filter(Boolean))];

  if (isMasterPasswordSet === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    if (isMFAEnabled && MFA_ENABLED) {
      return (
        <Grid2 container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh' }}>
          <Grid2 xs={10} md={6} lg={4}>
            <Typography variant="h5" gutterBottom>
              Enter MFA Token
            </Typography>
            <TextField
              label="MFA Token"
              variant="outlined"
              value={mfaToken}
              onChange={(e) => setMFAToken(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleVerifyMFA} fullWidth>
              Verify
            </Button>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          </Grid2>
        </Grid2>
      );
    } else {
      const passwordStrength = zxcvbn(masterPassword);

      return (
        <Grid2 container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh' }}>
          <Grid2 xs={10} md={6} lg={4}>
            <Typography variant="h5" gutterBottom>
              {isMasterPasswordSet ? 'Enter Master Password' : 'Set Master Password'}
            </Typography>
            <TextField
              type="password"
              label="Master Password"
              variant="outlined"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            {!isMasterPasswordSet && (
              <div>
                <Typography variant="body2">
                  Password Strength: {passwordStrength.score}/4
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength.score / 4) * 100}
                />
              </div>
            )}
            <Button variant="contained" color="primary" onClick={handleSetMasterPassword} fullWidth>
              {isMasterPasswordSet ? 'Login' : 'Set Master Password'}
            </Button>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          </Grid2>
        </Grid2>
      );
    }
  }

  // **Filtered Passwords based on searchQuery**
  const filteredPasswords = passwords.filter((entry) =>
    entry.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.category && entry.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Authenticated view
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Secure Password Manager
          </Typography>
          <Button color="inherit" onClick={handleSetupMFA}>
            {isMFAEnabled ? 'MFA Enabled' : 'Enable MFA'}
          </Button>
        </Toolbar>
      </AppBar>
      <Grid2 container spacing={2} sx={{ padding: 2 }}>
        {/* Password Generator */}
        <Grid2 xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Password Generator
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 xs={12}>
              <TextField
                label="Length"
                type="number"
                inputProps={{ min: 4, max: 64 }}
                value={passwordLength}
                onChange={(e) => setPasswordLength(Number(e.target.value))}
                fullWidth
              />
            </Grid2>
            <Grid2 xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                  />
                }
                label="Include Uppercase Letters"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                  />
                }
                label="Include Lowercase Letters"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                  />
                }
                label="Include Numbers"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                  />
                }
                label="Include Symbols"
              />
            </Grid2>
            <Grid2 xs={12}>
              <Button variant="contained" onClick={generatePassword} fullWidth>
                Generate Password
              </Button>
            </Grid2>
            {generatedPassword && (
              <Grid2 xs={12}>
                <Typography variant="body1">
                  Generated Password: <strong>{generatedPassword}</strong>
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setForm({ ...form, password: generatedPassword })}
                  sx={{ marginRight: 1 }}
                >
                  Use in Form
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigator.clipboard.writeText(generatedPassword)}
                >
                  Copy to Clipboard
                </Button>
              </Grid2>
            )}
          </Grid2>
        </Grid2>

        {/* Add/Edit Password Form */}
        <Grid2 xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            {isEditing ? 'Edit Password' : 'Add Password'}
          </Typography>
          <form onSubmit={isEditing ? handleUpdatePassword : handleAddPassword}>
            <TextField
              label="Site"
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
              margin="normal"
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {isEditing ? 'Update Password' : 'Add Password'}
            </Button>
            {isEditing && (
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setForm({ site: '', username: '', password: '', notes: '', category: '' });
                }}
                variant="outlined"
                color="secondary"
                fullWidth
                sx={{ marginTop: 1 }}
              >
                Cancel
              </Button>
            )}
          </form>
        </Grid2>

        {/* Search and Filter */}
        <Grid2 xs={12}>
          <TextField
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>

        {/* Password List */}
        <Grid2 xs={12}>
          <Grid2 container spacing={2}>
            {filteredPasswords.map((entry) => (
              <Grid2 xs={12} md={6} lg={4} key={entry.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{entry.site}</Typography>
                    <Typography variant="body2">Username: {entry.username}</Typography>
                    <Typography variant="body2">
                      Password: {showPasswords ? entry.password : '•'.repeat(8)}
                      <IconButton
                        onClick={() => setShowPasswords(!showPasswords)}
                        size="small"
                      >
                        {showPasswords ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Typography>
                    {entry.category && (
                      <Typography variant="body2">Category: {entry.category}</Typography>
                    )}
                    {entry.notes && (
                      <Typography variant="body2">Notes: {entry.notes}</Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton
                      onClick={() => handleCopyPassword(entry.password)}
                      color="primary"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditPassword(entry)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeletePassword(entry.id)}
                      color="secondary"
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid2>
            ))}
          </Grid2>
        </Grid2>
      </Grid2>
      {/* Place the Snackbar here */}
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
