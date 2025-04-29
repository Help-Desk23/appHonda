import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, TextInput, Text, Image, StyleSheet, ScrollView, Pressable, Alert, BackHandler, ActivityIndicator } from 'react-native';
import { useRootNavigationState } from 'expo-router';
//import para ocntrolar el boton de atras
import { useEffect } from 'react';
import { storeData } from '../utilities/sesions';
import axios from 'axios';
import { useRouter } from 'expo-router';

import Uri from '../assets/img/fondo.png';
import Icon from '../assets/img/vianb.png';
import Honda from '../assets/img/hondab.png';
import { BlurView } from 'expo-blur';
import { useFonts } from "expo-font";
import { Loading } from '../components/loading';


export default function LoginScreen() {
  const [fontsLoaded] = useFonts({
    'Helvetica-Bold': require('../assets/fonts/Helvetica-Bold.ttf'),
    'helvetica-light': require('../assets/fonts/helvetica-light.ttf'),
    'Helvetica': require('../assets/fonts/Helvetica.ttf'),
  });


  const router = useRouter();

  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [infoAsesores, setInfoAsesores] = useState('');
  //loading
  const [isLoading, setIsLoading] = useState(false);

  const url = 'http://177.222.114.122:3306/asesores/login';


  useEffect(() => {
    const backAction = () => {
      // Solo cerrar la app si estamos en la pantalla de login
      if (router.pathname === '/login') {
        BackHandler.exitApp(); // Cierra la aplicación
        return true; // Evita el comportamiento por defecto
      } else {
        router.replace('/login'); // Redirige al login si no estamos en la pantalla de login
        return true; // Evita el comportamiento por defecto
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Limpiar el listener cuando el componente se desmonte
    return () => backHandler.remove();
  }, [router]);
  //loading page
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ff0000" />
        <Text style={{ marginTop: 10, fontFamily: 'Helvetica-Bold', fontSize: 16 }}>Conectando con el servidor...</Text>
      </View>
    );
  }
  
  if (!fontsLoaded) {
    return <Loading />
  };


  const handleSignIn = async () => {
    // Verifica si los campos están vacíos
    if (!usuario || !contraseña) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true); // Activar el estado de carga

    axios
      .post(url, {
        usuario,
        contraseña
      })
      .then(async response => {
        setIsLoading(false); // Desactivar el estado de carga
        if (response.data) {
          const { asesor, id_asesores, id_sucursal } = response.data.asesor;
          await storeData({
            asesor,
            id_asesores,
            id_sucursal
          });
          setInfoAsesores(asesor);
          router.push("/home");
          Alert.alert(`Bienvenido`, ` ${response.data.asesor.asesor}`);
        } else {
          Alert.alert('Credencial Incorrecta');
        }
      })
      .catch(error => {
        setIsLoading(false); // Desactivar el estado de carga incluso en caso de error
        if (error.response) {
          console.error("Error de respuesta del servidor:", error.response.status, error.response.data);
          if (error.response.status === 401) {
            Alert.alert("Error de autenticación", "Usuario o contraseña incorrectos.");
          } else if (error.response.status === 500) {
            Alert.alert("Error del servidor", "Hubo un problema en el servidor. Inténtalo de nuevo más tarde.");
          } else {
            Alert.alert("Error", "Ocurrió un error inesperado.", error.response.data, error.response.status);
          }
        } else if (error.request) {
          console.error("Error de solicitud:", error.request);
          Alert.alert("Error de conexión", "No se pudo conectar al servidor.");
        } else {
          console.error("Error de configuración:", error.message);
          Alert.alert("Error", "Ocurrió un error al configurar la solicitud.");
        }
      });
  };


  return (
    <View style={styles.container}>
      <Image source={Uri} style={[styles.image, StyleSheet.absoluteFill]} />
      <Image source={Honda} style={{ width: 200, height: 200, position: 'absolute' }} resizeMode='contain' />
      <ScrollView contentContainerStyle={styles.scrollview}>
        <BlurView intensity={150} style={{ borderRadius: 10, overflow: "hidden" }} blur>
          <View style={styles.login}>
            <Image source={Icon} style={styles.icon} />
            <View>
              <Text style={{ fontSize: 17, fontWeight: '400', color: 'black', fontFamily: 'Helvetica-Bold' }}> Usuario </Text>
              <TextInput onChangeText={text => setUsuario(text)} style={styles.input} placeholder='Usuario' placeholderTextColor='grey' />
            </View>
            <View>
              <Text style={{ fontSize: 17, fontWeight: '400', color: 'black', fontFamily: 'Helvetica-Bold' }}> Contraseña </Text>
              <TextInput onChangeText={text => setContraseña(text)} style={styles.input} placeholder='Contraseña' secureTextEntry={true} placeholderTextColor='grey' />
            </View>
            <Pressable
              style={[styles.button, isLoading && { opacity: 0.7 }]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ fontSize: 17, fontWeight: '400', color: 'white', fontFamily: 'Helvetica' }}>Login</Text>
              )}
            </Pressable>
          </View>
        </BlurView>
      </ScrollView>
      <StatusBar style='auto' />
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  scrollview: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: 'center',
    justifyContent: 'center'
  },
  login: {
    width: 350,
    height: 500,
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  icon: {
    position: 'flex',
    width: 230,
    height: 120,
    borderColor: "#fff",
    marginVertical: 10,
    zIndex: 20,

  },
  input: {
    width: 250,
    height: 40,
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#ffffff90',
    marginBottom: 20,
    fontFamily: 'helvetica-light',
  },
  button: {
    width: 250,
    height: 40,
    borderRadius: 10,
    backgroundColor: "red",
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderColor: '#fff',
    borderWidth: 1
  }
});
