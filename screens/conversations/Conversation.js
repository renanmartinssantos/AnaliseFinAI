import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, updateDoc, arrayUnion, getDocs, where } from 'firebase/firestore';
import { auth, database } from '../../config/firebase';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Button, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function Conversation({ route, navigation }) {
  const { chatId, isGroupChat } = route.params; // Recebe chatId e isGroupChat
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatName, setChatName] = useState(''); // Nome do usuário ou grupo
  const [isMenuVisible, setIsMenuVisible] = useState(false); // Estado do menu
  const [newParticipantEmail, setNewParticipantEmail] = useState(''); // Email do novo participante

  // Determina a coleção de mensagens com base no tipo de chat
  const messagesCollection = isGroupChat
    ? collection(database, 'groupConversations', chatId, 'messages') // Mensagens de grupo
    : collection(database, 'privateChats', chatId, 'messages'); // Mensagens privadas

  // Busca o nome do usuário ou do grupo
  useEffect(() => {
    const fetchChatName = async () => {
      if (isGroupChat) {
        // Busca o nome do grupo
        const groupDocRef = doc(database, 'groupConversations', chatId);
        const groupDoc = await getDoc(groupDocRef);
        if (groupDoc.exists()) {
          setChatName(groupDoc.data().groupName || 'Grupo sem nome');
        }
      } else {
        // Busca o nome do outro usuário no chat privado
        const chatDocRef = doc(database, 'privateChats', chatId);
        const chatDoc = await getDoc(chatDocRef);
        if (chatDoc.exists()) {
          const participants = chatDoc.data().participants;
          const otherUserEmail = participants.find((email) => email !== auth.currentUser?.email);

          if (otherUserEmail) {
            const usersRef = collection(database, 'users');
            const q = query(usersRef, where('email', '==', otherUserEmail.toLowerCase()));
            const userSnapshot = await getDocs(q);

            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              setChatName(userData.name || 'Usuário sem nome');
            }
          }
        }
      }
    };

    fetchChatName();
  }, [chatId, isGroupChat]);

  // Configura o cabeçalho da tela com o nome do usuário ou do grupo
  useLayoutEffect(() => {
    navigation.setOptions({
      title: chatName, // Define o título da tela como o nome do usuário ou do grupo
      headerRight: () => (
        isGroupChat && (
          <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
            <Feather name="more-vertical" size={24} color="#FFF" style={{ marginRight: 16 }} />
          </TouchableOpacity>
        )
      ),
    });
  }, [chatName, isGroupChat]);

  // Busca as mensagens do chat
  useEffect(() => {
    const q = query(messagesCollection, orderBy('createdAt', 'desc')); // Ordena por createdAt

    const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
      const messagesList = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Verifica se o campo createdAt existe e é um Timestamp válido
        const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();

        return {
          _id: doc.id,
          ...data,
          createdAt, // Usa o valor convertido ou um fallback
          user: {
            _id: data.user._id,
            name: data.user.name,
            avatar: data.user.avatar,
          },
        };
      });
      setMessages(messagesList);
    });

    return () => unsubscribeMessages();
  }, [chatId, isGroupChat]);

  // Busca o nome do usuário e monitora mudanças em tempo real
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const userDocRef = doc(database, 'users', userId);

      const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUserName(userData.name || null);
        }
      });

      return () => unsubscribeUser();
    }
  }, []);

  // Envia uma mensagem
  const onSend = useCallback(async (newMessages = []) => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const userDocRef = doc(database, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userName = userData.name || null;

        await addDoc(messagesCollection, {
          ...newMessages[0],
          createdAt: serverTimestamp(), // Usa o horário do servidor
          user: {
            _id: userId,
            name: userName,
            avatar: auth.currentUser.photoURL,
          },
        });
      }
    }
  }, [chatId, isGroupChat]);

  // Adiciona um participante ao grupo
  const addParticipant = async () => {
    if (!newParticipantEmail) return;

    const groupDocRef = doc(database, 'groupConversations', chatId);
    await updateDoc(groupDocRef, {
      participants: arrayUnion(newParticipantEmail.toLowerCase()),
    });

    setNewParticipantEmail(''); // Limpa o campo de email
    setIsMenuVisible(false); // Fecha o menu
  };

  const setTyping = (textChanged) => {
    setIsTyping(textChanged.length > 0);
  };

  return (
    <>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: auth.currentUser?.uid,
          name: userName,
          avatar: auth.currentUser?.photoURL,
        }}
        showUserAvatar={true}
        onInputTextChanged={(text) => setTyping(text)}
        isTyping={isTyping}
      />

      {/* Menu para adicionar participantes */}
      <Modal visible={isMenuVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Participante</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o email do participante"
              value={newParticipantEmail}
              onChangeText={setNewParticipantEmail}
              keyboardType="email-address"
              renderUsernameOnMessage={true}
            />
            <Button title="Adicionar" onPress={addParticipant} />
            <Button title="Cancelar" onPress={() => setIsMenuVisible(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 16,
  },
});