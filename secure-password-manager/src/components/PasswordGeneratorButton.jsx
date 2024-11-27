// src/components/PasswordGeneratorButton.jsx

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

function PasswordGeneratorButton({ setForm, form, handleGeneratePassword }) {
  const handleClick = () => {
    const newPassword = handleGeneratePassword();
    setForm({ ...form, password: newPassword });
  };

  return (
    <Tooltip title="Generate Password">
      <IconButton onClick={handleClick} edge="end">
        <RefreshIcon />
      </IconButton>
    </Tooltip>
  );
}

export default PasswordGeneratorButton;
