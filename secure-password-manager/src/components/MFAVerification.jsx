// src/components/MFAVerification.jsx

import React from 'react';
import {
  Typography,
  TextField,
  Button,
  Alert,
  Grid2,
} from '@mui/material';

function MFAVerification({
  mfaToken,
  setMFAToken,
  handleVerifyMFA,
  errorMessage,
}) {
  return (
    <Grid2
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: '100vh', padding: 2 }}
    >
      <Grid2 xs={12} sm={8} md={6} lg={4}>
        <Typography variant="h6" gutterBottom align="center">
          Enter MFA Token
        </Typography>
        <TextField
          label="MFA Token"
          variant="outlined"
          value={mfaToken}
          onChange={(e) => setMFAToken(e.target.value)}
          fullWidth
          size="small"
          margin="dense"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleVerifyMFA}
          fullWidth
          size="small"
          sx={{ marginTop: 2 }}
        >
          Verify
        </Button>
        {errorMessage && (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </Grid2>
    </Grid2>
  );
}

export default MFAVerification;
