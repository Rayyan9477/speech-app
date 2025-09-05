import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const FAQScreen = () => {
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const faqData = [
    {
      id: 1,
      question: 'How do I create a new voice clone?',
      answer: 'To create a voice clone, go to the Voice Library and tap "Add Voice". Upload a clear audio sample of at least 30 seconds, then follow the processing steps to create your custom voice profile.',
    },
    {
      id: 2,
      question: 'What audio formats are supported?',
      answer: 'We support MP3, WAV, and M4A audio formats. For best results, use high-quality recordings with minimal background noise.',
    },
    {
      id: 3,
      question: 'How long does voice processing take?',
      answer: 'Voice processing typically takes 2-5 minutes depending on the length and quality of your audio sample. You\'ll receive a notification when processing is complete.',
    },
    {
      id: 4,
      question: 'Can I use my cloned voices commercially?',
      answer: 'Yes, you can use your cloned voices for commercial purposes with our Pro and Enterprise plans. Personal use is available on all plans.',
    },
    {
      id: 5,
      question: 'How do I improve voice cloning quality?',
      answer: 'Use clear audio samples, speak at consistent volume, minimize background noise, and provide at least 30 seconds of varied speech patterns.',
    },
    {
      id: 6,
      question: 'What languages are supported?',
      answer: 'We support voice cloning and translation for 10+ languages including English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, and Chinese.',
    },
    {
      id: 7,
      question: 'Is my data secure?',
      answer: 'Yes, all audio data is encrypted and processed securely. We follow industry-standard security practices and never share your personal data with third parties.',
    },
    {
      id: 8,
      question: 'How do I delete a voice clone?',
      answer: 'Go to your Voice Library, select the voice you want to delete, tap the menu button (three dots), and select "Delete". This action cannot be undone.',
    },
    {
      id: 9,
      question: 'Can I share my voice clones with others?',
      answer: 'Yes, you can make your voice clones public so other users can discover and use them, or share them privately with specific users.',
    },
    {
      id: 10,
      question: 'What are the plan differences?',
      answer: 'Free plan: 5 voice clones, basic features. Pro: Unlimited voices, commercial use, priority support. Enterprise: Custom solutions, dedicated support.',
    },
  ];

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const renderFAQItem = (item: any, index: number) => {
    const isExpanded = expandedItems.has(item.id);

    return (
      <View key={item.id} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={() => toggleExpanded(item.id)}
        >
          <Text style={styles.questionNumber}>{index + 1}</Text>
          <Text style={styles.question}>{item.question}</Text>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#5546FF"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.answerContainer}>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  const handleContactSupport = () => {
    navigation.navigate('ContactSupport');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* FAQ List */}
        <View style={styles.faqList}>
          {faqData.map((item, index) => renderFAQItem(item, index))}
        </View>

        {/* Still Need Help */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Still need help?</Text>
          <Text style={styles.helpText}>
            Can't find the answer you're looking for? Our support team is here to help.
          </Text>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSupport}
          >
            <MaterialIcons name="support" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  faqList: {
    padding: 20,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5546FF',
    marginRight: 12,
    minWidth: 24,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 22,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  answer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5546FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default FAQScreen;
