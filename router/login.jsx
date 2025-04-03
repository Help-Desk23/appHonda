import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, TextInput, Text, Image, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Uri from '../assets/img/fondo.jpg';
import Icon from '../assets/img/vian.png';
import Honda from '../assets/img/honda.png';
import { BlurView } from 'expo-blur';
import { useFonts } from "expo-font";
import { Loading } from '../components/loading';
import axios from 'axios';

export function LoginScreen () {

  const Router = useRouter();

  const [ usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [infoAsesores, setInfoAsesores] = useState('');

  const url = 'http:192.168.2.62:4000/login';

  const handleSignIn = () => {
    axios
    .post(url, {
      usuario,
      contraseña
    })
    .then(response => {
      if(response.data){
        const { nombre, id_asesores, id_sucursal } = response.data.asesor;
        setInfoAsesores(nombre)
        Router.push({
          pathname: '/home',
          params: {nombre, id_asesores, id_sucursal}
        });
        Alert.alert(`Bienvenido ${response.data.asesor.nombre}`);
      } else{
        Alert.alert('Credencial Incorrecta')
      }
      console.log(response.data)
    })
    .catch(error => {
      if (error.response){
        console.error("Error de respuesta en el Servidor:", error.response.status, error.response.data);
        if(error.response.status === 401){
          Alert.alert("Error de Autenticación", "Usuario o Contraseña Incorrecta");
        } else if(error.response.status === 500){
          Alert.alert("Error de Servidor", "Hubo un problema en el servidor, intente más tarde");
        } else{
          Alert.alert("Error", "Ocurrio un error inesperado");
        }
      } else if (error.request){
        console.error("Error de solicitud:", error.request);
        Alert.alert("Error de conexión", "No se pudo conectar con el servidor");
      } else{
        console.error("Error de configuración:", error.message);
        Alert.alert("Error", "Ocurrio un error al configurar la solicitud");
      }
    })
  }

  const [fontsLoaded] = useFonts({
    'Helvetica-Bold': require('../assets/fonts/Helvetica-Bold.ttf'),
    'helvetica-light': require('../assets/fonts/helvetica-light.ttf'),
    'Helvetica': require('../assets/fonts/Helvetica.ttf'),
  });

  if(!fontsLoaded){
    return <Loading />
  };

  return(
    <View style={styles.container}>
      <Image source={Uri} style={[styles.image, StyleSheet.absoluteFill]} />
      <Image source={Honda} style={{ width: 200, height: 200, position: 'absolute'}} resizeMode='contain'/>
      <ScrollView contentContainerStyle={styles.scrollview}>
        <BlurView intensity={150} style={{borderRadius: 10, overflow:"hidden"}} blur>
          <View style={styles.login}>
            <Image source={Icon} style = {styles.icon}/>
            <View>
              <Text style={{ fontSize: 17, fontWeight: '400', color: 'black', fontFamily: 'Helvetica-Bold'}}> Usuario </Text>
              <TextInput onChangeText={ text => setUsuario(text)} style={styles.input} placeholder='Usuario' placeholderTextColor='grey'/>
          </View>
          <View>
            <Text style={{ fontSize: 17, fontWeight: '400', color: 'black', fontFamily: 'Helvetica-Bold'}}> Contraseña </Text>
            <TextInput onChangeText={text => setContraseña(text)} style={styles.input} placeholder='Contraseña' secureTextEntry={true} placeholderTextColor='grey'/>
          </View>
          <Pressable style={styles.button} onPress={handleSignIn}>
            <Text style={{ fontSize: 17, fontWeight: '400', color: 'white', fontFamily: 'Helvetica'}}> Login </Text> 
          </Pressable>
          </View>
        </BlurView>
      </ScrollView>
    <StatusBar style='auto'/>
    </View>
  )
};

const styles = StyleSheet.create ({
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
    width: 150,
    height: 150,
    borderColor: "#fff",
    marginVertical: 10,
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