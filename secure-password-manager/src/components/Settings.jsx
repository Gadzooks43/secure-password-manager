import React, { useState } from 'react';
import {
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Grid2,
} from '@mui/material';

function Settings({
  passwordLength,
  setPasswordLength,
  includeUppercase,
  setIncludeUppercase,
  includeLowercase,
  setIncludeLowercase,
  includeNumbers,
  setIncludeNumbers,
  includeSymbols,
  setIncludeSymbols,
  handleSetupMFA,
  isMFAEnabled,
  qrCode,
  isMFASetUp,
  handleConfirmMFA,
}) {
  const [mfaToken, setMFAToken] = useState('');
  const [mfaError, setMFAError] = useState('');

  const handleMFAConfirm = async () => {
    try {
      await handleConfirmMFA(mfaToken);
      setMFAToken('');
      setMFAError('');
    } catch (error) {
      setMFAError('Failed to verify MFA token.');
    }
  };

  return (
    <Grid2 container spacing={1} sx={{ padding: 2 }}>
      <Grid2 xs={12}>
        <Typography variant="h6" gutterBottom align="center">
          Settings
        </Typography>
      </Grid2>

      {/* Password Generator Settings */}
      <Grid2 xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Password Generator Settings
        </Typography>
        <TextField
          label="Password Length"
          type="number"
          inputProps={{ min: 4, max: 64 }}
          value={passwordLength}
          onChange={(e) => setPasswordLength(Number(e.target.value))}
          fullWidth
          size="small"
          margin="dense"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              size="small"
            />
          }
          label="Include Uppercase Letters"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              size="small"
            />
          }
          label="Include Lowercase Letters"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              size="small"
            />
          }
          label="Include Numbers"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              size="small"
            />
          }
          label="Include Symbols"
        />
      </Grid2>

      {/* MFA Settings */}
      <Grid2 xs={12} sx={{ marginTop: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          MFA Settings
        </Typography>
        {!isMFAEnabled && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSetupMFA}
            size="small"
            sx={{ marginTop: 1 }}
            fullWidth
          >
            Enable MFA
          </Button>
        )}
        {isMFAEnabled && !isMFASetUp && qrCode && (
          <Grid2 container spacing={1} sx={{ marginTop: 1 }}>
            <Grid2 xs={12}>
              <Typography variant="body2">
                Scan this QR code with your authenticator app:
              </Typography>
              <img src={qrCode} alt="MFA QR Code" style={{ width: '100%', maxWidth: '200px', marginTop: '10px' }} />
            </Grid2>
            <Grid2 xs={12}>
              <TextField
                label="Enter MFA Token"
                value={mfaToken}
                onChange={(e) => setMFAToken(e.target.value)}
                fullWidth
                size="small"
                margin="dense"
              />
            </Grid2>
            <Grid2 xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMFAConfirm}
                size="small"
                fullWidth
                disabled={!mfaToken}
              >
                Confirm MFA Setup
              </Button>
            </Grid2>
            {mfaError && (
              <Grid2 xs={12}>
                <Typography variant="body2" color="error">
                  {mfaError}
                </Typography>
              </Grid2>
            )}
          </Grid2>
        )}
        {isMFAEnabled && isMFASetUp && (
          <Typography variant="body2" color="success.main" sx={{ marginTop: 1 }}>
            MFA is enabled and verified.
          </Typography>
        )}
      </Grid2>
    </Grid2>
  );
}

export default Settings;
