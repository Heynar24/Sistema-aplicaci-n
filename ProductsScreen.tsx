import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { supabase } from './supabaseClient';
import { imprimirVenta } from './printerUtils';
// @ts-ignore
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para ID incremental

// Función para obtener el siguiente ID de pedido incremental (persistente)
const obtenerSiguienteIdPedido = async (): Promise<number> => {
  try {
    const ultimoId = await AsyncStorage.getItem('ultimoIdPedido');
    const id = ultimoId ? parseInt(ultimoId, 10) + 1 : 1; // Empieza en 1 si no hay
    await AsyncStorage.setItem('ultimoIdPedido', id.toString());
    return id;
  } catch (e) {
    console.log("Error obteniendo ID de pedido:", e);
    return 1; // Fallback
  }
};

const categorias = [
  {
    nombre: "Pollo a la leña",
    productos: [
      { id: 1, nombre: "Económico con fideo a la leña", precio: 18 },
      { id: 2, nombre: "Económico sin fideo a la leña", precio: 16 },
      { id: 3, nombre: "1/4 pierna a la leña", precio: 28 },
      { id: 4, nombre: "1/4 pecho a la leña", precio: 32 },
      { id: 5, nombre: "1/2 pollo a la leña", precio: 55 },
      { id: 6, nombre: "Pollo entero a la leña", precio: 110 },
      { id: 7, nombre: "Económico con solo papa leña", precio: 16 },
      { id: 8, nombre: "Económico con solo fideo leña", precio: 18 },
    ],
  },
  {
    nombre: "Pollo a la broaster",
    productos: [
      { id: 9, nombre: "Super económico broaster", precio: 13 },
      { id: 10, nombre: "Económico broaster con fideo", precio: 18 },
      { id: 11, nombre: "Económico broaster", precio: 16 },
      { id: 12, nombre: "1/4 broaster", precio: 28 },
      { id: 13, nombre: "1/2 broaster", precio: 55 },
    ],
  },
  {
    nombre: "Salchipapas",
    productos: [{ id: 14, nombre: "Salchipapa clásica", precio: 16 }],
  },
  {
    nombre: "Porciones",
    productos: [
      { id: 15, nombre: "Porción de fideo", precio: 8 },
      { id: 16, nombre: "Porción de papa", precio: 8 },
      { id: 17, nombre: "Porción de arroz", precio: 8 },
    ],
  },
  {
    nombre: "Sodas",
    productos: [
      { id: 18, nombre: "Aqua-rius peque", precio: 5 },
      { id: 19, nombre: "Agua personal", precio: 6 },
      { id: 20, nombre: "Tropi-k personal", precio: 7 },
      { id: 21, nombre: "Jugo Tropi popular", precio: 7 },
      { id: 22, nombre: "Agua 990ml", precio: 8 },
      { id: 23, nombre: "Agua 2L", precio: 12 },
      { id: 24, nombre: "Jugo Tropi 1L", precio: 12 },
      { id: 25, nombre: "Jugo del Valle", precio: 12 },
      { id: 26, nombre: "Jugo Pura Vida", precio: 17 },
      { id: 27, nombre: "Aqua-rius 2L", precio: 16 },
      { id: 28, nombre: "Tropi-K 2L", precio: 17 },

      { id: 29, nombre: "Mini", precio: 3 },
      { id: 30, nombre: "Pop popular", precio: 4 }, 
      { id: 31, nombre: "Soda peque", precio: 5 },
      { id: 32, nombre: "Coca Cola personal", precio: 7 },
      { id: 33, nombre: "Salvietti personal", precio: 7 },
      { id: 34, nombre: "Popular Coca Cola", precio: 9 },
      { id: 35, nombre: "Popular Fanta", precio: 9 },
      { id: 36, nombre: "Popular Sprite", precio: 9 },
      { id: 37, nombre: "Mendocina 1L", precio: 9 },
      { id: 38, nombre: "Pepsi 1L", precio: 10 },
      { id: 39, nombre: "Coca Cola de 1.5L", precio: 12},
      { id: 40, nombre: "Cabaña", precio: 16},
      { id: 41, nombre: "Simba", precio: 16 },
      { id: 42, nombre: "Salvietti 2L", precio: 16 },
      { id: 43, nombre: "Coca Cola 2L", precio: 19},
      { id: 44, nombre: "Fanta 2L", precio: 19},
      { id: 45, nombre: "Sprite 2L", precio: 19 },
      { id: 46, nombre: "Salvietti 3L", precio: 20},
      { id: 47, nombre: "Coca Cola 3L", precio: 24 },
    ],
  },
];

const ProductsScreen: React.FC<{ route: any }> = ({ route }) => {
  const [categoriaActiva, setCategoriaActiva] = useState(categorias[0].nombre);
  const [pedido, setPedido] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [totalDia, setTotalDia] = useState(0);

  const [nombreCliente, setNombreCliente] = useState('');
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState('');

  // Estados nuevos para el indicador de carga
  const [isLoading, setIsLoading] = useState(false);
  const [tiempoImpresion, setTiempoImpresion] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null); // Corregido: En React Native, setInterval devuelve number, no NodeJS.Timeout
  
  // AGREGAR AQUÍ: useEffect para cargar pedido si viene de edición
  useEffect(() => {
  if (route.params?.pedidoEditar) {
    cargarPedidoParaEditar(route.params.pedidoEditar);
  }
  cargarTotalDia(); // Para recalcular totalDia al inicio
  }, [route.params]);

  // AGREGAR AQUÍ: Función para cargar pedido para editar
const cargarPedidoParaEditar = (pedidoEditar: any) => {
  setPedido(pedidoEditar.productos.reduce((acc: any, item: any) => {
    acc[item.id] = { producto: { id: item.id, nombre: item.nombre, precio: item.precio }, cantidad: item.cantidad };
    return acc;
  }, {}));
  setTotal(pedidoEditar.total);
  setNombreCliente(pedidoEditar.cliente);
  setModalidadSeleccionada(pedidoEditar.modalidad);
};

// AGREGAR AQUÍ: Función para recalcular totalDia desde Supabase
const cargarTotalDia = async () => {
  const fechaHoy = new Date().toISOString().split('T')[0];
  try {
    const { data, error } = await supabase
      .from('ventas')
      .select('total')
      .gte('fecha', fechaHoy + 'T00:00:00.000Z')
      .lt('fecha', new Date(fechaHoy + 'T23:59:59.999Z').toISOString());

    if (!error && data) {
      // Línea corregida
      const suma = data.reduce((sum: number, v: any) => sum + v.total, 0);
      setTotalDia(suma);
    }
  } catch (e) {
    console.log(e);
  }
};

  useEffect(() => {
  const cargarTotalDia = async () => {
    const guardado = await AsyncStorage.getItem('totalDia');
    if (guardado) setTotalDia(parseFloat(guardado));
  };
  cargarTotalDia();
  }, []);

  const agregarProducto = (producto: any) => {
    setPedido((prev: any) => {
      const actual = { ...prev };
      actual[producto.id]
        ? actual[producto.id].cantidad++
        : (actual[producto.id] = { producto, cantidad: 1 });
      return actual;
    });
    setTotal((prev) => prev + producto.precio);
  };

  const aumentarCantidad = (id: number) => {
    setPedido((prev: any) => {
      const actual = { ...prev };
      actual[id].cantidad += 1;
      setTotal(t => t + actual[id].producto.precio);
      return actual;
    });
  };

  const disminuirCantidad = (id: number) => {
    setPedido((prev: any) => {
      const actual = { ...prev };
      const precio = actual[id].producto.precio;
      actual[id].cantidad === 1 ? delete actual[id] : actual[id].cantidad--;
      setTotal((prev) => prev - precio);
      return actual;
    });
  };

  const reiniciarPedido = () => {
    setPedido({});
    setTotal(0);
    setNombreCliente('');
    setModalidadSeleccionada('');
  };

  const confirmarPedido = async () => {
    if (!modalidadSeleccionada || total === 0) {
      Alert.alert('Error', 'Selecciona modalidad, tipo de pago y agrega productos.');
      return;
    }
      setIsLoading(true);
      setTiempoImpresion(0);
      const startTime = Date.now();
      const id = setInterval(() => {
      setTiempoImpresion(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setIntervalId(id);


    // MODIFICADO: Detectar si es edición
    const esEdicion = route.params?.pedidoEditar;
    const idPedido = esEdicion ? route.params.pedidoEditar.id : await obtenerSiguienteIdPedido();

    const venta = {
      id: idPedido,
      cliente: nombreCliente || 'Sin nombre',
      modalidad: modalidadSeleccionada,
      productos: Object.values(pedido).map((item: any) => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad,
      })),
      total,
      fecha: esEdicion ? route.params.pedidoEditar.fecha : new Date().toISOString(),
    };

    console.log('🧪 Enviando venta:', JSON.stringify(venta));
    try {
      if (esEdicion) {
        const { data, error } = await supabase
          .from('ventas')
          .update([venta])
          .eq('id', idPedido)
          .select('*');

        if (error) {
          console.log('❌ Supabase error:', error.message, error.details, error.hint);
          Alert.alert('Error', 'No se pudo actualizar el pedido.');
          return;
        }

        console.log('✅ Pedido actualizado:', data);
        Alert.alert('¡Éxito!', `Pedido N${idPedido} actualizado correctamente.`);
      } else {
        // MODIFICADO: Insertar si es nuevo
        const { data, error } = await supabase.from('ventas').insert([venta]).select('*');

        if (error) {
          console.log('❌ Supabase error:', error.message, error.details, error.hint);
          Alert.alert('Error', 'No se pudo guardar el pedido.');
          return;
        }

        console.log('✅ Venta guardada:', data);
        Alert.alert('¡Éxito!', `Pedido N${idPedido} guardado correctamente.`);
      }

      // MODIFICADO: Recalcular totalDia después de cualquier cambio
      await cargarTotalDia();
      reiniciarPedido();

      // Mostrar indicador de carga antes de imprimir
      setIsLoading(true);
      setTiempoImpresion(0);
      const startTime = Date.now();

      // Iniciar intervalo para actualizar tiempo en tiempo real
      const id = setInterval(() => {
        setTiempoImpresion(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setIntervalId(id);

      // Conectar a la impresora antes de imprimir
      await BluetoothManager.connect("66:32:6A:16:E9:ED");
      await imprimirVenta(venta);

      // Ocultar indicador de carga después de imprimir
      clearInterval(id);
      setIntervalId(null);
      setIsLoading(false);
      setTiempoImpresion(0);

    } catch (e: any) {
      console.log('💥 Excepción inesperada:', e?.message || e);
      Alert.alert('Error', 'Falló la conexión con Supabase.');

      // Ocultar indicador si hay error
      if (intervalId) clearInterval(intervalId);
      setIsLoading(false);
      setTiempoImpresion(0);
    }
  };

  const productosVisibles =
    categorias.find((c) => c.nombre === categoriaActiva)?.productos || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🛒 Pedido actual</Text>
      <Text style={styles.totalHighlight}>TOTAL: Bs {total}</Text>

      <Text style={styles.label}>Nombre del cliente (opcional):</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Jhon Heynar"
        value={nombreCliente}
        onChangeText={setNombreCliente}
      />

      {/* Modalidad y Pago */}
      <View style={styles.optionRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Modalidad</Text>
          <View style={styles.optionRow}>
            {['mesa', 'llevar'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.optionButton, modalidadSeleccionada === m && styles.optionActive]}
                onPress={() => setModalidadSeleccionada(m)}
              >
                <Text style={styles.optionText}>{m.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.optionRow}>
          </View>
        </View>
      </View>

      {/* Pedido */}
      {Object.values(pedido).map((item: any) => (
        <View key={item.producto.id} style={styles.pedidoRow}>
          <Text>{item.producto.nombre}</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyButton} onPress={() => disminuirCantidad(item.producto.id)}>
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNumber}>{item.cantidad}</Text>
            <TouchableOpacity style={styles.qtyButton} onPress={() => aumentarCantidad(item.producto.id)}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Botones */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.confirmButton} onPress={confirmarPedido}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={reiniciarPedido}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalDia}>Total vendido hoy: Bs {totalDia}</Text>

      {/* Categorías */}
      <View style={styles.tabRow}>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.nombre}
            style={[styles.tabButton, categoriaActiva === cat.nombre && styles.tabButtonActive]}
            onPress={() => setCategoriaActiva(cat.nombre)}
          >
            <Text style={[styles.tabText, categoriaActiva === cat.nombre && styles.tabTextActive]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Productos */}
      <View style={styles.productsGrid}>
        {productosVisibles.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.productCard,
              pedido[p.id] && { borderColor: '#28a745', borderWidth: 2 },
            ]}
            onPress={() => agregarProducto(p)}
          >
            <Text style={styles.productName}>{p.nombre}</Text>
            <Text style={styles.productPrice}>Bs {p.precio}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal de carga para impresión */}
      <Modal visible={isLoading} transparent={true} animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9a1818" />
            <Text style={styles.loadingText}>Imprimiendo ticket...</Text>
            <Text style={styles.loadingTime}>Tiempo: {tiempoImpresion} segundos</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#9a1818' },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, padding: 8, borderRadius: 6 },

  optionRow: { flexDirection: 'row', flexWrap: 'wrap' },
  optionButton: { backgroundColor: '#eee', padding: 8, margin: 4, borderRadius: 6 },
  optionActive: { backgroundColor: '#9a1818' },
  optionText: { fontWeight: 'bold', color: '#000' },

  pedidoRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: { backgroundColor: '#9a1818', padding: 6, borderRadius: 4 },
  qtyText: { color: '#fff', fontSize: 18 },
  qtyNumber: { marginHorizontal: 8 },

  buttonRow: { flexDirection: 'row', marginTop: 10 },
  confirmButton: { flex: 1, backgroundColor: '#28a745', padding: 10, marginRight: 5, borderRadius: 6 },
  resetButton: { flex: 1, backgroundColor: '#dc3545', padding: 10, borderRadius: 6 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

  tabRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15 },
  tabButton: { padding: 10, backgroundColor: '#f2f2f2', margin: 4, borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#9a1818', borderWidth: 2, borderColor: '#7a1212', elevation: 4 },
  tabText: { color: '#333' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },

  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  productCard: { width: '48%', backgroundColor: '#f2f2f2', padding: 12, borderRadius: 8, marginVertical: 6, borderWidth: 1, borderColor: '#ccc' },
  productName: { fontWeight: 'bold' },
  productPrice: { marginTop: 4, color: '#555' },

  totalHighlight: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  totalDia: { fontWeight: 'bold', marginTop: 10, color: '#28a745' },

  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingTime: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
});

export default ProductsScreen;