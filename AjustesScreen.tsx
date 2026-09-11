import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Button,
  Alert,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

import { resetPedidos } from './utils/pedidoCounter';
import { supabase } from './supabaseClient';

export default function AjustesScreen({ navigation }: any) {
  const [ventaActiva, setVentaActiva] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesandoVenta, setProcesandoVenta] = useState(false);

  const [sesionId, setSesionId] = useState<number | null>(null);
  const [totalDia, setTotalDia] = useState<number>(0);

  // =====================================================
  // BUSCAR SESIÓN ACTIVA
  // =====================================================

  const verificarVentaActiva = useCallback(async () => {
    try {
      setCargando(true);

      console.log('🔎 Buscando sesión activa...');

      const { data, error } = await supabase
        .from('sesiones_venta')
        .select('id, fecha_inicio, fecha_fin, estado, total_dia')
        .eq('estado', 'iniciada')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        console.log(
          '❌ Error Supabase buscando sesión:',
          error
        );

        Alert.alert(
          'Error',
          `No se puede verificar la sesión de ventas.\n\n${error.message}`
        );

        setVentaActiva(false);
        setSesionId(null);
        setTotalDia(0);

        return;
      }

      console.log('📋 Resultado sesión activa:', data);

      if (data && data.length > 0) {
        const sesion = data[0];

        console.log('✅ Sesión activa encontrada:', sesion);

        setVentaActiva(true);
        setSesionId(sesion.id);
        setTotalDia(Number(sesion.total_dia) || 0);
      } else {
        console.log('ℹ️ No hay ninguna sesión activa.');

        setVentaActiva(false);
        setSesionId(null);
        setTotalDia(0);
      }
    } catch (error: any) {
      console.log(
        '💥 Error inesperado verificando sesión:',
        error
      );

      Alert.alert(
        'Error',
        `No se pudo verificar la sesión de ventas.\n\n${
          error?.message || 'Error desconocido'
        }`
      );

      setVentaActiva(false);
      setSesionId(null);
      setTotalDia(0);
    } finally {
      setCargando(false);
    }
  }, []);

  // =====================================================
  // COMPROBAR SESIÓN AL ABRIR LA PANTALLA
  // =====================================================

  useEffect(() => {
    verificarVentaActiva();
  }, [verificarVentaActiva]);

  // =====================================================
  // REINICIAR CONTADOR DE PEDIDOS
  // =====================================================

  const handleReset = async () => {
    try {
      await resetPedidos();

      Alert.alert(
        'Contador reiniciado',
        'El próximo pedido será N1.'
      );
    } catch (error: any) {
      console.log(
        '❌ Error reiniciando contador:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo reiniciar el contador de pedidos.'
      );
    }
  };

  // =====================================================
  // INICIAR VENTA
  // =====================================================

  const iniciarVenta = async () => {
    try {
      console.log('🟢 Iniciando venta...');

      // Comprobar nuevamente en Supabase
      const { data: sesiones, error: buscarError } =
        await supabase
          .from('sesiones_venta')
          .select('id, estado, total_dia')
          .eq('estado', 'iniciada')
          .order('id', { ascending: false })
          .limit(1);

      if (buscarError) {
        console.log(
          '❌ Error comprobando sesión:',
          buscarError
        );

        Alert.alert(
          'Error',
          `No se puede verificar la sesión de ventas.\n\n${buscarError.message}`
        );

        return;
      }

      // =================================================
      // YA EXISTE UNA SESIÓN
      // =================================================

      if (sesiones && sesiones.length > 0) {
        const sesionExistente = sesiones[0];

        console.log(
          '⚠️ Ya existe una sesión:',
          sesionExistente
        );

        setVentaActiva(true);
        setSesionId(sesionExistente.id);
        setTotalDia(
          Number(sesionExistente.total_dia) || 0
        );

        Alert.alert(
          'Venta activa',
          'Ya existe una venta iniciada.'
        );

        return;
      }

      // =================================================
      // CREAR NUEVA SESIÓN
      // =================================================

      const { data, error } = await supabase
        .from('sesiones_venta')
        .insert({
          fecha_inicio: new Date().toISOString(),
          estado: 'iniciada',
          total_dia: 0,
        })
        .select('id, fecha_inicio, estado, total_dia')
        .single();

      if (error) {
        console.log(
          '❌ Error creando sesión:',
          error
        );

        Alert.alert(
          'Error',
          `No se pudo iniciar la venta.\n\n${error.message}`
        );

        return;
      }

      console.log(
        '✅ Nueva sesión creada:',
        data
      );

      setVentaActiva(true);
      setSesionId(data.id);
      setTotalDia(Number(data.total_dia) || 0);

      Alert.alert(
        'Venta iniciada',
        `La venta se inició correctamente.\n\nSesión N° ${data.id}`
      );
    } catch (error: any) {
      console.log(
        '💥 Error iniciando venta:',
        error
      );

      Alert.alert(
        'Error',
        `No se pudo iniciar la venta.\n\n${
          error?.message || 'Error desconocido'
        }`
      );
    }
  };

  // =====================================================
  // TERMINAR VENTA
  // =====================================================

  const terminarVenta = async () => {
    try {
      console.log('🔴 Terminando venta...');

      // Buscar sesión activa
      const { data: sesiones, error: buscarError } =
        await supabase
          .from('sesiones_venta')
          .select('id, estado, total_dia')
          .eq('estado', 'iniciada')
          .order('id', { ascending: false })
          .limit(1);

      if (buscarError) {
        console.log(
          '❌ Error buscando sesión:',
          buscarError
        );

        Alert.alert(
          'Error',
          `No se pudo buscar la sesión activa.\n\n${buscarError.message}`
        );

        return;
      }

      // =================================================
      // NO EXISTE SESIÓN
      // =================================================

      if (!sesiones || sesiones.length === 0) {
        console.log(
          '⚠️ No existe una sesión activa.'
        );

        setVentaActiva(false);
        setSesionId(null);
        setTotalDia(0);

        Alert.alert(
          'Aviso',
          'No existe una venta activa para terminar.'
        );

        return;
      }

      const sesion = sesiones[0];

      const totalFinal =
        Number(sesion.total_dia) || 0;

      console.log(
        '🔴 Sesión a finalizar:',
        sesion.id
      );

      console.log(
        '💰 Total final:',
        totalFinal
      );

      // =================================================
      // FINALIZAR SESIÓN
      // =================================================

      const { data, error } = await supabase
        .from('sesiones_venta')
        .update({
          estado: 'finalizada',
          fecha_fin: new Date().toISOString(),
        })
        .eq('id', sesion.id)
        .eq('estado', 'iniciada')
        .select(
          'id, fecha_inicio, fecha_fin, estado, total_dia'
        )
        .single();

      if (error) {
        console.log(
          '❌ Error finalizando sesión:',
          error
        );

        Alert.alert(
          'Error',
          `No se pudo finalizar la venta.\n\n${error.message}`
        );

        return;
      }

      console.log(
        '✅ Sesión finalizada:',
        data
      );

      // =================================================
      // LIMPIAR ESTADO LOCAL
      // =================================================

      setVentaActiva(false);
      setSesionId(null);
      setTotalDia(0);

      Alert.alert(
        'Venta finalizada',
        `La venta terminó correctamente.\n\nTotal vendido: Bs ${totalFinal}`
      );
    } catch (error: any) {
      console.log(
        '💥 Error terminando venta:',
        error
      );

      Alert.alert(
        'Error',
        `No se pudo terminar la venta.\n\n${
          error?.message || 'Error desconocido'
        }`
      );
    }
  };

  // =====================================================
  // BOTÓN INICIAR / TERMINAR
  // =====================================================

  const handleVenta = async () => {
    if (procesandoVenta) {
      return;
    }

    try {
      setProcesandoVenta(true);

      if (ventaActiva) {
        await terminarVenta();
      } else {
        await iniciarVenta();
      }
    } finally {
      setProcesandoVenta(false);
    }
  };

  // =====================================================
  // PANTALLA DE CARGA
  // =====================================================

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#9a1818"
        />

        <Text style={styles.loadingText}>
          Verificando sesión de venta...
        </Text>
      </View>
    );
  }

  // =====================================================
  // PANTALLA
  // =====================================================

  return (
    <View style={styles.container}>

      {/* ESTADO DE VENTA */}

      <View
        style={[
          styles.estadoContainer,
          ventaActiva
            ? styles.estadoActiva
            : styles.estadoInactiva,
        ]}
      >
        <Text style={styles.estadoTitulo}>
          Estado de venta
        </Text>

        <Text style={styles.estadoTexto}>
          {ventaActiva
            ? '🟢 VENTA ACTIVA'
            : '🔴 VENTA FINALIZADA'}
        </Text>

        {ventaActiva && sesionId !== null && (
          <>
            <Text style={styles.sesionTexto}>
              Sesión N° {sesionId}
            </Text>

            <Text style={styles.totalTexto}>
              Total: Bs {totalDia}
            </Text>
          </>
        )}
      </View>

      {/* REINICIAR CONTADOR */}

      <View style={styles.buttonContainer}>
        <Button
          title="Reiniciar contador de pedidos"
          onPress={handleReset}
          disabled={procesandoVenta}
        />
      </View>

      {/* INICIAR / TERMINAR VENTA */}

      <View style={styles.buttonContainer}>
        <Button
          title={
            procesandoVenta
              ? 'Procesando...'
              : ventaActiva
              ? 'Terminar venta'
              : 'Iniciar venta'
          }
          onPress={handleVenta}
          disabled={procesandoVenta}
          color={
            ventaActiva
              ? '#dc3545'
              : '#28a745'
          }
        />
      </View>

    </View>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },

  estadoContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },

  estadoActiva: {
    backgroundColor: '#e8f8ed',
    borderWidth: 1,
    borderColor: '#28a745',
  },

  estadoInactiva: {
    backgroundColor: '#f8e8e8',
    borderWidth: 1,
    borderColor: '#dc3545',
  },

  estadoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },

  estadoTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },

  sesionTexto: {
    marginTop: 8,
    fontSize: 15,
    color: '#555',
  },

  totalTexto: {
    marginTop: 5,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9a1818',
  },

  buttonContainer: {
    width: '90%',
    marginVertical: 10,
  },
});
