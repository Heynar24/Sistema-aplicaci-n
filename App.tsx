import 'react-native-url-polyfill/auto';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductsScreen from './ProductsScreen'; // Importamos la pantalla de productos
import AjustesScreen from './AjustesScreen';   // Pantalla de ajustes (nueva)
import EditorScreen from './EditorScreen';


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