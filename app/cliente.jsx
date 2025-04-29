import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View, TextInput, ScrollView, TouchableHighlight, Alert, ActivityIndicator, Keyboard, Linking, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";

import Search from '../assets/img/search.png';
import Flecha from '../assets/img/flecha.png';
import X from '../assets/img/equis.png';
import { io } from "socket.io-client";
import { getData } from "../utilities/sesions";


export default function Cliente() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [cliente, setCliente] = useState('');
  const [idAsesor, setIdAsesor] = useState(null);
  const insets = useSafeAreaInsets();
  const [alertVisible, setAlertVisible] = useState(false);
  const router = useRouter();

  const socket = io("http://177.222.114.122:3306");

  useEffect(() => {
    const cargarDatosAsesor = async () => {
      const datos = await getData();
      if (datos) {
        setIdAsesor(datos.id_asesores);
      }
    };
    cargarDatosAsesor();
  }, []);

  useEffect(() => {
    if (!idAsesor) return;

    socket.on("connect", () => {
      socket.emit("obtenerCotizacionAsesor", { id_asesores: idAsesor });
    });

    socket.on("proformaData", (cotizacion) => {
      setData(cotizacion)
    });
  }, [idAsesor]);

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
    if (text) {
      const newData = data.filter(item => {
        const itemData = item.nombre_cliente ? item.nombre_cliente.toUpperCase() : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      })
      setFilteredData(newData);
    } else {
      setFilteredData(data);
    }
  }
  //recaegar el tipo de letra
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
  const mostrarAlertaProforma = (item) => {
    if (alertVisible) return; // Evita abrir dos veces

    setAlertVisible(true);

    const mensaje = `*PROFORMA CLIENTE*:\n\n` +
      `Hola, ${item.nombre_cliente} le comparto la proforma de la moto:\n\n` +
      `*Modelo*: ${item.modelo}\n` +
      `*Precio*: ${item.precious} $us\n` +
      `*Inicial*: ${item.inicialbs} Bs\n` +
      `*Cuota Mensual*: ${item.cuota_mes} $us\n` +
      `*Plazo*: ${item.plazo} meses\n\n\n` +
      `Soy ${item.asesor}  de la sucursal ${item.sucursal}.`;

    Alert.alert(
      "Proforma Cliente",
      `Nombre: ${item.nombre_cliente}
      \nModelo: ${item.modelo}
      \nSucursal: ${item.sucursal}
      \nPrecio: ${item.precious} $us.
      \nIncial: ${item.inicialbs} Bs.
      \nCuota Mensual: ${item.cuota_mes} $us.
      \nPlazo: ${item.plazo} Meses
      \nAsesor: ${item.asesor}
      \nFecha: ${formatFecha(item.fecha)}`,
      [
        {
          text: "Cerrar",
          style: "cancel",
          onPress: () => setAlertVisible(false),
        },
        {
          text: "Enviar por WhatsApp",
          onPress: () => {
            const numeroConCodigoPais = `591${item.telefono}`;
            const url = Platform.OS === 'ios'
              ? `https://wa.me/${numeroConCodigoPais}?text=${encodeURIComponent(mensaje)}`
              : `whatsapp://send?phone=${numeroConCodigoPais}&text=${encodeURIComponent(mensaje)}`;

            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(url);
                } else {
                  Alert.alert("Error", "WhatsApp no está instalado");
                }
              })
              .catch((err) => console.error("Error:", err))
              .finally(() => setAlertVisible(false)); // asegurarse de liberar el flag
          }
        }
      ]
    );
  };


  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: "#FFFF", flex: 1 }}>
      <View style={{ backgroundColor: "#F5F5F5", height: insets.top }} />
  
      {/* Encabezado y búsqueda */}
      <View style={{ alignItems: "center" }}>
        <View style={styles.containerProforma}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            onPress={() => router.replace('/home')}
            underlayColor="#6D5B5B"
            activeOpacity={0.6}
          >
            <Image source={Flecha} style={{ width: 25, height: 25, marginRight: 20 }} />
          </TouchableOpacity>
          <Text style={{ fontSize: 19, color: "#F00000", fontFamily: "ZillaSlab-Bold" }}> BUSCAR CLIENTE </Text>
        </View>
  
        <View style={styles.containerBuscar}>
          <Image source={Search} style={{ width: 15, height: 15 }} />
          <TextInput
            placeholder="Buscar..."
            style={styles.input}
            underlayColor="#F5F5F5"
            onChangeText={(text) => {
              setCliente(text);
              searchFilterFuction(text);
            }}
          />
          {cliente.length > 0 && (
            <TouchableHighlight
              onPress={() => {
                Keyboard.dismiss();
                limpiarTexto();
              }}
              underlayColor="transparent"
            >
              <Image source={X} style={{ width: 18, height: 18, left: 20 }} />
            </TouchableHighlight>
          )}
        </View>
      </View>
  
      {/* Lista scrollable */}
      <ScrollView style={{ flex: 1}}>
        <View style={styles.containerCliente}>
          {filteredData.map((item, index) => {
            return (
              <View style={styles.gapClientes} key={index}>
                <View style={styles.clienteContainer}>
                  <Image source={{ uri: item.img_moto }} style={styles.motoImage} resizeMode="contain" />
                </View>
                <TouchableHighlight
                  style={styles.clienteInfo}
                  onPress={() => mostrarAlertaProforma(item)}
                  underlayColor={"#FF6868"}
                  activeOpacity={0.6}
                >
                  <View>
                    <Text>{item.nombre_cliente}</Text>
                    <Text>{item.modelo}</Text>
                    <Text>{item.sucursal}</Text>
                    <Text>{formatFecha(item.fecha)}</Text>
                  </View>
                </TouchableHighlight>
              </View>
            );
          })}
        </View>
      </ScrollView>
  
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  containerProforma: {
    flexDirection: "row",
    width: "90%",
    alignItems: "center",
    paddingBottom: 16
  },
  containerBuscar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
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
    paddingHorizontal: 50, 
    paddingBottom: 20,
    backgroundColor: "#e5e5e5",
  },
  gapClientes: {
    flexDirection: "row",
    alignItems: "flex-start", 
    gap: 10, 
  },
  motoImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  clienteInfo: {
    flex: 1, 
    justifyContent: 'center',
    borderRadius: 10,
    alignItems: "flex-start", 
  },
});
