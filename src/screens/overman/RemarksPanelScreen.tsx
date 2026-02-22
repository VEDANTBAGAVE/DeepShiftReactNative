import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type RemarksPanelScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Message {
  id: string;
  sender: 'overman' | 'foreman';
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const RemarksPanelScreen: React.FC = () => {
  const navigation = useNavigation<RemarksPanelScreenNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'M001',
      sender: 'foreman',
      senderName: 'Rajesh Kumar',
      content:
        'Morning shift report submitted for Panel 5-A. All safety checks completed.',
      timestamp: '08:15 AM',
      read: true,
    },
    {
      id: 'M002',
      sender: 'overman',
      senderName: 'You',
      content:
        'Good work, Rajesh. Please double-check the gas levels in adjacent panel 5-B.',
      timestamp: '08:22 AM',
      read: true,
    },
    {
      id: 'M003',
      sender: 'foreman',
      senderName: 'Amit Sharma',
      content:
        'Hydraulic support issue reported in Panel 6-A. Maintenance notified.',
      timestamp: '09:10 AM',
      read: true,
    },
    {
      id: 'M004',
      sender: 'overman',
      senderName: 'You',
      content:
        'Acknowledged. Keep me updated on the repair timeline. Ensure crew safety first.',
      timestamp: '09:15 AM',
      read: true,
    },
    {
      id: 'M005',
      sender: 'foreman',
      senderName: 'Suresh Patil',
      content:
        'Panel 5-B gas readings confirmed normal. Ventilation system working properly.',
      timestamp: '09:45 AM',
      read: true,
    },
    {
      id: 'M006',
      sender: 'overman',
      senderName: 'You',
      content: 'Excellent. Continue monitoring throughout the shift.',
      timestamp: '09:50 AM',
      read: true,
    },
    {
      id: 'M007',
      sender: 'foreman',
      senderName: 'Vijay Singh',
      content:
        'Production target achieved for Panel 7-A. Crew performing well.',
      timestamp: '10:30 AM',
      read: false,
    },
  ]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: `M${String(messages.length + 1).padStart(3, '0')}`,
        sender: 'overman',
        senderName: 'You',
        content: message.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        read: true,
      };

      setMessages([...messages, newMessage]);
      setMessage('');

      // Simulate foreman response after 2 seconds
      setTimeout(() => {
        const autoReply: Message = {
          id: `M${String(messages.length + 2).padStart(3, '0')}`,
          sender: 'foreman',
          senderName: 'Rajesh Kumar',
          content: 'Understood, will do.',
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          read: false,
        };
        setMessages(prev => [...prev, autoReply]);
      }, 2000);
    }
  };

  const unreadCount = messages.filter(
    m => !m.read && m.sender === 'foreman',
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Remarks Panel</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>💬</Text>
        <View style={styles.infoBannerContent}>
          <Text style={styles.infoBannerTitle}>Communication Interface</Text>
          <Text style={styles.infoBannerText}>
            Two-way messaging with foremen for quick updates and instructions
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => {
            const isOverman = msg.sender === 'overman';
            const showDateDivider = index === 0 || index === 4; // Demo: show divider at specific points

            return (
              <View key={msg.id}>
                {showDateDivider && (
                  <View style={styles.dateDivider}>
                    <View style={styles.dateDividerLine} />
                    <Text style={styles.dateDividerText}>
                      {index === 0 ? 'Today' : 'Earlier'}
                    </Text>
                    <View style={styles.dateDividerLine} />
                  </View>
                )}

                <View
                  style={[
                    styles.messageRow,
                    isOverman ? styles.messageRowRight : styles.messageRowLeft,
                  ]}
                >
                  {!isOverman && (
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {msg.senderName.charAt(0)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.messageContent}>
                    {!isOverman && (
                      <Text style={styles.senderName}>{msg.senderName}</Text>
                    )}
                    <View
                      style={[
                        styles.messageBubble,
                        isOverman
                          ? styles.messageBubbleOverman
                          : styles.messageBubbleForeman,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isOverman && styles.messageTextOverman,
                        ]}
                      >
                        {msg.content}
                      </Text>
                      <View style={styles.messageFooter}>
                        <Text
                          style={[
                            styles.messageTime,
                            isOverman && styles.messageTimeOverman,
                          ]}
                        >
                          {msg.timestamp}
                        </Text>
                        {isOverman && (
                          <Text style={styles.messageStatus}>✓✓</Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {isOverman && (
                    <View
                      style={[styles.avatarContainer, styles.avatarOverman]}
                    >
                      <Text style={styles.avatarText}>Y</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#94a3b8"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!message.trim()}
              activeOpacity={0.7}
            >
              <Text style={styles.sendButtonText}>Send</Text>
              <Text style={styles.sendButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.characterCount}>{message.length}/500</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e3a5f',
    elevation: 4,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 60,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
    alignItems: 'center',
    gap: 12,
  },
  infoBannerIcon: {
    fontSize: 24,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#075985',
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 11,
    color: '#0c4a6e',
    lineHeight: 14,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  dateDividerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverman: {
    backgroundColor: '#3b82f6',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  senderName: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageBubbleForeman: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  messageBubbleOverman: {
    backgroundColor: '#3b82f6',
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextOverman: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  messageTimeOverman: {
    color: '#bfdbfe',
  },
  messageStatus: {
    fontSize: 10,
    color: '#bfdbfe',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  sendButtonIcon: {
    fontSize: 16,
    color: '#fff',
  },
  characterCount: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
});

export default RemarksPanelScreen;
