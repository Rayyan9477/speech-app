import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import { vi } from 'vitest'
import AudioPlayer from '../../components/AudioPlayer'

describe('AudioPlayer', () => {
  const mockAudioUrl = 'http://test.com/audio.wav'

  beforeEach(() => {
    // Mock HTMLAudioElement
    Object.defineProperty(global.HTMLAudioElement.prototype, 'play', {
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    })
    
    Object.defineProperty(global.HTMLAudioElement.prototype, 'pause', {
      writable: true,
      value: vi.fn(),
    })
    
    Object.defineProperty(global.HTMLAudioElement.prototype, 'load', {
      writable: true,
      value: vi.fn(),
    })

    // Mock audio properties
    Object.defineProperty(global.HTMLAudioElement.prototype, 'currentTime', {
      writable: true,
      value: 0,
    })
    
    Object.defineProperty(global.HTMLAudioElement.prototype, 'duration', {
      writable: true,
      value: 10,
    })
    
    Object.defineProperty(global.HTMLAudioElement.prototype, 'volume', {
      writable: true,
      value: 1,
    })
    
    Object.defineProperty(global.HTMLAudioElement.prototype, 'paused', {
      writable: true,
      value: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders audio player with controls', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: /progress/i })).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: /volume/i })).toBeInTheDocument()
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })

    test('displays correct audio source', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const audioElement = screen.getByRole('application') // audio element has this role
      expect(audioElement).toHaveAttribute('src', mockAudioUrl)
    })

    test('shows initial time as 0:00', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })
  })

  describe('Play/Pause Functionality', () => {
    test('toggles play state when play button is clicked', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined)
      const mockPause = vi.fn()
      
      Object.defineProperty(global.HTMLAudioElement.prototype, 'play', {
        writable: true,
        value: mockPlay,
      })
      
      Object.defineProperty(global.HTMLAudioElement.prototype, 'pause', {
        writable: true,
        value: mockPause,
      })

      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const playButton = screen.getByRole('button', { name: /play/i })
      
      // Click to play
      fireEvent.click(playButton)
      
      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalledTimes(1)
      })
      
      // Button should now show pause icon
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
      
      // Click to pause
      const pauseButton = screen.getByRole('button', { name: /pause/i })
      fireEvent.click(pauseButton)
      
      expect(mockPause).toHaveBeenCalledTimes(1)
    })

    test('handles play promise rejection gracefully', async () => {
      const mockPlay = vi.fn().mockRejectedValue(new Error('Play failed'))
      
      Object.defineProperty(global.HTMLAudioElement.prototype, 'play', {
        writable: true,
        value: mockPlay,
      })

      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const playButton = screen.getByRole('button', { name: /play/i })
      
      // Should not throw error
      fireEvent.click(playButton)
      
      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Volume Control', () => {
    test('changes volume when volume slider is moved', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const volumeSlider = screen.getByRole('slider', { name: /volume/i })
      
      // Change volume to 50%
      fireEvent.change(volumeSlider, { target: { value: [0.5] } })
      
      await waitFor(() => {
        expect(volumeSlider).toHaveValue('50')
      })
    })

    test('toggles mute when volume button is clicked', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const volumeButton = screen.getByRole('button', { name: /volume/i })
      
      // Click to mute
      fireEvent.click(volumeButton)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /muted/i })).toBeInTheDocument()
      })
      
      // Click to unmute
      const muteButton = screen.getByRole('button', { name: /muted/i })
      fireEvent.click(muteButton)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /volume/i })).toBeInTheDocument()
      })
    })

    test('restores previous volume when unmuting', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const volumeSlider = screen.getByRole('slider', { name: /volume/i })
      const volumeButton = screen.getByRole('button', { name: /volume/i })
      
      // Set volume to 70%
      fireEvent.change(volumeSlider, { target: { value: [0.7] } })
      
      // Mute
      fireEvent.click(volumeButton)
      
      // Unmute
      const muteButton = screen.getByRole('button', { name: /muted/i })
      fireEvent.click(muteButton)
      
      await waitFor(() => {
        expect(volumeSlider).toHaveValue('70')
      })
    })
  })

  describe('Progress Control', () => {
    test('updates progress when audio time changes', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const audioElement = screen.getByRole('application')
      
      // Mock time update
      Object.defineProperty(audioElement, 'currentTime', { value: 5 })
      Object.defineProperty(audioElement, 'duration', { value: 10 })
      
      fireEvent.timeUpdate(audioElement)
      
      await waitFor(() => {
        const progressSlider = screen.getByRole('slider', { name: /progress/i })
        expect(progressSlider).toHaveValue('50')
      })
    })

    test('seeks to position when progress slider is moved', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const progressSlider = screen.getByRole('slider', { name: /progress/i })
      const audioElement = screen.getByRole('application')
      
      // Mock duration
      Object.defineProperty(audioElement, 'duration', { value: 10 })
      
      // Seek to 30% (3 seconds)
      fireEvent.change(progressSlider, { target: { value: [30] } })
      
      await waitFor(() => {
        expect(audioElement.currentTime).toBe(3)
      })
    })

    test('displays correct time format', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const audioElement = screen.getByRole('application')
      
      // Mock 1 minute 30 seconds
      Object.defineProperty(audioElement, 'currentTime', { value: 90 })
      Object.defineProperty(audioElement, 'duration', { value: 180 })
      
      fireEvent.timeUpdate(audioElement)
      fireEvent.loadedMetadata(audioElement)
      
      await waitFor(() => {
        expect(screen.getByText('1:30')).toBeInTheDocument()
        expect(screen.getByText('3:00')).toBeInTheDocument()
      })
    })
  })

  describe('Audio Events', () => {
    test('updates duration when metadata is loaded', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const audioElement = screen.getByRole('application')
      
      // Mock duration
      Object.defineProperty(audioElement, 'duration', { value: 120 })
      
      fireEvent.loadedMetadata(audioElement)
      
      await waitFor(() => {
        expect(screen.getByText('2:00')).toBeInTheDocument()
      })
    })

    test('handles audio end event', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const audioElement = screen.getByRole('application')
      
      // Simulate audio ending
      Object.defineProperty(audioElement, 'paused', { value: true })
      fireEvent.ended(audioElement)
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
      })
    })

    test('handles audio error gracefully', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const audioElement = screen.getByRole('application')
      
      // Simulate audio error
      fireEvent.error(audioElement)
      
      // Should not crash and controls should remain functional
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      expect(screen.getByRole('button', { name: /play/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('slider', { name: /progress/i })).toHaveAttribute('aria-label')
      expect(screen.getByRole('slider', { name: /volume/i })).toHaveAttribute('aria-label')
    })

    test('keyboard navigation works', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const playButton = screen.getByRole('button', { name: /play/i })
      
      playButton.focus()
      expect(document.activeElement).toBe(playButton)
      
      // Press Enter to play
      fireEvent.keyDown(playButton, { key: 'Enter', code: 'Enter' })
      
      // Should trigger play
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    test('handles invalid audio URL', () => {
      render(<AudioPlayer audioUrl="" />)
      
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
      expect(screen.getByRole('application')).toHaveAttribute('src', '')
    })

    test('handles NaN duration gracefully', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const audioElement = screen.getByRole('application')
      
      // Mock NaN duration
      Object.defineProperty(audioElement, 'duration', { value: NaN })
      
      fireEvent.loadedMetadata(audioElement)
      
      await waitFor(() => {
        // Should show 0:00 instead of NaN
        expect(screen.getByText('0:00')).toBeInTheDocument()
      })
    })

    test('handles very long audio files', async () => {
      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const audioElement = screen.getByRole('application')
      
      // Mock 1 hour duration
      Object.defineProperty(audioElement, 'duration', { value: 3600 })
      Object.defineProperty(audioElement, 'currentTime', { value: 1830 }) // 30:30
      
      fireEvent.loadedMetadata(audioElement)
      fireEvent.timeUpdate(audioElement)
      
      await waitFor(() => {
        expect(screen.getByText('30:30')).toBeInTheDocument()
        expect(screen.getByText('1:00:00')).toBeInTheDocument()
      })
    })

    test('handles rapid play/pause clicks', async () => {
      const mockPlay = vi.fn().mockResolvedValue(undefined)
      const mockPause = vi.fn()
      
      Object.defineProperty(global.HTMLAudioElement.prototype, 'play', {
        writable: true,
        value: mockPlay,
      })
      
      Object.defineProperty(global.HTMLAudioElement.prototype, 'pause', {
        writable: true,
        value: mockPause,
      })

      render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const playButton = screen.getByRole('button', { name: /play/i })
      
      // Rapid clicks
      fireEvent.click(playButton)
      fireEvent.click(playButton)
      fireEvent.click(playButton)
      
      // Should handle gracefully without errors
      await waitFor(() => {
        expect(mockPlay).toHaveBeenCalled()
        expect(mockPause).toHaveBeenCalled()
      })
    })
  })

  describe('Component Lifecycle', () => {
    test('cleans up event listeners on unmount', () => {
      const { unmount } = render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      const audioElement = screen.getByRole('application')
      const removeEventListenerSpy = vi.spyOn(audioElement, 'removeEventListener')
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('loadedmetadata', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('ended', expect.any(Function))
    })

    test('updates audio source when audioUrl prop changes', () => {
      const { rerender } = render(<AudioPlayer audioUrl={mockAudioUrl} />)
      
      let audioElement = screen.getByRole('application')
      expect(audioElement).toHaveAttribute('src', mockAudioUrl)
      
      const newUrl = 'http://test.com/new-audio.wav'
      rerender(<AudioPlayer audioUrl={newUrl} />)
      
      audioElement = screen.getByRole('application')
      expect(audioElement).toHaveAttribute('src', newUrl)
    })
  })
})