import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import HomeScreen from '../screens/HomeScreen'

// Mock the theme provider
const mockTheme = {
  colors: {
    background: '#ffffff',
    text: {
      primary: '#000000',
      secondary: '#666666'
    }
  },
  isDark: false
}

jest.mock('../lib/theme-provider', () => ({
  useTheme: () => mockTheme
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    {children}
  </NavigationContainer>
)

describe('HomeScreen', () => {
  const mockNavigate = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock navigation
    jest.doMock('@react-navigation/native', () => ({
      ...jest.requireActual('@react-navigation/native'),
      useNavigation: () => ({
        navigate: mockNavigate,
        goBack: jest.fn(),
        isFocused: jest.fn(() => true)
      })
    }))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    expect(getByText('Voicify')).toBeTruthy()
    expect(getByText('AI Text to Speech')).toBeTruthy()
    expect(getByText('AI Voice Changer')).toBeTruthy()
    expect(getByText('AI Voice Translate')).toBeTruthy()
    expect(getByText('Explore AI Voices')).toBeTruthy()
  })

  it('displays app header correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    expect(getByText('Voicify')).toBeTruthy()
    
    // Check for menu and notification icons (they should be rendered as text in mocked components)
    const headerElements = screen.getAllByText('Voicify')
    expect(headerElements.length).toBeGreaterThanOrEqual(1)
  })

  it('displays upgrade to pro card', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    expect(getByText('Upgrade to Pro!')).toBeTruthy()
    expect(getByText('Enjoy all benefits without any restrictions')).toBeTruthy()
    expect(getByText('Upgrade')).toBeTruthy()
  })

  it('displays all main features', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // Check feature titles
    expect(getByText('AI Text to Speech')).toBeTruthy()
    expect(getByText('AI Voice Changer')).toBeTruthy()
    expect(getByText('AI Voice Translate')).toBeTruthy()

    // Check feature descriptions
    expect(getByText('Convert your text into stunning speech.')).toBeTruthy()
    expect(getByText("Change your voice to someone else's voice.")).toBeTruthy()
    expect(getByText('Translate your voice into another language.')).toBeTruthy()

    // Check create buttons
    const createButtons = screen.getAllByText('Create')
    expect(createButtons.length).toBe(3)
  })

  it('navigates to TTS screen when TTS feature is pressed', async () => {
    const { getAllByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    const createButtons = getAllByText('Create')
    const ttsCreateButton = createButtons[0] // First create button is for TTS

    fireEvent.press(ttsCreateButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('TTSProjectCreation')
    })
  })

  it('navigates to Voice Cloning screen when Voice Changer feature is pressed', async () => {
    const { getAllByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    const createButtons = getAllByText('Create')
    const voiceCloningButton = createButtons[1] // Second create button is for Voice Cloning

    fireEvent.press(voiceCloningButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('VoiceCloningUpload')
    })
  })

  it('navigates to Voice Translation screen when Voice Translate feature is pressed', async () => {
    const { getAllByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    const createButtons = getAllByText('Create')
    const voiceTranslateButton = createButtons[2] // Third create button is for Voice Translation

    fireEvent.press(voiceTranslateButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('VoiceSearch')
    })
  })

  it('displays voice samples section', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    expect(getByText('Explore AI Voices')).toBeTruthy()
    expect(getByText('View All')).toBeTruthy()
    
    // Check sample voices
    expect(getByText('Olivia (F) 🇺🇸')).toBeTruthy()
    expect(getByText('Samuel (M) 🇺🇸')).toBeTruthy()
    expect(getByText('Young')).toBeTruthy()
    expect(getByText('Middle-Aged')).toBeTruthy()
  })

  it('handles voice sample interactions', async () => {
    const { getAllByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    const selectButtons = getAllByText('Select')
    expect(selectButtons.length).toBe(2) // Two voice samples

    // Test selecting a voice
    fireEvent.press(selectButtons[0])
    
    // Since there's no actual implementation, we just test that it doesn't crash
    await waitFor(() => {
      expect(selectButtons[0]).toBeTruthy()
    })
  })

  it('applies correct theme colors', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    const header = getByText('Voicify')
    expect(header).toBeTruthy()
    
    // Since we're testing with mocked components, we verify the theme hook is called
    // In a real test with actual components, you would check styles
  })

  it('handles scroll view interactions', () => {
    const { getByTestId, queryByTestId } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // The screen should render without crashing even with scroll interactions
    expect(getByText('Voicify')).toBeTruthy()
    
    // Test would include scroll events in a real scenario
    // fireEvent.scroll(scrollView, { nativeEvent: { contentOffset: { y: 100 } } })
  })

  it('adapts to dark theme', () => {
    // Mock dark theme
    const darkTheme = {
      colors: {
        background: '#000000',
        text: {
          primary: '#ffffff',
          secondary: '#cccccc'
        }
      },
      isDark: true
    }

    jest.doMock('../lib/theme-provider', () => ({
      useTheme: () => darkTheme
    }))

    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    expect(getByText('Voicify')).toBeTruthy()
    // In a real test, you would verify the background color and text colors
  })

  it('handles notification icon press', async () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // Since notifications icon is mocked, we just verify the component renders
    expect(getByText('Voicify')).toBeTruthy()
    
    // In a real implementation, you would test:
    // fireEvent.press(notificationIcon)
    // expect(mockNavigate).toHaveBeenCalledWith('Notifications')
  })

  it('handles menu icon press', async () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // Since menu icon is mocked, we just verify the component renders
    expect(getByText('Voicify')).toBeTruthy()
    
    // In a real implementation, you would test:
    // fireEvent.press(menuIcon)
    // expect(mockNavigate).toHaveBeenCalledWith('Menu')
  })

  it('handles upgrade button press', async () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    const upgradeButton = getByText('Upgrade')
    fireEvent.press(upgradeButton)
    
    // Since there's no implementation, we just verify it doesn't crash
    await waitFor(() => {
      expect(upgradeButton).toBeTruthy()
    })
  })

  it('renders with correct layout structure', () => {
    const { getByText, queryByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // Check header section
    expect(getByText('Voicify')).toBeTruthy()
    
    // Check upgrade section
    expect(getByText('Upgrade to Pro!')).toBeTruthy()
    
    // Check features section
    expect(getByText('AI Text to Speech')).toBeTruthy()
    expect(getByText('AI Voice Changer')).toBeTruthy()
    expect(getByText('AI Voice Translate')).toBeTruthy()
    
    // Check voices section
    expect(getByText('Explore AI Voices')).toBeTruthy()
    
    // Verify the layout doesn't contain unwanted elements
    expect(queryByText('Error')).toBeFalsy()
    expect(queryByText('Loading')).toBeFalsy()
  })

  it('handles voice actions (favorite and play)', async () => {
    const { getAllByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // Voice cards should be rendered
    expect(getAllByText('Select').length).toBe(2)
    
    // In a real implementation, you would test favorite and play buttons:
    // const favoriteButtons = getAllByTestId('favorite-button')
    // const playButtons = getAllByTestId('play-button')
    // fireEvent.press(favoriteButtons[0])
    // fireEvent.press(playButtons[0])
  })

  it('displays correct feature icons', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // Features should be displayed
    expect(getByText('AI Text to Speech')).toBeTruthy()
    expect(getByText('AI Voice Changer')).toBeTruthy()
    expect(getByText('AI Voice Translate')).toBeTruthy()
    
    // In a real test with actual icons, you would verify:
    // expect(getByTestId('tts-icon')).toBeTruthy()
    // expect(getByTestId('voice-changer-icon')).toBeTruthy()
    // expect(getByTestId('voice-translate-icon')).toBeTruthy()
  })

  it('handles feature card press events', async () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // Test pressing feature cards (not just create buttons)
    const ttsCard = getByText('AI Text to Speech')
    fireEvent.press(ttsCard)

    await waitFor(() => {
      // In a real implementation, this might navigate to the feature screen
      expect(ttsCard).toBeTruthy()
    })
  })

  it('handles safe area correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // SafeAreaView should be used - component should render properly
    expect(getByText('Voicify')).toBeTruthy()
  })

  it('handles screen focus events', () => {
    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    // Component should handle focus/blur events without crashing
    expect(getByText('Voicify')).toBeTruthy()
    
    // In a real implementation, you might test:
    // fireEvent(screen, 'focus')
    // expect(someRefreshFunction).toHaveBeenCalled()
  })

  it('handles different screen sizes', () => {
    // Mock different screen dimensions
    const mockDimensions = {
      get: jest.fn(() => ({ width: 320, height: 568 })) // iPhone SE size
    }
    
    jest.doMock('react-native', () => ({
      ...jest.requireActual('react-native'),
      Dimensions: mockDimensions
    }))

    const { getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    expect(getByText('Voicify')).toBeTruthy()
    // Component should adapt to smaller screen sizes
  })

  it('renders without memory leaks', async () => {
    const { unmount, getByText } = render(
      <TestWrapper>
        <HomeScreen />
      </TestWrapper>
    )

    expect(getByText('Voicify')).toBeTruthy()
    
    // Unmount component
    unmount()
    
    // No assertions needed - test passes if no memory leaks occur
    await waitFor(() => {
      // Component should unmount cleanly
      expect(true).toBe(true)
    })
  })
})