import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth, database } from '../../config/firebase'; // Importe o Firebase config
import colors from '../../colors';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState(''); // Estado para o nome do grupo
  const [participantsInput, setParticipantsInput] = useState(''); // Estado para o campo de e-mails
  const [participants, setParticipants] = useState([]); // Lista de participantes
  const [friends, setFriends] = useState([]); // Lista de amigos do usuário
  const navigation = useNavigation();
  const userEmail = auth.currentUser?.email; // E-mail do usuário logado

  // Busca a lista de amigos ao carregar a tela
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const userRef = doc(database, 'users', auth.currentUser?.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const friendIds = userData.friendlist || []; // IDs dos amigos

          // Busca os detalhes de cada amigo
          const friendsList = await Promise.all(
            friendIds.map(async (friendId) => {
              const friendRef = doc(database, 'users', friendId);
              const friendSnapshot = await getDoc(friendRef);
              if (friendSnapshot.exists()) {
                return friendSnapshot.data(); // Retorna os dados do amigo
              }
              return null;
            })
          );

          // Filtra amigos válidos e atualiza o estado
          setFriends(friendsList.filter((friend) => friend !== null));
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

  // Função para adicionar um e-mail à lista de participantes
  const handleAddParticipant = () => {
    const email = participantsInput.trim(); // Remove espaços em branco

    // Verifica se o e-mail é válido e não é o próprio usuário
    if (email && !participants.includes(email) && email !== userEmail) {
      // Verifica se o e-mail pertence a um amigo
      const isFriend = friends.some((friend) => friend.email === email);

      if (isFriend) {
        setParticipants([...participants, email]); // Adiciona o e-mail à lista
        setParticipantsInput(''); // Limpa o campo de entrada
      } else {
        Alert.alert('Erro', 'Você só pode adicionar amigos ao grupo.');
      }
    } else if (email === userEmail) {
      Alert.alert('Erro', 'Você não pode adicionar seu próprio e-mail.');
    }
  };

  // Função para remover um e-mail da lista de participantes
  const handleRemoveParticipant = (email) => {
    setParticipants(participants.filter((participant) => participant !== email));
  };

  // Função para criar o grupo
  const handleCreateGroup = async () => {
    if (groupName.trim() && participants.length > 0) {
      try {
        // Adiciona o grupo ao Firebase
        await addDoc(collection(database, 'groupConversations'), {
          groupName: groupName.trim(),
          participants: [...participants, userEmail], // Inclui o dono do grupo
          owner: userEmail, // E-mail do dono do grupo
          createdAt: serverTimestamp(), // Timestamp do Firebase
        });

        // Navega de volta para a tela anterior
        navigation.goBack();
      } catch (error) {
        console.error('Erro ao criar grupo:', error);
        Alert.alert('Erro', 'Não foi possível criar o grupo. Tente novamente.');
      }
    } else {
      Alert.alert('Erro', 'Preencha o nome do grupo e adicione pelo menos um participante.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Criar Grupo</Text>

        {/* Campo para o nome do grupo */}
        <TextInput
          style={styles.input}
          placeholder="Nome do Grupo"
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Campo para adicionar participantes */}
        <View style={styles.participantsInputContainer}>
          <ScrollView
            horizontal
            style={styles.participantsBubbles}
            contentContainerStyle={styles.bubblesContent}
          >
            {participants.map((email, index) => (
              <View key={index} style={styles.bubble}>
                <Text style={styles.bubbleText}>{email}</Text>
                <TouchableOpacity
                  style={styles.bubbleRemoveButton}
                  onPress={() => handleRemoveParticipant(email)}
                >
                  <Text style={styles.bubbleRemoveText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.participantsInput}
              placeholder="Adicionar participantes"
              value={participantsInput}
              onChangeText={setParticipantsInput}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === ' ' || nativeEvent.key === ',') {
                  handleAddParticipant(); // Adiciona o e-mail ao pressionar espaço ou vírgula
                }
              }}
              onSubmitEditing={handleAddParticipant} // Adiciona o e-mail ao pressionar "Enter"
              keyboardType="email-address"
            />
          </ScrollView>
        </View>

        {/* Botão para criar o grupo */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateGroup}
        >
          <Text style={styles.createButtonText}>Criar Grupo</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
  },
  participantsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 5,
    padding: 8,
    marginBottom: 16,
  },
  participantsBubbles: {
    flex: 1,
  },
  bubblesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  bubbleText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  bubbleRemoveButton: {
    marginLeft: 8,
  },
  bubbleRemoveText: {
    fontSize: 16,
    color: colors.darkGray,
  },
  participantsInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    margin: 0,
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});