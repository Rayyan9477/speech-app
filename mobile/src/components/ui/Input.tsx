import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme-provider';
import { Colors, Typography, Spacing, BorderRadius } from '../../../../shared/design-system';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      size = 'medium',
      style,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();

    const getSizeStyles = () => {
      switch (size) {
        case 'small':
          return {
            height: 40,
            fontSize: Typography.fontSize.sm,
            paddingHorizontal: Spacing[3],
            paddingVertical: Spacing[2],
          };
        case 'large':
          return {
            height: 56,
            fontSize: Typography.fontSize.lg,
            paddingHorizontal: Spacing[5],
            paddingVertical: Spacing[4],
          };
        default: // medium
          return {
            height: 48,
            fontSize: Typography.fontSize.base,
            paddingHorizontal: Spacing[4],
            paddingVertical: Spacing[3],
          };
      }
    };

    const sizeStyles = getSizeStyles();

    const getInputContainerStyle = (): ViewStyle => ({
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.surface,
      borderColor: error ? colors.error : colors.border,
      minHeight: sizeStyles.height,
    });

    const getInputStyle = (): TextStyle => ({
      flex: 1,
      fontSize: sizeStyles.fontSize,
      color: colors.text.primary,
      paddingHorizontal: leftIcon ? Spacing[2] : sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
    });

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

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.text.primary }]}>
            {label}
          </Text>
        )}
        
        <View style={getInputContainerStyle()}>
          {leftIcon && (
            <View style={[styles.iconContainer, { paddingLeft: Spacing[4] }]}>
              <MaterialIcons
                name={leftIcon}
                size={getIconSize()}
                color={colors.text.secondary}
              />
            </View>
          )}
          
          <TextInput
            ref={ref}
            style={[getInputStyle(), inputStyle, style]}
            placeholderTextColor={colors.text.tertiary}
            {...props}
          />
          
          {rightIcon && (
            <TouchableOpacity
              style={[styles.iconContainer, { paddingRight: Spacing[4] }]}
              onPress={onRightIconPress}
            >
              <MaterialIcons
                name={rightIcon}
                size={getIconSize()}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {(error || helperText) && (
          <Text
            style={[
              styles.helperText,
              {
                color: error ? colors.error : colors.text.secondary,
              },
            ]}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[4],
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing[2],
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing[1],
    marginLeft: Spacing[1],
  },
});

export default Input;