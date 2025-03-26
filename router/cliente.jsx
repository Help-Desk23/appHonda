import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View,TextInput, ScrollView, TouchableHighlight, Alert, ActivityIndicator, Keyboard} from "react-native";
import Search from '../assets/img/search.png';
import Flecha from '../assets/img/flecha.png';
import X from '../assets/img/equis.png';
import { io } from "socket.io-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Link } from "expo-router";

export function Cliente () {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [cliente, setCliente] = useState('');
    const insets = useSafeAreaInsets();
    
  const socket = io("http://192.168.10.147:4000");
  
  useEffect(() =>{
    socket.on("connect", () => {
      socket.emit("obtenerCotizacion")
    });
  
    socket.on("proformaData", (cotizacion) => {
      setData(cotizacion)
    })
  }, []);
  
  useEffect(() => {
    setFilteredData(data);
  }, [data]);
  
    const formatFecha = (fecha) => {
      const date = new Date(fecha);
      return date.toLocaleDateString();
    };
  
    const limpiarTexto = () => {
      setCliente('');
      searchFilterFuction('')
    }
  
  
    const searchFilterFuction = (text) => {
      if(text){
        const newData = data.filter(item => {
          const itemData = item.nombre_cliente ? item.nombre_cliente.toUpperCase() : ''.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        })
        setFilteredData(newData);
      }else{
        setFilteredData(data);
      }
    }

    const [fontsLoaded] = useFonts({
      'ZillaSlab-Bold': require('../assets/fonts/ZillaSlab-Bold.ttf'),
    });

    if (!fontsLoaded) {
      return (
        <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <ActivityIndicator size="large" color="#FF0000" />
        </View>
      );
    }

    return(
        <View style={{paddingTop: insets.top, paddingBottom: insets.bottom}}>
            <ScrollView>
                <View style= {{ alignItems: "center", flex: 1}}>
                <View style= {styles.containerProforma}>
                  <Link asChild href="/home">
                    <TouchableHighlight underlayColor="transparent">
                      <Image source={Flecha} style={{ width: 25, height: 25}}/>
                    </TouchableHighlight>
                  </Link>
                  <Text style={{ fontSize: 19, color: "#F00000", fontFamily: "ZillaSlab-Bold"}}> BUSCAR CLIENTE </Text>
                </View>
                <View style={ styles.containerBuscar}>
                  <Image source={Search} style= {{ width: 15, height: 15}}/>
                  <TextInput 
                    placeholder="Buscar..." 
                    style= {styles.input} 
                    value={cliente}
                    onChangeText={(text) => { 
                        setCliente(text); 
                        searchFilterFuction(text)
                        }}
                  />
                  {cliente.length > 0 && (
                    <TouchableHighlight onPress={() => {
                      Keyboard.dismiss(); 
                      limpiarTexto();}} 
                      underlayColor="transparent"
                    >
                      <Image source={X} style={{ width: 18, height: 18, left: 20}}/>
                    </TouchableHighlight>
                  )}
                </View>
                <View style= {styles.containerCliente}>
                    {filteredData.map ((item, index) => {
                    return(
                        <View style= {styles.gapClientes} key={index}>
                        <View style= {styles.clienteContainer}>
                            <Image source={{uri: item.img_moto}} style= {styles.motoImage} resizeMode= "contain"/>
                        </View>
                        <TouchableHighlight onPress={() => 
                            Alert.alert("Proforma Cliente", 
                            `Nombre: ${item.nombre_cliente}
                            \nModelo: ${item.modelo}
                            \nSucursal: ${item.sucursal}
                            \nPrecio: ${item.precious} $us.
                            \nIncial: ${item.inicialbs} Bs.
                            \nCuota Mensual: ${item.cuota_mes} $us.
                            \nPlazo: ${item.plazo} Meses
                            \nAsesor: ${item.asesor}
                            \nFecha: ${formatFecha(item.fecha)}`)}
                            underlayColor="transparent"
                            style={styles.clienteInfo}>
                        <View>
                            <Text> {item.nombre_cliente}</Text>
                            <Text> {item.modelo}</Text>
                            <Text> {item.sucursal}</Text>
                            <Text> {formatFecha(item.fecha)} </Text>
                        </View>
                        </TouchableHighlight>
                        </View>
                    )
                    })}
                </View>
                </View>
                <StatusBar style='auto'/>
            </ScrollView>
        </View>
    )
};

const styles = StyleSheet.create({
    containerProforma: {
      flexDirection: "row",
      width: "90%",
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 16
    },
    containerBuscar: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: "#F5F5F5",
      paddingHorizontal: 15,
      width: '95%',
      gap: 5,
    },
    iconSearch: {
      height: 30,
      width: 30,
    },
    input: {
      fontWeight: "400",
      fontSize: 15,
      width: '80%',
    },
    containerCliente: {
      gap: 20,
      top: 10
    },
    gapClientes: {
      flexDirection: "row",
    },
    motoImage: {
      width: 100,
      height: 100,
    },
    clienteInfo: {
      justifyContent: 'center',
    },
  });