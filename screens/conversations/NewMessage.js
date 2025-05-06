import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, database } from '../../config/firebase'; // Importe o Firebase config
import colors from '../../colors';

export default function NewMessage() {
  const [searchQuery, setSearchQuery] = useState(''); // Estado para o campo de busca
  const [friends, setFriends] = useState([]); // Lista de amigos
  const [filteredFriends, setFilteredFriends] = useState([]); // Lista de amigos filtrados
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o carregamento
  const navigation = useNavigation();
  const userEmail = auth.currentUser?.email; // E-mail do usuário logado

  // Configura o título da tela na barra de navegação
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Nova Mensagem', // Título da tela
      headerBackTitle: 'Voltar', // Texto do botão de voltar (opcional)
    });
  }, [navigation]);

  // Busca a lista de amigos ao carregar a tela
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const userRef = doc(database, 'users', auth.currentUser?.uid);
        const userSnapshot = await getDoc(userRef); // Use getDoc corretamente

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const friendIds = userData.friendlist || []; // IDs dos amigos

          // Busca os detalhes de cada amigo
          const friendsList = await Promise.all(
            friendIds.map(async (friendId) => {
              const friendRef = doc(database, 'users', friendId);
              const friendSnapshot = await getDoc(friendRef); // Use getDoc corretamente
              if (friendSnapshot.exists()) {
                return friendSnapshot.data(); // Retorna os dados do amigo
              }
              return null;
            })
          );

          // Filtra amigos válidos e atualiza o estado
          const validFriends = friendsList.filter((friend) => friend !== null);
          setFriends(validFriends);
          setFilteredFriends(validFriends); // Inicializa a lista filtrada com todos os amigos
        } else {
          console.log('Documento do usuário não encontrado.');
        }
      } catch (err) {
        console.error('Erro ao buscar lista de amigos:', err);
      }
    };

    if (auth.currentUser?.uid) {
      fetchFriends();
    }
  }, []);

  // Função para filtrar a lista de amigos
  useEffect(() => {
    if (searchQuery) {
      const filtered = friends.filter(
        (friend) =>
          friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          friend.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFriends(filtered);
    } else {
      setFilteredFriends(friends); // Mostra todos os amigos se o campo de busca estiver vazio
    }
  }, [searchQuery, friends]);

  // Função para verificar se já existe uma conversa com o amigo
  const checkIfConversationExists = async (participantEmail) => {
    try {
      const privateChatsRef = collection(database, 'privateChats');
      const q = query(
        privateChatsRef,
        where('participants', 'array-contains', userEmail)
      );

      const querySnapshot = await getDocs(q);

      for (const doc of querySnapshot.docs) {
        const chatData = doc.data();
        if (chatData.participants.includes(participantEmail)) {
          return doc.id; // Retorna o ID da conversa existente
        }
      }

      return null; // Retorna null se não encontrar uma conversa existente
    } catch (error) {
      console.error('Erro ao verificar conversa existente:', error);
      return null;
    }
  };

  // Função para iniciar ou abrir uma conversa
  const handleStartConversation = async (participantEmail) => {
    if (!participantEmail) {
      Alert.alert('Erro', 'Selecione um amigo para iniciar a conversa.');
      return;
    }

    if (participantEmail === userEmail) {
      Alert.alert('Erro', 'Você não pode enviar uma mensagem para si mesmo.');
      return;
    }

    setIsLoading(true); // Inicia o carregamento

    try {
      // Verifica se já existe uma conversa com o amigo
      const existingChatId = await checkIfConversationExists(participantEmail);

      if (existingChatId) {
        // Se a conversa já existir, abre a conversa existente
        navigation.navigate('Conversation', { chatId: existingChatId });
      } else {
        // Se a conversa não existir, cria uma nova conversa
        const newChatRef = await addDoc(collection(database, 'privateChats'), {
          participants: [userEmail, participantEmail], // Inclui o usuário logado e o participante
          createdAt: serverTimestamp(), // Timestamp do Firebase
        });

        // Navega para a nova conversa
        navigation.navigate('Conversation', { chatId: newChatRef.id });
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a conversa. Tente novamente.');
    } finally {
      setIsLoading(false); // Finaliza o carregamento
    }
  };

  // Função para redirecionar para a tela AddFriends.js
  const redirectToAddFriends = () => {
    navigation.navigate('AddFriends');
  };

  // Renderiza um item da lista de amigos
  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleStartConversation(item.email)}
    >
      <Text style={styles.friendName}>{item.name}</Text>
      <Text style={styles.friendEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Campo de busca */}
        <TextInput
          style={styles.input}
          placeholder="Buscar amigo por nome ou e-mail"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Lista de amigos */}
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.userid}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum amigo encontrado.</Text>
              <TouchableOpacity
                style={styles.addFriendButton}
                onPress={redirectToAddFriends}
              >
                <Text style={styles.addFriendButtonText}>Adicionar Amigo</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
  },
  friendItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendEmail: {
    fontSize: 14,
    color: colors.gray,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 10,
  },
  addFriendButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});