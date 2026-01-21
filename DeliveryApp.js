// App para Entregadores (simplificado)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

export default function DeliveryApp() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Entregador</Text>
        <TouchableOpacity 
          style={[styles.onlineButton, isOnline && styles.onlineButtonActive]}
          onPress={() => setIsOnline(!isOnline)}
        >
          <Text style={styles.onlineButtonText}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isOnline ? (
        <View style={styles.content}>
          {currentOrder ? (
            <>
              <Text style={styles.orderTitle}>Entrega em andamento</Text>
              {/* Mapa e detalhes da entrega */}
            </>
          ) : (
            <View style={styles.waitingContainer}>
              <Ionicons name="time-outline" size={60} color="#ccc" />
              <Text style={styles.waitingText}>Aguardando pedidos...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.offlineContainer}>
          <Text>Ative o modo online para receber pedidos</Text>
        </View>
      )}
    </SafeAreaView>
  );
}