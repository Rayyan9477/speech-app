import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../test/utils'
import { vi } from 'vitest'
import VoiceCloneCreator from '../../components/VoiceCloning/VoiceCloneCreator'
import { mockApiClient, createMockAudioFile, createMockVoiceCloneResponse } from '../../test/utils'

describe('VoiceCloneCreator', () => {
  const mockOnCloneCreated = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders voice clone creator form', () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      expect(screen.getByLabelText(/voice clone name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/upload audio sample/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create voice clone/i })).toBeInTheDocument()
    })

    test('initially shows create button as disabled', () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      expect(createButton).toBeDisabled()
    })

    test('shows required field indicators', () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      expect(screen.getByText(/\*/)).toBeInTheDocument() // Required indicator
    })
  })

  describe('Form Validation', () => {
    test('enables create button when name and file are provided', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Initially disabled
      expect(createButton).toBeDisabled()
      
      // Add name
      fireEvent.change(nameInput, { target: { value: 'Test Voice' } })
      expect(createButton).toBeDisabled()
      
      // Add file
      const audioFile = createMockAudioFile('test.wav', 1024)
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      
      await waitFor(() => {
        expect(createButton).toBeEnabled()
      })
    })

    test('validates file type on selection', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      
      // Try to upload invalid file type
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('valid audio file')
        )
      })
    })

    test('validates file size on selection', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      
      // Create oversized file (over 50MB)
      const oversizedFile = createMockAudioFile('large.wav', 51 * 1024 * 1024)
      fireEvent.change(fileInput, { target: { files: [oversizedFile] } })
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('too large')
        )
      })
    })

    test('accepts valid audio file types', async () => {
      const validTypes = [
        { name: 'test.wav', type: 'audio/wav' },
        { name: 'test.mp3', type: 'audio/mp3' },
        { name: 'test.ogg', type: 'audio/ogg' },
        { name: 'test.m4a', type: 'audio/m4a' },
        { name: 'test.flac', type: 'audio/flac' }
      ]

      for (const fileType of validTypes) {
        render(
          <VoiceCloneCreator 
            onCloneCreated={mockOnCloneCreated} 
            onError={mockOnError} 
          />
        )
        
        const fileInput = screen.getByLabelText(/upload audio sample/i)
        const validFile = new File(['content'], fileType.name, { type: fileType.type })
        
        fireEvent.change(fileInput, { target: { files: [validFile] } })
        
        // Should not call onError for valid file types
        expect(mockOnError).not.toHaveBeenCalled()
        
        // Cleanup for next iteration
        vi.clearAllMocks()
      }
    })

    test('validates name length', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const longName = 'A'.repeat(101) // Over 100 character limit
      
      fireEvent.change(nameInput, { target: { value: longName } })
      
      await waitFor(() => {
        expect(screen.getByText(/name is too long/i)).toBeInTheDocument()
      })
    })

    test('requires non-empty name', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      
      // Add file but empty name
      const audioFile = createMockAudioFile('test.wav')
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      fireEvent.change(nameInput, { target: { value: '' } })
      
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      expect(createButton).toBeDisabled()
    })
  })

  describe('Voice Clone Creation', () => {
    test('creates voice clone successfully', async () => {
      const mockResponse = createMockVoiceCloneResponse({
        name: 'My Test Voice'
      })
      
      mockApiClient.createVoiceClone.mockResolvedValue(mockResponse)

      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Fill form
      fireEvent.change(nameInput, { target: { value: 'My Test Voice' } })
      const audioFile = createMockAudioFile('voice.wav')
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      
      // Submit form
      fireEvent.click(createButton)
      
      // Should show uploading state
      expect(screen.getByText(/creating voice clone/i)).toBeInTheDocument()
      expect(createButton).toBeDisabled()
      
      await waitFor(() => {
        expect(mockApiClient.createVoiceClone).toHaveBeenCalledWith(
          'My Test Voice',
          audioFile,
          undefined // user_id
        )
        expect(mockOnCloneCreated).toHaveBeenCalledWith(mockResponse)
      })
    })

    test('creates voice clone with user ID', async () => {
      const mockResponse = createMockVoiceCloneResponse()
      mockApiClient.createVoiceClone.mockResolvedValue(mockResponse)

      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
          userId="user123"
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Fill form
      fireEvent.change(nameInput, { target: { value: 'Test Voice' } })
      const audioFile = createMockAudioFile('voice.wav')
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      
      // Submit form
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockApiClient.createVoiceClone).toHaveBeenCalledWith(
          'Test Voice',
          audioFile,
          'user123'
        )
      })
    })

    test('handles creation error', async () => {
      const errorMessage = 'Failed to create voice clone'
      mockApiClient.createVoiceClone.mockRejectedValue(new Error(errorMessage))

      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Fill form
      fireEvent.change(nameInput, { target: { value: 'Test Voice' } })
      const audioFile = createMockAudioFile('voice.wav')
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      
      // Submit form
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('create voice clone')
        )
      })
      
      // Should reset uploading state
      expect(screen.queryByText(/creating voice clone/i)).not.toBeInTheDocument()
      expect(createButton).toBeEnabled()
    })

    test('handles network error', async () => {
      mockApiClient.createVoiceClone.mockRejectedValue(new Error('Network error'))

      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Fill form and submit
      fireEvent.change(nameInput, { target: { value: 'Test Voice' } })
      const audioFile = createMockAudioFile('voice.wav')
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('Failed to create voice clone')
        )
      })
    })
  })

  describe('Form Reset', () => {
    test('resets form after successful creation', async () => {
      const mockResponse = createMockVoiceCloneResponse()
      mockApiClient.createVoiceClone.mockResolvedValue(mockResponse)

      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Fill form
      fireEvent.change(nameInput, { target: { value: 'Test Voice' } })
      const audioFile = createMockAudioFile('voice.wav')
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      
      // Submit form
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockOnCloneCreated).toHaveBeenCalled()
      })
      
      // Form should be reset
      expect(nameInput).toHaveValue('')
      expect(fileInput).toHaveValue('')
      expect(createButton).toBeDisabled()
    })

    test('does not reset form after failed creation', async () => {
      mockApiClient.createVoiceClone.mockRejectedValue(new Error('Creation failed'))

      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Fill form
      fireEvent.change(nameInput, { target: { value: 'Test Voice' } })
      const audioFile = createMockAudioFile('voice.wav')
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      
      // Submit form
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled()
      })
      
      // Form should not be reset
      expect(nameInput).toHaveValue('Test Voice')
      expect(createButton).toBeEnabled()
    })
  })

  describe('UI Feedback', () => {
    test('shows progress indicator during upload', async () => {
      // Mock slow API response
      mockApiClient.createVoiceClone.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Fill form
      fireEvent.change(nameInput, { target: { value: 'Test Voice' } })
      const audioFile = createMockAudioFile('voice.wav')
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      
      // Submit form
      fireEvent.click(createButton)
      
      // Should show progress
      expect(screen.getByText(/creating voice clone/i)).toBeInTheDocument()
      expect(createButton).toBeDisabled()
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText(/creating voice clone/i)).not.toBeInTheDocument()
      })
    })

    test('shows file information after selection', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const audioFile = createMockAudioFile('my-voice.wav', 2048)
      
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      
      await waitFor(() => {
        expect(screen.getByText(/my-voice\.wav/)).toBeInTheDocument()
        expect(screen.getByText(/2\.0 KB/)).toBeInTheDocument()
      })
    })

    test('shows drag and drop area', () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument()
      expect(screen.getByText(/browse files/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('has proper form labels and ARIA attributes', () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      
      expect(nameInput).toHaveAttribute('aria-required', 'true')
      expect(fileInput).toHaveAttribute('aria-required', 'true')
      expect(fileInput).toHaveAttribute('accept', '.wav,.mp3,.ogg,.m4a,.flac')
    })

    test('announces validation errors to screen readers', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })
      
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert')
        expect(errorMessage).toBeInTheDocument()
      })
    })

    test('supports keyboard navigation', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Tab navigation
      nameInput.focus()
      expect(document.activeElement).toBe(nameInput)
      
      fireEvent.keyDown(nameInput, { key: 'Tab' })
      expect(document.activeElement).toBe(fileInput)
      
      fireEvent.keyDown(fileInput, { key: 'Tab' })
      expect(document.activeElement).toBe(createButton)
    })
  })

  describe('Edge Cases', () => {
    test('handles multiple file selection (takes first)', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const file1 = createMockAudioFile('voice1.wav')
      const file2 = createMockAudioFile('voice2.wav')
      
      fireEvent.change(fileInput, { target: { files: [file1, file2] } })
      
      await waitFor(() => {
        expect(screen.getByText(/voice1\.wav/)).toBeInTheDocument()
        expect(screen.queryByText(/voice2\.wav/)).not.toBeInTheDocument()
      })
    })

    test('handles empty file selection', async () => {
      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      
      fireEvent.change(fileInput, { target: { files: [] } })
      
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      expect(createButton).toBeDisabled()
    })

    test('trims whitespace from voice name', async () => {
      const mockResponse = createMockVoiceCloneResponse()
      mockApiClient.createVoiceClone.mockResolvedValue(mockResponse)

      render(
        <VoiceCloneCreator 
          onCloneCreated={mockOnCloneCreated} 
          onError={mockOnError} 
        />
      )
      
      const nameInput = screen.getByLabelText(/voice clone name/i)
      const fileInput = screen.getByLabelText(/upload audio sample/i)
      const createButton = screen.getByRole('button', { name: /create voice clone/i })
      
      // Fill form with whitespace
      fireEvent.change(nameInput, { target: { value: '  Trimmed Voice  ' } })
      const audioFile = createMockAudioFile('voice.wav')
      fireEvent.change(fileInput, { target: { files: [audioFile] } })
      
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(mockApiClient.createVoiceClone).toHaveBeenCalledWith(
          'Trimmed Voice', // Should be trimmed
          audioFile,
          undefined
        )
      })
    })
  })
})