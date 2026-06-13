import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from './supabaseClient';

const EditorScreen: React.FC = ({ navigation }: any) => {
  const [ventas, setVentas] = useState<any[]>([]);

  useEffect(() => {
    const fetchVentas = async () => {
      const { data, error } = await supabase.from('ventas').select('*');
      if (!error) setVentas(data || []);
    };
    fetchVentas();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.row} 
      onPress={() => navigation.navigate('Productos', { pedidoEdit: item })}
    >
      <Text>ID: {item.id}</Text>
      <Text>Cliente: {item.cliente}</Text>
      <Text>Total: Bs {item.total}</Text>
      <Text>Fecha: {item.fecha}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editor de pedidos</Text>
      <FlatList
        data={ventas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  row: { padding: 15, borderBottomWidth: 1, borderColor: '#ccc' }
});

export default EditorScreen;