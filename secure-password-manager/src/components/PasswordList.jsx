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
    <Grid2 container spacing={2} sx={{ padding: 2 }}>
      {/* Search and Filter */}
      <Grid2 xs={12}>
        <TextField
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
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
        <Grid2 container spacing={2}>
          {filteredPasswords.map((entry) => (
            <Grid2 xs={12} md={6} lg={4} key={entry.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{entry.site}</Typography>
                  <Typography variant="body2">Username: {entry.username}</Typography>
                  <Typography variant="body2">
                    Password: {showPasswords ? entry.password : '•'.repeat(8)}
                    <IconButton
                      onClick={() => setShowPasswords(!showPasswords)}
                      size="small"
                    >
                      {showPasswords ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Typography>
                  {entry.category && (
                    <Typography variant="body2">Category: {entry.category}</Typography>
                  )}
                  {entry.notes && (
                    <Typography variant="body2">Notes: {entry.notes}</Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton
                    onClick={() => handleCopyPassword(entry.password)}
                    color="primary"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                  <IconButton onClick={() => handleEditPassword(entry)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeletePassword(entry.id)}
                    color="secondary"
                  >
                    <Delete />
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
