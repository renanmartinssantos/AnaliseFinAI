import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import colors from '../colors';
import { Feather } from '@expo/vector-icons';
import FooterNavigation from './components/FooterNavigation';

export default function Chats() {
  const [botConversation, setBotConversation] = useState(null); // Última mensagem do Bot
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado do Modal
  const [groups, setGroups] = useState([]); // Lista de grupos do usuário
  const [privateChats, setPrivateChats] = useState([]); // Lista de conversas privadas
  const [userNames, setUserNames] = useState({}); // Armazena os nomes dos usuários
  const [lastMessages, setLastMessages] = useState({}); // Armazena as últimas mensagens
  const navigation = useNavigation();
  const userEmail = auth.currentUser?.email; // E-mail do usuário logado

  // Função para formatar a data da mensagem
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const messageDate = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      // Mensagem enviada hoje: exibe apenas a hora
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      // Mensagem enviada ontem
      return 'Ontem';
    } else {
      // Mensagem enviada antes de ontem: exibe a data completa
      return messageDate.toLocaleDateString('pt-BR');
    }
  };

  // Busca a última mensagem do Bot
  useEffect(() => {
    const userEmail = auth?.currentUser?.email;
    if (!userEmail) return;

    const botQuery = query(
      collection(database, 'chats'),
      where('user._id', '==', 0),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeBot = onSnapshot(botQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const lastMessage = querySnapshot.docs[0].data();
        setBotConversation({
          id: querySnapshot.docs[0].id,
          ...lastMessage,
        });
      } else {
        setBotConversation(null);
      }
    });

    return unsubscribeBot;
  }, []);

  // Busca os grupos do usuário e a última mensagem de cada grupo
  useEffect(() => {
    if (!userEmail) return;

    const groupsQuery = query(
      collection(database, 'groupConversations'),
      where('participants', 'array-contains', userEmail)
    );

    const unsubscribeGroups = onSnapshot(groupsQuery, (querySnapshot) => {
      const groupsList = querySnapshot.docs.map((doc) => {
        const groupId = doc.id;

        // Busca a última mensagem do grupo
        const messagesQuery = query(
          collection(database, `groupConversations/${groupId}/messages`), // Subcoleção messages
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const unsubscribeMessages = onSnapshot(messagesQuery, (messagesSnapshot) => {
          if (!messagesSnapshot.empty) {
            const lastMessage = messagesSnapshot.docs[0].data();
            console.log('Última mensagem do grupo encontrada:', lastMessage); // Log para depuração
            setLastMessages((prevMessages) => ({
              ...prevMessages,
              [groupId]: {
                name: lastMessage.user.name,
                text: lastMessage.text,
                createdAt: lastMessage.createdAt,
              },
            }));
          } else {
            console.log('Nenhuma mensagem encontrada para o grupo:', groupId); // Log para depuração
            setLastMessages((prevMessages) => ({
              ...prevMessages,
              [groupId]: {
                name: '',
                text: 'Não há mensagens',
                createdAt: null,
              },
            }));
          }
        });

        return {
          id: groupId,
          ...doc.data(),
          unsubscribeMessages,
        };
      });

      setGroups(groupsList);

      return () => {
        groupsList.forEach((group) => group.unsubscribeMessages());
      };
    });

    return unsubscribeGroups;
  }, [userEmail]);

  // Busca as conversas privadas do usuário e os nomes dos participantes
  useEffect(() => {
    if (!userEmail) return;

    const privateChatsQuery = query(
      collection(database, 'privateChats'),
      where('participants', 'array-contains', userEmail)
    );

    const unsubscribePrivateChats = onSnapshot(privateChatsQuery, (querySnapshot) => {
      const chats = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrivateChats(chats);

      // Busca os nomes dos usuários para cada conversa privada
      chats.forEach((chat) => {
        const otherUserEmail = chat.participants.find((email) => email !== userEmail);
        if (otherUserEmail) {
          const usersRef = collection(database, 'users');
          const q = query(usersRef, where('email', '==', otherUserEmail.toLowerCase()));

          const unsubscribeUser = onSnapshot(q, (userSnapshot) => {
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              setUserNames((prevNames) => ({
                ...prevNames,
                [otherUserEmail]: userData.name || 'Usuário sem nome',
              }));
            }
          });

          return unsubscribeUser;
        }
      });

      // Busca a última mensagem de cada conversa privada
      chats.forEach((chat) => {
        const messagesQuery = query(
          collection(database, `privateChats/${chat.id}/messages`), // Subcoleção messages
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const unsubscribeMessages = onSnapshot(messagesQuery, (messagesSnapshot) => {
          if (!messagesSnapshot.empty) {
            const lastMessage = messagesSnapshot.docs[0].data();
            console.log('Última mensagem encontrada:', lastMessage); // Log para depuração
            setLastMessages((prevMessages) => ({
              ...prevMessages,
              [chat.id]: {
                name: lastMessage.user.name,
                text: lastMessage.text,
                createdAt: lastMessage.createdAt,
              },
            }));
          } else {
            console.log('Nenhuma mensagem encontrada para o chat:', chat.id); // Log para depuração
            setLastMessages((prevMessages) => ({
              ...prevMessages,
              [chat.id]: {
                name: '',
                text: 'Não há mensagens',
                createdAt: null,
              },
            }));
          }
        });

        return unsubscribeMessages;
      });
    });

    return unsubscribePrivateChats;
  }, [userEmail]);

  // Renderiza a conversa com o Bot
  const renderBotConversation = () => {
    if (!botConversation) {
      return (
        <Text style={styles.noMessagesText}>Nenhuma mensagem do Bot ainda.</Text>
      );
    }

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Chat', { participants: botConversation.participants })}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: botConversation.user.avatar }} // Avatar do Bot
            style={styles.avatar}
          />
        </View>
        <View style={styles.conversationDetails}>
          <Text style={styles.conversationName}>Chat Bot</Text>
          <Text style={styles.lastMessage}>
            {botConversation.title || 'Nenhuma mensagem ainda'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderiza a lista de grupos
  const renderGroups = () => {
    if (groups.length === 0) {
      return null;
    }

    return groups.map((group) => {
      const otherUserEmail = group.participants.find((email) => email !== userEmail);
      const otherUserName = userNames[otherUserEmail] || 'Carregando...';

      const lastMessage = lastMessages[group.id];
      const lastMessageText = lastMessage ? lastMessage.text : 'Carregando...';
      const lastMessageTime = lastMessage ? formatMessageTime(lastMessage.createdAt) : '';
      const lastMessageName = lastMessage ? (lastMessage.name == userNames[otherUserEmail] ? lastMessage.name + ": " : (!lastMessage.name) ? "" : "Você: ") : 'Carregando...';

      return (
        <TouchableOpacity
          key={group.id}
          style={styles.conversationItem}
          onPress={() => navigation.navigate('Conversation', { chatId: group.id, isGroupChat: true })}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }} // Avatar padrão do grupo
              style={styles.avatar}
            />
          </View>
          <View style={styles.conversationDetails}>
            <Text style={styles.conversationName}>{group.groupName}</Text>
            <Text style={styles.lastMessage}>{lastMessageName + lastMessageText}</Text>
          </View>
          <Text style={styles.messageTime}>{lastMessageTime}</Text>
        </TouchableOpacity>
      );
    });
  };

  // Renderiza a lista de conversas privadas
  const renderPrivateChats = () => {
    if (privateChats.length === 0) {
      return null;
    }

    return privateChats.map((chat) => {
      const otherUserEmail = chat.participants.find((email) => email !== userEmail);
      const otherUserName = userNames[otherUserEmail] || 'Carregando...';

      const lastMessage = lastMessages[chat.id];
      const lastMessageText = lastMessage ? lastMessage.text : 'Carregando...';
      const lastMessageTime = lastMessage ? formatMessageTime(lastMessage.createdAt) : '';
      const lastMessageName = lastMessage ? (lastMessage.name == userNames[otherUserEmail] ? lastMessage.name + ": " : (!lastMessage.name) ? "" : "Você: ") : 'Carregando...';
      return (
        <TouchableOpacity
          key={chat.id}
          style={styles.conversationItem}
          onPress={() => navigation.navigate('Conversation', { chatId: chat.id, isGroupChat: false })}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }} // Avatar padrão do usuário
              style={styles.avatar}
            />
          </View>
          <View style={styles.conversationDetails}>
            <Text style={styles.conversationName}>{otherUserName}</Text>
            <Text style={styles.lastMessage}>{lastMessageName + lastMessageText}</Text>
          </View>
          <Text style={styles.messageTime}>{lastMessageTime}</Text>
        </TouchableOpacity>
      );
    });
  };

  // Função para abrir o Modal
  const openModal = () => {
    setIsModalVisible(true);
  };

  // Função para fechar o Modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Função para lidar com a seleção de uma opção
  const handleOptionPress = (option) => {
    closeModal();
    switch (option) {
      case 'Criar Grupo':
        navigation.navigate('CreateGroup');
        break;
      case 'Enviar Mensagem':
        navigation.navigate('NewMessage');
        break;
      case 'Adicionar Amigo':
        navigation.navigate('AddFriends'); // Navega para a página AddFriends
        break;
      default:
        break;
    }
  };

  // Configuração do cabeçalho personalizado
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={openModal}
        >
          <Feather name="more-vertical" size={24} color="#FFFFFF" style={{ marginRight: 10 }} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Conversa com o Bot */}
      {renderBotConversation()}

      {/* Lista de conversas privadas */}
      {renderPrivateChats()}

      {/* Lista de grupos */}
      {renderGroups()}

      {/* Exibe "Nenhuma conversa encontrada" apenas se não houver conversas */}
      {groups.length === 0 && privateChats.length === 0 && (
        <Text style={styles.noMessagesText}>Nenhuma conversa encontrada.</Text>
      )}

      {/* Modal para exibir as opções */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleOptionPress('Criar Grupo')}
              >
                <Text style={styles.modalOptionText}>Criar Grupo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleOptionPress('Enviar Mensagem')}
              >
                <Text style={styles.modalOptionText}>Enviar Mensagem</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleOptionPress('Adicionar Amigo')}
              >
                <Text style={styles.modalOptionText}>Adicionar Amigo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <FooterNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    position: 'relative',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  conversationDetails: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGray,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.gray,
  },
  messageTime: {
    position: 'absolute',
    top: 12,
    right: 16,
    fontSize: 12,
    color: colors.gray,
  },
  noMessagesText: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.gray,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.darkGray,
  },
});