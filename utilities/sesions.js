import AsyncStorage from '@react-native-async-storage/async-storage';

// Almacena los datos de sesión en AsyncStorage
export const storeData = async (data) => {
  try {
    await AsyncStorage.setItem('userSession', JSON.stringify(data));
  } catch (e) {
    console.error("Error guardando sesión", e);
  }
};

// El servidor no respondió
export const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('userSession');
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Error leyendo sesión", e);
    return null;
  }
};

// Eliminar los datos de sesión
export const clearData = async () => {
  try {
    await AsyncStorage.removeItem('userSession');
  } catch (e) {
    console.error("Error limpiando sesión", e);
  }
};