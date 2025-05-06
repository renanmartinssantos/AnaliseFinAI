import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth, database } from '../../config/firebase';

const CurrencyScreen = () => {
  const [currencies, setCurrencies] = useState([]); // Lista completa de moedas
  const [filteredCurrencies, setFilteredCurrencies] = useState([]); // Lista filtrada (com busca)
  const [searchText, setSearchText] = useState(''); // Texto de busca
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [favorites, setFavorites] = useState([]); // Lista de favoritos
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Moedas Favoritas', // Título da tela
      headerBackTitle: 'Voltar', // Texto do botão de voltar (opcional)
    });
  }, [navigation]);

  // Função para buscar os dados da API de moedas
  const fetchCurrencies = async () => {
    try {
      console.log('Buscando moedas da API...');
      const response = await fetch('https://economia.awesomeapi.com.br/json/available');
      if (!response.ok) throw new Error('Erro ao buscar moedas');
      const data = await response.json();

      // Mapeia os dados da API para o formato desejado
      const currencyList = Object.keys(data).map((key) => ({
        id: key,
        code: key.split('-')[0],
        codein: key.split('-')[1],
        name: data[key],
        isFavorite: false, // Estado inicial de favorito
      }));

      console.log('Moedas carregadas:', currencyList.length);
      setCurrencies(currencyList);
      setFilteredCurrencies(currencyList); // Inicialmente, a lista filtrada é igual à lista completa
      setLoading(false);

      // Após carregar as moedas, busca os favoritos
      await fetchFavorites(currencyList);
    } catch (error) {
      console.error('Erro ao buscar moedas:', error);
      setLoading(false);
    }
  };

  // Função para buscar os favoritos (do AsyncStorage ou Firebase)
  const fetchFavorites = async (currencyList) => {
    try {
      console.log('Buscando favoritos...');
      let favoritesList = [];

      // Tenta buscar do AsyncStorage
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        favoritesList = JSON.parse(storedFavorites);
        console.log('Favoritos carregados do AsyncStorage:', favoritesList);
      } else {
        // Se não houver no AsyncStorage, busca do Firebase
        const userEmail = auth.currentUser.email;
        const q = query(
          collection(database, 'coinFavorites'),
          where('user.id', '==', userEmail),
          orderBy('createdAt', 'desc'),
          limit(3) // Limita aos últimos 3 favoritos
        );
        const querySnapshot = await getDocs(q);
        favoritesList = querySnapshot.docs.map(doc => doc.data().currencyId);
        console.log('Favoritos carregados do Firebase:', favoritesList);

        // Salva no AsyncStorage para uso futuro
        await AsyncStorage.setItem('favorites', JSON.stringify(favoritesList));
      }

      setFavorites(favoritesList);
      updateCurrenciesWithFavorites(currencyList, favoritesList); // Atualiza as moedas com os favoritos
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    }
  };

  // Função para atualizar o estado de isFavorite nas moedas e ordenar os favoritos no topo
  const updateCurrenciesWithFavorites = (currencyList, favoritesList) => {
    console.log('Atualizando moedas com favoritos:', favoritesList);
    const updatedCurrencies = currencyList.map(currency => ({
      ...currency,
      isFavorite: favoritesList.includes(currency.id),
    }));

    // Ordena as moedas: favoritos primeiro
    const sortedCurrencies = updatedCurrencies.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1; // a vem antes de b
      if (!a.isFavorite && b.isFavorite) return 1; // b vem antes de a
      return 0; // mantém a ordem original
    });

    console.log('Moedas ordenadas:', sortedCurrencies.length);
    setCurrencies(sortedCurrencies);
    setFilteredCurrencies(sortedCurrencies); // Atualiza a lista filtrada também
  };

  // Função para favoritar/desfavoritar uma moeda
  const toggleFavorite = async (id) => {
    try {
      if (favorites.length >= 3 && !favorites.includes(id)) {
        Alert.alert('Limite de favoritos', 'Você só pode favoritar até 3 moedas.');
        return;
      }

      const isFavorite = favorites.includes(id);
      let updatedFavorites;

      if (isFavorite) {
        updatedFavorites = favorites.filter(favId => favId !== id); // Remove o favorito
      } else {
        updatedFavorites = [...favorites, id]; // Adiciona o favorito
      }

      console.log('Favoritos atualizados:', updatedFavorites);
      setFavorites(updatedFavorites);
      updateCurrenciesWithFavorites(currencies, updatedFavorites);

      // Atualiza o AsyncStorage
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));

      // Sincroniza com o Firebase
      if (isFavorite) {
        await removeFavoriteFromFirebase(id); // Remove do Firebase
      } else {
        await addFavoriteToFirebase(id); // Adiciona ao Firebase
      }
    } catch (error) {
      console.error('Erro ao favoritar/desfavoritar:', error);
    }
  };

  // Função para adicionar um favorito ao Firebase
  const addFavoriteToFirebase = async (currencyId) => {
    try {
      const userEmail = auth.currentUser.email;
      await addDoc(collection(database, 'coinFavorites'), {
        user: { id: userEmail },
        currencyId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito no Firebase:', error);
    }
  };

  // Função para remover um favorito do Firebase
  const removeFavoriteFromFirebase = async (currencyId) => {
    try {
      const userEmail = auth.currentUser.email;
      const q = query(
        collection(database, 'coinFavorites'),
        where('user.id', '==', userEmail),
        where('currencyId', '==', currencyId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error('Erro ao remover favorito do Firebase:', error);
    }
  };

  // Efeito para carregar os dados ao iniciar a tela
  useEffect(() => {
    fetchCurrencies(); // Busca as moedas e, em seguida, os favoritos
  }, []);

  // Função para filtrar as moedas com base no texto de busca
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(text.toLowerCase()) ||
        currency.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCurrencies(filtered);
  };

  // Renderiza cada item da lista de moedas
  const renderCurrencyItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.currencyInfo}>
        <Text style={styles.currencyCode}>{item.code}</Text>
        <Text style={styles.currencyName}>{item.name}</Text>
      </View>
      <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
        <FontAwesome
          name={item.isFavorite ? 'heart' : 'heart-o'}
          size={24}
          color={item.isFavorite ? '#FF0000' : '#FFFFFF'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar moeda..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={handleSearch}
      />

      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={filteredCurrencies}
          keyExtractor={(item) => item.id}
          renderItem={renderCurrencyItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma moeda encontrada.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  searchInput: {
    backgroundColor: '#333',
    color: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  currencyInfo: {
    flex: 1,
    marginRight: 16,
  },
  currencyCode: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currencyName: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CurrencyScreen;