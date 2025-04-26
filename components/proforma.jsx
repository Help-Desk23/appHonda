import { Text, View, StyleSheet, Image, TouchableHighlight, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import ViewShot from "react-native-view-shot";
import { TouchableOpacity } from 'react-native';
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from '@react-navigation/native';
import { useRef, useState, useEffect } from "react";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';

// Imagenes
import FondoProforma from '../assets/img/fondo/fondo.png';
import Compartir from '../assets/img/enviar.png';
import Descargar from '../assets/img/descargar.png';
import Flecha from '../assets/img/flecha.png';

export function Proforma({ nombre, modelo, plazo, precioDolares, precioBolivianos, inicialDolares, inicialBolivianos, cuotaMes, asesor, imagen, tipoCambio }) {

  const viewShotRef = useRef();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [isProcessing, setIsProcessing] = useState(false);
    //cosnt de loadin de permisos
  const [isLoading, setIsLoading] = useState(false);
    // Calcular cuota en bolivianos
    const cuotaBs = cuotaMes * tipoCambio;
    const decimalCuotaMes = cuotaBs.toFixed(2);
  
    // boton de volver atras
    const navigation = useNavigation();
  
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (Constants.appOwnership === 'expo') {
          setIsLoading(false);
          return;
        }

        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permiso necesario',
            'La app necesita acceso a tu galería para guardar imágenes.',
            [
              { text: 'Cancelar', onPress: () => setIsLoading(false) },
              { text: 'Abrir configuración', onPress: () => {
                Linking.openSettings();
                setIsLoading(false);
              }}
            ]
          );
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudieron verificar los permisos');
      } finally {
        setIsLoading(false); // Oculta el loader inicial
      }
    };

    checkPermissions();
  }, []);


  // Descargar
  const captureAndSave = async () => {
    setIsLoading(true); // Activar loading
    try {
      if (Constants.appOwnership === 'expo') {
        Alert.alert(
          'No disponible en Expo Go',
          'Para guardar imágenes, debes crear un build de desarrollo (expo run:android).',
          [{ text: 'OK' }]
        );
        return;
      }

      const { granted } = await MediaLibrary.getPermissionsAsync();
      if (!granted) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Se necesitan permisos para guardar la imagen');
          return;
        }
      }

      const uri = await viewShotRef.current.capture();
      await MediaLibrary.createAssetAsync(uri);
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
    } finally {
      setIsLoading(false); // Desactivar loading siempre
    }
  };

  const shareImage = async () => {
    setIsLoading(true);
    try {
      const uri = await viewShotRef.current.capture();
      const fileUri = `${FileSystem.documentDirectory}proforma.png`;
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: 'Compartir Proforma',
        });
      } else {
        console.log('El sistema no permite compartir esta imagen');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff0000" />
          <Text style={styles.loadingText}>Procesando...</Text>
        </View>
      )}
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

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#FF0000" />
              <Text style={styles.processingText}>PROCESANDO...</Text>
            </View>
          </View>
        )}

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
    height: "50%",

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
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    zIndex: 1000,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(0, 0, 0)', // Fondo negro semitransparente
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Para que esté por encima de todo
  },
  processingContainer: {
    backgroundColor: 'rgb(76, 74, 74)',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
});
