import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    let baseStyle: ViewStyle = {};

    // Size styles
    switch (size) {
      case 'small':
        baseStyle = { ...baseStyle, paddingVertical: 8, paddingHorizontal: 16 };
        break;
      case 'large':
        baseStyle = { ...baseStyle, paddingVertical: 16, paddingHorizontal: 24 };
        break;
      default: // medium
        baseStyle = { ...baseStyle, paddingVertical: 12, paddingHorizontal: 20 };
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle = {
          ...baseStyle,
          backgroundColor: disabled ? '#9CA3AF' : '#5546FF',
          borderWidth: 0,
        };
        break;
      case 'secondary':
        baseStyle = {
          ...baseStyle,
          backgroundColor: disabled ? '#F3F4F6' : '#F9FAFB',
          borderWidth: 1,
          borderColor: disabled ? '#E5E7EB' : '#D1D5DB',
        };
        break;
      case 'outline':
        baseStyle = {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled ? '#9CA3AF' : '#5546FF',
        };
        break;
      case 'ghost':
        baseStyle = {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
        break;
    }

    return [styles.button, baseStyle, style];
  };

  const getTextStyle = () => {
    let baseStyle: TextStyle = {};

    // Size styles
    switch (size) {
      case 'small':
        baseStyle = { ...baseStyle, fontSize: 14 };
        break;
      case 'large':
        baseStyle = { ...baseStyle, fontSize: 18 };
        break;
      default: // medium
        baseStyle = { ...baseStyle, fontSize: 16 };
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle = { ...baseStyle, color: '#FFFFFF' };
        break;
      case 'secondary':
        baseStyle = { ...baseStyle, color: disabled ? '#9CA3AF' : '#1F2937' };
        break;
      case 'outline':
        baseStyle = { ...baseStyle, color: disabled ? '#9CA3AF' : '#5546FF' };
        break;
      case 'ghost':
        baseStyle = { ...baseStyle, color: disabled ? '#9CA3AF' : '#5546FF' };
        break;
    }

    return [styles.buttonText, baseStyle, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#5546FF'}
        />
      ) : (
        <>
          {icon && (
            <MaterialIcons
              name={icon as any}
              size={20}
              color={variant === 'primary' ? '#FFFFFF' : '#5546FF'}
              style={styles.icon}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
});

export default Button;
