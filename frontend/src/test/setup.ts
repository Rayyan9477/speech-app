import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock HTMLMediaElement methods
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockImplementation(() => Promise.resolve()),
})

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: vi.fn(),
})

// Mock AudioContext for audio-related tests
global.AudioContext = vi.fn().mockImplementation(() => ({
  createAnalyser: vi.fn(),
  createGain: vi.fn(),
  createScriptProcessor: vi.fn(),
  createMediaStreamSource: vi.fn(),
  close: vi.fn(),
  resume: vi.fn(),
  suspend: vi.fn(),
}))

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  requestData: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  state: 'inactive',
  mimeType: 'audio/webm',
  ondataavailable: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onstart: null,
  onstop: null,
}))

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([
        { stop: vi.fn() }
      ])
    }),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
})

// Mock fetch
global.fetch = vi.fn()

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn().mockReturnValue('mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock File API
global.File = vi.fn().mockImplementation((bits, name, options) => ({
  name,
  size: bits ? bits.join('').length : 0,
  type: options?.type || '',
  lastModified: Date.now(),
  slice: vi.fn(),
  stream: vi.fn(),
  text: vi.fn(),
  arrayBuffer: vi.fn(),
}))

global.FileReader = vi.fn().mockImplementation(() => ({
  readAsArrayBuffer: vi.fn(),
  readAsDataURL: vi.fn(),
  readAsText: vi.fn(),
  abort: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  EMPTY: 0,
  LOADING: 1,
  DONE: 2,
  readyState: 0,
  result: null,
  error: null,
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.speechSynthesis for TTS tests
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    speaking: false,
    pending: false,
    paused: false,
  },
})

// Mock WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: WebSocket.CONNECTING,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}))

// Suppress console warnings in tests
const originalWarn = console.warn
const originalError = console.error

beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return
    }
    originalWarn(...args)
  }
  
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return
    }
    originalError(...args)
  }
})

afterAll(() => {
  console.warn = originalWarn
  console.error = originalError
})