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
  handleGeneratePassword,
}) {
  return (
    <Grid2 container spacing={1} sx={{ padding: 2 }}>
      <Grid2 xs={12}>
        <Typography variant="h6" gutterBottom>
          {isEditing ? 'Edit Password' : 'Add Password'}
        </Typography>
      </Grid2>

      <form onSubmit={isEditing ? handleUpdatePassword : handleAddPassword} style={{ width: '100%' }}>
        <Grid2 container spacing={1}>
          <Grid2 xs={12}>
            <TextField
              label="Site"
              value={form.site}
              onChange={(e) => setForm({ ...form, site: e.target.value })}
              required
              fullWidth
              size="small"
              margin="dense"
            />
          </Grid2>

          <Grid2 xs={12}>
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              fullWidth
              size="small"
              margin="dense"
            />
          </Grid2>

          <Grid2 xs={12}>
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              fullWidth
              size="small"
              margin="dense"
              InputProps={{
                endAdornment: (
                  <PasswordGeneratorButton
                    setForm={setForm}
                    form={form}
                    handleGeneratePassword={handleGeneratePassword}
                  />
                ),
              }}
            />
          </Grid2>

          <Grid2 xs={12}>
            <TextField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
              size="small"
              margin="dense"
            />
          </Grid2>

          <Grid2 xs={12}>
            <TextField
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
              size="small"
              margin="dense"
            />
          </Grid2>

          <Grid2 xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth size="small">
              {isEditing ? 'Update Password' : 'Add Password'}
            </Button>
          </Grid2>

          {isEditing && (
            <Grid2 xs={12}>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setForm({ site: '', username: '', password: '', notes: '', category: '' });
                }}
                variant="outlined"
                color="secondary"
                fullWidth
                size="small"
                sx={{ marginTop: 1 }}
              >
                Cancel
              </Button>
            </Grid2>
          )}
        </Grid2>
      </form>
    </Grid2>
  );
}

export default AddPassword;
