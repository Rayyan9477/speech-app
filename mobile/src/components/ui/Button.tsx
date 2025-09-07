import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme-provider';
import { Colors, Typography, Spacing, BorderRadius } from '../../../../shared/design-system';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { colors, isDark } = useTheme();

  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      opacity: disabled || loading ? 0.6 : 1,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (size) {
      case 'small':
        return {
          ...baseStyle,
          paddingHorizontal: Spacing[4],
          paddingVertical: Spacing[2],
          minHeight: 36,
        };
      case 'large':
        return {
          ...baseStyle,
          paddingHorizontal: Spacing[8],
          paddingVertical: Spacing[5],
          minHeight: 56,
        };
      default: // medium
        return {
          ...baseStyle,
          paddingHorizontal: Spacing[6],
          paddingVertical: Spacing[4],
          minHeight: 48,
        };
    }
  };

  const getTextStyle = () => {
    const baseTextStyle: TextStyle = {
      fontWeight: Typography.fontWeight.semibold,
    };

    switch (size) {
      case 'small':
        return {
          ...baseTextStyle,
          fontSize: Typography.fontSize.sm,
        };
      case 'large':
        return {
          ...baseTextStyle,
          fontSize: Typography.fontSize.lg,
        };
      default: // medium
        return {
          ...baseTextStyle,
          fontSize: Typography.fontSize.base,
        };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default: // medium
        return 20;
    }
  };

  const renderContent = () => {
    const iconSize = getIconSize();
    const iconComponent = icon ? (
      <MaterialIcons
        name={icon}
        size={iconSize}
        color={getTextColor()}
        style={iconPosition === 'left' ? { marginRight: 8 } : { marginLeft: 8 }}
      />
    ) : null;

    return (
      <>
        {iconPosition === 'left' && iconComponent}
        <Text style={[getTextStyle(), { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
        {iconPosition === 'right' && iconComponent}
      </>
    );
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'gradient':
        return '#FFFFFF';
      case 'secondary':
        return colors.text.primary;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.text.secondary;
      default:
        return '#FFFFFF';
    }
  };

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyle(), style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Colors.gradients.primaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: BorderRadius.md },
          ]}
        />
        {renderContent()}
      </TouchableOpacity>
    );
  }

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.surface;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'outline':
        return colors.primary;
      case 'secondary':
        return colors.border;
      default:
        return 'transparent';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        getButtonStyle(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default Button;