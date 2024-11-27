// src/components/MFAVerification.jsx

import React from 'react';
import { Typography, TextField, Button, Alert, Grid2 } from '@mui/material';

function MFAVerification({ mfaToken, setMFAToken, handleVerifyMFA, errorMessage }) {
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
}

export default MFAVerification;
