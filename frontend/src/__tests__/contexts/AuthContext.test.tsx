import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import { vi } from 'vitest'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { mockFetchSuccess, mockFetchError, createMockUser } from '../../test/utils'

// Test component that uses the auth context
const TestComponent = () => {
  const {
    user,
    token,
    login,
    logout,
    register,
    updateUser,
    changePassword,
    isLoading,
    isAuthenticated,
    isAdmin,
    isModerator,
  } = useAuth()

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'No user'}</div>
      <div data-testid="token">{token || 'No token'}</div>
      <div data-testid="isLoading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <div data-testid="isAdmin">{isAdmin ? 'Admin' : 'Not admin'}</div>
      <div data-testid="isModerator">{isModerator ? 'Moderator' : 'Not moderator'}</div>
      
      <button onClick={() => login('testuser', 'password123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => register({
        username: 'newuser',
        email: 'new@test.com',
        password: 'Password123!',
        first_name: 'New',
        last_name: 'User'
      })}>Register</button>
      <button onClick={() => updateUser({ first_name: 'Updated' })}>Update User</button>
      <button onClick={() => changePassword('oldpass', 'newpass')}>Change Password</button>
    </div>
  )
}

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with no user when localStorage is empty', () => {
      renderWithAuthProvider()
      
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
      expect(screen.getByTestId('token')).toHaveTextContent('No token')
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not authenticated')
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('Not admin')
      expect(screen.getByTestId('isModerator')).toHaveTextContent('Not moderator')
      expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
    })

    it('should initialize with user data from localStorage', () => {
      const mockUser = createMockUser()
      const mockToken = 'mock-jwt-token'
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', mockToken)
      
      renderWithAuthProvider()
      
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username)
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken)
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Authenticated')
    })

    it('should handle corrupted user data in localStorage', () => {
      localStorage.setItem('user', 'invalid-json')
      localStorage.setItem('token', 'token')
      
      renderWithAuthProvider()
      
      expect(screen.getByTestId('user')).toHaveTextContent('No user')
      expect(screen.getByTestId('token')).toHaveTextContent('No token')
      expect(localStorage.getItem('user')).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('Authentication Flow', () => {
    it('should login successfully', async () => {
      const mockUser = createMockUser()
      const mockToken = 'new-jwt-token'
      
      mockFetchSuccess({
        access_token: mockToken,
        user: mockUser
      })
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Login'))
      
      expect(screen.getByTestId('isLoading')).toHaveTextContent('Loading')
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username)
        expect(screen.getByTestId('token')).toHaveTextContent(mockToken)
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Authenticated')
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })

      // Check localStorage
      expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockUser))
      expect(localStorage.getItem('token')).toEqual(mockToken)
    })

    it('should handle login failure', async () => {
      mockFetchError(401, 'Invalid credentials')
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Login'))
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not authenticated')
      })
    })

    it('should logout successfully', async () => {
      // Setup initial authenticated state
      const mockUser = createMockUser()
      const mockToken = 'jwt-token'
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', mockToken)
      
      mockFetchSuccess({ message: 'Logged out successfully' })
      
      renderWithAuthProvider()
      
      // Verify initial authenticated state
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Authenticated')
      
      fireEvent.click(screen.getByText('Logout'))
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No user')
        expect(screen.getByTestId('token')).toHaveTextContent('No token')
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not authenticated')
      })

      // Check localStorage is cleared
      expect(localStorage.getItem('user')).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('should clear local state even if logout request fails', async () => {
      // Setup initial authenticated state
      const mockUser = createMockUser()
      const mockToken = 'jwt-token'
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', mockToken)
      
      mockFetchError(500, 'Server error')
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Logout'))
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('No user')
        expect(screen.getByTestId('token')).toHaveTextContent('No token')
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not authenticated')
      })
    })
  })

  describe('Registration', () => {
    it('should register new user successfully', async () => {
      const mockUser = createMockUser({ username: 'newuser' })
      
      mockFetchSuccess({
        message: 'User registered successfully',
        user: mockUser
      })
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Register'))
      
      expect(screen.getByTestId('isLoading')).toHaveTextContent('Loading')
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/v1/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'newuser',
            email: 'new@test.com',
            password: 'Password123!',
            first_name: 'New',
            last_name: 'User'
          }),
        })
      )
    })

    it('should handle registration failure', async () => {
      mockFetchError(409, 'Username already exists')
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Register'))
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })
      
      // Should not be authenticated after failed registration
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not authenticated')
    })
  })

  describe('User Management', () => {
    it('should update user information', async () => {
      // Setup initial authenticated state
      const mockUser = createMockUser()
      const mockToken = 'jwt-token'
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', mockToken)
      
      const updatedUser = { ...mockUser, first_name: 'Updated' }
      mockFetchSuccess(updatedUser)
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Update User'))
      
      expect(screen.getByTestId('isLoading')).toHaveTextContent('Loading')
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('Updated')
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })

      // Check localStorage is updated
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      expect(storedUser.first_name).toBe('Updated')
    })

    it('should handle user update failure', async () => {
      const mockUser = createMockUser()
      const mockToken = 'jwt-token'
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', mockToken)
      
      mockFetchError(500, 'Update failed')
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Update User'))
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })
      
      // User should remain unchanged
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.first_name)
    })

    it('should change password and logout', async () => {
      const mockUser = createMockUser()
      const mockToken = 'jwt-token'
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', mockToken)
      
      mockFetchSuccess({ message: 'Password changed successfully' })
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Change Password'))
      
      expect(screen.getByTestId('isLoading')).toHaveTextContent('Loading')
      
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not authenticated')
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })

      // Should be logged out after password change
      expect(localStorage.getItem('user')).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('Role-based Authorization', () => {
    it('should correctly identify admin users', () => {
      const adminUser = createMockUser({ role: 'admin' })
      const mockToken = 'jwt-token'
      localStorage.setItem('user', JSON.stringify(adminUser))
      localStorage.setItem('token', mockToken)
      
      renderWithAuthProvider()
      
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('Admin')
      expect(screen.getByTestId('isModerator')).toHaveTextContent('Not moderator')
    })

    it('should correctly identify moderator users', () => {
      const moderatorUser = createMockUser({ role: 'moderator' })
      const mockToken = 'jwt-token'
      localStorage.setItem('user', JSON.stringify(moderatorUser))
      localStorage.setItem('token', mockToken)
      
      renderWithAuthProvider()
      
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('Not admin')
      expect(screen.getByTestId('isModerator')).toHaveTextContent('Moderator')
    })

    it('should correctly identify regular users', () => {
      const regularUser = createMockUser({ role: 'user' })
      const mockToken = 'jwt-token'
      localStorage.setItem('user', JSON.stringify(regularUser))
      localStorage.setItem('token', mockToken)
      
      renderWithAuthProvider()
      
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('Not admin')
      expect(screen.getByTestId('isModerator')).toHaveTextContent('Not moderator')
    })
  })

  describe('API Request Helper', () => {
    it('should include authorization header when token exists', async () => {
      const mockUser = createMockUser()
      const mockToken = 'jwt-token'
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', mockToken)
      
      mockFetchSuccess({ message: 'success' })
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Update User'))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/auth/me',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockToken}`,
            }),
          })
        )
      })
    })

    it('should not include authorization header when no token', async () => {
      mockFetchSuccess({
        access_token: 'new-token',
        user: createMockUser()
      })
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Login'))
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:8000/api/v1/auth/login',
          expect.objectContaining({
            headers: expect.not.objectContaining({
              'Authorization': expect.any(String),
            }),
          })
        )
      })
    })

    it('should handle API errors gracefully', async () => {
      mockFetchError(400, 'Bad Request')
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Login'))
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })
      
      // Should remain unauthenticated
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not authenticated')
    })
  })

  describe('Hook Usage', () => {
    it('should throw error when used outside of AuthProvider', () => {
      // Wrap in error boundary to catch the error
      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>
        } catch (error) {
          return <div>Error: {(error as Error).message}</div>
        }
      }

      const TestComponentWithoutProvider = () => {
        useAuth()
        return <div>Should not render</div>
      }

      expect(() => {
        render(
          <ErrorBoundary>
            <TestComponentWithoutProvider />
          </ErrorBoundary>
        )
      }).toThrow('useAuth must be used within an AuthProvider')
    })
  })

  describe('Edge Cases', () => {
    it('should handle network errors', async () => {
      ;(global.fetch as vi.Mock).mockRejectedValue(new Error('Network error'))
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Login'))
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })
      
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not authenticated')
    })

    it('should handle invalid JSON responses', async () => {
      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Login'))
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })
    })

    it('should handle missing response data', async () => {
      ;(global.fetch as vi.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      })
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Login'))
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })
      
      // Should handle missing access_token gracefully
      expect(screen.getByTestId('token')).toHaveTextContent('No token')
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous login attempts', async () => {
      const mockUser = createMockUser()
      const mockToken = 'jwt-token'
      
      mockFetchSuccess({
        access_token: mockToken,
        user: mockUser
      })
      
      renderWithAuthProvider()
      
      // Simulate multiple rapid clicks
      const loginButton = screen.getByText('Login')
      fireEvent.click(loginButton)
      fireEvent.click(loginButton)
      fireEvent.click(loginButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Authenticated')
      })
      
      // Should only make one successful login
      expect(screen.getByTestId('user')).toHaveTextContent(mockUser.username)
    })

    it('should prevent operations when loading', async () => {
      let resolvePromise: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      
      ;(global.fetch as vi.Mock).mockReturnValue(loginPromise)
      
      renderWithAuthProvider()
      
      fireEvent.click(screen.getByText('Login'))
      expect(screen.getByTestId('isLoading')).toHaveTextContent('Loading')
      
      // Try to perform another operation while loading
      fireEvent.click(screen.getByText('Register'))
      
      // Should still be loading from the first operation
      expect(screen.getByTestId('isLoading')).toHaveTextContent('Loading')
      
      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'token',
          user: createMockUser()
        })
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('Not loading')
      })
    })
  })
})