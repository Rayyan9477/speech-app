import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const mockStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] ?? null
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockStorage
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: mockStorage
})

// Mock HTMLMediaElement
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn().mockResolvedValue(undefined),
})

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
})

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  writable: true,
  value: vi.fn(),
})

// Mock fetch
global.fetch = vi.fn()

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

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = vi.fn()

// Mock file reader
global.FileReader = class {
  result: string | ArrayBuffer | null = null
  readAsDataURL = vi.fn()
  readAsText = vi.fn()
  readAsArrayBuffer = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  onloadend: ((event: ProgressEvent<FileReader>) => void) | null = null
}

// Mock speech recognition APIs
global.webkitSpeechRecognition = vi.fn().mockImplementation(() => ({
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  start: vi.fn(),
  stop: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))

global.SpeechRecognition = global.webkitSpeechRecognition

// Clean up after each test
afterEach(() => {
  mockStorage.clear()
  vi.clearAllMocks()
})