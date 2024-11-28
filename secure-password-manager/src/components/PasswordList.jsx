// src/components/PasswordList.jsx

import React, { useState } from 'react';
import {
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Typography,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Grid2,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Edit,
  Delete,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

function PasswordList({
  passwords,
  handleCopyPassword,
  handleEditPassword,
  handleDeletePassword,
  categories,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Filtered Passwords based on searchQuery
  const filteredPasswords = passwords.filter((entry) =>
    entry.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.category && entry.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Grid2 container spacing={1} sx={{ padding: 2 }}>
      {/* Search and Filter */}
      <Grid2 xs={12}>
        <TextField
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          size="small"
          margin="dense"
        />
      </Grid2>
      <Grid2 xs={12}>
        <FormControl fullWidth size="small" margin="dense">
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
        <Grid2 container spacing={1}>
          {filteredPasswords.map((entry) => (
            <Grid2 xs={12} key={entry.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" component="div">
                    {entry.site}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Username:</strong> {entry.username}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Password:</strong>{' '}
                    {showPasswords ? entry.password : '•'.repeat(8)}
                    <IconButton
                      onClick={() => setShowPasswords(!showPasswords)}
                      size="small"
                    >
                      {showPasswords ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </Typography>
                  {entry.category && (
                    <Typography variant="body2">
                      <strong>Category:</strong> {entry.category}
                    </Typography>
                  )}
                  {entry.notes && (
                    <Typography variant="body2">
                      <strong>Notes:</strong> {entry.notes}
                    </Typography>
                  )}
                </CardContent>
                <CardActions disableSpacing>
                  <IconButton
                    onClick={() => handleCopyPassword(entry.password)}
                    color="primary"
                    size="small"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleEditPassword(entry)}
                    color="primary"
                    size="small"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeletePassword(entry.id)}
                    color="secondary"
                    size="small"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Grid2>
    </Grid2>
  );
}

export default PasswordList;
