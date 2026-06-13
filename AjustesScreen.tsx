import React from 'react';
import { View, Button, Alert } from 'react-native';
import { resetPedidos } from './utils/pedidoCounter';

export default function AjustesScreen({ navigation }: any) {
  const handleReset = async () => {
    await resetPedidos();
    Alert.alert("Contador reiniciado", "El próximo pedido será N1");
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
      <Button title="Reiniciar contador de pedidos" onPress={handleReset} />

      {/* Nuevo botón para abrir el editor */}
      <Button title="Editor de pedidos" onPress={() => navigation.navigate('Editor')} />
    </View>
  );
}