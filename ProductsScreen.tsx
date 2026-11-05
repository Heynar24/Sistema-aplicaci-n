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

import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// PRODUCTOS
// =====================================================

const categorias = [
  {
    nombre: 'Pollo a la leña',
    productos: [
      { id: 1, nombre: 'Económico con fideo a la leña', precio: 18 },
      { id: 2, nombre: 'Económico sin fideo a la leña', precio: 16 },
      { id: 3, nombre: '1/4 pierna a la leña', precio: 28 },
      { id: 4, nombre: '1/4 pecho a la leña', precio: 32 },
      { id: 5, nombre: '1/2 pollo a la leña', precio: 55 },
      { id: 6, nombre: 'Pollo entero a la leña', precio: 110 },
      { id: 7, nombre: 'Económico con solo papa leña', precio: 16 },
      { id: 8, nombre: 'Económico con solo fideo leña', precio: 18 },
    ],
  },
  {
    nombre: 'Pollo a la broaster',
    productos: [
      { id: 9, nombre: 'Super económico broaster', precio: 13 },
      { id: 10, nombre: 'Económico broaster con fideo', precio: 18 },
      { id: 11, nombre: 'Económico broaster', precio: 16 },
      { id: 12, nombre: '1/4 broaster', precio: 28 },
      { id: 13, nombre: '1/2 broaster', precio: 55 },
    ],
  },
  {
    nombre: 'Salchipapas',
    productos: [
      {
        id: 14,
        nombre: 'Salchipapa clásica',
        precio: 17,
      },
    ],
  },
  {
    nombre: 'Porciones',
    productos: [
      { id: 15, nombre: 'Porción de fideo', precio: 8 },
      { id: 16, nombre: 'Porción de papa', precio: 8 },
      { id: 17, nombre: 'Porción de arroz', precio: 8 },
    ],
  },
  {
    nombre: 'Sodas',
    productos: [
      { id: 18, nombre: 'Agua en bolsa', precio: 1 },
      { id: 19, nombre: 'Aqua-rius peque', precio: 5 },
      { id: 20, nombre: 'Agua personal', precio: 6 },
      { id: 21, nombre: 'Tropi-k personal', precio: 7 },
      { id: 22, nombre: 'Jugo Tropi popular', precio: 7 },
      { id: 23, nombre: 'Agua 990ml', precio: 8 },
      { id: 24, nombre: 'Agua 2L', precio: 12 },
      { id: 25, nombre: 'Jugo Tropi 1L', precio: 12 },
      { id: 26, nombre: 'Jugo del Valle', precio: 12 },
      { id: 27, nombre: 'Jugo Pura Vida', precio: 18 },
      { id: 28, nombre: 'Aqua-rius 2L', precio: 18 },
      { id: 29, nombre: 'Tropi-K 2L', precio: 17 },

      { id: 30, nombre: 'Mini', precio: 3 },
      { id: 31, nombre: 'Pop popular', precio: 4 },
      { id: 32, nombre: 'Soda peque', precio: 5 },
      { id: 33, nombre: 'Coca Cola personal', precio: 7 },
      { id: 34, nombre: 'Salvietti personal', precio: 7 },
      { id: 35, nombre: 'Popular Coca Cola', precio: 9 },
      { id: 36, nombre: 'Popular Fanta', precio: 9 },
      { id: 37, nombre: 'Popular Sprite', precio: 9 },
      { id: 38, nombre: 'Mendocina 1L', precio: 9 },
      { id: 39, nombre: 'Pepsi 1L', precio: 10 },
      { id: 40, nombre: 'Coca Cola de 1.5L', precio: 15 },
      { id: 41, nombre: 'Cabaña', precio: 18 },
      { id: 42, nombre: 'Simba', precio: 18 },
      { id: 43, nombre: 'Salvietti 2L', precio: 16 },
      { id: 44, nombre: 'Coca Cola 2L', precio: 20 },
      { id: 45, nombre: 'Fanta 2L', precio: 19 },
      { id: 46, nombre: 'Sprite 2L', precio: 19 },
      { id: 47, nombre: 'Salvietti 3L', precio: 20 },
      { id: 48, nombre: 'Coca Cola 3L', precio: 25 },
    ],
  },
  {
    nombre: 'Helados',
    productos: [
      { id: 49, nombre: 'Tentacion', precio: 10 },
      { id: 50, nombre: 'Tentacion mini', precio: 6 },
      { id: 51, nombre: 'Tentacion mini (con almendra)', precio: 6.50 },
      { id: 52, nombre: 'Griego', precio: 10 },
      { id: 53, nombre: 'Tentacion cono', precio: 10 },
      { id: 54, nombre: 'Cono', precio: 10 },
      { id: 55, nombre: 'Rocky cono', precio: 8 },
      { id: 56, nombre: 'Megacono', precio: 8 },
      { id: 57, nombre: 'Ricoco (cono)', precio: 6 },
      { id: 58, nombre: 'Copa helada', precio: 8 },
      { id: 59, nombre: 'Waferito', precio: 4 },
      { id: 60, nombre: 'Deli vasito', precio: 5 },
      { id: 61, nombre: 'Sandwich Vainilla', precio: 6 },
      { id: 62, nombre: 'Ricoco (paleta)', precio: 4 },
      { id: 63, nombre: 'Rocky', precio: 6 },
      { id: 64, nombre: 'Negrito', precio: 3.5 },
      { id: 65, nombre: 'Brownie', precio: 10 },
      { id: 66, nombre: 'deli POP', precio: 3 },
      { id: 67, nombre: 'Lenguix', precio: 3 },
      { id: 68, nombre: 'Vaquita', precio: 3 },
      { id: 69, nombre: 'Pura Fruta', precio: 3 },
      { id: 70, nombre: 'Salsero', precio: 2.50 },
      { id: 71, nombre: 'Vaquita (bolo)', precio: 1.50 },
      { id: 72, nombre: 'Bolo Fruntas', precio: 1.00 },
      { id: 73, nombre: 'Picolé', precio: 1.50 },
      { id: 74, nombre: 'Alfredo Canela', precio: 2.00 },
      { id: 75, nombre: 'Delizaurio', precio: 2.50 },
      { id: 76, nombre: 'DISFRUT', precio: 2 },
    ],
  },
];

// =====================================================
// TIPOS
// =====================================================

type Producto = {
  id: number;
  nombre: string;
  precio: number;
};

type ItemPedido = {
  producto: Producto;
  cantidad: number;
};

type Pedido = {
  [key: number]: ItemPedido;
};

// =====================================================
// ID DE PEDIDO
// =====================================================

const obtenerSiguienteIdPedido = async (): Promise<number> => {
  try {
    const ultimoId = await AsyncStorage.getItem('ultimoIdPedido');

    const id = ultimoId
      ? parseInt(ultimoId, 10) + 1
      : 1;

    await AsyncStorage.setItem(
      'ultimoIdPedido',
      id.toString()
    );

    return id;
  } catch (e) {
    console.log(
      '❌ Error obteniendo ID de pedido:',
      e
    );

    return 1;
  }
};

// =====================================================
// COMPONENTE
// =====================================================

const ProductsScreen: React.FC<{ route: any }> = ({
  route,
}) => {
  const [categoriaActiva, setCategoriaActiva] =
    useState(categorias[0].nombre);

  const [pedido, setPedido] = useState<Pedido>({});
  const [total, setTotal] = useState(0);
  const [totalDia, setTotalDia] = useState(0);

  const [nombreCliente, setNombreCliente] =
    useState('');

  const [modalidadSeleccionada, setModalidadSeleccionada] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(false);

  const [tiempoImpresion, setTiempoImpresion] =
    useState(0);

  const [intervalId, setIntervalId] =
    useState<ReturnType<typeof setInterval> | null>(
      null
    );

  const [ventaActiva, setVentaActiva] =
    useState(false);

  // ===================================================
  // VERIFICAR SESIÓN ACTIVA
  // ===================================================

  const verificarVentaActiva = async () => {
    try {
      const { data, error } = await supabase
        .from('sesiones_venta')
        .select('id, total_dia')
        .eq('estado', 'iniciada')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.log(
          '❌ Error verificando venta:',
          error.message
        );

        return;
      }

      if (data) {
        setVentaActiva(true);
        setTotalDia(Number(data.total_dia || 0));
      } else {
        setVentaActiva(false);
        setTotalDia(0);
      }
    } catch (e) {
      console.log(
        '💥 Error verificando sesión:',
        e
      );
    }
  };

  // ===================================================
  // CARGAR PEDIDO PARA EDITAR
  // ===================================================

  const cargarPedidoParaEditar = (
    pedidoEditar: any
  ) => {
    const pedidoConvertido: Pedido =
      pedidoEditar.productos.reduce(
        (acc: Pedido, item: any) => {
          acc[item.id] = {
            producto: {
              id: item.id,
              nombre: item.nombre,
              precio: item.precio,
            },
            cantidad: item.cantidad,
          };

          return acc;
        },
        {}
      );

    setPedido(pedidoConvertido);

    setTotal(Number(pedidoEditar.total || 0));

    setNombreCliente(
      pedidoEditar.cliente || ''
    );

    setModalidadSeleccionada(
      pedidoEditar.modalidad || ''
    );
  };

  // ===================================================
  // CARGAR INFORMACIÓN INICIAL
  // ===================================================

  useEffect(() => {
    verificarVentaActiva();

    if (route.params?.pedidoEditar) {
      cargarPedidoParaEditar(
        route.params.pedidoEditar
      );
    }
  }, [route.params]);

  // ===================================================
  // LIMPIAR INTERVALO AL SALIR
  // ===================================================

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // ===================================================
  // AGREGAR PRODUCTO
  // ===================================================

  const agregarProducto = (
    producto: Producto
  ) => {
    setPedido((prev) => {
      const actual = { ...prev };

      if (actual[producto.id]) {
        actual[producto.id] = {
          ...actual[producto.id],
          cantidad:
            actual[producto.id].cantidad + 1,
        };
      } else {
        actual[producto.id] = {
          producto,
          cantidad: 1,
        };
      }

      return actual;
    });

    setTotal(
      (prev) => prev + producto.precio
    );
  };

  // ===================================================
  // AUMENTAR CANTIDAD
  // ===================================================

  const aumentarCantidad = (
    id: number
  ) => {
    const item = pedido[id];

    if (!item) return;

    setPedido((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        cantidad:
          prev[id].cantidad + 1,
      },
    }));

    setTotal(
      (prev) =>
        prev + item.producto.precio
    );
  };

  // ===================================================
  // DISMINUIR CANTIDAD
  // ===================================================

  const disminuirCantidad = (
    id: number
  ) => {
    const item = pedido[id];

    if (!item) return;

    setPedido((prev) => {
      const actual = { ...prev };

      if (actual[id].cantidad === 1) {
        delete actual[id];
      } else {
        actual[id] = {
          ...actual[id],
          cantidad:
            actual[id].cantidad - 1,
        };
      }

      return actual;
    });

    setTotal(
      (prev) =>
        Math.max(
          0,
          prev - item.producto.precio
        )
    );
  };

  // ===================================================
  // REINICIAR PEDIDO
  // ===================================================

  const reiniciarPedido = () => {
    setPedido({});
    setTotal(0);
    setNombreCliente('');
    setModalidadSeleccionada('');
  };

  // ===================================================
  // ACTUALIZAR TOTAL DE LA SESIÓN
  // ===================================================

  const actualizarTotalDia = async (
    monto: number
  ) => {
    try {
      const { data: sesion, error: errorSesion } =
        await supabase
          .from('sesiones_venta')
          .select('id, total_dia')
          .eq('estado', 'iniciada')
          .order('id', {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (errorSesion) {
        console.log(
          '❌ Error buscando sesión activa:',
          errorSesion.message
        );

        return false;
      }

      if (!sesion) {
        console.log(
          '❌ No existe una sesión de venta activa.'
        );

        return false;
      }

      const nuevoTotal =
        Number(sesion.total_dia || 0) +
        Number(monto);

      const { error } = await supabase
        .from('sesiones_venta')
        .update({
          total_dia: nuevoTotal,
        })
        .eq('id', sesion.id);

      if (error) {
        console.log(
          '❌ Error actualizando total_dia:',
          error.message
        );

        return false;
      }

      setTotalDia(nuevoTotal);

      return true;
    } catch (e) {
      console.log(
        '💥 Excepción actualizando total:',
        e
      );

      return false;
    }
  };

  // ===================================================
  // CONFIRMAR PEDIDO
  // ===================================================

  const confirmarPedido = async () => {
    if (!ventaActiva) {
      await verificarVentaActiva();

      Alert.alert(
        'Venta no iniciada',
        'Primero debes iniciar una venta desde Ajustes.'
      );

      return;
    }

    // -----------------------------------------------
    // Validaciones
    // -----------------------------------------------

    if (
      !modalidadSeleccionada ||
      total === 0
    ) {
      Alert.alert(
        'Error',
        'Selecciona modalidad y agrega productos.'
      );

      return;
    }

    // -----------------------------------------------
    // Obtener ID
    // -----------------------------------------------

    const esEdicion =
      !!route.params?.pedidoEditar;

    const idPedido = esEdicion
      ? route.params.pedidoEditar.id
      : await obtenerSiguienteIdPedido();

    // -----------------------------------------------
    // Crear venta
    // -----------------------------------------------

    // IMPORTANTE:
    // No enviamos "id" al INSERT porque la columna id de
    // Supabase/PostgreSQL se genera automáticamente.
    const venta = {
      cliente:
        nombreCliente || 'Sin nombre',

      modalidad:
        modalidadSeleccionada,

      productos: Object.values(
        pedido
      ).map((item) => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad,
      })),

      total,

      fecha: esEdicion
        ? route.params.pedidoEditar.fecha
        : new Date().toISOString(),
    };

    console.log(
      '🧪 Enviando venta:',
      JSON.stringify(venta)
    );

    // -----------------------------------------------
    // Mostrar carga
    // -----------------------------------------------

    setIsLoading(true);
    setTiempoImpresion(0);

    const startTime = Date.now();

    const nuevoInterval = setInterval(() => {
      setTiempoImpresion(
        Math.floor(
          (Date.now() - startTime) / 1000
        )
      );
    }, 1000);

    setIntervalId(nuevoInterval);

    try {
      // =============================================
      // GUARDAR / ACTUALIZAR VENTA
      // =============================================

      if (esEdicion) {
        const { data, error } =
          await supabase
            .from('ventas')
            .update(venta)
            .eq('id', idPedido)
            .select('*');

        if (error) {
          console.log(
            '❌ Supabase error:',
            error.message,
            error.details,
            error.hint
          );

          Alert.alert(
            'Error',
            'No se pudo actualizar el pedido.'
          );

          return;
        }
        console.log(
          '✅ Pedido actualizado:',
          data
        );
        Alert.alert(
          '¡Éxito!',
          `Pedido N${idPedido} actualizado correctamente.`
        );
      } else {
        const { data, error } =
          await supabase
            .from('ventas')
            .insert([venta])
            .select('*');

        if (error) {
          console.log(
            '❌ Supabase error:',
            error.message,
            error.details,
            error.hint
          );

          Alert.alert(
            'Error',
            'No se pudo guardar el pedido.'
          );

          return;
        }

        console.log(
          '✅ Venta guardada:',
          data
        );

        // =============================================
        // SUMAR AL TOTAL DE LA SESIÓN
        // =============================================

        const totalActualizado =
          await actualizarTotalDia(
            total
          );

        if (!totalActualizado) {
          Alert.alert(
            'Advertencia',
            'La venta fue guardada, pero no se pudo actualizar el total de la sesión.'
          );
        }

        Alert.alert(
          '¡Éxito!',
          `Pedido N${idPedido} guardado correctamente.`
        );
      }

      // -----------------------------------------------
      // Limpiar pedido
      // -----------------------------------------------

      reiniciarPedido();

      // -----------------------------------------------
      // Imprimir
      // -----------------------------------------------
      //
      // La impresión queda SEPARADA del guardado.
      // Si la impresora falla, el pedido ya guardado NO
      // se considera un error de Supabase.
      //
      // La MAC se conserva exactamente igual.
      // -----------------------------------------------

      try {
        console.log(
          '🖨️ Conectando con impresora...'
        );

        await BluetoothManager.connect(
          '66:32:6A:16:E9:ED'
        );

        console.log(
          '🖨️ Impresora conectada. Imprimiendo ticket...'
        );

        await imprimirVenta(venta);

        console.log(
          '✅ Ticket impreso correctamente.'
        );
      } catch (errorImpresion: any) {
        console.log(
          '⚠️ No se pudo imprimir el pedido:',
          errorImpresion?.message || errorImpresion
        );

        Alert.alert(
          'Pedido guardado',
          'El pedido se guardó correctamente, pero no se pudo imprimir. Verifica que la impresora esté encendida y conectada.'
        );
      }
    } catch (e: any) {
      console.log(
        '💥 Excepción inesperada:',
        e?.message || e
      );

      Alert.alert(
        'Error',
        'Ocurrió un error al guardar o imprimir el pedido.'
      );
    } finally {
      // -----------------------------------------------
      // Limpiar contador
      // -----------------------------------------------

      if (nuevoInterval) {
        clearInterval(
          nuevoInterval
        );
      }

      setIntervalId(null);
      setIsLoading(false);
      setTiempoImpresion(0);
    }
  };

  // ===================================================
  // PRODUCTOS VISIBLES
  // ===================================================

  const productosVisibles =
    categorias.find(
      (c) =>
        c.nombre === categoriaActiva
    )?.productos || [];

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      <Text style={styles.header}>
        🛒 Pedido actual
      </Text>

      <Text style={styles.totalHighlight}>
        TOTAL: Bs {total}
      </Text>

      {/* ESTADO DE VENTA */}

      <View
        style={[
          styles.estadoVenta,
          ventaActiva
            ? styles.estadoActiva
            : styles.estadoInactiva,
        ]}
      >
        <Text
          style={
            ventaActiva
              ? styles.estadoTextoActivo
              : styles.estadoTextoInactivo
          }
        >
          {ventaActiva
            ? '🟢 Venta activa'
            : '🔴 Venta no iniciada'}
        </Text>
      </View>

      {/* CLIENTE */}

      <Text style={styles.label}>
        Nombre del cliente (opcional):
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. Jhon Heynar"
        value={nombreCliente}
        onChangeText={
          setNombreCliente
        }
      />

      {/* MODALIDAD */}

      <Text style={styles.label}>
        Modalidad
      </Text>

      <View style={styles.optionRow}>
        {['mesa', 'llevar'].map(
          (m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.optionButton,
                modalidadSeleccionada ===
                  m &&
                  styles.optionActive,
              ]}
              onPress={() =>
                setModalidadSeleccionada(
                  m
                )
              }
            >
              <Text
                style={[
                  styles.optionText,
                  modalidadSeleccionada ===
                    m &&
                    styles.optionTextActive,
                ]}
              >
                {m.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* PEDIDO */}

      {Object.values(pedido).map(
        (item) => (
          <View
            key={item.producto.id}
            style={styles.pedidoRow}
          >
            <Text
              style={{
                flex: 1,
                marginRight: 10,
              }}
            >
              {item.producto.nombre}
            </Text>

            <View
              style={styles.qtyControls}
            >
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() =>
                  disminuirCantidad(
                    item.producto.id
                  )
                }
              >
                <Text
                  style={styles.qtyText}
                >
                  −
                </Text>
              </TouchableOpacity>

              <Text
                style={styles.qtyNumber}
              >
                {item.cantidad}
              </Text>

              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() =>
                  aumentarCantidad(
                    item.producto.id
                  )
                }
              >
                <Text
                  style={styles.qtyText}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      )}

      {/* BOTONES */}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !ventaActiva &&
              styles.buttonDisabled,
          ]}
          onPress={
            confirmarPedido
          }
        >
          <Text
            style={styles.buttonText}
          >
            Confirmar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={
            reiniciarPedido
          }
        >
          <Text
            style={styles.buttonText}
          >
            Reiniciar
          </Text>
        </TouchableOpacity>
      </View>

      {/* TOTAL SESIÓN */}

      <Text style={styles.totalDia}>
        Total vendido en esta sesión:
        {' '}Bs {totalDia}
      </Text>

      {/* CATEGORÍAS */}

      <View style={styles.tabRow}>
        {categorias.map(
          (cat) => (
            <TouchableOpacity
              key={cat.nombre}
              style={[
                styles.tabButton,
                categoriaActiva ===
                  cat.nombre &&
                  styles.tabButtonActive,
              ]}
              onPress={() =>
                setCategoriaActiva(
                  cat.nombre
                )
              }
            >
              <Text
                style={[
                  styles.tabText,
                  categoriaActiva ===
                    cat.nombre &&
                    styles.tabTextActive,
                ]}
              >
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* PRODUCTOS */}

      <View
        style={styles.productsGrid}
      >
        {productosVisibles.map(
          (p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.productCard,
                pedido[p.id] && {
                  borderColor:
                    '#28a745',
                  borderWidth: 2,
                },
              ]}
              onPress={() =>
                agregarProducto(p)
              }
            >
              <Text
                style={
                  styles.productName
                }
              >
                {p.nombre}
              </Text>

              <Text
                style={
                  styles.productPrice
                }
              >
                Bs {p.precio}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* MODAL IMPRESIÓN */}

      <Modal
        visible={isLoading}
        transparent
        animationType="fade"
      >
        <View
          style={
            styles.loadingOverlay
          }
        >
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color="#9a1818"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Imprimiendo ticket...
            </Text>

            <Text
              style={
                styles.loadingTime
              }
            >
              Tiempo: {tiempoImpresion}{' '}
              segundos
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9a1818',
  },

  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
  },

  estadoVenta: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },

  estadoActiva: {
    backgroundColor: '#d4edda',
  },

  estadoInactiva: {
    backgroundColor: '#f8d7da',
  },

  estadoTextoActivo: {
    color: '#155724',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  estadoTextoInactivo: {
    color: '#721c24',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  optionButton: {
    backgroundColor: '#eee',
    padding: 10,
    margin: 4,
    borderRadius: 6,
  },

  optionActive: {
    backgroundColor: '#9a1818',
  },

  optionText: {
    fontWeight: 'bold',
    color: '#000',
  },

  optionTextActive: {
    color: '#fff',
  },

  pedidoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },

  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  qtyButton: {
    backgroundColor: '#9a1818',
    padding: 6,
    borderRadius: 4,
    minWidth: 32,
    alignItems: 'center',
  },

  qtyText: {
    color: '#fff',
    fontSize: 18,
  },

  qtyNumber: {
    marginHorizontal: 8,
    fontWeight: 'bold',
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },

  confirmButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 10,
    marginRight: 5,
    borderRadius: 6,
  },

  buttonDisabled: {
    backgroundColor: '#999',
  },

  resetButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 6,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 15,
  },

  tabButton: {
    padding: 10,
    backgroundColor: '#f2f2f2',
    margin: 4,
    borderRadius: 8,
  },

  tabButtonActive: {
    backgroundColor: '#9a1818',
    borderWidth: 2,
    borderColor: '#7a1212',
    elevation: 4,
  },

  tabText: {
    color: '#333',
  },

  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  productCard: {
    width: '48%',
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  productName: {
    fontWeight: 'bold',
  },

  productPrice: {
    marginTop: 4,
    color: '#555',
  },

  totalHighlight: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },

  totalDia: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#28a745',
    fontSize: 16,
  },

  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(0, 0, 0, 0.5)',
  },

  loadingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 220,
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
