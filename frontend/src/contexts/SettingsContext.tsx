import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  plan: 'free' | 'pro' | 'team';
  joinedAt: Date;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}

export interface AppearanceSettings {
  theme: 'system' | 'light' | 'dark';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface LinkedAccount {
  id: string;
  platform: string;
  username: string;
  isConnected: boolean;
  connectedAt?: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'invited' | 'inactive';
  avatar?: string;
  joinedAt: Date;
  permissions: string[];
}

export interface SettingsState {
  user: UserProfile;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  paymentMethods: PaymentMethod[];
  linkedAccounts: LinkedAccount[];
  teamMembers: TeamMember[];
  currentSection: string;
  isLoading: boolean;
  error: string | null;
  showUpgradeDialog: boolean;
  showLogoutConfirmation: boolean;
}

type SettingsAction =
  | { type: 'SET_CURRENT_SECTION'; payload: string }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPDATE_NOTIFICATION_SETTINGS'; payload: Partial<NotificationSettings> }
  | { type: 'UPDATE_APPEARANCE_SETTINGS'; payload: Partial<AppearanceSettings> }
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'REMOVE_PAYMENT_METHOD'; payload: string }
  | { type: 'SET_DEFAULT_PAYMENT_METHOD'; payload: string }
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'REMOVE_TEAM_MEMBER'; payload: string }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: { id: string; updates: Partial<TeamMember> } }
  | { type: 'CONNECT_LINKED_ACCOUNT'; payload: { id: string; username: string } }
  | { type: 'DISCONNECT_LINKED_ACCOUNT'; payload: string }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SHOW_UPGRADE_DIALOG' }
  | { type: 'HIDE_UPGRADE_DIALOG' }
  | { type: 'SHOW_LOGOUT_CONFIRMATION' }
  | { type: 'HIDE_LOGOUT_CONFIRMATION' };

// Mock data
const mockUser: UserProfile = {
  id: '1',
  name: 'Andrew Ainsley',
  email: 'andrew.ainsley@yourdomain.com',
  avatar: '/avatars/andrew.jpg',
  role: 'owner',
  plan: 'free',
  joinedAt: new Date('2024-01-01')
};

const mockNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  marketingEmails: true,
  productUpdates: true,
  securityAlerts: true
};

const mockAppearance: AppearanceSettings = {
  theme: 'system',
  language: 'English (US)',
  fontSize: 'medium',
  animations: true
};

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  }
];

const mockLinkedAccounts: LinkedAccount[] = [
  {
    id: '1',
    platform: 'Google',
    username: 'andrew.ainsley@gmail.com',
    isConnected: true,
    connectedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    platform: 'GitHub',
    username: 'andrewainsley',
    isConnected: false
  },
  {
    id: '3',
    platform: 'Discord',
    username: 'AndrewA#1234',
    isConnected: true,
    connectedAt: new Date('2024-01-15')
  }
];

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'admin',
    status: 'active',
    avatar: '/avatars/sarah.jpg',
    joinedAt: new Date('2024-01-10'),
    permissions: ['manage_voices', 'manage_projects', 'view_analytics']
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'member',
    status: 'active',
    avatar: '/avatars/mike.jpg',
    joinedAt: new Date('2024-01-20'),
    permissions: ['manage_voices', 'manage_projects']
  }
];

const initialState: SettingsState = {
  user: mockUser,
  notifications: mockNotifications,
  appearance: mockAppearance,
  paymentMethods: mockPaymentMethods,
  linkedAccounts: mockLinkedAccounts,
  teamMembers: mockTeamMembers,
  currentSection: 'account',
  isLoading: false,
  error: null,
  showUpgradeDialog: false,
  showLogoutConfirmation: false
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_CURRENT_SECTION':
      return { ...state, currentSection: action.payload };

    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case 'UPDATE_NOTIFICATION_SETTINGS':
      return {
        ...state,
        notifications: { ...state.notifications, ...action.payload }
      };

    case 'UPDATE_APPEARANCE_SETTINGS':
      return {
        ...state,
        appearance: { ...state.appearance, ...action.payload }
      };

    case 'ADD_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: [...state.paymentMethods, action.payload]
      };

    case 'REMOVE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.filter(pm => pm.id !== action.payload)
      };

    case 'SET_DEFAULT_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethods: state.paymentMethods.map(pm => ({
          ...pm,
          isDefault: pm.id === action.payload
        }))
      };

    case 'ADD_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: [...state.teamMembers, action.payload]
      };

    case 'REMOVE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(tm => tm.id !== action.payload)
      };

    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.map(tm =>
          tm.id === action.payload.id
            ? { ...tm, ...action.payload.updates }
            : tm
        )
      };

    case 'CONNECT_LINKED_ACCOUNT':
      return {
        ...state,
        linkedAccounts: state.linkedAccounts.map(account =>
          account.id === action.payload.id
            ? { 
                ...account, 
                isConnected: true, 
                username: action.payload.username,
                connectedAt: new Date()
              }
            : account
        )
      };

    case 'DISCONNECT_LINKED_ACCOUNT':
      return {
        ...state,
        linkedAccounts: state.linkedAccounts.map(account =>
          account.id === action.payload
            ? { ...account, isConnected: false, connectedAt: undefined }
            : account
        )
      };

    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SHOW_UPGRADE_DIALOG':
      return { ...state, showUpgradeDialog: true };

    case 'HIDE_UPGRADE_DIALOG':
      return { ...state, showUpgradeDialog: false };

    case 'SHOW_LOGOUT_CONFIRMATION':
      return { ...state, showLogoutConfirmation: true };

    case 'HIDE_LOGOUT_CONFIRMATION':
      return { ...state, showLogoutConfirmation: false };

    default:
      return state;
  }
}

interface SettingsContextType {
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
  // Helper functions
  setCurrentSection: (section: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => Promise<void>;
  updateAppearanceSettings: (updates: Partial<AppearanceSettings>) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  inviteTeamMember: (email: string, role: 'admin' | 'member') => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;
  connectLinkedAccount: (id: string, username: string) => Promise<void>;
  disconnectLinkedAccount: (id: string) => Promise<void>;
  upgradeAccount: (plan: 'pro' | 'team') => Promise<void>;
  logout: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  const setCurrentSection = (section: string) => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: section });
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    dispatch({ type: 'SET_IS_LOADING', payload: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatch({ type: 'UPDATE_USER_PROFILE', payload: updates });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  };

  const updateNotificationSettings = async (updates: Partial<NotificationSettings>) => {
    dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: updates });
  };

  const updateAppearanceSettings = async (updates: Partial<AppearanceSettings>) => {
    dispatch({ type: 'UPDATE_APPEARANCE_SETTINGS', payload: updates });
  };

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString()
    };
    dispatch({ type: 'ADD_PAYMENT_METHOD', payload: newMethod });
  };

  const removePaymentMethod = async (id: string) => {
    dispatch({ type: 'REMOVE_PAYMENT_METHOD', payload: id });
  };

  const inviteTeamMember = async (email: string, role: 'admin' | 'member') => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
      status: 'invited',
      joinedAt: new Date(),
      permissions: role === 'admin' ? ['manage_voices', 'manage_projects', 'view_analytics'] : ['manage_voices']
    };
    dispatch({ type: 'ADD_TEAM_MEMBER', payload: newMember });
  };

  const removeTeamMember = async (id: string) => {
    dispatch({ type: 'REMOVE_TEAM_MEMBER', payload: id });
  };

  const connectLinkedAccount = async (id: string, username: string) => {
    dispatch({ type: 'CONNECT_LINKED_ACCOUNT', payload: { id, username } });
  };

  const disconnectLinkedAccount = async (id: string) => {
    dispatch({ type: 'DISCONNECT_LINKED_ACCOUNT', payload: id });
  };

  const upgradeAccount = async (plan: 'pro' | 'team') => {
    dispatch({ type: 'UPDATE_USER_PROFILE', payload: { plan } });
    dispatch({ type: 'HIDE_UPGRADE_DIALOG' });
  };

  const logout = async () => {
    dispatch({ type: 'HIDE_LOGOUT_CONFIRMATION' });
    // Implement logout logic
    console.log('Logging out...');
  };

  const value: SettingsContextType = {
    state,
    dispatch,
    setCurrentSection,
    updateUserProfile,
    updateNotificationSettings,
    updateAppearanceSettings,
    addPaymentMethod,
    removePaymentMethod,
    inviteTeamMember,
    removeTeamMember,
    connectLinkedAccount,
    disconnectLinkedAccount,
    upgradeAccount,
    logout
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};