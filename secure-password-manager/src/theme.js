// src/theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  spacing: 4, // Adjust the default spacing from 8 to 4
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small',
        margin: 'dense',
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

export default theme;
