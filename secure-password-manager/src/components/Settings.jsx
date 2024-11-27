// src/components/Settings.jsx

import React from 'react';
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
}) {
  return (
    <Grid2 container spacing={2} sx={{ padding: 2 }}>
      <Grid2 xs={12}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
      </Grid2>

      {/* Password Generator Settings */}
      <Grid2 xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          Password Generator Settings
        </Typography>
        <TextField
          label="Password Length"
          type="number"
          inputProps={{ min: 4, max: 64 }}
          value={passwordLength}
          onChange={(e) => setPasswordLength(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
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

      {/* MFA Settings */}
      <Grid2 xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          MFA Settings
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSetupMFA}>
          {isMFAEnabled ? 'MFA Enabled' : 'Enable MFA'}
        </Button>
      </Grid2>
    </Grid2>
  );
}

export default Settings;
