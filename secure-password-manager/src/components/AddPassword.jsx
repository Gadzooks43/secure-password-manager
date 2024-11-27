// src/components/AddPassword.jsx

import React from 'react';
import {
  Typography,
  TextField,
  Button,
  IconButton,
  Grid2,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import PasswordGeneratorButton from './PasswordGeneratorButton';

function AddPassword({
  form,
  setForm,
  handleAddPassword,
  handleUpdatePassword,
  isEditing,
  setIsEditing,
  setGeneratedPassword,
  generatedPassword,
  handleGeneratePassword,
}) {
  return (
    <Grid2 container spacing={2} sx={{ padding: 2 }}>
      <Grid2 xs={12}>
        <Typography variant="h5" gutterBottom>
          {isEditing ? 'Edit Password' : 'Add Password'}
        </Typography>
        <form onSubmit={isEditing ? handleUpdatePassword : handleAddPassword}>
          <TextField
            label="Site"
            value={form.site}
            onChange={(e) => setForm({ ...form, site: e.target.value })}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <PasswordGeneratorButton
                  setGeneratedPassword={setGeneratedPassword}
                  setForm={setForm}
                  form={form}
                  handleGeneratePassword={handleGeneratePassword}
                />
              ),
            }}
          />
          <TextField
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            multiline
            rows={3}
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            {isEditing ? 'Update Password' : 'Add Password'}
          </Button>
          {isEditing && (
            <Button
              onClick={() => {
                setIsEditing(false);
                setForm({ site: '', username: '', password: '', notes: '', category: '' });
              }}
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ marginTop: 1 }}
            >
              Cancel
            </Button>
          )}
        </form>
      </Grid2>
    </Grid2>
  );
}

export default AddPassword;
