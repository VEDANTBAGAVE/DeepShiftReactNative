import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { messageService, DBMessage } from '../../services/messageService';
import { User } from '../../types/database';

type CommunicationPanelNavigationProp = StackNavigationProp<RootStackParamList>;

const CommunicationPanel: React.FC = () => {
  const navigation = useNavigation<CommunicationPanelNavigationProp>();
  const { user } = useAuth();

  const [peers, setPeers] = useState<User[]>([]);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, { text: string; time: string }>>({});
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const selectedPeer = peers.find(p => p.id === selectedPeerId) ?? null;
  const totalUnread = Object.values(unreadCounts).reduce((s, n) => s + n, 0);

  const loadPeers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const overmen = await userService.getUsers({ role: 'overman', is_active: true });
      setPeers(overmen);

      // Load unread counts + last message preview for each peer in parallel
      const counts: Record<string, number> = {};
      const lasts: Record<string, { text: string; time: string }> = {};
      await Promise.all(
        overmen.map(async peer => {
          const [count, msgs] = await Promise.all([
            messageService.getUnreadCount(peer.id, user.id),
            messageService.getMessages(user.id, peer.id),
          ]);
          counts[peer.id] = count;
          if (msgs.length > 0) {
            const last = msgs[msgs.length - 1];
            lasts[peer.id] = {
              text: last.content,
              time: new Date(last.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          }
        }),
      );
      setUnreadCounts(counts);
      setLastMessages(lasts);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPeers();
  }, [loadPeers]);

  const loadMessages = useCallback(async (peerId: string) => {
    if (!user) return;
    setLoadingMessages(true);
    try {
      const msgs = await messageService.getMessages(user.id, peerId);
      setMessages(msgs);
      // Mark peer's messages as read
      await messageService.markRead(peerId, user.id);
      setUnreadCounts(prev => ({ ...prev, [peerId]: 0 }));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  const handleSelectPeer = (peerId: string) => {
    setSelectedPeerId(peerId);
    setMessages([]);
    loadMessages(peerId);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedPeerId || !user || sending) return;
    const text = messageText.trim();
    setMessageText('');
    setSending(true);
    try {
      const msg = await messageService.sendMessage(user.id, selectedPeerId, text);
      setMessages(prev => [...prev, msg]);
      setLastMessages(prev => ({
        ...prev,
        [selectedPeerId]: {
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      }));
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch {
      setMessageText(text); // restore on error
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>â†</Text>
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
          {loading ? (
            <ActivityIndicator style={{ marginTop: 24 }} color="#1e3a5f" />
          ) : (
            <ScrollView style={styles.conversationsScroll} showsVerticalScrollIndicator={false}>
              {peers.length === 0 && (
                <Text style={{ padding: 16, color: '#94a3b8', fontSize: 13 }}>
                  No overmen found
                </Text>
              )}
              {peers.map(peer => (
                <TouchableOpacity
                  key={peer.id}
                  style={[
                    styles.conversationItem,
                    selectedPeerId === peer.id && styles.conversationItemActive,
                  ]}
                  onPress={() => handleSelectPeer(peer.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(peer.name)}</Text>
                    </View>
                    {(unreadCounts[peer.id] ?? 0) > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{unreadCounts[peer.id]}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.conversationInfo}>
                    <View style={styles.conversationHeader}>
                      <Text style={styles.conversationName}>{peer.name}</Text>
                      <Text style={styles.conversationTime}>
                        {lastMessages[peer.id]?.time ?? ''}
                      </Text>
                    </View>
                    <Text style={styles.conversationId}>{peer.employee_code}</Text>
                    <Text
                      style={[
                        styles.conversationLastMessage,
                        (unreadCounts[peer.id] ?? 0) > 0 && styles.conversationLastMessageUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {lastMessages[peer.id]?.text ?? 'Tap to start chatting'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Chat Area */}
        <View style={styles.chatArea}>
          {selectedPeer ? (
            <KeyboardAvoidingView
              style={styles.chatContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={100}
            >
              {/* Chat Header */}
              <View style={styles.chatHeader}>
                <View>
                  <Text style={styles.chatHeaderName}>{selectedPeer.name}</Text>
                  <Text style={styles.chatHeaderId}>{selectedPeer.employee_code}</Text>
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>Overman</Text>
                </View>
              </View>

              {/* Messages */}
              {loadingMessages ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator color="#1e3a5f" />
                </View>
              ) : (
                <ScrollView
                  ref={scrollRef}
                  style={styles.messagesScroll}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                >
                  {messages.length === 0 && (
                    <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 40 }}>
                      No messages yet. Say hello!
                    </Text>
                  )}
                  {messages.map(msg => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <View
                        key={msg.id}
                        style={[
                          styles.messageContainer,
                          isMe ? styles.messageContainerManager : styles.messageContainerOverman,
                        ]}
                      >
                        <View
                          style={[
                            styles.messageBubble,
                            isMe ? styles.messageBubbleManager : styles.messageBubbleOverman,
                          ]}
                        >
                          <View style={styles.messageHeader}>
                            <Text
                              style={[
                                styles.messageSender,
                                isMe && styles.messageSenderManager,
                              ]}
                            >
                              {isMe ? 'You' : (msg.sender?.name ?? selectedPeer.name)}
                            </Text>
                            <Text
                              style={[
                                styles.messageTimestamp,
                                isMe && styles.messageTimestampManager,
                              ]}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.messageText,
                              isMe && styles.messageTextManager,
                            ]}
                          >
                            {msg.content}
                          </Text>
                          {isMe && (
                            <Text style={styles.messageStatus}>
                              {msg.is_read ? 'âœ“âœ“' : 'âœ“'}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

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
                    (!messageText.trim() || sending) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  activeOpacity={0.7}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.sendButtonText}>Send</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatIcon}>ðŸ’¬</Text>
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
