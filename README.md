# AI Language Processor

A comprehensive cross-platform voice processing application built with Next.js, React Native, and Expo. Features AI-powered text-to-speech, voice cloning, translation, and voice modification capabilities.

## 🚀 Features

- **Cross-Platform Compatibility**: Works seamlessly on Web, Android, and iOS
- **AI-Powered Voice Processing**: Advanced TTS, voice cloning, and translation
- **Material UI Design**: Modern, responsive UI with Material Design principles
- **Real-time Animations**: Smooth animations powered by Framer Motion and Anime.js
- **Responsive Layouts**: Optimized for all device sizes and orientations

## 🛠️ Tech Stack

### Web Platform (Next.js)
- **Framework**: Next.js 14 with App Router
- **UI Library**: Material UI (@mui/material)
- **Animations**: Framer Motion + Anime.js
- **Styling**: Material UI Theme System
- **Language**: TypeScript

### Mobile Platform (React Native + Expo)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **UI Library**: Material UI (adapted for React Native)
- **Animations**: Framer Motion + Anime.js
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Vector Store for embeddings
- **AI/ML**: Integration with various AI services

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (for mobile development)
- Python 3.8+ (for backend)

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/speech-app.git
cd speech-app
```

### 2. Web Development (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Mobile Development (React Native + Expo)
```bash
cd mobile
npm install
npm run start
```

For Android:
```bash
npm run android
```

For iOS:
```bash
npm run ios
```

### 4. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## 🏗️ Project Structure

```
speech-app/
├── frontend/                 # Next.js web application
│   ├── app/                  # Next.js app router pages
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/             # Utilities and configurations
│   │   └── pages/           # Legacy pages (being migrated)
│   └── package.json
├── mobile/                   # React Native + Expo mobile app
│   ├── src/
│   │   ├── screens/         # Mobile screens
│   │   ├── components/      # Mobile components
│   │   └── lib/            # Mobile utilities
│   └── App.tsx
├── backend/                  # FastAPI backend
│   ├── app/
│   ├── main.py
│   └── requirements.txt
└── docker-compose.yml        # Multi-service orchestration
```

## 🎨 Design System

### Material UI Theme
The application uses a custom Material UI theme with:
- Primary color: `#5546FF` (Voicify Purple)
- Secondary color: `#7C3AED` (Purple)
- Typography: Urbanist + Poppins fonts
- Border radius: 12px for components
- Custom shadows and transitions

### Animation System
- **Framer Motion**: Declarative animations for React components
- **Anime.js**: Complex, performant animations
- Pre-built animation variants for consistent motion design

## 📱 Cross-Platform Compatibility

### Shared Components
Components are designed to work across platforms:
- Conditional rendering based on platform
- Platform-specific styling and behavior
- Shared business logic with platform-specific adaptations

### Navigation
- **Web**: Next.js App Router with programmatic navigation
- **Mobile**: React Navigation with native stack and tab navigation
- Unified navigation patterns across platforms

### Responsive Design
- Mobile-first approach with responsive breakpoints
- Adaptive layouts for different screen sizes
- Touch-friendly interactions on mobile

## 🔧 Development Commands

### Web Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Mobile Development
```bash
cd mobile
npm run start        # Start Expo development server
npm run android      # Run on Android device/emulator
npm run ios          # Run on iOS device/simulator
npm run web          # Run on web (for testing)
```

### Backend Development
```bash
cd backend
python main.py       # Start FastAPI server
```

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Individual Services
- **Web**: Deploy to Vercel, Netlify, or any static hosting
- **Mobile**: Build and submit to App Store and Play Store
- **Backend**: Deploy to cloud platforms (AWS, GCP, Azure)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Migration Notes

This project has been migrated from:
- Vite + React to Next.js for better SEO and performance
- shadcn/ui to Material UI for cross-platform compatibility
- React Router to Next.js routing for web and React Navigation for mobile
- Tailwind CSS custom theme to Material UI theme system

The migration ensures:
- Backward compatibility with existing features
- Improved performance and developer experience
- Cross-platform code sharing
- Modern React patterns and best practices