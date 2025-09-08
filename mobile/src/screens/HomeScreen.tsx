import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import type { TabScreenProps, RootStackParamList } from '../types/navigation';
import { useTheme } from '../lib/theme-provider';
import { Colors, Typography, Spacing, BorderRadius } from '../../shared/design-system';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const HomeScreen = () => {
  const navigation = useNavigation<TabScreenProps<'Home'>['navigation']>();
  const { colors, isDark } = useTheme();

  const features = [
    {
      title: 'AI Text to Speech',
      description: 'Convert your text into stunning speech.',
      icon: 'volume-up',
      screen: 'TTSProjectCreation',
      gradientColors: ['#5546FF', '#7D8BFF'],
    },
    {
      title: 'AI Voice Changer',
      description: 'Change your voice to someone else\'s voice.',
      icon: 'mic',
      screen: 'VoiceCloningUpload',
      gradientColors: ['#22C55E', '#4ADE80'],
    },
    {
      title: 'AI Voice Translate',
      description: 'Translate your voice into another language.',
      icon: 'translate',
      screen: 'VoiceTranslate',
      gradientColors: ['#F59E0B', '#FBBF24'],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <MaterialIcons 
              name="menu" 
              size={24} 
              color={colors.text.primary} 
            />
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              Voicify
            </Text>
            <TouchableOpacity>
              <MaterialIcons 
                name="notifications" 
                size={24} 
                color={colors.text.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upgrade to Pro Card */}
        <View style={styles.section}>
          <Card variant="gradient" gradientColors={['#5546FF', '#7D8BFF']}>
            <View style={styles.upgradeCard}>
              <View style={styles.upgradeContent}>
                <View style={styles.crownIcon}>
                  <MaterialIcons name="star" size={24} color="#FFC107" />
                </View>
                <Text style={styles.upgradeTitle}>Upgrade to Pro!</Text>
                <Text style={styles.upgradeSubtitle}>
                  Enjoy all benefits without any restrictions
                </Text>
                <Button
                  title="Upgrade"
                  variant="secondary"
                  size="small"
                  style={styles.upgradeButton}
                  textStyle={{ color: Colors.primary[500] }}
                  onPress={() => {}}
                />
              </View>
              <View style={styles.upgradeAvatars}>
                {/* User avatars would go here */}
              </View>
            </View>
          </Card>
        </View>

        {/* Main Features */}
        <View style={styles.section}>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={() => navigation.navigate(feature.screen as any)}
                activeOpacity={0.8}
              >
                <Card variant="default" style={{ flex: 1 }}>
                  <View style={styles.featureContent}>
                    <View style={[styles.featureIcon, { backgroundColor: feature.gradientColors[0] + '20' }]}>
                      <MaterialIcons 
                        name={feature.icon as any} 
                        size={28} 
                        color={feature.gradientColors[0]} 
                      />
                    </View>
                    <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
                      {feature.description}
                    </Text>
                    <Button
                      title="Create"
                      variant="gradient"
                      size="small"
                      style={styles.createButton}
                      onPress={() => navigation.navigate(feature.screen as any)}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Explore AI Voices Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Explore AI Voices
            </Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllButton, { color: Colors.primary[500] }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.voicesGrid}>
            {[
              { name: 'Olivia (F) 🇺🇸', age: 'Young' },
              { name: 'Samuel (M) 🇺🇸', age: 'Middle-Aged' },
            ].map((voice, index) => (
              <Card key={index} variant="default" style={styles.voiceCard}>
                <View style={styles.voiceContent}>
                  <View style={[styles.voiceAvatar, { backgroundColor: index === 0 ? '#FE7A36' : '#9C27B0' }]}>
                    <Text style={styles.voiceAvatarText}>
                      {voice.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.voiceName, { color: colors.text.primary }]}>
                    {voice.name}
                  </Text>
                  <Text style={[styles.voiceAge, { color: colors.text.secondary }]}>
                    {voice.age}
                  </Text>
                  <View style={styles.voiceActions}>
                    <TouchableOpacity>
                      <MaterialIcons name="favorite-border" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <MaterialIcons name="play-arrow" size={20} color={colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                  <Button
                    title="Select"
                    variant="primary"
                    size="small"
                    style={styles.selectButton}
                    onPress={() => {}}
                  />
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  section: {
    paddingHorizontal: Spacing[6],
    marginBottom: Spacing[6],
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeContent: {
    flex: 1,
  },
  crownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  upgradeTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: Spacing[1],
  },
  upgradeSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing[4],
  },
  upgradeButton: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  upgradeAvatars: {
    // For user avatars
  },
  featuresGrid: {
    gap: Spacing[4],
  },
  featureCard: {
    marginBottom: Spacing[4],
  },
  featureContent: {
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  featureTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing[2],
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing[4],
  },
  createButton: {
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  viewAllButton: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  voicesGrid: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  voiceCard: {
    flex: 1,
  },
  voiceContent: {
    alignItems: 'center',
  },
  voiceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  voiceAvatarText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  voiceName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: Spacing[1],
  },
  voiceAge: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  voiceActions: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginBottom: Spacing[3],
  },
  selectButton: {
    alignSelf: 'stretch',
  },
});

export default HomeScreen;
