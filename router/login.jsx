import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, TextInput, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Uri from '../assets/img/fondo.jpg';
import Icon from '../assets/img/vian.png';
import Honda from '../assets/img/honda.png';
import { BlurView } from 'expo-blur';
import { useFonts } from "expo-font";
import { Loading } from '../components/loading';

export function LoginScreen () {

  const [fontsLoaded] = useFonts({
    'Helvetica-Bold': require('../assets/fonts/Helvetica-Bold.ttf'),
    'helvetica-light': require('../assets/fonts/helvetica-light.ttf'),
    'Helvetica': require('../assets/fonts/Helvetica.ttf'),
  });

  if(!fontsLoaded){
    return <Loading/>
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
              <TextInput style={styles.input} placeholder='Usuario' placeholderTextColor='grey'/>
          </View>
          <View>
            <Text style={{ fontSize: 17, fontWeight: '400', color: 'black', fontFamily: 'Helvetica-Bold'}}> Contraseña </Text>
            <TextInput style={styles.input} placeholder='Contraseña' secureTextEntry={true} placeholderTextColor='grey'/>
          </View>
          <Pressable style={styles.button}>
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