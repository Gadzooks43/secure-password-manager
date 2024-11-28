// src/components/Navbar.jsx

import React from 'react';
import { AppBar, Tabs, Tab } from '@mui/material';
import { AddBox, ListAlt, Settings } from '@mui/icons-material';

function Navbar({ currentTab, handleChange }) {
  return (
    <AppBar
      position="static"
      sx={{ height: 48 }} // Reduce AppBar height
    >
      <Tabs
        value={currentTab}
        onChange={handleChange}
        variant="fullWidth" // Make tabs fill the width
        TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
        sx={{ minHeight: 48 }} // Reduce Tabs height
      >
        <Tab
          icon={<AddBox />}
          aria-label="Add"
          sx={{
            minWidth: 'auto',
            minHeight: 48, // Reduce Tab height
            color: 'white',
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        />
        <Tab
          icon={<ListAlt />}
          aria-label="Passwords"
          sx={{
            minWidth: 'auto',
            minHeight: 48,
            color: 'white',
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        />
        <Tab
          icon={<Settings />}
          aria-label="Settings"
          sx={{
            minWidth: 'auto',
            minHeight: 48,
            color: 'white',
            '&.Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </Tabs>
    </AppBar>
  );
}

export default Navbar;
