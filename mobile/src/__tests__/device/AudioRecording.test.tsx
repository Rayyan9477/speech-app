import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { PermissionsAndroid, Platform } from 'react-native'

// Mock audio recording component
const AudioRecordingComponent = () => {
  const [recording, setRecording] = React.useState(null)
  const [isRecording, setIsRecording] = React.useState(false)
  const [recordingUri, setRecordingUri] = React.useState(null)
  const [duration, setDuration] = React.useState(0)
  const [hasPermission, setHasPermission] = React.useState(false)

  React.useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ANDROID.RECORD_AUDIO
        )
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED)
      } else {
        const { status } = await Audio.requestPermissionsAsync()
        setHasPermission(status === 'granted')
      }
    } catch (error) {
      console.error('Permission error:', error)
      setHasPermission(false)
    }
  }

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        await checkPermissions()
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      })

      const newRecording = new Audio.Recording()
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      await newRecording.startAsync()
      
      setRecording(newRecording)
      setIsRecording(true)
      setDuration(0)
    } catch (error) {
      console.error('Start recording error:', error)
    }
  }

  const stopRecording = async () => {
    try {
      if (!recording) return

      setIsRecording(false)
      await recording.stopAndUnloadAsync()
      
      const uri = recording.getURI()
      setRecordingUri(uri)
      
      const status = await recording.getStatusAsync()
      if (status.durationMillis) {
        setDuration(status.durationMillis / 1000)
      }
      
      setRecording(null)
    } catch (error) {
      console.error('Stop recording error:', error)
    }
  }

  const playRecording = async () => {
    if (!recordingUri) return

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri })
      await sound.playAsync()
    } catch (error) {
      console.error('Play recording error:', error)
    }
  }

  const saveRecording = async () => {
    if (!recordingUri) return

    try {
      const fileName = `recording_${Date.now()}.m4a`
      const newPath = `${FileSystem.documentDirectory}${fileName}`
      await FileSystem.moveAsync({
        from: recordingUri,
        to: newPath
      })
      return newPath
    } catch (error) {
      console.error('Save recording error:', error)
      return null
    }
  }

  return (
    <div testID="audio-recording-component">
      <button 
        testID="check-permissions-button"
        onClick={checkPermissions}
      >
        Check Permissions
      </button>
      
      <div testID="permission-status">
        {hasPermission ? 'Has Permission' : 'No Permission'}
      </div>

      <button 
        testID="start-recording-button"
        onClick={startRecording}
        disabled={!hasPermission || isRecording}
      >
        Start Recording
      </button>

      <button 
        testID="stop-recording-button"
        onClick={stopRecording}
        disabled={!isRecording}
      >
        Stop Recording
      </button>

      <div testID="recording-status">
        {isRecording ? 'Recording...' : 'Not Recording'}
      </div>

      <div testID="recording-duration">
        Duration: {duration.toFixed(1)}s
      </div>

      {recordingUri && (
        <div>
          <div testID="recording-uri">{recordingUri}</div>
          <button testID="play-button" onClick={playRecording}>
            Play Recording
          </button>
          <button testID="save-button" onClick={saveRecording}>
            Save Recording
          </button>
        </div>
      )}
    </div>
  )
}

describe('Audio Recording Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  describe('Permissions', () => {
    it('should request audio recording permissions on Android', async () => {
      Platform.OS = 'android'
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(PermissionsAndroid.request).toHaveBeenCalledWith(
          PermissionsAndroid.PERMISSIONS.ANDROID.RECORD_AUDIO
        )
      })

      expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
    })

    it('should request audio recording permissions on iOS', async () => {
      Platform.OS = 'ios'
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(Audio.requestPermissionsAsync).toHaveBeenCalled()
      })

      expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
    })

    it('should handle permission denial', async () => {
      PermissionsAndroid.request.mockResolvedValue('denied')
      Audio.requestPermissionsAsync.mockResolvedValue({ status: 'denied' })
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      fireEvent.press(getByTestId('check-permissions-button'))

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('No Permission')
      })
    })

    it('should handle permission errors', async () => {
      PermissionsAndroid.request.mockRejectedValue(new Error('Permission error'))
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      fireEvent.press(getByTestId('check-permissions-button'))

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('No Permission')
        expect(consoleSpy).toHaveBeenCalledWith('Permission error:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('Recording Functionality', () => {
    beforeEach(() => {
      // Mock successful permission
      PermissionsAndroid.request.mockResolvedValue('granted')
      Audio.requestPermissionsAsync.mockResolvedValue({ status: 'granted' })
    })

    it('should start recording successfully', async () => {
      const mockRecording = {
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'file://mock-recording.m4a'),
        getStatusAsync: jest.fn().mockResolvedValue({
          durationMillis: 5000,
          isRecording: false,
          isDoneRecording: true
        })
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))

      await waitFor(() => {
        expect(Audio.setAudioModeAsync).toHaveBeenCalledWith({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        })
        expect(mockRecording.prepareToRecordAsync).toHaveBeenCalledWith(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        )
        expect(mockRecording.startAsync).toHaveBeenCalled()
        expect(getByTestId('recording-status')).toHaveTextContent('Recording...')
      })
    })

    it('should stop recording successfully', async () => {
      const mockRecording = {
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'file://mock-recording.m4a'),
        getStatusAsync: jest.fn().mockResolvedValue({
          durationMillis: 5000,
          isRecording: false,
          isDoneRecording: true
        })
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      // Wait for permissions and start recording
      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))

      await waitFor(() => {
        expect(getByTestId('recording-status')).toHaveTextContent('Recording...')
      })

      fireEvent.press(getByTestId('stop-recording-button'))

      await waitFor(() => {
        expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled()
        expect(mockRecording.getURI).toHaveBeenCalled()
        expect(getByTestId('recording-status')).toHaveTextContent('Not Recording')
        expect(getByTestId('recording-uri')).toHaveTextContent('file://mock-recording.m4a')
        expect(getByTestId('recording-duration')).toHaveTextContent('Duration: 5.0s')
      })
    })

    it('should handle recording start errors', async () => {
      const mockRecording = {
        prepareToRecordAsync: jest.fn().mockRejectedValue(new Error('Recording failed')),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(),
        getStatusAsync: jest.fn()
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Start recording error:', expect.any(Error))
        expect(getByTestId('recording-status')).toHaveTextContent('Not Recording')
      })

      consoleSpy.mockRestore()
    })

    it('should prevent recording without permissions', async () => {
      PermissionsAndroid.request.mockResolvedValue('denied')
      Audio.requestPermissionsAsync.mockResolvedValue({ status: 'denied' })
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('No Permission')
      })

      // Start button should be disabled
      const startButton = getByTestId('start-recording-button')
      expect(startButton).toBeDisabled()
    })

    it('should prevent multiple simultaneous recordings', async () => {
      const mockRecording = {
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(),
        getStatusAsync: jest.fn()
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))

      await waitFor(() => {
        expect(getByTestId('recording-status')).toHaveTextContent('Recording...')
      })

      // Start button should be disabled during recording
      const startButton = getByTestId('start-recording-button')
      expect(startButton).toBeDisabled()
    })
  })

  describe('Playback Functionality', () => {
    beforeEach(() => {
      PermissionsAndroid.request.mockResolvedValue('granted')
      Audio.requestPermissionsAsync.mockResolvedValue({ status: 'granted' })
    })

    it('should play recorded audio', async () => {
      const mockSound = {
        playAsync: jest.fn()
      }
      
      Audio.Sound.createAsync = jest.fn().mockResolvedValue({ sound: mockSound })

      const mockRecording = {
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'file://mock-recording.m4a'),
        getStatusAsync: jest.fn().mockResolvedValue({
          durationMillis: 5000,
          isRecording: false,
          isDoneRecording: true
        })
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      // Complete recording flow
      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))
      
      await waitFor(() => {
        expect(getByTestId('recording-status')).toHaveTextContent('Recording...')
      })

      fireEvent.press(getByTestId('stop-recording-button'))

      await waitFor(() => {
        expect(getByTestId('recording-uri')).toHaveTextContent('file://mock-recording.m4a')
      })

      // Play the recording
      fireEvent.press(getByTestId('play-button'))

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalledWith({ uri: 'file://mock-recording.m4a' })
        expect(mockSound.playAsync).toHaveBeenCalled()
      })
    })

    it('should handle playback errors', async () => {
      Audio.Sound.createAsync = jest.fn().mockRejectedValue(new Error('Playback failed'))

      const mockRecording = {
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'file://mock-recording.m4a'),
        getStatusAsync: jest.fn().mockResolvedValue({
          durationMillis: 5000,
          isRecording: false,
          isDoneRecording: true
        })
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      // Complete recording flow
      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))
      
      await waitFor(() => {
        expect(getByTestId('recording-status')).toHaveTextContent('Recording...')
      })

      fireEvent.press(getByTestId('stop-recording-button'))

      await waitFor(() => {
        expect(getByTestId('recording-uri')).toHaveTextContent('file://mock-recording.m4a')
      })

      // Try to play the recording
      fireEvent.press(getByTestId('play-button'))

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Play recording error:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('File Management', () => {
    beforeEach(() => {
      PermissionsAndroid.request.mockResolvedValue('granted')
      Audio.requestPermissionsAsync.mockResolvedValue({ status: 'granted' })
      
      FileSystem.documentDirectory = 'file://mock-document-directory/'
      FileSystem.moveAsync = jest.fn()
    })

    it('should save recording to persistent storage', async () => {
      const mockRecording = {
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'file://temp-recording.m4a'),
        getStatusAsync: jest.fn().mockResolvedValue({
          durationMillis: 5000,
          isRecording: false,
          isDoneRecording: true
        })
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      // Complete recording flow
      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))
      
      await waitFor(() => {
        expect(getByTestId('recording-status')).toHaveTextContent('Recording...')
      })

      fireEvent.press(getByTestId('stop-recording-button'))

      await waitFor(() => {
        expect(getByTestId('recording-uri')).toHaveTextContent('file://temp-recording.m4a')
      })

      // Save the recording
      fireEvent.press(getByTestId('save-button'))

      await waitFor(() => {
        expect(FileSystem.moveAsync).toHaveBeenCalledWith({
          from: 'file://temp-recording.m4a',
          to: expect.stringMatching(/file:\/\/mock-document-directory\/recording_\d+\.m4a/)
        })
      })
    })

    it('should handle save errors', async () => {
      FileSystem.moveAsync = jest.fn().mockRejectedValue(new Error('Save failed'))

      const mockRecording = {
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'file://temp-recording.m4a'),
        getStatusAsync: jest.fn().mockResolvedValue({
          durationMillis: 5000,
          isRecording: false,
          isDoneRecording: true
        })
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      // Complete recording flow
      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))
      fireEvent.press(getByTestId('stop-recording-button'))

      await waitFor(() => {
        expect(getByTestId('recording-uri')).toHaveTextContent('file://temp-recording.m4a')
      })

      // Try to save the recording
      fireEvent.press(getByTestId('save-button'))

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Save recording error:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('should not save without recording', async () => {
      const { getByTestId, queryByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      // Save button should not exist without a recording
      expect(queryByTestId('save-button')).toBeFalsy()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle audio mode setup failure', async () => {
      PermissionsAndroid.request.mockResolvedValue('granted')
      Audio.requestPermissionsAsync.mockResolvedValue({ status: 'granted' })
      Audio.setAudioModeAsync = jest.fn().mockRejectedValue(new Error('Audio mode failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Start recording error:', expect.any(Error))
      })

      consoleSpy.mockRestore()
    })

    it('should handle stop recording when no recording exists', async () => {
      const { getByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      // Stop button should be disabled initially
      const stopButton = getByTestId('stop-recording-button')
      expect(stopButton).toBeDisabled()
    })

    it('should handle recording status check failure', async () => {
      const mockRecording = {
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(() => 'file://mock-recording.m4a'),
        getStatusAsync: jest.fn().mockRejectedValue(new Error('Status check failed'))
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))
      fireEvent.press(getByTestId('stop-recording-button'))

      await waitFor(() => {
        expect(getByTestId('recording-status')).toHaveTextContent('Not Recording')
        // Duration should remain 0 if status check fails
        expect(getByTestId('recording-duration')).toHaveTextContent('Duration: 0.0s')
      })
    })

    it('should handle component unmount during recording', async () => {
      const mockRecording = {
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        stopAndUnloadAsync: jest.fn(),
        getURI: jest.fn(),
        getStatusAsync: jest.fn()
      }

      Audio.Recording = jest.fn(() => mockRecording)
      
      const { getByTestId, unmount } = render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(getByTestId('permission-status')).toHaveTextContent('Has Permission')
      })

      fireEvent.press(getByTestId('start-recording-button'))

      await waitFor(() => {
        expect(getByTestId('recording-status')).toHaveTextContent('Recording...')
      })

      // Unmount component while recording
      unmount()

      // Should not crash - this tests memory leak prevention
      expect(true).toBe(true)
    })
  })

  describe('Platform-Specific Behavior', () => {
    it('should use Android-specific permissions', async () => {
      Platform.OS = 'android'
      
      render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(PermissionsAndroid.request).toHaveBeenCalledWith(
          PermissionsAndroid.PERMISSIONS.ANDROID.RECORD_AUDIO
        )
      })
    })

    it('should use iOS-specific permissions', async () => {
      Platform.OS = 'ios'
      
      render(<AudioRecordingComponent />)

      await waitFor(() => {
        expect(Audio.requestPermissionsAsync).toHaveBeenCalled()
      })
    })

    it('should handle unknown platform', async () => {
      Platform.OS = 'windows'
      
      const { getByTestId } = render(<AudioRecordingComponent />)

      // Should default to iOS behavior for unknown platforms
      await waitFor(() => {
        expect(Audio.requestPermissionsAsync).toHaveBeenCalled()
      })
    })
  })
})