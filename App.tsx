import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsScreen from './ProductsScreen'; 
import AjustesScreen from './AjustesScreen';   
import EditorScreen from './EditorScreen';
import { supabase } from './supabaseClient'; // 👈 importa tu cliente

const Stack = createNativeStackNavigator();

const HomeScreen: React.FC = ({ navigation }: any) => {
  return (
    <ImageBackground
      source={require('./assets/Logo3.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>🍟SISTEMA P.S.🍗</Text>
        <Image source={require('./assets/Logo1.png')} style={styles.logo} />
        <Text style={styles.subtitle}>Bienvenido</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Productos')}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={() => navigation.navigate('Ajustes')}>
          <Text style={styles.buttonText}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default function App() {
  // 👇 Aquí va la prueba de conexión
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('sesiones_venta')
          .select('*')
          .limit(1);

        if (error) {
          console.log("❌ Error conexión:", error.message);
        } else {
          console.log("✅ Conexión correcta:", data);
        }
      } catch (err) {
        console.log("💥 Error inesperado:", err);
      }
    };

    testConnection();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Productos" component={ProductsScreen} />
        <Stack.Screen name="Ajustes" component={AjustesScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
