// src/components/Login.jsx

import React from 'react';
import { Typography, TextField, Button, Alert, LinearProgress, Grid2 } from '@mui/material';
import zxcvbn from 'zxcvbn';

function Login({ masterPassword, setMasterPassword, handleSetMasterPassword, isMasterPasswordSet, errorMessage }) {
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

export default Login;
