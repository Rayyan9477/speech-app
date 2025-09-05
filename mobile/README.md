# AI Language Processor Mobile App

A comprehensive React Native mobile application for AI-powered speech processing, built with Expo and TypeScript.

## 🚀 Features

### ✅ **Implemented Features**

#### **🔐 Authentication**
- **Welcome Screen** - App introduction and onboarding
- **Login/Signup** - Email/password authentication
- **OTP Verification** - Secure email verification with countdown timer
- **Biometric Authentication** - Fingerprint/face ID support (iOS/Android)

#### **🎤 Core Speech Processing**
- **Text-to-Speech (TTS)** - Convert text to natural speech
  - Voice selection (English, Spanish, French, German, etc.)
  - Speed and pitch controls
  - Audio playback with download/share
  - Character counter and validation

- **Voice Changer** - Transform voice characteristics
  - Audio file upload or live recording
  - Multiple voice effects (Deep, High Pitch, Robot, Cartoon, etc.)
  - Real-time processing with progress indicators
  - Result playback and export

- **Voice Translation** - Translate speech across languages
  - Multi-language support (10+ languages with flags)
  - Source/target language selection
  - Audio processing with translation
  - Playback and export features

- **Voice Cloning** - Create custom voice profiles
  - Upload or record voice samples
  - AI processing with progress tracking
  - Voice identity creation and management
  - Custom voice naming and categorization

#### **📚 Voice Library**
- **My Voices** - Custom voice management
- **AI Voices** - Pre-built voice collection
- **Favorites System** - Save preferred voices
- **Voice Cloning** - Create custom voice profiles
- **Search & Filter** - Find voices by category/language

#### **📁 Projects Management**
- **Project Creation** - Multiple project types (TTS, Voice Changer, Translation)
- **Project Organization** - Status tracking (Draft, Processing, Completed)
- **Project Search** - Filter by type and status
- **Project Actions** - Edit, duplicate, share, delete
- **Offline Support** - Local project management

#### **⚙️ Settings & Preferences**
- **Account Management** - Profile, password, security
- **App Appearance** - Light/dark mode, language selection
- **Notifications** - Push and email preferences
- **Billing & Subscriptions** - Payment methods, history
- **Data Management** - Export data, clear cache
- **Help & Support** - FAQ, contact support, terms

#### **🔍 Search & Discovery**
- **Project Search** - Find projects by name, description, or author
- **Voice Search** - Discover voices by language, category, or type
- **Advanced Filtering** - Filter by categories, languages, and more
- **Recent Searches** - Quick access to previous searches

#### **🎵 Audio Experience**
- **Enhanced Audio Player** - Multiple waveform visualizations
- **Playback Controls** - Speed, volume, loop, and seeking
- **Audio Recording** - High-quality recording with visual feedback
- **File Management** - Upload, download, and share audio files

#### **📖 Help & Support**
- **Comprehensive FAQ** - 10+ frequently asked questions
- **Contact Support** - Email and live chat options
- **Video Tutorials** - Step-by-step guides
- **Troubleshooting** - Common issues and solutions

#### **💳 Billing & Subscriptions**
- **Upgrade Plans** - Pro and Enterprise options
- **Payment Processing** - Multiple payment methods
- **Subscription Management** - Billing cycle management
- **Payment History** - Transaction tracking

#### **👥 User Management**
- **Team Overview** - Member management dashboard
- **Invite Teammates** - Send invitations with roles
- **Role Management** - Editor/Viewer permissions
- **Remove Members** - Safe member removal process

#### **🔔 Notifications**
- **Granular Controls** - Category-based notification settings
- **Quiet Hours** - Scheduled notification blocking
- **Device Management** - Per-device notification settings
- **Test Notifications** - Send test alerts

#### **🎵 Audio Features**
- **Audio Recording** - High-quality recording with waveform visualization
- **Audio Playback** - Built-in player with controls
- **File Management** - Upload, download, share audio files
- **Voice Cloning** - Multi-step workflow with recording and processing
- **Voice Library** - Manage custom and AI voices
- **Offline Storage** - Local audio file caching

#### **🔄 Offline Support**
- **Data Caching** - All data cached locally with expiration
- **Offline Queue** - Actions queued for sync when online
- **Network Detection** - Automatic sync when connection restored
- **Storage Management** - Cache cleanup and storage info

## 🛠️ Technical Stack

### **Framework & Runtime**
- **React Native 0.72.6** - Cross-platform mobile development
- **Expo SDK 49** - Managed workflow with native modules
- **TypeScript** - Type-safe development

### **Navigation & State**
- **React Navigation v6** - Stack and tab navigation
- **AsyncStorage** - Local data persistence

### **Audio & Media**
- **Expo AV** - Audio recording and playback
- **Expo File System** - File management
- **Expo Document Picker** - File selection

### **UI & Styling**
- **React Native Paper** - Material Design components
- **Expo Vector Icons** - Cross-platform icons
- **Custom Components** - Reusable UI components

### **Networking & API**
- **Axios** - HTTP client with interceptors
- **Offline Storage** - Custom caching layer
- **Network Detection** - Connectivity monitoring

## 📱 App Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx      # Custom button component
│   │   ├── Card.tsx        # Card component
│   │   ├── AudioPlayer.tsx # Audio playback component
│   │   └── AudioRecorder.tsx # Audio recording component
│   ├── screens/            # App screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── OTPVerificationScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TTSScreen.tsx
│   │   ├── VoiceChangerScreen.tsx
│   │   ├── VoiceTranslateScreen.tsx
│   │   ├── VoiceLibraryScreen.tsx
│   │   ├── ProjectsScreen.tsx
│   │   ├── CreateProjectScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # Business logic & API
│   │   ├── api.ts         # API service layer
│   │   ├── offlineStorage.ts # Offline storage service
│   │   └── networkService.ts # Network management
│   └── lib/
│       └── theme-provider.tsx # Theme configuration
├── App.tsx                # Main app component
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Emulator/Device

### **Installation**

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/emulator:**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## 🔧 Configuration

### **Backend API**
Update the API base URL in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-backend-api.com';
```

### **App Permissions**
The app automatically requests necessary permissions:
- **Microphone** - Audio recording
- **Camera** - Video recording (future feature)
- **Storage** - File access
- **Notifications** - Push notifications

## 🎨 Design System

### **Colors**
- **Primary:** `#5546FF`
- **Secondary:** `#6B7280`
- **Success:** `#22C55E`
- **Error:** `#EF4444`
- **Background:** `#F9FAFB`
- **Surface:** `#FFFFFF`

### **Typography**
- **Primary Font:** System font stack
- **Headings:** 24-28px, 600 weight
- **Body:** 14-16px, 400-500 weight
- **Labels:** 12-14px, 500 weight

### **Spacing**
- **Small:** 8px
- **Medium:** 16px
- **Large:** 20-24px
- **Extra Large:** 32px+

## 🔄 Offline Functionality

The app provides comprehensive offline support:

1. **Data Caching** - Projects, voices, and settings cached locally
2. **Offline Queue** - Actions queued for sync when online
3. **Automatic Sync** - Background sync when connection restored
4. **Cache Expiration** - Automatic cleanup of stale data

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] Authentication flow (login/signup/OTP)
- [ ] TTS functionality with different voices
- [ ] Voice changer with audio upload
- [ ] Voice translation across languages
- [ ] Voice library management
- [ ] Projects creation and management
- [ ] Settings configuration
- [ ] Audio recording and playback
- [ ] Offline functionality
- [ ] Network connectivity handling

### **Device Testing**
- [ ] iOS Simulator/Device
- [ ] Android Emulator/Device
- [ ] Different screen sizes
- [ ] Orientation changes

## 📦 Build & Deployment

### **Development Build**
```bash
expo build:android
expo build:ios
```

### **Production Build**
```bash
expo build:android --type app-bundle
expo build:ios --type archive
```

### **OTA Updates**
```bash
expo publish
```

## 🐛 Troubleshooting

### **Common Issues**

1. **Metro bundler issues:**
   ```bash
   npm start --reset-cache
   ```

2. **Permission issues:**
   - Reset app permissions in device settings
   - Reinstall the app

3. **Audio recording issues:**
   - Check microphone permissions
   - Ensure no other app is using microphone

4. **Network issues:**
   - Check internet connectivity
   - Verify API endpoints

## 📋 API Integration

The app is designed to integrate with your existing backend API. Update the API endpoints in `src/services/api.ts` to match your backend structure.

### **Required API Endpoints**
- `POST /auth/login` - User authentication
- `POST /auth/signup` - User registration
- `POST /auth/verify-otp` - OTP verification
- `GET /projects` - Get user projects
- `POST /projects` - Create project
- `GET /tts/voices` - Get available voices
- `POST /tts/generate` - Generate speech
- `POST /voice-changer/process` - Process voice change
- `GET /voice-translate/languages` - Get supported languages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Documentation:** Check this README
- **Issues:** Create GitHub issues
- **Discussions:** Use GitHub Discussions
- **Email:** support@ailanguageprocessor.com

---

**Built with ❤️ using React Native & Expo**
