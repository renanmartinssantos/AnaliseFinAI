import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { auth, database } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function FriendList() {
  const [friends, setFriends] = useState([]); // Lista de amigos
  const userId = auth.currentUser?.uid; // ID do usuário logado
  const navigation = useNavigation(); // Navegação entre telas

  // Busca a lista de amigos ao carregar a tela
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        // Busca o documento do usuário logado
        const userRef = doc(database, 'users', userId);
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

    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  // Renderiza um item da lista de amigos
  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/40' }} // Avatar do amigo
        style={styles.avatar}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendEmail}>{item.email}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lista de Amigos</Text>

      {/* Lista de amigos */}
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.userid}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum amigo adicionado.</Text>}
      />

    {/* Botão para adicionar amigos */}
    <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddFriends')}
      >
        <Text style={styles.addButtonText}>Adicionar Amigo</Text>
    </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  friendEmail: {
    fontSize: 14,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});