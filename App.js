// App do Cliente COMPLETO (React Native + Expo)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  RefreshControl
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const API_URL = 'http://SEU_IP:3000/api'; // Substitua pelo seu IP
const { width, height } = Dimensions.get('window');

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ==================== CONTEXTO ====================
const AuthContext = React.createContext();

// ==================== COMPONENTES ====================
function CategoryButton({ name, icon, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.categoryBtn, active && styles.categoryBtnActive]} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? '#fff' : '#666'} />
      <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{name}</Text>
    </TouchableOpacity>
  );
}

function RestaurantCard({ restaurant, onPress, isFavorite, onToggleFavorite }) {
  return (
    <TouchableOpacity style={styles.restaurantCard} onPress={onPress}>
      <View style={styles.restaurantImageContainer}>
        <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
        <TouchableOpacity 
          style={styles.favoriteBtn} 
          onPress={() => onToggleFavorite(restaurant._id)}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isFavorite ? '#EA1D2C' : '#fff'} 
          />
        </TouchableOpacity>
        {restaurant.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Destaque</Text>
          </View>
        )}
      </View>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <Text style={styles.restaurantCategory}>{restaurant.category}</Text>
        <View style={styles.restaurantDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{restaurant.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({restaurant.ratingCount})</Text>
          </View>
          <Text style={styles.deliveryTime}>⏱ {restaurant.deliveryTime}</Text>
          <Text style={styles.deliveryFee}>
            {restaurant.deliveryFee > 0 ? `R$ ${restaurant.deliveryFee.toFixed(2)}` : 'Grátis'}
          </Text>
        </View>
        {restaurant.promoText && (
          <Text style={styles.promoText}>🎁 {restaurant.promoText}</Text>
        )}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, restaurant.isOpen ? styles.open : styles.closed]} />
          <Text style={styles.statusText}>{restaurant.isOpen ? 'Aberto agora' : 'Fechado'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <View style={styles.productCard}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>R$ {product.price.toFixed(2)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>R$ {product.originalPrice.toFixed(2)}</Text>
            )}
            {product.isPromo && (
              <View style={styles.promoBadge}>
                <Text style={styles.promoText}>PROMO</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={() => onAdd(product)}>
          <Text style={styles.addToCartText}>Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==================== TELAS ====================
function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('Auth');
    }, 2000);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Ionicons name="fast-food" size={80} color="#EA1D2C" />
      <Text style={styles.splashTitle}>FoodFast</Text>
      <Text style={styles.splashSubtitle}>Delivery de Comida</Text>
    </View>
  );
}

function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const body = isLogin ? { email, password } : { name, email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        // Simular salvamento do token
        Alert.alert('Sucesso', isLogin ? 'Login realizado!' : 'Cadastro realizado!');
        navigation.navigate('MainTabs', { user: data.user });
      } else {
        Alert.alert('Erro', data.error || 'Ocorreu um erro');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <ScrollView contentContainerStyle={styles.authContent}>
        <View style={styles.authHeader}>
          <Ionicons name="fast-food" size={60} color="#EA1D2C" />
          <Text style={styles.authTitle}>FoodFast</Text>
          <Text style={styles.authSubtitle}>Delivery de Comida</Text>
        </View>
        
        <View style={styles.authForm}>
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Nome completo"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>
          
          <TouchableOpacity
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Entrar' : 'Cadastrar'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchText}>
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.authFooter}>
          <Text style={styles.footerText}>Ou continue com</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.skipText}>Continuar sem login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeScreen({ navigation }) {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadData();
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log('Erro ao obter localização:', error);
    }
  };

  const loadData = async () => {
    try {
      const [restaurantsRes] = await Promise.all([
        fetch(`${API_URL}/restaurants`),
      ]);
      
      const restaurantsData = await restaurantsRes.json();
      setRestaurants(restaurantsData);
      
      // Extrair categorias únicas
      const uniqueCategories = ['Todos', ...new Set(restaurantsData.map(r => r.category))];
      setCategories(uniqueCategories.slice(0, 8));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesCategory = selectedCategory === 'Todos' || restaurant.category === selectedCategory;
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = async (restaurantId) => {
    try {
      // Simular toggle de favorito
      if (favorites.includes(restaurantId)) {
        setFavorites(favorites.filter(id => id !== restaurantId));
      } else {
        setFavorites([...favorites, restaurantId]);
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EA1D2C" />
        <Text style={styles.loadingText}>Carregando restaurantes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={20} color="#EA1D2C" />
          <View>
            <Text style={styles.locationLabel}>Entregar em</Text>
            <Text style={styles.locationText}>Rua Exemplo, 123 • Alterar</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#333" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar restaurantes ou produtos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categorias */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category, index) => (
            <CategoryButton
              key={index}
              name={category}
              icon={getCategoryIcon(category)}
              active={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Filtrar</Text>
          <Ionicons name="filter-outline" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Ordenar</Text>
          <Ionicons name="swap-vertical-outline" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Entrega Grátis</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de restaurantes */}
      <FlatList
        data={filteredRestaurants}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => navigation.navigate('Restaurant', { restaurant: item })}
            isFavorite={favorites.includes(item._id)}
            onToggleFavorite={toggleFavorite}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.restaurantList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum restaurante encontrado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function RestaurantScreen({ navigation, route }) {
  const { restaurant } = route.params;
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tudo');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurant._id}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    
    Alert.alert('Adicionado!', `${product.name} adicionado ao carrinho`);
  };

  const categories = ['Tudo', ...new Set(products.map(p => p.category))];
  const filteredProducts = activeCategory === 'Tudo' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com imagem do restaurante */}
      <View style={styles.restaurantHeader}>
        <Image source={{ uri: restaurant.image }} style={styles.restaurantHeaderImage} />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.restaurantHeaderOverlay}>
          <Text style={styles.restaurantHeaderName}>{restaurant.name}</Text>
          <View style={styles.restaurantHeaderDetails}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCountText}>({restaurant.ratingCount})</Text>
            </View>
            <Text style={styles.headerDetail}>• {restaurant.category}</Text>
            <Text style={styles.headerDetail}>• {restaurant.deliveryTime}</Text>
          </View>
          <Text style={styles.restaurantStatus}>
            {restaurant.isOpen ? '🟢 Aberto agora' : '🔴 Fechado'}
          </Text>
        </View>
      </View>

      {/* Categorias do cardápio */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.menuCategories}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCategoryBtn, activeCategory === category && styles.menuCategoryBtnActive]}
            onPress={() => setActiveCategory(category)}
          >
            <Text style={[styles.menuCategoryText, activeCategory === category && styles.menuCategoryTextActive]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de produtos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ProductCard product={item} onAdd={addToCart} />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="fast-food-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
            </View>
          }
        />
      )}

      {/* Carrinho flutuante */}
      {itemCount > 0 && (
        <View style={styles.floatingCart}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartItemCount}>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</Text>
            <Text style={styles.cartTotal}>R$ {cartTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewCartButton}
            onPress={() => navigation.navigate('Cart', { cart, restaurant })}
          >
            <Text style={styles.viewCartText}>Ver carrinho</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function CartScreen({ navigation, route }) {
  const [cart, setCart] = useState(route.params?.cart || []);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = 5.99;
  const total = subtotal + deliveryFee - discount;

  const updateQuantity = (productId, change) => {
    setCart(prev => prev.map(item => {
      if (item._id === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/coupons/validate/${couponCode}`);
      if (response.ok) {
        const coupon = await response.json();
        if (subtotal >= coupon.minOrder) {
          let discountValue = 0;
          if (coupon.discountType === 'percentage') {
            discountValue = subtotal * (coupon.discountValue / 100);
          } else {
            discountValue = coupon.discountValue;
          }
          setDiscount(discountValue);
          Alert.alert('Sucesso!', `Cupom aplicado: R$ ${discountValue.toFixed(2)} de desconto`);
        } else {
          Alert.alert('Erro', `Pedido mínimo: R$ ${coupon.minOrder.toFixed(2)}`);
        }
      } else {
        Alert.alert('Erro', 'Cupom inválido ou expirado');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível validar o cupom');
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Erro', 'Selecione um endereço de entrega');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Erro', 'Seu carrinho está vazio');
      return;
    }

    const orderData = {
      restaurantId: route.params?.restaurant?._id,
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      address: selectedAddress,
      paymentMethod,
      couponCode: discount > 0 ? couponCode : undefined,
      subtotal,
      deliveryFee,
      discount,
      total
    };

    try {
      Alert.alert(
        'Confirmar pedido',
        `Total: R$ ${total.toFixed(2)}\n\nEndereço: ${selectedAddress.street}, ${selectedAddress.number}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Confirmar', 
            onPress: async () => {
              const response = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer token' // Adicionar token real
                },
                body: JSON.stringify(orderData)
              });

              if (response.ok) {
                const order = await response.json();
                Alert.alert(
                  'Pedido realizado!',
                  `Seu pedido #${order._id.slice(-6)} foi confirmado. Tempo estimado: ${route.params?.restaurant?.deliveryTime}`,
                  [{ text: 'OK', onPress: () => navigation.navigate('Orders') }]
                );
                setCart([]);
              } else {
                Alert.alert('Erro', 'Não foi possível realizar o pedido');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrinho</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.cartContent}>
        {/* Itens do carrinho */}
        {cart.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyCartText}>Seu carrinho está vazio</Text>
            <TouchableOpacity 
              style={styles.continueShoppingButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.continueShoppingText}>Continuar comprando</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.cartItems}>
              {cart.map(item => (
                <View key={item._id} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>R$ {item.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item._id, -1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item._id, 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cartItemTotal}>
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Cupom */}
            <View style={styles.couponContainer}>
              <Text style={styles.sectionTitle}>Cupom de desconto</Text>
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Digite o código do cupom"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.applyCouponButton} onPress={applyCoupon}>
                  <Text style={styles.applyCouponText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
              {discount > 0 && (
                <View style={styles.discountApplied}>
                  <Text style={styles.discountText}>Desconto aplicado: R$ {discount.toFixed(2)}</Text>
                  <TouchableOpacity onPress={() => setDiscount(0)}>
                    <Ionicons name="close-circle" size={20} color="#EA1D2C" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Endereço */}
            <View style={styles.addressSection}>
              <Text style={styles.sectionTitle}>Endereço de entrega</Text>
              <TouchableOpacity 
                style={styles.addAddressButton}
                onPress={() => Alert.alert('Adicionar endereço', 'Funcionalidade em desenvolvimento')}
              >
                <Ionicons name="add-circle-outline" size={20} color="#EA1D2C" />
                <Text style={styles.addAddressText}>Adicionar novo endereço</Text>
              </TouchableOpacity>
              
              {/* Endereços salvos */}
              <TouchableOpacity style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <Ionicons name="home-outline" size={20} color="#666" />
                  <Text style={styles.addressTitle}>Casa</Text>
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Padrão</Text>
                  </View>
                </View>
                <Text style={styles.addressText}>Rua das Flores, 123</Text>
                <Text style={styles.addressText}>Centro, São Paulo - SP</Text>
              </TouchableOpacity>
            </View>

            {/* Pagamento */}
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Forma de pagamento</Text>
              {['credit_card', 'debit_card', 'cash', 'pix'].map(method => (
                <TouchableOpacity
                  key={method}
                  style={[styles.paymentMethod, paymentMethod === method && styles.paymentMethodSelected]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <View style={styles.paymentMethodInfo}>
                    <Ionicons 
                      name={
                        method === 'credit_card' ? 'card-outline' :
                        method === 'debit_card' ? 'card-outline' :
                        method === 'cash' ? 'cash-outline' : 'qr-code-outline'
                      } 
                      size={24} 
                      color={paymentMethod === method ? '#EA1D2C' : '#666'} 
                    />
                    <Text style={[styles.paymentMethodText, paymentMethod === method && styles.paymentMethodTextSelected]}>
                      {method === 'credit_card' ? 'Cartão de crédito' :
                       method === 'debit_card' ? 'Cartão de débito' :
                       method === 'cash' ? 'Dinheiro' : 'PIX'}
                    </Text>
                  </View>
                  {paymentMethod === method && (
                    <Ionicons name="checkmark-circle" size={24} color="#EA1D2C" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Resumo */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Resumo do pedido</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>R$ {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxa de entrega</Text>
                <Text style={styles.summaryValue}>R$ {deliveryFee.toFixed(2)}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, styles.discountLabel]}>Desconto</Text>
                  <Text style={[styles.summaryValue, styles.discountValue]}>- R$ {discount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Botão finalizar */}
      {cart.length > 0 && (
        <View style={styles.checkoutFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>R$ {total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={placeOrder}>
            <Text style={styles.checkoutButtonText}>Finalizar pedido</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Simular chamada API
      const mockOrders = [
        {
          _id: '1',
          restaurantId: { name: 'Burguer King', image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9' },
          status: 'on_the_way',
          total: 42.90,
          createdAt: new Date(Date.now() - 30*60000),
          estimatedDeliveryTime: new Date(Date.now() + 15*60000)
        },
        {
          _id: '2',
          restaurantId: { name: 'Pizza Hut', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
          status: 'delivered',
          total: 67.50,
          createdAt: new Date(Date.now() - 2*24*60*60000),
          rating: 5
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: 'Pendente', color: '#FFA500', icon: 'time-outline' },
      preparing: { label: 'Preparando', color: '#3498db', icon: 'restaurant-outline' },
      ready: { label: 'Pronto', color: '#2ecc71', icon: 'checkmark-circle-outline' },
      on_the_way: { label: 'A caminho', color: '#9b59b6', icon: 'bicycle-outline' },
      delivered: { label: 'Entregue', color: '#27ae60', icon: 'checkmark-done-outline' },
      cancelled: { label: 'Cancelado', color: '#e74c3c', icon: 'close-circle-outline' }
    };
    return statuses[status] || statuses.pending;
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
      </View>

      {/* Tabs */}
      <View style={styles.ordersTabs}>
        <TouchableOpacity
          style={[styles.orderTab, activeTab === 'active' && styles.orderTabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.orderTabText, activeTab === 'active' && styles.orderTabTextActive]}>
            Em andamento ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.orderTab, activeTab === 'history' && styles.orderTabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.orderTabText, activeTab === 'history' && styles.orderTabTextActive]}>
            Histórico ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA1D2C" />
        </View>
      ) : displayedOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={activeTab === 'active' ? 'time-outline' : 'receipt-outline'} 
            size={60} 
            color="#ccc" 
          />
          <Text style={styles.emptyText}>
            {activeTab === 'active' ? 'Nenhum pedido em andamento' : 'Nenhum pedido no histórico'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedOrders}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            const isActive = item.status === 'on_the_way';
            
            return (
              <TouchableOpacity style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Image source={{ uri: item.restaurantId.image }} style={styles.orderRestaurantImage} />
                  <View style={styles.orderRestaurantInfo}>
                    <Text style={styles.orderRestaurantName}>{item.restaurantId.name}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                    <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.orderDetails}>
                  <View style={styles.orderTotalContainer}>
                    <Text style={styles.orderTotalLabel}>Total:</Text>
                    <Text style={styles.orderTotalValue}>R$ {item.total.toFixed(2)}</Text>
                  </View>
                  
                  {isActive && (
                    <View style={styles.trackingContainer}>
                      <View style={styles.trackingBar}>
                        {['Preparando', 'A caminho', 'Entregue'].map((step, index) => (
                          <View key={step} style={styles.trackingStep}>
                            <View style={[
                              styles.trackingDot,
                              index <= (item.status === 'on_the_way' ? 1 : 0) && styles.trackingDotActive
                            ]} />
                            <Text style={styles.trackingStepText}>{step}</Text>
                          </View>
                        ))}
                      </View>
                      {item.estimatedDeliveryTime && (
                        <Text style={styles.etaText}>
                          Chega em {Math.max(0, Math.round((item.estimatedDeliveryTime - new Date()) / 60000))} min
                        </Text>
                      )}
                    </View>
                  )}
                  
                  {item.status === 'delivered' && item.rating && (
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratedText}>Você avaliou:</Text>
                      <View style={styles.starsContainer}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons 
                            key={i} 
                            name={i < item.rating ? 'star' : 'star-outline'} 
                            size={16} 
                            color="#FFD700" 
                          />
                        ))}
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.orderActions}>
                    {isActive && (
                      <>
                        <TouchableOpacity style={styles.actionButton}>
                          <Ionicons name="chatbubble-outline" size={20} color="#666" />
                          <Text style={styles.actionButtonText}>Ajuda</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                          <Ionicons name="location-outline" size={20} color="#666" />
                          <Text style={styles.actionButtonText}>Rastrear</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity style={[styles.actionButton, styles.reorderButton]}>
                      <Ionicons name="refresh-outline" size={20} color="#EA1D2C" />
                      <Text style={[styles.actionButtonText, styles.reorderButtonText]}>Pedir novamente</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.ordersList}
        />
      )}
    </SafeAreaView>
  );
}

function ProfileScreen() {
  const [user, setUser] = useState({
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    loyaltyPoints: 1250
  });
  const [addresses, setAddresses] = useState([
    { id: '1', title: 'Casa', address: 'Rua das Flores, 123', isDefault: true },
    { id: '2', title: 'Trabalho', address: 'Av. Paulista, 1000' }
  ]);

  const menuItems = [
    { icon: 'person-outline', label: 'Meus dados', screen: 'EditProfile' },
    { icon: 'location-outline', label: 'Meus endereços', screen: 'Addresses' },
    { icon: 'card-outline', label: 'Formas de pagamento', screen: 'PaymentMethods' },
    { icon: 'heart-outline', label: 'Favoritos', screen: 'Favorites' },
    { icon: 'ticket-outline', label: 'Cupons', screen: 'Coupons' },
    { icon: 'star-outline', label: 'Avaliações', screen: 'Reviews' },
    { icon: 'help-circle-outline', label: 'Ajuda', screen: 'Help' },
    { icon: 'settings-outline', label: 'Configurações', screen: 'Settings' },
    { icon: 'log-out-outline', label: 'Sair', action: () => Alert.alert('Sair', 'Deseja sair da conta?') }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.profileContent}>
        {/* Header do perfil */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editPhotoButton}>
              <Ionicons name="camera-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          
          {/* Pontos de fidelidade */}
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyInfo}>
              <Ionicons name="trophy-outline" size={24} color="#FFD700" />
              <View style={styles.loyaltyDetails}>
                <Text style={styles.loyaltyTitle}>Programa Fidelidade</Text>
                <Text style={styles.loyaltyPoints}>{user.loyaltyPoints} pontos</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.redeemButton}>
              <Text style={styles.redeemButtonText}>Resgatar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Endereços rápidos */}
        <View style={styles.addressesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Endereços salvos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {addresses.map(address => (
              <TouchableOpacity key={address.id} style={styles.addressCard}>
                <View style={styles.addressCardHeader}>
                  <Ionicons name={address.title === 'Casa' ? 'home-outline' : 'business-outline'} size={20} color="#666" />
                  <Text style={styles.addressCardTitle}>{address.title}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Padrão</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressCardText} numberOfLines={2}>{address.address}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addAddressCard}>
              <Ionicons name="add-circle-outline" size={30} color="#EA1D2C" />
              <Text style={styles.addAddressCardText}>Adicionar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action || (() => console.log(`Navegar para ${item.screen}`))}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={22} color="#666" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Estatísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Minhas estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="fast-food-outline" size={30} color="#EA1D2C" />
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="restaurant-outline" size={30} color="#3498db" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Restaurantes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star-outline" size={30} color="#FFD700" />
              <Text style={styles.statNumber}>38</Text>
              <Text style={styles.statLabel}>Avaliações</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== NAVEGAÇÃO ====================
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EA1D2C',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Search" component={HomeScreen} options={{ title: 'Buscar' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Pedidos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

// ==================== APP PRINCIPAL ====================
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==================== FUNÇÕES AUXILIARES ====================
function getCategoryIcon(category) {
  const icons = {
    'Fast Food': 'fast-food-outline',
    'Pizza': 'pizza-outline',
    'Japonesa': 'fish-outline',
    'Brasileira': 'restaurant-outline',
    'Italiana': 'wine-outline',
    'Chinesa': 'basket-outline',
    'Lanches': 'burger-outline',
    'Saudável': 'leaf-outline',
    'Doces': 'ice-cream-outline',
    'Todos': 'apps-outline'
  };
  return icons[category] || 'restaurant-outline';
}

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  
  // Splash Screen
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  splashTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#EA1D2C',
    marginTop: 20
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5
  },
  
  // Auth Screen
  authContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  authContent: {
    padding: 20,
    paddingTop: 60
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EA1D2C',
    marginTop: 10
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5
  },
  authForm: {
    marginBottom: 30
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333'
  },
  authButton: {
    backgroundColor: '#EA1D2C',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  authButtonDisabled: {
    backgroundColor: '#ff6b6b'
  },
  authButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10
  },
  switchButton: {
    alignItems: 'center',
    padding: 15
  },
  switchText: {
    color: '#EA1D2C',
    fontSize: 16,
    fontWeight: '500'
  },
  authFooter: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20
  },
  footerText: {
    color: '#666',
    marginBottom: 15
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333'
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 20
  },
  skipText: {
    color: '#666',
    fontSize: 14
  },
  
  // Home Screen
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5
  },
  cartButton: {
    position: 'relative',
    padding: 8
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EA1D2C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333'
  },
  categoriesContainer: {
    paddingVertical: 10,
    backgroundColor: '#fff'
  },
  categoryBtn: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f5'
  },
  categoryBtnActive: {
    backgroundColor: '#EA1D2C'
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666'
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 10
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    gap: 5
  },
  filterText: {
    fontSize: 14,
    color: '#666'
  },
  restaurantList: {
    padding: 20
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  restaurantImageContainer: {
    position: 'relative',
    height: 150
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 5
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  featuredText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333'
  },
  restaurantInfo: {
    padding: 15
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  restaurantCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 3,
    marginRight: 3
  },
  ratingCount: {
    fontSize: 12,
    color: '#999'
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666'
  },
  deliveryFee: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600'
  },
  promoText: {
    fontSize: 12,
    color: '#EA1D2C',
    marginTop: 5,
    fontWeight: '500'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5
  },
  open: {
    backgroundColor: '#2ecc71'
  },
  closed: {
    backgroundColor: '#e74c3c'
  },
  statusText: {
    fontSize: 12,
    color: '#666'
  },
  
  // Restaurant Screen
  restaurantHeader: {
    height: 200,
    position: 'relative'
  },
  restaurantHeaderImage: {
    width: '100%',
    height: '100%'
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5
  },
  restaurantHeaderOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15
  },
  restaurantHeaderName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  restaurantHeaderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 10
  },
  ratingText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 3
  },
  ratingCountText: {
    fontSize: 12,
    color: '#ccc'
  },
  headerDetail: {
    fontSize: 14,
    color: '#ccc'
  },
  restaurantStatus: {
    fontSize: 14,
    color: '#2ecc71',
    marginTop: 5,
    fontWeight: '600'
  },
  menuCategories: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff'
  },
  menuCategoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5'
  },
  menuCategoryBtnActive: {
    backgroundColor: '#EA1D2C'
  },
  menuCategoryText: {
    fontSize: 14,
    color: '#666'
  },
  menuCategoryTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  productList: {
    padding: 15
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between'
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 5
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through'
  },
  promoBadge: {
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  promoText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold'
  },
  addToCartBtn: {
    backgroundColor: '#EA1D2C',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: 'flex-start'
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  floatingCart: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cartInfo: {
    flex: 1
  },
  cartItemCount: {
    fontSize: 14,
    color: '#666'
  },
  cartTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  viewCartButton: {
    backgroundColor: '#EA1D2C',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  viewCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  
  // Cart Screen
  cartContent: {
    padding: 20,
    paddingBottom: 100
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30
  },
  continueShoppingButton: {
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  cartItems: {
    marginBottom: 20
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 10
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 10
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10
  },
  couponContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: 10
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16
  },
  applyCouponButton: {
    backgroundColor: '#EA1D2C',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  applyCouponText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  discountApplied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 8
  },
  discountText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600'
  },
  addressSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 15
  },
  addAddressText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#EA1D2C',
    fontWeight: '500'
  },
  addressCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  defaultBadge: {
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold'
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  paymentSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10
  },
  paymentMethodSelected: {
    borderColor: '#EA1D2C',
    backgroundColor: '#fff5f5'
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333'
  },
  paymentMethodTextSelected: {
    color: '#EA1D2C',
    fontWeight: '600'
  },
  summarySection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666'
  },
  summaryValue: {
    fontSize: 16,
    color: '#333'
  },
  discountLabel: {
    color: '#2ecc71'
  },
  discountValue: {
    color: '#2ecc71',
    fontWeight: '600'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EA1D2C'
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalContainer: {
    flex: 1
  },
  footerTotalLabel: {
    fontSize: 14,
    color: '#666'
  },
  footerTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  checkoutButton: {
    backgroundColor: '#EA1D2C',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  
  // Orders Screen
  ordersTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  orderTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  orderTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#EA1D2C'
  },
  orderTabText: {
    fontSize: 16,
    color: '#666'
  },
  orderTabTextActive: {
    color: '#EA1D2C',
    fontWeight: '600'
  },
  ordersList: {
    padding: 20
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  orderHeader: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  orderRestaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 10
  },
  orderRestaurantInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center'
  },
  orderRestaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  orderDetails: {
    padding: 15
  },
  orderTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  orderTotalLabel: {
    fontSize: 16,
    color: '#666'
  },
  orderTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  trackingContainer: {
    marginBottom: 15
  },
  trackingBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  trackingStep: {
    alignItems: 'center',
    flex: 1
  },
  trackingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginBottom: 5
  },
  trackingDotActive: {
    backgroundColor: '#EA1D2C'
  },
  trackingStepText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center'
  },
  etaText: {
    fontSize: 14,
    color: '#EA1D2C',
    fontWeight: '600',
    textAlign: 'center'
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10
  },
  ratedText: {
    fontSize: 14,
    color: '#666'
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    gap: 5
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666'
  },
  reorderButton: {
    flex: 1,
    borderColor: '#EA1D2C'
  },
  reorderButtonText: {
    color: '#EA1D2C',
    fontWeight: '600'
  },
  
  // Profile Screen
  profileContent: {
    paddingBottom: 30
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#EA1D2C',
    borderRadius: 15,
    padding: 5
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  loyaltyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    width: '100%'
  },
  loyaltyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  loyaltyDetails: {
    flex: 1
  },
  loyaltyTitle: {
    fontSize: 14,
    color: '#666'
  },
  loyaltyPoints: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  redeemButton: {
    backgroundColor: '#EA1D2C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  addressesSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  seeAllText: {
    color: '#EA1D2C',
    fontSize: 14
  },
  addressCard: {
    width: 200,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginRight: 10
  },
  addressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8
  },
  addressCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  addressCardText: {
    fontSize: 14,
    color: '#666'
  },
  addAddressCard: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 10,
    marginRight: 10
  },
  addAddressCardText: {
    marginTop: 5,
    fontSize: 12,
    color: '#EA1D2C'
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 20
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  menuItemText: {
    fontSize: 16,
    color: '#333'
  },
  statsSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginHorizontal: 5
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  
  // Utilitários
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  }
});