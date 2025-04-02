import { Text, View, StyleSheet, Image, TouchableHighlight, SafeAreaView, Share, Alert, navigation } from "react-native";
import { StatusBar } from "expo-status-bar";
import ViewShot from "react-native-view-shot";
import { TouchableOpacity } from 'react-native';
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { useRef, useState, useEffect } from "react";
import Flecha from '../assets/img/flecha.png';


// Imagenes
import FondoProforma from '../assets/img/fondo/fondo.png';
import Compartir from '../assets/img/enviar.png';
import Descargar from '../assets/img/descargar.png';

export function Proforma({ nombre, modelo, plazo, precioDolares, precioBolivianos, inicialDolares, inicialBolivianos, cuotaMes, asesor, imagen, tipoCambio }) {

  //pedir permiso para guardar la imagen en la galeria
  const viewShotRef = useRef();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    const requestMediaPermission = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso necesario',
          'La app necesita acceso a tu galería para guardar imágenes.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir configuración', onPress: () => Linking.openSettings() }
          ]
        );
      }
    };
    requestMediaPermission();
  }, []);


  const financiadoDolar = precioDolares - inicialDolares;

  const cuotaBs = cuotaMes * tipoCambio;

  const decimalCuotaMes = cuotaBs.toFixed(2);

  // boton de volver atras
  const navigation = useNavigation();


  // Descargar
  const captureAndSave = async () => {
    try {
      // Verificación robusta de permisos
      if (!mediaLibraryPermission?.granted) {
        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'Permiso requerido',
            'Para guardar la imagen, necesitas otorgar permisos de almacenamiento.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Abrir Configuración',
                onPress: () => Linking.openSettings()
              }
            ]
          );
          return;
        }
      }

      // Capturar el ViewShot
      const uri = await viewShotRef.current.capture();

      const asset = await MediaLibrary.createAssetAsync(uri);

      Alert.alert(
        '¡Guardado exitoso!',
        'La imagen se guardó en tu galería',
        [{ text: 'OK' }]
      );

    } catch (error) {
      Alert.alert(
        'Error',
        error.message.includes('permission')
          ? 'Permiso insuficiente. Selecciona "Permitir todo" en configuración.'
          : 'Error al guardar: ' + error.message
      );
    }
  };

  // Compartir
  const shareImage = async () => {
    try {
      const uri = await viewShotRef.current.capture();

      // Comparte directamente desde la URI temporal
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Compartir Proforma',
        });
      }
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.viewShotRef}>
        <Image source={FondoProforma} style={[styles.image, StyleSheet.absoluteFill]} />
        <Image source={{ uri: imagen }} style={styles.imageMoto} resizeMode="contain" />
        <Text style={styles.modelo}>{modelo}</Text>
        <View style={styles.nombreCliente}>
          <Text style={styles.tituloCliente}>Cliente:</Text>
          <Text style={styles.cliente}> {nombre} </Text>
        </View>

        <View style={styles.precioMoto}>
          <Text style={styles.tituloMoto}> Precio Contado: </Text>
          <View style={styles.precioContainer}>
            <Text style={styles.costoMoto}> $us. {precioDolares} </Text>
            <Text style={styles.costoMoto}> Bs. {precioBolivianos} </Text>
          </View>
        </View>

        <View style={styles.linea}></View>

        <View style={styles.containerTitulos}>
          <View style={styles.gapStyles}>
            <Text style={styles.titulo}> Cuota Inicial: </Text>

            <Text style={styles.titulo}> Cuota Mensual: </Text>

            <Text style={styles.titulo}> Plazo: </Text>

            <Text style={styles.titulo}> Asesor: </Text>
          </View>
          <View style={styles.cuotaContainer}>
            <View style={styles.direction}>
              <Text style={styles.textStyle}> $us. {inicialDolares}</Text>
              <Text style={styles.textStyle}> Bs. {inicialBolivianos}</Text>
            </View>

            <View style={styles.direction}>
              <Text style={styles.textStyle}> $us. {cuotaMes}</Text>
              <Text style={styles.textStyle}> Bs. {decimalCuotaMes}</Text>
            </View>

            <Text style={styles.textStyle}> {plazo} Meses </Text>
            <Text style={styles.textStyle}> {asesor}</Text>
          </View>
        </View>
      </ViewShot>
        {/* Boton de volver atras */}


      <View style={styles.iconFooter}>
      <TouchableOpacity onPress={() => navigation.replace("home")}>
        <Image source={Flecha} style={{ marginLeft: 20, width: 35, height: 35 }} />
      </TouchableOpacity>

        <TouchableHighlight onPress={shareImage}>
          <Image source={Compartir} style={styles.enviar} />
        </TouchableHighlight>


        <TouchableHighlight onPress={captureAndSave}>
          <Image source={Descargar} style={styles.enviar} />
        </TouchableHighlight>
      </View>
      <StatusBar barStyles="light-content" backgroundColor="#202020" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#202020"
  },
  viewShotRef: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    width: "100%",
    height: "52%",
  },
  imageMoto: {
    marginBottom: 50,
    width: 350,
    height: 250,
  },
  modelo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    top: 35
  },
  nombreCliente: {
    alignItems: "center",
    top: 45
  },
  tituloCliente: {
    color: "red",
    fontSize: 20,
    fontWeight: "600"
  },
  cliente: {
    fontSize: 18,
    color: "white"
  },
  precioMoto: {
    alignItems: "center",
    top: 55
  },
  tituloMoto: {
    color: "red",
    fontSize: 20,
    fontWeight: "600"
  },
  precioContainer: {
    flexDirection: "row",
    gap: 20
  },
  costoMoto: {
    fontSize: 18,
    color: "white"
  },
  linea: {
    backgroundColor: "black",
    height: 1,
    width: "100%",
    top: 70
  },
  containerTitulos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    top: 75
  },
  gapStyles: {
    gap: 5
  },
  titulo: {
    fontSize: 18,
    fontWeight: "600",
    color: "red"
  },
  cuotaContainer: {
    gap: 8
  },
  direction: {
    flexDirection: "row",
    gap: 20
  },
  textStyle: {
    fontSize: 15,
    color: "white"
  },
  iconFooter: {
    flexDirection: "row",
    justifyContent: "center",
    top: -15,
    gap: 30
  },
  enviar: {
    height: 40,
    width: 40
  }
});