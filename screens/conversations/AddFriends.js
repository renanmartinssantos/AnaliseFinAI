import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
  FlatList,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { auth, database } from '../../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

export default function AddFriends() {
  const [userId, setUserId] = useState(''); // ID do usuário atual
  const [email, setEmail] = useState(''); // E-mail do amigo
  const [qrCodeValue, setQrCodeValue] = useState(''); // Valor do QR Code
  const [friendRequests, setFriendRequests] = useState([]); // Solicitações de amizade pendentes

  // Busca o ID do usuário atual e as solicitações de amizade ao carregar a tela
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid); // Usa o UID do Firebase como ID do usuário
      setQrCodeValue(`https://seusite.com/add-friend?uid=${user.uid}`); // Gera o link do QR Code
      fetchFriendRequests(user.uid); // Busca as solicitações de amizade
    }
  }, []);

  // Função para buscar as solicitações de amizade
  const fetchFriendRequests = async (userId) => {
    try {
      const userRef = doc(database, 'users', userId); // Referência ao documento do usuário
      const userSnapshot = await getDoc(userRef); // Use getDoc para buscar o documento

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data(); // Dados do documento
        setFriendRequests(userData.friendRequests || []); // Atualiza o estado com as solicitações
      } else {
        console.log('Documento do usuário não encontrado.');
      }
    } catch (err) {
      console.error('Erro ao buscar solicitações de amizade:', err);
    }
  };

  // Função para enviar uma solicitação de amizade
  const sendFriendRequest = async (receiverEmail) => {
    if (!receiverEmail) {
      Alert.alert('Erro', 'Por favor, insira um e-mail.');
      return;
    }

    // Verifica se o usuário está tentando adicionar a si mesmo
    const user = auth.currentUser;
    if (user && user.email === receiverEmail) {
      Alert.alert('Erro', 'Você não pode adicionar a si mesmo como amigo.');
      return;
    }

    try {
      // Busca o usuário pelo e-mail
      const usersRef = collection(database, 'users');
      const q = query(usersRef, where('email', '==', receiverEmail.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Erro', 'Usuário não encontrado.');
      } else {
        const receiverData = querySnapshot.docs[0].data();
        const receiverId = receiverData.userid;

        // Adiciona o ID do solicitante ao campo friendRequests do receptor
        const receiverRef = doc(database, 'users', receiverId);
        await updateDoc(receiverRef, {
          friendRequests: arrayUnion(userId),
        });

        Alert.alert('Sucesso', 'Solicitação de amizade enviada.');
      }
    } catch (err) {
      console.error('Erro ao enviar solicitação de amizade:', err);
      Alert.alert('Erro', 'Não foi possível enviar a solicitação.');
    }
  };

  // Função para aceitar uma solicitação de amizade
  const acceptFriendRequest = async (requesterId) => {
    try {
      const userRef = doc(database, 'users', userId);
      const requesterRef = doc(database, 'users', requesterId);

      // Adiciona o ID do amigo à friendlist de ambos os usuários
      await updateDoc(userRef, {
        friendlist: arrayUnion(requesterId),
        friendRequests: arrayRemove(requesterId), // Remove a solicitação
      });

      await updateDoc(requesterRef, {
        friendlist: arrayUnion(userId),
      });

      // Atualiza a lista de solicitações
      setFriendRequests((prevRequests) => prevRequests.filter((id) => id !== requesterId));
      Alert.alert('Sucesso', 'Solicitação de amizade aceita.');
    } catch (err) {
      console.error('Erro ao aceitar solicitação de amizade:', err);
      Alert.alert('Erro', 'Não foi possível aceitar a solicitação.');
    }
  };

  // Função para recusar uma solicitação de amizade
  const rejectFriendRequest = async (requesterId) => {
    try {
      const userRef = doc(database, 'users', userId);

      // Remove a solicitação
      await updateDoc(userRef, {
        friendRequests: arrayRemove(requesterId),
      });

      // Atualiza a lista de solicitações
      setFriendRequests((prevRequests) => prevRequests.filter((id) => id !== requesterId));
      Alert.alert('Sucesso', 'Solicitação de amizade recusada.');
    } catch (err) {
      console.error('Erro ao recusar solicitação de amizade:', err);
      Alert.alert('Erro', 'Não foi possível recusar a solicitação.');
    }
  };

  // Função para abrir a câmera do celular (usando deep link)
  const openCameraApp = () => {
    Linking.openURL('camera://'); // Deep link para abrir a câmera do celular
  };

  // Renderiza uma solicitação de amizade
  const renderFriendRequest = ({ item }) => {
    return (
      <View style={styles.requestItem}>
        <Text style={styles.requestText}>Solicitação de: {item}</Text>
        <View style={styles.requestButtons}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => acceptFriendRequest(item)}
          >
            <Text style={styles.buttonText}>Aceitar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => rejectFriendRequest(item)}
          >
            <Text style={styles.buttonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Adicionar Amigo</Text>

      {/* Exibe o ID do usuário */}
      <Text style={styles.userId}>Seu ID: {userId}</Text>

      {/* Exibe o QR Code do ID do usuário */}
      <View style={styles.qrCodeContainer}>
        {qrCodeValue ? ( // Renderiza o QRCode apenas se qrCodeValue estiver definido
          <QRCode
            value={qrCodeValue} // Valor do QR Code (link com o ID do usuário)
            size={200}
          />
        ) : (
          <Text style={styles.loadingText}>Carregando QR Code...</Text>
        )}
      </View>

      {/* Botão para abrir a câmera do celular */}
      <TouchableOpacity style={styles.button} onPress={openCameraApp}>
        <Text style={styles.buttonText}>Abrir Câmera do Celular</Text>
      </TouchableOpacity>

      {/* Campo para adicionar amigo pelo e-mail */}
      <TextInput
        style={styles.input}
        placeholder="Digite o e-mail do amigo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Botão para enviar solicitação de amizade */}
      <TouchableOpacity style={styles.button} onPress={() => sendFriendRequest(email)}>
        <Text style={styles.buttonText}>Enviar Solicitação</Text>
      </TouchableOpacity>

      {/* Lista de solicitações de amizade */}
      <Text style={styles.subtitle}>Solicitações de Amizade</Text>
      <FlatList
        data={friendRequests}
        renderItem={renderFriendRequest}
        keyExtractor={(item) => item}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma solicitação pendente.</Text>}
      />
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
  userId: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  requestText: {
    fontSize: 16,
  },
  requestButtons: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
  },
});