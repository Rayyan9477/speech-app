// URL configuration for different environments
export const URLS = {
  frontend: {
    base: process.env.FRONTEND_URL || 'http://localhost:3000',
    auth: {
      login: '/login',
      signup: '/signup',
      welcome: '/welcome',
      splash: '/splash',
      walkthrough: '/walkthrough',
      onboarding: {
        roleSelection: '/onboarding/role-selection',
        contentType: '/onboarding/content-type',
        companySize: '/onboarding/company-size',
        profileCompletion: '/onboarding/profile-completion'
      }
    },
    dashboard: {
      home: '/home',
      projects: '/projects',
      explore: '/explore',
      account: '/account',
      voices: '/voices',
      tts: {
        create: '/tts/create',
        editor: '/tts/editor',
        export: '/tts/export',
        voiceSelection: '/tts/voice-selection'
      },
      voiceCloning: '/voice-cloning',
      voiceTranslate: {
        base: '/voice-translate',
        languageSelect: '/voice-translate/language-select'
      },
      voiceChanger: '/voice-changer'
    }
  },
  backend: {
    base: process.env.BACKEND_URL || 'http://localhost:8000',
    api: {
      auth: '/api/auth',
      users: '/api/users',
      tts: '/api/tts',
      voices: '/api/voices',
      uploads: '/api/uploads',
      processing: '/api/processing'
    }
  },
  mobile: {
    base: process.env.MOBILE_URL || 'http://localhost:19006' // Expo web default port
  }
};

export const getFullUrl = (type: 'frontend' | 'backend' | 'mobile', path: string): string => {
  return `${URLS[type].base}${path}`;
};

export const waitForServer = async (url: string, maxAttempts: number = 30): Promise<boolean> => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 200 || response.status === 404) {
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return false;
};