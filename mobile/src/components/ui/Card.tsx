import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../lib/theme-provider';
import { Colors, BorderRadius, Spacing, Shadows } from '../../../../shared/design-system';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  gradientColors?: string[];
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  gradientColors,
}) => {
  const { colors, isDark } = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return Spacing[3];
      case 'large':
        return Spacing[8];
      default: // medium
        return Spacing[6];
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      padding: getPadding(),
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 8,
        };

      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };

      case 'gradient':
        return {
          ...baseStyle,
          overflow: 'hidden',
        };

      default: // default
        return {
          ...baseStyle,
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
    }
  };

  if (variant === 'gradient') {
    const colors = gradientColors || Colors.gradients.primaryCard;
    
    return (
      <View style={[getCardStyle(), style]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: BorderRadius.lg },
          ]}
        />
        <View style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

export default Card;