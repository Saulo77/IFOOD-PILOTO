// App para Restaurantes (simplificado)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminApp() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel do Restaurante</Text>
      </View>
      
      {/* Resumo */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Pedidos Hoje</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>R$ 856,90</Text>
          <Text style={styles.statLabel}>Faturamento</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Avaliação</Text>
        </View>
      </View>
      
      {/* Pedidos pendentes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pedidos Pendentes</Text>
        <FlatList
          data={orders}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text>Pedido #{item.id}</Text>
              <TouchableOpacity style={styles.acceptButton}>
                <Text style={styles.acceptButtonText}>Aceitar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}