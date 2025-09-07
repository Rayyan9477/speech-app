import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { VoiceProcessingProvider } from '@/contexts/VoiceProcessingContext'
import { TTSProjectProvider } from '@/contexts/TTSProjectContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ThemeProvider } from '@/lib/theme-provider'

// Mock implementations for providers
const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const mockAuthValue = {
    user: null,
    token: null,
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn(),
    register: jest.fn().mockResolvedValue(undefined),
    updateUser: jest.fn().mockResolvedValue(undefined),
    changePassword: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    isModerator: false,
  }

  return (
    <AuthProvider value={mockAuthValue}>
      {children}
    </AuthProvider>
  )
}

const MockVoiceProcessingProvider = ({ children }: { children: ReactNode }) => {
  const mockValue = {
    currentStep: 'upload',
    audioFile: null,
    selectedVoice: null,
    processedAudio: null,
    isProcessing: false,
    error: null,
    progress: 0,
    setAudioFile: jest.fn(),
    setSelectedVoice: jest.fn(),
    startProcessing: jest.fn().mockResolvedValue(undefined),
    resetProcessing: jest.fn(),
    nextStep: jest.fn(),
    previousStep: jest.fn(),
  }

  return (
    <VoiceProcessingProvider value={mockValue}>
      {children}
    </VoiceProcessingProvider>
  )
}

const MockTTSProjectProvider = ({ children }: { children: ReactNode }) => {
  const mockValue = {
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    createProject: jest.fn().mockResolvedValue(undefined),
    updateProject: jest.fn().mockResolvedValue(undefined),
    deleteProject: jest.fn().mockResolvedValue(undefined),
    loadProjects: jest.fn().mockResolvedValue(undefined),
    setCurrentProject: jest.fn(),
    generateSpeech: jest.fn().mockResolvedValue(undefined),
  }

  return (
    <TTSProjectProvider value={mockValue}>
      {children}
    </TTSProjectProvider>
  )
}

const MockSettingsProvider = ({ children }: { children: ReactNode }) => {
  const mockValue = {
    theme: 'light' as const,
    language: 'en',
    notifications: true,
    autoSave: true,
    quality: 'high' as const,
    updateSettings: jest.fn(),
    resetSettings: jest.fn(),
  }

  return (
    <SettingsProvider value={mockValue}>
      {children}
    </SettingsProvider>
  )
}

// Full providers wrapper
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <MockSettingsProvider>
          <MockAuthProvider>
            <MockTTSProjectProvider>
              <MockVoiceProcessingProvider>
                {children}
              </MockVoiceProcessingProvider>
            </MockTTSProjectProvider>
          </MockAuthProvider>
        </MockSettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test utilities
export const createMockFile = (name: string, content: string, type: string): File => {
  const file = new File([content], name, { type })
  return file
}

export const createMockAudioFile = (name = 'test.wav'): File => {
  return createMockFile(name, 'mock-audio-content', 'audio/wav')
}

export const createMockUser = (overrides = {}) => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  status: 'active',
  first_name: 'Test',
  last_name: 'User',
  profile_picture: null,
  last_login: new Date().toISOString(),
  created_at: new Date().toISOString(),
  settings: {},
  ...overrides,
})

export const createMockProject = (overrides = {}) => ({
  id: '1',
  name: 'Test Project',
  text: 'Hello world',
  voice_id: 'voice-1',
  settings: {
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
  },
  status: 'draft',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  audio_url: null,
  ...overrides,
})

export const createMockVoice = (overrides = {}) => ({
  id: 'voice-1',
  name: 'Test Voice',
  gender: 'female',
  language: 'en-US',
  accent: 'american',
  category: 'neural',
  sample_url: 'http://example.com/sample.wav',
  ...overrides,
})

// Mock API responses
export const mockFetchSuccess = (data: any) => {
  ;(global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

export const mockFetchError = (status = 500, message = 'Internal Server Error') => {
  ;(global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ detail: message }),
    text: () => Promise.resolve(JSON.stringify({ detail: message })),
  })
}

// Async utilities
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

// Custom matchers for testing
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R
    }
  }
}