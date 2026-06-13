import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = "pedidoCounter";

export async function getNextPedido(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    let num = value ? parseInt(value, 10) : 0;
    num += 1;
    await AsyncStorage.setItem(KEY, num.toString());
    return num;
  } catch {
    return 1; // si algo falla, empieza en 1
  }
}

export async function resetPedidos(): Promise<void> {
  await AsyncStorage.setItem(KEY, "0");
}