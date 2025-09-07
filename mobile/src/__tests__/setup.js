import 'react-native-gesture-handler/jestSetup'
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default)
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    PermissionsAndroid: {
      request: jest.fn().mockResolvedValue('granted'),
      check: jest.fn().mockResolvedValue(true),
      requestMultiple: jest.fn().mockResolvedValue({}),
      PERMISSIONS: {
        ANDROID: {
          RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
          WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
          READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE'
        }
      },
      RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
        NEVER_ASK_AGAIN: 'never_ask_again'
      }
    },
    Alert: {
      alert: jest.fn()
    },
    StatusBar: {
      setBarStyle: jest.fn(),
      setBackgroundColor: jest.fn(),
      setTranslucent: jest.fn()
    }
  }
})

// Mock Expo modules
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setAudioModeAsync: jest.fn(),
    Recording: jest.fn(() => ({
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getStatusAsync: jest.fn().mockResolvedValue({
        isRecording: false,
        isDoneRecording: true,
        durationMillis: 5000
      }),
      getURI: jest.fn(() => 'file://mock-recording.m4a')
    })),
    RecordingOptionsPresets: {
      HIGH_QUALITY: {}
    }
  },
  AVPlaybackStatus: {}
}))

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://mock-document-directory/',
  cacheDirectory: 'file://mock-cache-directory/',
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1024 }),
  readDirectoryAsync: jest.fn().mockResolvedValue([]),
  downloadAsync: jest.fn().mockResolvedValue({ uri: 'file://mock-downloaded-file' }),
  uploadAsync: jest.fn().mockResolvedValue({ status: 200 }),
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64'
  },
  FileSystemSessionType: {
    BACKGROUND: 0,
    FOREGROUND: 1
  }
}))

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    type: 'success',
    name: 'test-audio.wav',
    uri: 'file://mock-audio-file.wav',
    size: 1024000
  })
}))

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  saveToLibraryAsync: jest.fn().mockResolvedValue({}),
  getAssetsAsync: jest.fn().mockResolvedValue({
    assets: [],
    endCursor: '',
    hasNextPage: false,
    totalCount: 0
  }),
  MediaType: {
    audio: 'audio',
    photo: 'photo',
    video: 'video'
  }
}))

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue({}),
  isAvailableAsync: jest.fn().mockResolvedValue(true)
}))

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy'
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error'
  }
}))

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({
    status: 'granted',
    canAskAgain: true,
    granted: true
  }),
  scheduleNotificationAsync: jest.fn(),
  cancelNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getPresentedNotificationsAsync: jest.fn().mockResolvedValue([]),
  dismissNotificationAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn()
}))

jest.mock('expo-constants', () => ({
  default: {
    statusBarHeight: 44,
    deviceName: 'iPhone 13',
    platform: {
      ios: {
        platform: 'ios',
        model: 'iPhone 13'
      }
    },
    manifest: {
      version: '1.0.0'
    }
  }
}))

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn()
  }),
  useRoute: () => ({
    params: {},
    name: 'MockScreen'
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: jest.fn(() => true),
  NavigationContainer: ({ children }) => children,
  CommonActions: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn()
  }
}))

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children
  })
}))

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children
  })
}))

// Mock React Native Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcon')
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicon')
jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon')

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  Provider: ({ children }) => children,
  Portal: ({ children }) => children,
  Modal: ({ children, visible }) => visible ? children : null,
  Snackbar: ({ children }) => children,
  Button: 'Button',
  Text: 'Text',
  Card: 'Card',
  Surface: 'Surface',
  Appbar: {
    Header: 'AppbarHeader',
    BackAction: 'AppbarBackAction',
    Content: 'AppbarContent',
    Action: 'AppbarAction'
  },
  FAB: 'FAB',
  Chip: 'Chip',
  Avatar: 'Avatar',
  List: {
    Item: 'ListItem',
    Icon: 'ListIcon',
    Section: 'ListSection'
  },
  RadioButton: {
    Group: 'RadioButtonGroup',
    Item: 'RadioButtonItem'
  },
  Checkbox: 'Checkbox',
  Switch: 'Switch',
  ProgressBar: 'ProgressBar',
  ActivityIndicator: 'ActivityIndicator'
}))

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  const mockSound = {
    play: jest.fn((callback) => callback && callback(true)),
    pause: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
    setVolume: jest.fn(),
    getDuration: jest.fn(() => 10),
    getCurrentTime: jest.fn((callback) => callback(5)),
    setCurrentTime: jest.fn()
  }

  return jest.fn(() => mockSound)
})

// Mock react-native-audio-record
jest.mock('react-native-audio-record', () => ({
  init: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  on: jest.fn(),
  destroy: jest.fn()
}))

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: 'mock-document-directory',
  CachesDirectoryPath: 'mock-caches-directory',
  writeFile: jest.fn(),
  readFile: jest.fn(),
  unlink: jest.fn(),
  exists: jest.fn().mockResolvedValue(true),
  stat: jest.fn().mockResolvedValue({ size: 1024 }),
  readDir: jest.fn().mockResolvedValue([]),
  mkdir: jest.fn(),
  copyFile: jest.fn(),
  moveFile: jest.fn(),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve({ statusCode: 200 })
  })),
  uploadFiles: jest.fn(() => ({
    promise: Promise.resolve({ statusCode: 200 })
  }))
}))

// Mock react-native-share
jest.mock('react-native-share', () => ({
  open: jest.fn().mockResolvedValue({}),
  isAvailableAsync: jest.fn().mockResolvedValue(true)
}))

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    }
  })),
  get: jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({ data: {} }),
  isAxiosError: jest.fn(() => false)
}))

// Mock NetInfo
jest.mock('@react-native-netinfo/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    type: 'wifi',
    isInternetReachable: true
  }),
  addEventListener: jest.fn(() => () => {}),
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    type: 'wifi',
    isInternetReachable: true
  }))
}))

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn().mockResolvedValue(true),
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}))

// Global test utilities
global.fetch = jest.fn()

// Mock timers
jest.useFakeTimers()

// Console warning suppression for known issues
const originalWarn = console.warn
console.warn = (...args) => {
  if (
    args[0] &&
    args[0].includes &&
    (args[0].includes('ReactNativeFiberHostComponent') ||
     args[0].includes('Warning: React.createElement') ||
     args[0].includes('Warning: Failed prop type'))
  ) {
    return
  }
  originalWarn(...args)
}

// Silence console.error for tests
const originalError = console.error
console.error = (...args) => {
  if (
    args[0] &&
    args[0].includes &&
    args[0].includes('Warning: ')
  ) {
    return
  }
  originalError(...args)
}