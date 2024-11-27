// src/components/Navbar.jsx

import React from 'react';
import { AppBar, Tabs, Tab } from '@mui/material';
import { AddBox, ListAlt, Settings } from '@mui/icons-material';

function Navbar({ currentTab, handleChange }) {
  return (
    <AppBar position="static">
      <Tabs
        value={currentTab}
        onChange={handleChange}
        centered
        TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
      >
        <Tab
          icon={<AddBox />}
          aria-label="Add"
          sx={{
            minWidth: 'auto',
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
