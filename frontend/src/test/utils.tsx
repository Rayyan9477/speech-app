import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Mock API client
export const mockApiClient = {
  transcribeAudio: vi.fn(),
  synthesizeSpeech: vi.fn(),
  createVoiceClone: vi.fn(),
  listVoiceClones: vi.fn(),
  deleteVoiceClone: vi.fn(),
  synthesizeWithClonedVoice: vi.fn(),
  getVoiceCloneInfo: vi.fn(),
  findSimilarVoices: vi.fn(),
  extractVoiceEmbedding: vi.fn(),
  getAvailableVoices: vi.fn(),
  detectLanguage: vi.fn(),
  translateText: vi.fn(),
  getTranscriptionSession: vi.fn(),
  getSynthesisSession: vi.fn(),
  testStreaming: vi.fn(),
  connectWebSocket: vi.fn(),
}

// Mock the API client module
vi.mock('../api/client', () => ({
  apiClient: mockApiClient
}))

// Custom render function
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockVoiceClone = (overrides = {}) => ({
  clone_id: 'test-clone-123',
  name: 'Test Voice Clone',
  status: 'completed',
  created_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createMockTranscriptionResponse = (overrides = {}) => ({
  transcription: 'This is a test transcription',
  language: 'en',
  confidence: 0.95,
  duration_seconds: 2.5,
  model: 'whisper-large-v3-turbo',
  session_id: 'test-session-123',
  ...overrides
})

export const createMockSynthesisResponse = (overrides = {}) => ({
  audio_path: '/test/audio/output.wav',
  filename: 'output.wav',
  text: 'Test synthesis text',
  language: 'en',
  voice_style: 'neutral',
  emotion: 'neutral',
  duration_seconds: 2.0,
  sample_rate: 22050,
  model: 'dia-tts',
  encrypted: false,
  session_id: 'test-synthesis-session',
  ...overrides
})

export const createMockVoiceCloneResponse = (overrides = {}) => ({
  clone_id: 'test-clone-123',
  name: 'Test Voice Clone',
  status: 'completed',
  embedding_path: '/test/embeddings/clone.npy',
  embedding_dimensions: 512,
  sample_path: '/test/samples/clone.wav',
  ...overrides
})

// Test file utilities
export const createMockAudioFile = (name = 'test-audio.wav', size = 1024) => {
  const file = new File(['test audio content'], name, {
    type: 'audio/wav',
    lastModified: Date.now(),
  })
  
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  })
  
  return file
}

export const createMockImageFile = (name = 'test-image.png', size = 1024) => {
  return new File(['test image content'], name, {
    type: 'image/png',
    lastModified: Date.now(),
  })
}

// Event utilities
export const createMockChangeEvent = (files: File[]) => ({
  target: {
    files: {
      0: files[0],
      length: files.length,
      item: (index: number) => files[index] || null,
      [Symbol.iterator]: function* () {
        for (const file of files) {
          yield file
        }
      },
    },
  },
})

// Audio utilities
export const createMockAudioElement = () => ({
  currentTime: 0,
  duration: 10,
  paused: true,
  volume: 1,
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})

// WebSocket utilities
export const createMockWebSocket = () => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: WebSocket.OPEN,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
})

// Local storage mock
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Session storage mock
export const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

// Cleanup function
export const resetMocks = () => {
  Object.values(mockApiClient).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockReset()
    }
  })
  
  mockLocalStorage.getItem.mockReset()
  mockLocalStorage.setItem.mockReset()
  mockLocalStorage.removeItem.mockReset()
  mockLocalStorage.clear.mockReset()
  
  mockSessionStorage.getItem.mockReset()
  mockSessionStorage.setItem.mockReset()
  mockSessionStorage.removeItem.mockReset()
  mockSessionStorage.clear.mockReset()
}

// Wait for promises to resolve
export const waitForPromises = () => new Promise(resolve => setTimeout(resolve, 0))

// Test error boundary
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Error occurred</div>
    }

    return this.props.children
  }
}