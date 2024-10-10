import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Uri from '../assets/img/fondo.jpg';
import Icon from '../assets/img/vian.png';
import Honda from '../assets/img/honda.png';
import { BlurView } from 'expo-blur';

export function LoginScreen () {
  const router = useRouter();


  return (
<View style={styles.container}>
    <Image source={Uri} style = {[styles.image, StyleSheet.absoluteFill]} />
    <Image source={Honda} style={{width:200, height:200, position: 'absolute'}}/>
    <ScrollView contentContainerStyle = {{
      flex: 1,
      width: "100%",
      height: "100%",
      alignItems: 'center',
      justifyContent:'center'
    }}>
      <BlurView intensity={90}>
        <View style={styles.login}>
          <Image source={Icon} style = {styles.icon} />
          <View>
            <Text style={{ fontSize: 17, fontWeight: '400', color: 'white'}}> Usuario </Text>
            <TextInput style={styles.input}  />
          </View>
          <View>
            <Text style={{ fontSize: 17, fontWeight: '400', color: 'white'}}> Password </Text>
            <TextInput style={styles.input} />
          </View>
          <TouchableOpacity style={styles.button}>
            <Text style={{ fontSize: 17, fontWeight: '400', color: 'white'}}> Login </Text> 
          </TouchableOpacity>
        </View>
      </BlurView>
    </ScrollView>
    <StatusBar style="auto" />
  </View>
  );
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
      marginVertical: 30,
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
      marginBottom: 20
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