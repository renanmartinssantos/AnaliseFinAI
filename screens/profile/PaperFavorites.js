import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs, orderBy, limit, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { auth, database } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';

const StockScreen = () => {
  const [stocks, setStocks] = useState([]); // Lista completa de ações
  const [filteredStocks, setFilteredStocks] = useState([]); // Lista filtrada (com busca)
  const [searchText, setSearchText] = useState(''); // Texto de busca
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [favorites, setFavorites] = useState([]); // Lista de favoritos
  const navigation = useNavigation();

  useLayoutEffect(() => {
      navigation.setOptions({
        title: 'Ações Favoritas', // Título da tela
        headerBackTitle: 'Voltar', // Texto do botão de voltar (opcional)
      });
  }, [navigation]);
  // Função para buscar os dados da API de ações
  const fetchStocks = async () => {
    try {
      console.log('Buscando ações da API...');
      const response = await fetch('https://b3api.me/api/quote/result');
      if (!response.ok) throw new Error('Erro ao buscar ações');
      const data = await response.json();

      // Mapeia os dados da API para o formato desejado
      const stockList = data.data.stocks.map((stock) => ({
        id: stock.stock, // Usamos o símbolo como ID único
        symbol: stock.stock, // Ex: "PETR4"
        name: stock.name, // Ex: "Petrobras"
        close: stock.close, // Preço de fechamento
        change: stock.change, // Variação percentual
        isFavorite: false, // Estado inicial de favorito
      }));

      console.log('Ações carregadas:', stockList.length);
      setStocks(stockList);
      setFilteredStocks(stockList); // Inicialmente, a lista filtrada é igual à lista completa
      setLoading(false);

      // Após carregar as ações, busca os favoritos
      await fetchFavorites(stockList);
    } catch (error) {
      console.error('Erro ao buscar ações:', error);
      setLoading(false);
    }
  };

  // Função para buscar os favoritos (do AsyncStorage ou Firebase)
  const fetchFavorites = async (stockList) => {
    try {
      console.log('Buscando favoritos...');
      let favoritesList = [];

      // Tenta buscar do AsyncStorage
      const storedFavorites = await AsyncStorage.getItem('stockFavorites');
      if (storedFavorites) {
        favoritesList = JSON.parse(storedFavorites);
        console.log('Favoritos carregados do AsyncStorage:', favoritesList);
      } else {
        // Se não houver no AsyncStorage, busca do Firebase
        const userEmail = auth.currentUser.email;
        const q = query(
          collection(database, 'stockFavorites'),
          where('user.id', '==', userEmail),
          orderBy('createdAt', 'desc'),
          limit(3) // Limita aos últimos 3 favoritos
        );
        const querySnapshot = await getDocs(q);
        favoritesList = querySnapshot.docs.map(doc => doc.data().stockId);
        console.log('Favoritos carregados do Firebase:', favoritesList);

        // Salva no AsyncStorage para uso futuro
        await AsyncStorage.setItem('stockFavorites', JSON.stringify(favoritesList));
      }

      setFavorites(favoritesList);
      updateStocksWithFavorites(stockList, favoritesList); // Atualiza as ações com os favoritos
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    }
  };

  // Função para atualizar o estado de isFavorite nas ações e ordenar os favoritos no topo
  const updateStocksWithFavorites = (stockList, favoritesList) => {
    console.log('Atualizando ações com favoritos:', favoritesList);
    const updatedStocks = stockList.map(stock => ({
      ...stock,
      isFavorite: favoritesList.includes(stock.id),
    }));

    // Ordena as ações: favoritos primeiro
    const sortedStocks = updatedStocks.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1; // a vem antes de b
      if (!a.isFavorite && b.isFavorite) return 1; // b vem antes de a
      return 0; // mantém a ordem original
    });

    console.log('Ações ordenadas:', sortedStocks.length);
    setStocks(sortedStocks);
    setFilteredStocks(sortedStocks); // Atualiza a lista filtrada também
  };

  // Função para favoritar/desfavoritar uma ação
  const toggleFavorite = async (id) => {
    try {
      if (favorites.length >= 3 && !favorites.includes(id)) {
        Alert.alert('Limite de favoritos', 'Você só pode favoritar até 3 ações.');
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
      updateStocksWithFavorites(stocks, updatedFavorites);

      // Atualiza o AsyncStorage
      await AsyncStorage.setItem('stockFavorites', JSON.stringify(updatedFavorites));

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
  const addFavoriteToFirebase = async (stockId) => {
    try {
      const userEmail = auth.currentUser.email;
      await addDoc(collection(database, 'stockFavorites'), {
        user: { id: userEmail },
        stockId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao adicionar favorito no Firebase:', error);
    }
  };

  // Função para remover um favorito do Firebase
  const removeFavoriteFromFirebase = async (stockId) => {
    try {
      const userEmail = auth.currentUser.email;
      const q = query(
        collection(database, 'stockFavorites'),
        where('user.id', '==', userEmail),
        where('stockId', '==', stockId)
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
    fetchStocks(); // Busca as ações e, em seguida, os favoritos
  }, []);

  // Função para filtrar as ações com base no texto de busca
  const handleSearch = (text) => {
    setSearchText(text);
    const filtered = stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(text.toLowerCase()) || // Filtra pelo símbolo
        stock.name.toLowerCase().includes(text.toLowerCase()) // Filtra pelo nome
    );
    setFilteredStocks(filtered);
  };

  // Renderiza cada item da lista de ações
  const renderStockItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.currencyInfo}>
        <Text style={styles.currencyCode}>{item.symbol}</Text>
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
        placeholder="Buscar ação..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={handleSearch}
      />

      {loading ? (
        <Text style={styles.loadingText}>Carregando...</Text>
      ) : (
        <FlatList
          data={filteredStocks}
          keyExtractor={(item) => item.id}
          renderItem={renderStockItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma ação encontrada.</Text>}
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
  currencyPrice: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  currencyChange: {
    color: item => item.change >= 0 ? '#00FF00' : '#FF0000',
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

export default StockScreen;