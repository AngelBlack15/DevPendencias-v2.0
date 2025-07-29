import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const TestAuth: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  const handleLogin = () => {
    login({
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      name: 'Test User'
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Test Authentication</h2>
      <div style={{ marginBottom: '20px' }}>
        <p>Is Authenticated: <strong>{isAuthenticated ? 'Yes' : 'No'}</strong></p>
        {user && (
          <div>
            <p>User: <strong>{user.name}</strong></p>
            <p>Email: <strong>{user.email}</strong></p>
            <p>Role: <strong>{user.role}</strong></p>
          </div>
        )}
      </div>
      <div>
        {!isAuthenticated ? (
          <button 
            onClick={handleLogin}
            style={{
              padding: '10px 15px',
              backgroundColor: '#232122',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Simulate Login
          </button>
        ) : (
          <button 
            onClick={logout}
            style={{
              padding: '10px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default TestAuth;
