import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import FooterNavigation from './components/FooterNavigation';
import { useTheme } from './context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { auth, database } from '../config/firebase';

const { width: screenWidth } = Dimensions.get("window");

const menuItems = [
  { id: '1', title: 'Chats', icon: 'robot', navigate: 'Chats' },
  { id: '2', title: 'Ações', icon: 'file-text', navigate: 'PaperFavorites' },
  { id: '3', title: 'Moedas', icon: 'coins', navigate: 'CoinFavorites' },
  { id: '4', title: 'Configurações', icon: 'gear', navigate: 'Settings' },
  { id: '5', title: 'Notificações', icon: 'plus-square', navigate: 'Notification' },
  { id: '6', title: 'Mais', icon: 'plus', navigate: 'Profile' },
];

const defaultStocks = ['BBAS3', 'PETR3', 'VALE3']; // Ações padrão

const Home = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { isDarkMode, currentTheme } = useTheme();
  const [portfolio, setPortfolio] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteCurrencies, setFavoriteCurrencies] = useState([]);
  const [defaultCurrencies, setDefaultCurrencies] = useState([]);
  const [favoriteStocks, setFavoriteStocks] = useState([]); // Estado para ações favoritas
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null);

  // Busca as ações favoritas do usuário no Firebase
  const fetchFavoriteStocks = async () => {
    try {
      const userEmail = auth.currentUser.email;
      const q = query(
        collection(database, 'stockFavorites'),
        where('user.id', '==', userEmail),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const favorites = querySnapshot.docs.map(doc => doc.data().stockId);
      console.log("Ações favoritas carregadas:", favorites);

      if (favorites.length > 0) {
        const stockDetails = await fetchStockDetails(favorites);
        setFavoriteStocks(stockDetails);
      } else {
        // Se não houver ações favoritas, carrega as ações padrão
        const stockDetails = await fetchStockDetails(defaultStocks);
        setFavoriteStocks(stockDetails);
      }
    } catch (error) {
      console.error('Erro ao buscar ações favoritas:', error);
    }
  };

  // Busca os detalhes das ações favoritas na API
  const fetchStockDetails = async (stockIds) => {
    try {
      const stockDetails = [];
      for (const stockId of stockIds) {
        const response = await fetch(`https://b3api.me/api/quote/${stockId}`);
        if (!response.ok) throw new Error('Erro ao buscar ação');
        const data = await response.json();
        stockDetails.push(data);
      }
      return stockDetails;
    } catch (error) {
      console.error('Erro ao buscar detalhes das ações:', error);
      return [];
    }
  };

  // Listener para atualizar as ações favoritas em tempo real
  useEffect(() => {
    const userEmail = auth.currentUser.email;
    const q = query(
      collection(database, 'stockFavorites'),
      where('user.id', '==', userEmail),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const favorites = querySnapshot.docs.map(doc => doc.data().stockId);
      console.log("Ações favoritas atualizadas em tempo real:", favorites);

      if (favorites.length > 0) {
        const stockDetails = await fetchStockDetails(favorites);
        setFavoriteStocks(stockDetails);
      } else {
        // Se não houver ações favoritas, carrega as ações padrão
        const stockDetails = await fetchStockDetails(defaultStocks);
        setFavoriteStocks(stockDetails);
      }
    });

    return () => unsubscribe();
  }, []);

  // Busca as moedas favoritas do usuário no Firebase
  const fetchFavoriteCurrencies = async () => {
    try {
      const userEmail = auth.currentUser.email;
      const q = query(
        collection(database, 'coinFavorites'),
        where('user.id', '==', userEmail),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const favorites = querySnapshot.docs.map(doc => doc.data().currencyId);
      console.log("Moedas favoritas carregadas:", favorites);

      if (favorites.length > 0) {
        const favoriteDetails = await fetchCurrencyDetails(favorites);
        setFavoriteCurrencies(favoriteDetails);
      } else {
        await fetchDefaultCurrencies();
      }
    } catch (error) {
      console.error('Erro ao buscar moedas favoritas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Busca os detalhes das moedas na coleção `coins`
  const fetchCurrencyDetails = async (currencyIds) => {
    try {
      const currencyDetails = [];
      for (const currencyId of currencyIds) {
        const q = query(
          collection(database, 'coins'),
          where('code_codein', '==', currencyId),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          currencyDetails.push(querySnapshot.docs[0].data());
        }
      }
      return currencyDetails;
    } catch (error) {
      console.error('Erro ao buscar detalhes das moedas:', error);
      return [];
    }
  };

  // Busca as moedas padrão (USD-BRL, EUR-BRL, BTC-BRL) no Firebase
  const fetchDefaultCurrencies = async () => {
    try {
      const currenciesToFetch = ['USD-BRL', 'EUR-BRL', 'BTC-BRL'];
      const latestCurrencies = [];

      for (const currency of currenciesToFetch) {
        const q = query(
          collection(database, 'coins'),
          where('code_codein', '==', currency),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          latestCurrencies.push(querySnapshot.docs[0].data());
        }
      }

      setDefaultCurrencies(latestCurrencies);
      console.log("Moedas padrões carregadas:", latestCurrencies);
    } catch (error) {
      console.error('Erro ao buscar moedas padrão:', error);
    }
  };

  // Busca as notícias financeiras em tempo real
  const fetchNews = () => {
    try {
      const collectionRef = collection(database, 'chats');
      const q = query(collectionRef, where('user._id', '==', 0), orderBy('createdAt', 'desc'), limit(3));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newNews = querySnapshot.docs.map(doc => ({
          id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
          image: doc.data().image,
          title: doc.data().title,
          description: doc.data().description,
          score: doc.data().score,
          tier: doc.data().tier,
        }));

        setNews(newNews);
        console.log("Notícias carregadas:", newNews);
      });

      return unsubscribe; // Retorna a função de unsubscribe para limpar o listener
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    }
  };

  // Busca a análise de desempenho em tempo real
  const fetchPerformanceAnalysis = () => {
    try {
      const collectionRef = collection(database, 'predictAnalysis');
      const q = query(collectionRef, orderBy('createdAt', 'desc'), limit(1));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const performanceData = querySnapshot.docs[0].data();
          performanceData.id = querySnapshot.docs[0].id; // Adiciona o ID do documento
          console.log("Performance Data:", performanceData);
          setPerformanceAnalysis(performanceData);
        }
      });

      return unsubscribe; // Retorna a função de unsubscribe para limpar o listener
    } catch (error) {
      console.error('Erro ao buscar análise de desempenho:', error);
    }
  };

  // Atualiza os favoritos em tempo real
  useEffect(() => {
    const userEmail = auth.currentUser.email;
    const q = query(
      collection(database, 'coinFavorites'),
      where('user.id', '==', userEmail),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const favorites = querySnapshot.docs.map(doc => doc.data().currencyId);
      console.log("Moedas favoritas atualizadas em tempo real:", favorites);

      if (favorites.length === 0) {
        setFavoriteCurrencies([]);
        await fetchDefaultCurrencies();
      } else {
        const favoriteDetails = await fetchCurrencyDetails(favorites);
        setFavoriteCurrencies(favoriteDetails);
      }
    });

    return () => unsubscribe();
  }, []);

  // Busca os dados ao carregar a tela
  useEffect(() => {
    let unsubscribeNews;
    let unsubscribePerformanceAnalysis;

    const loadData = async () => {
      await fetchFavoriteCurrencies();
      await fetchFavoriteStocks(); // Busca as ações favoritas
      unsubscribeNews = fetchNews(); // Inicia o listener de notícias
      unsubscribePerformanceAnalysis = fetchPerformanceAnalysis(); // Inicia o listener de análise de desempenho
    };

    loadData();

    // Limpa os listeners quando o componente é desmontado
    return () => {
      if (unsubscribeNews) unsubscribeNews();
      if (unsubscribePerformanceAnalysis) unsubscribePerformanceAnalysis();
    };
  }, []);

  // Renderiza cada item do menu
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate(item.navigate)} style={[styles.menuItem, { backgroundColor: currentTheme.cardBackground }]}>
      <FontAwesome6 name={item.icon} size={20} color={currentTheme.text} />
      <Text style={[styles.menuItemText, { color: currentTheme.text }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Renderiza cada moeda (favorita ou padrão)
  const renderCurrency = (item) => {
    const averagePrice = (parseFloat(item.bid) + parseFloat(item.ask)) / 2;
    const formattedPrice = averagePrice.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const formattedIcon = item.code.toLowerCase();

    return (
      <View key={item.code_codein} style={[styles.assetItem, { backgroundColor: currentTheme.cardBackground }]}>
        <FontAwesome style={[styles.assetIcon]} name={formattedIcon} size={24} color={currentTheme.text} />
        <Text style={[styles.assetName, { color: currentTheme.text }]}>{item.code}/{item.codein}</Text>
        <Text style={[styles.assetValue, { color: currentTheme.text }]}>{formattedPrice}</Text>
        <Text style={[styles.assetChange, { color: item.pctChange.includes("-") ? currentTheme.negativeColor : item.pctChange == 0 ? currentTheme.text : currentTheme.positiveColor }]}>
          {item.pctChange}%
        </Text>
      </View>
    );
  };

  // Renderiza cada ação favorita
  const renderStock = (item) => {
    const formattedPrice = item.price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return (
      <View key={item.symbol} style={[styles.assetItem, { backgroundColor: currentTheme.cardBackground }]}>
        <SvgUri viewBox="0 0 60 60"
          uri={item.logourl}
          width={24}
          height={24}
          preserveAspectRatio="xMidYMid meet"
        />
        <Text style={[styles.assetName, { color: currentTheme.text  }]}>{item.symbol}</Text>
        <Text style={[styles.assetValue, { color: currentTheme.text }]}>{formattedPrice}</Text>
        <Text style={[styles.assetChange, { color: item.regularMarketChangePercent >= 0 ? currentTheme.positiveColor : currentTheme.negativeColor }]}>
          {item.regularMarketChangePercent.toFixed(2)}%
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background, paddingTop: insets.top }]}>
      <StatusBar backgroundColor={currentTheme.headerBackground} barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.header, { backgroundColor: currentTheme.headerBackground }]}>
          {/* <Text style={[styles.balanceLabel, { color: currentTheme.headerText }]}>Valor da Carteira</Text>
          <Text style={[styles.balanceValue, { color: currentTheme.headerText }]}>R$ 85.000,00</Text>
          <Text style={[styles.balanceChange, { color: currentTheme.positiveColor }]}>+1.8% hoje</Text> */}
        </View>

        <View style={styles.section}>
          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id}
            numColumns={3}
            scrollEnabled={false}
          />
        </View>

        {/* Nova seção: Ações Favoritas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Ações Favoritas</Text>
          {favoriteStocks.length > 0 ? (
            favoriteStocks.map((stock) => (
              <View key={stock.symbol}>
                {renderStock(stock)}
              </View>
            ))
          ) : (
            <Text style={{ color: currentTheme.text }}>Nenhuma ação favorita encontrada.</Text>
          )}
        </View>

        {/* Seção: Ativos Favoritos (Moedas) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Ativos Favoritos</Text>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            favoriteCurrencies.length > 0
              ? favoriteCurrencies.map((currency) => (
                  <View key={currency.code_codein}>
                    {renderCurrency(currency)}
                  </View>
                ))
              : defaultCurrencies.map((currency) => (
                  <View key={currency.code_codein}>
                    {renderCurrency(currency)}
                  </View>
                ))
          )}
        </View>

        {/* Seção: Análise de Desempenho */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Indicador de Mercado</Text>
          {performanceAnalysis ? (
            <View style={[styles.performanceItem, { backgroundColor: currentTheme.cardBackground }]}>
              {(() => {
                const tendencia = (performanceAnalysis.analysis.tendencia || '').toUpperCase(); // Acessa corretamente o campo tendencia
                console.log("A TENDENCIA É: ", tendencia); // Log para depuração

                if (tendencia.includes('POSITIVO')) {
                  return <AntDesign name="caretup" size={24} color={currentTheme.positiveColor} style={{ marginRight: 16 }} />;
                } else if (tendencia.includes('NEGATIVO')) {
                  return <AntDesign name="caretdown" size={24} color={currentTheme.negativeColor} style={{ marginRight: 16 }} />;
                } else {
                  return <AntDesign name="minus" size={24} color={currentTheme.stable} style={{ marginRight: 16 }} />;
                }
              })()}
              <View style={styles.performanceContent}>
                <Text style={[styles.newsDate, { color: currentTheme.secondaryTextColor }]}>
                  {(() => {
                    // Converte a string ISO para um objeto Date (UTC)
                    const dateUTC = new Date(performanceAnalysis.createdAt);

                    // Ajusta para UTC-3 (Brasília)
                    const dateUTCMinus3 = new Date(dateUTC.getTime() - 3 * 60 * 60 * 1000);

                    // Formata a data no padrão brasileiro
                    return dateUTCMinus3.toLocaleString('pt-BR', {
                      hour12: false, // Usar formato 24 horas
                      day: '2-digit', // Dia com dois dígitos
                      month: '2-digit', // Mês com dois dígitos
                      year: 'numeric', // Ano com quatro dígitos
                      hour: '2-digit', // Hora com dois dígitos
                      minute: '2-digit', // Minuto com dois dígitos
                      second: '2-digit', // Segundo com dois dígitos
                    });
                  })()}
                </Text>
                <Text style={[styles.performanceValue, { color: currentTheme.text }]}>
                  {performanceAnalysis.analysis.impacto}
                </Text>
                <Text style={[styles.performanceAnalysis, { color: currentTheme.secondaryTextColor }]}>
                  {performanceAnalysis.analysis.interpretacao}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: currentTheme.text }}>Carregando análise de desempenho...</Text>
          )}
        </View>

        {/* Seção: Notícias Financeiras */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Notícias Financeiras</Text>
          <FlatList
            data={news}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.newsItem, { backgroundColor: currentTheme.cardBackground }]}>
                {item.tier.startsWith('POS') ? (
                  <AntDesign name="caretup" size={24} color={currentTheme.positiveColor} style={{ marginRight: 16 }} />
                ) : item.tier.startsWith('NEG') ? (
                  <AntDesign name="caretdown" size={24} color={currentTheme.negativeColor} style={{ marginRight: 16 }} />
                ) : (
                  <AntDesign name="minus" size={24} color={currentTheme.stable} style={{ marginRight: 16 }} />
                )}
                <View style={styles.newsContent}>
                  <Text style={[styles.newsDate, { color: currentTheme.secondaryTextColor }]}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  <Text style={[styles.newsTitle, { color: currentTheme.text }]}>{item.title}</Text>
                  <Text style={[styles.newsSource, { color: currentTheme.secondaryTextColor }]}>{item.score}</Text>
                </View>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <FooterNavigation />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 0,
    borderBottomColor: '#444444',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 18,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
  },
  balanceChange: {
    fontSize: 16,
    marginTop: 4,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  menuItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    padding: 8,
    borderRadius: 8,
    width: (screenWidth / 3) - 16,
    height: 80,
  },
  menuItemText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  assetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  stockIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  assetName: {
    fontSize: 14,
    flex: 2,
    alignItems: "flex-start",
  },
  assetValue: {
    fontSize: 14,
    flex: 2,
    alignItems: "flex-start",
  },
  assetChange: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    alignItems: "flex-end",
  },
  newsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
  },
  newsSource: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  performanceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  performanceContent: {
    flex: 1,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  performanceAnalysis: {
    fontSize: 14,
  },
});