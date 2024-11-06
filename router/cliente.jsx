import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View,TextInput, ScrollView, TouchableHighlight, Alert} from "react-native";
import Cancelar from '../assets/img/cancelar.png';
import { io } from "socket.io-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export function Cliente () {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [cliente, setCliente] = useState('');
    const insets = useSafeAreaInsets();
    
  const socket = io("http://192.168.2.46:4000");
  
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

    return(
        <View style={{paddingTop: insets.top, paddingBottom: insets.bottom}}>
            <ScrollView>
                <View style= {{ alignItems: "center", flex: 1}}>
                <View style= {styles.containerProforma}>
                    <Text style={styles.titleProforma }> BUSCAR PROFORMA </Text>
                </View>
                <View style={ styles.containerBuscar}>
                    <TextInput 
                    placeholder="NOMBRE DEL CLIENTE" 
                    style= {styles.input} 
                    value={cliente}
                    onChangeText={(text) => { 
                        setCliente(text); 
                        searchFilterFuction(text)
                        }}
                    />
                    <TouchableHighlight onPress={limpiarTexto} underlayColor="transparent">
                        <Image source={Cancelar} style= {styles.iconSearch} />
                    </TouchableHighlight>
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
      backgroundColor: "#cd2027",
      height: 80,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    titleProforma: {
      fontSize: 15,
      fontWeight: 'bold',
      color: "white",
      top: 20
    },
    containerBuscar: {
      flexDirection: "row",
      gap: 50,
      marginTop: 10,
      justifyContent: "center"
    },
    iconSearch: {
      height: 40,
      width: 40
    },
    input: {
      borderBottomWidth: 1,
      width: "70%",
      textAlign: "center",
      borderBottomColor: '#ccc',
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