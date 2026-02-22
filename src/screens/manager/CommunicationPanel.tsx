import React, { useState } from 'react';
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

type CommunicationPanelNavigationProp = StackNavigationProp<RootStackParamList>;

interface Message {
  id: string;
  sender: 'Manager' | 'Overman';
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  overmanName: string;
  overmanId: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
  messages: Message[];
}

const CommunicationPanel: React.FC = () => {
  const navigation = useNavigation<CommunicationPanelNavigationProp>();
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState('');

  // Demo conversations data
  const conversations: Conversation[] = [
    {
      id: 'conv-1',
      overmanName: 'Rajesh Patil',
      overmanId: 'OVM-105',
      lastMessage: 'Acknowledged – corrective action in progress',
      unreadCount: 0,
      timestamp: '2 hours ago',
      messages: [
        {
          id: 'msg-1',
          sender: 'Manager',
          senderName: 'Manager',
          text: 'Please ensure gas level below 1% before next shift',
          timestamp: '10:30 AM',
          status: 'read',
        },
        {
          id: 'msg-2',
          sender: 'Overman',
          senderName: 'Rajesh Patil',
          text: 'Acknowledged – corrective action in progress',
          timestamp: '10:45 AM',
          status: 'delivered',
        },
      ],
    },
    {
      id: 'conv-2',
      overmanName: 'Amit Sharma',
      overmanId: 'OVM-112',
      lastMessage: 'Thank you for the feedback',
      unreadCount: 2,
      timestamp: '4 hours ago',
      messages: [
        {
          id: 'msg-3',
          sender: 'Manager',
          senderName: 'Manager',
          text: 'Great work on maintaining safety standards this week. Keep it up!',
          timestamp: '8:15 AM',
          status: 'read',
        },
        {
          id: 'msg-4',
          sender: 'Overman',
          senderName: 'Amit Sharma',
          text: 'Thank you for the feedback',
          timestamp: '8:20 AM',
          status: 'delivered',
        },
        {
          id: 'msg-5',
          sender: 'Overman',
          senderName: 'Amit Sharma',
          text: 'We will continue to maintain these standards',
          timestamp: '8:21 AM',
          status: 'delivered',
        },
      ],
    },
    {
      id: 'conv-3',
      overmanName: 'Vijay Kumar',
      overmanId: 'OVM-108',
      lastMessage: 'Equipment inspection completed',
      unreadCount: 1,
      timestamp: '6 hours ago',
      messages: [
        {
          id: 'msg-6',
          sender: 'Manager',
          senderName: 'Manager',
          text: 'Please conduct equipment inspection in Section A-2 today',
          timestamp: '6:00 AM',
          status: 'read',
        },
        {
          id: 'msg-7',
          sender: 'Overman',
          senderName: 'Vijay Kumar',
          text: 'Equipment inspection completed',
          timestamp: '6:30 AM',
          status: 'delivered',
        },
      ],
    },
    {
      id: 'conv-4',
      overmanName: 'Suresh Singh',
      overmanId: 'FOR-045',
      lastMessage: 'Will coordinate with maintenance team',
      unreadCount: 0,
      timestamp: 'Yesterday',
      messages: [
        {
          id: 'msg-8',
          sender: 'Manager',
          senderName: 'Manager',
          text: 'Pump-03 needs urgent maintenance. Please prioritize this.',
          timestamp: 'Yesterday 4:30 PM',
          status: 'read',
        },
        {
          id: 'msg-9',
          sender: 'Overman',
          senderName: 'Suresh Singh',
          text: 'Will coordinate with maintenance team',
          timestamp: 'Yesterday 5:00 PM',
          status: 'delivered',
        },
      ],
    },
  ];

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0,
  );

  const handleSendMessage = () => {
    if (messageText.trim() && selectedConversation) {
      console.log(
        'Sending message:',
        messageText,
        'to conversation:',
        selectedConversation,
      );
      // TODO: API call to send message
      setMessageText('');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Communication Panel</Text>
          <Text style={styles.headerSubtitle}>
            {totalUnread > 0
              ? `${totalUnread} unread messages`
              : 'All messages read'}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        {/* Conversations List */}
        <View style={styles.conversationsList}>
          <Text style={styles.sectionTitle}>Conversations</Text>
          <ScrollView
            style={styles.conversationsScroll}
            showsVerticalScrollIndicator={false}
          >
            {conversations.map(conv => (
              <TouchableOpacity
                key={conv.id}
                style={[
                  styles.conversationItem,
                  selectedConversation === conv.id &&
                    styles.conversationItemActive,
                ]}
                onPress={() => setSelectedConversation(conv.id)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {conv.overmanName
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </Text>
                  </View>
                  {conv.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>
                        {conv.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>
                      {conv.overmanName}
                    </Text>
                    <Text style={styles.conversationTime}>
                      {conv.timestamp}
                    </Text>
                  </View>
                  <Text style={styles.conversationId}>{conv.overmanId}</Text>
                  <Text
                    style={[
                      styles.conversationLastMessage,
                      conv.unreadCount > 0 &&
                        styles.conversationLastMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {conv.lastMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Area */}
        <View style={styles.chatArea}>
          {selectedConv ? (
            <KeyboardAvoidingView
              style={styles.chatContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={100}
            >
              {/* Chat Header */}
              <View style={styles.chatHeader}>
                <View>
                  <Text style={styles.chatHeaderName}>
                    {selectedConv.overmanName}
                  </Text>
                  <Text style={styles.chatHeaderId}>
                    {selectedConv.overmanId}
                  </Text>
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>Overman</Text>
                </View>
              </View>

              {/* Messages */}
              <ScrollView
                style={styles.messagesScroll}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {selectedConv.messages.map(msg => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageContainer,
                      msg.sender === 'Manager'
                        ? styles.messageContainerManager
                        : styles.messageContainerOverman,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        msg.sender === 'Manager'
                          ? styles.messageBubbleManager
                          : styles.messageBubbleOverman,
                      ]}
                    >
                      <View style={styles.messageHeader}>
                        <Text
                          style={[
                            styles.messageSender,
                            msg.sender === 'Manager' &&
                              styles.messageSenderManager,
                          ]}
                        >
                          {msg.sender}
                        </Text>
                        <Text
                          style={[
                            styles.messageTimestamp,
                            msg.sender === 'Manager' &&
                              styles.messageTimestampManager,
                          ]}
                        >
                          {msg.timestamp}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.messageText,
                          msg.sender === 'Manager' && styles.messageTextManager,
                        ]}
                      >
                        {msg.text}
                      </Text>
                      {msg.sender === 'Manager' && msg.status && (
                        <Text style={styles.messageStatus}>
                          {msg.status === 'read' ? '✓✓' : '✓'}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Message Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
                  placeholderTextColor="#94a3b8"
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !messageText.trim() && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatIcon}>💬</Text>
              <Text style={styles.emptyChatText}>
                Select a conversation to start messaging
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1e3a5f',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  conversationsList: {
    width: '35%',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 16,
    paddingBottom: 12,
  },
  conversationsScroll: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  conversationItemActive: {
    backgroundColor: '#f1f5f9',
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a5f',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e3a5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  conversationTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  conversationId: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  conversationLastMessage: {
    fontSize: 13,
    color: '#64748b',
  },
  conversationLastMessageUnread: {
    fontWeight: '600',
    color: '#1e293b',
  },
  chatArea: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  chatHeaderId: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  messagesScroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageContainer: {
    flexDirection: 'row',
  },
  messageContainerManager: {
    justifyContent: 'flex-end',
  },
  messageContainerOverman: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    elevation: 1,
  },
  messageBubbleManager: {
    backgroundColor: '#f59e0b',
  },
  messageBubbleOverman: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 12,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  messageSenderManager: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  messageTimestamp: {
    fontSize: 10,
    color: '#94a3b8',
  },
  messageTimestampManager: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  messageTextManager: {
    color: '#fff',
  },
  messageStatus: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyChatIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyChatText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default CommunicationPanel;
