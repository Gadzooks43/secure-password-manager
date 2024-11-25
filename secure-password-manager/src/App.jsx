import React, { useState, useEffect } from 'react';

function App() {
  const [masterPassword, setMasterPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwords, setPasswords] = useState([]);
  const [form, setForm] = useState({ site: '', username: '', password: '' });

  const handleSetMasterPassword = async () => {
    try {
      const response = await window.electronAPI.setMasterPassword(masterPassword);
      if (response.status === 'Master password set') {
        setIsAuthenticated(true);
        fetchPasswords();
      } else {
        alert(response.error);
      }
    } catch (error) {
      console.error('Error setting master password:', error);
    }
  };

  const fetchPasswords = async () => {
    try {
      const response = await window.electronAPI.getPasswords();
      if (response.passwords) {
        setPasswords(response.passwords);
      } else {
        alert(response.error);
      }
    } catch (error) {
      console.error('Error fetching passwords:', error);
    }
  };

  const handleAddPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await window.electronAPI.addPassword(form);
      if (response.status === 'Password added') {
        fetchPasswords();
        setForm({ site: '', username: '', password: '' });
      } else {
        alert(response.error);
      }
    } catch (error) {
      console.error('Error adding password:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Enter Master Password</h1>
        <input
          type="password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
        />
        <button onClick={handleSetMasterPassword}>Set Master Password</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Secure Password Manager</h1>
      <form onSubmit={handleAddPassword}>
        <input
          type="text"
          placeholder="Site"
          value={form.site}
          onChange={(e) => setForm({ ...form, site: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit">Add Password</button>
      </form>
      <h2>Stored Passwords</h2>
      <ul>
        {passwords.map((entry) => (
          <li key={entry.id}>
            {entry.site} - {entry.username} - {entry.password}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
