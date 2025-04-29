import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform, ScrollView, ActivityIndicator, BackHandler, Image, TextInput, TouchableHighlight, TouchableOpacity, Modal, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "../components/logo";
import Logout from "../assets/img/logout.png";
import Cliente from "../assets/img/btn.png";
import { useFonts } from "expo-font";
import { io } from "socket.io-client";
import { useLocalSearchParams } from 'expo-router';
import { Picker } from "@react-native-picker/picker";
import { Proforma } from '../components/proforma';
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { getData } from '../utilities/sesions';
//ruta a login
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

//router
import { useRouter } from 'expo-router'; // Asegúrate de importar useRouter



export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  //recuperar los datos de la sesion del local storage
  const { asesor, id_asesores, id_sucursal } = useLocalSearchParams();

  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [plazo, setPlazo] = useState('');
  const [data, setData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [precioDolares, setPrecioDolares] = useState('');
  const [precioBolivianos, setPrecioBolivianos] = useState('');
  const [inicialDolares, setInicialDolares] = useState('');
  const [inicialBolivianos, setInicialBolivianos] = useState('');
  const [imagen, setImagen] = useState('');
  const [costoVarios, setCostoVarios] = useState([{  interes_anual: 0, tipo_cambio: 0, formulario: 0, descuento_inicial:0 }]);
  const [showAlert, setShowAlert] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modeloSeleccionado, setModeloSeleccionado] = useState('');
  const router = useRouter(); // Añade esto junto a tus otros hooks




  //------------constantes de local storage
  const params = useLocalSearchParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      const savedData = await getData();
      const combinedData = savedData ? { ...savedData, ...params } : params;
      setUserData(combinedData);
    };

    loadSession();
  }, []);


  const asesorData = userData ? userData.asesor : null;
  const idAsesor = userData ? userData.id_asesores : null;
  const idSucursal = userData ? userData.id_sucursal : null;
  //console.log("Datos de sesión:", userData);
  //------------------------------------------
  // MOTOS
  const socket = io("http://177.222.114.122:3306")

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("obtenerMotos");
      socket.emit("obtenerCosto");
    });

    socket.on("motos", (motos) => {
      setData(motos);
    });

    socket.on("costosvarios", (costo) => {
      setCostoVarios(costo)
    })

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleModeloChange = (value) => {
    setSelectedValue(value);

    const motoSeleccionada = data.find(moto =>
      moto.id_motos.toString() === value.toString()); // <- Corrección aquí

    if (motoSeleccionada) {

      setImagen(motoSeleccionada.img_motos);
      setPrecioDolares(motoSeleccionada.precious);
      setPrecioBolivianos((motoSeleccionada.precious * costoVarios[0].tipo_cambio).toFixed(2));
      setModeloSeleccionado(motoSeleccionada.modelo);
    } else {
      // Resetear valores
      setImagen('');
      setPrecioDolares('');
      setPrecioBolivianos('');
      setModeloSeleccionado('');
    }
  };

  // ESTILO DEL INPUT AL SELECCIONAR
  const [isFocusedInput1, setIsFocusedInput1] = useState(false);
  const [isFocusedInput2, setIsFocusedInput2] = useState(false);
  const [isFocusedInput3, setIsFocusedInput3] = useState(false);
  const [isFocusedInput4, setIsFocusedInput4] = useState(false);
  const [isFocusedInput5, setIsFocusedInput5] = useState(false);

  //loading al presionar procesar
  const [isProcessing, setIsProcessing] = useState(false);


  //
  const handleInicialDolaresChange = (text) => {
    setInicialDolares(text);

    if (!isNaN(parseFloat(text))) {

      const inicialBs = parseFloat(text) * costoVarios[0].tipo_cambio;
      setInicialBolivianos(inicialBs.toFixed(2));
    }
  };

  const handleInicialBolivianosChange = (text) => {
    setInicialBolivianos(text);

    if (!isNaN(parseFloat(text))) {
      const inicialDolares = parseFloat(text) / costoVarios[0].tipo_cambio;
      setInicialDolares(inicialDolares.toFixed(2));
    }
  };


  // POST CLIENTE
  const handlePress = async () => {
    const startTime = Date.now();
    const MIN_LOADING_TIME = 1000;
    setIsProcessing(true);
    try {
      //validar datos de cliente
      if (!nombreCliente || !telefonoCliente || !plazo || !selectedValue) {
        Alert.alert("Error", "Faltan campos por ingresar");
        return; // Si la validación falla, no continuar
      }

      //validar moto slecionada
      if (!selectedValue) {
        Alert.alert("Error", "Seleccione una moto");
        return; // Si la validación falla, no continuar
      }

      if (!validarPlazo()) {
        return; // Si la validación falla, no continuar
      }
      if (!validarIncial()) {
        return; // Si la validación falla, no continuar
      }
      const responseCliente = await axios.post("http://177.222.114.122:3306/clientes", {
        nombre: nombreCliente,
        telefono: telefonoCliente,
      });
      //console.log(`id_asesor: ${userData.id_asesores}\nasesor: ${userData.asesor}\n Sucursal: ${userData.id_sucursal}\n Nombre: ${nombreCliente}\nTelefono: ${telefonoCliente}\nModelo: ${modeloSeleccionado}\nPlazo: ${plazo} meses\nPrecio $US: ${precioDolares}\nPrecio Bs: ${precioBolivianos}\nInicial $US: ${inicialDolares}\nInicial Bs: ${inicialBolivianos}\nCuota Mensual: ${calcularCuotaMensual()}`);

      if (responseCliente.data && responseCliente.data.id_cliente) {

        const idCliente = responseCliente.data.id_cliente;
        //mostrar ls datos de la proforma
        //console.log(` id_asesor: ${userData.id_asesores}\n asesor: ${userData.asesor}\n Sucursal: ${userData.id_sucursal}\n Nombre: ${nombreCliente}\nTelefono: ${telefonoCliente}\nModelo: ${modeloSeleccionado}\nPlazo: ${plazo} meses\nPrecio $US: ${precioDolares}\nPrecio Bs: ${precioBolivianos}\nInicial $US: ${inicialDolares}\nInicial Bs: ${inicialBolivianos}\nCuota Mensual: ${calcularCuotaMensual()}`);
        //validar plazo
        if (validarIncial()) {
          await axios.post("http://177.222.114.122:3306/proforma", {
            id_cliente: idCliente,
            id_motos: selectedValue,
            id_asesores: userData.id_asesores,
            id_sucursal: userData.id_sucursal,
            modelo: modeloSeleccionado,
            plazo: plazo,
            precious: precioDolares,
            inicialbs: inicialBolivianos,
            cuota_mes: calcularCuotaMensual()
          });

          //Alert.alert("Aviso", "Cliente registrado correctamente");
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime < MIN_LOADING_TIME) {
            await new Promise(resolve =>
              setTimeout(resolve, MIN_LOADING_TIME - elapsedTime)
            );
          }
        }
      } else {
        Alert.alert("Error", "No se pudo almacenar el nuevo cliente");
      }
      setShowAlert(true);
      setModalVisible(true);
    } catch (err) {
      //console.log(`id_asesor: ${userData.id_asesores}\nasesor: ${userData.asesor}\n Sucursal: ${userData.id_sucursal}\n Nombre: ${nombreCliente}\nTelefono: ${telefonoCliente}\nModelo: ${modeloSeleccionado}\nPlazo: ${plazo} meses\nPrecio $US: ${precioDolares}\nPrecio Bs: ${precioBolivianos}\nInicial $US: ${inicialDolares}\nInicial Bs: ${inicialBolivianos}\nCuota Mensual: ${calcularCuotaMensual()}`);

      //console.error(err);
      //Alert.alert("Error", err.message);
      Alert.alert("Error", "Faltan campos por ingresar");
      // si el servidor devueve un error con numero 409 puedo controlar eso y poenr otra alerta
      if (err.response && err.response.status === 409) {
        Alert.alert("Error", "El cliente ya existe en la base de datos, pero con numero de telefono diferente");
        //ahora si falta ingresar algun campo
      } else {
        Alert.alert("Error", "Faltan campos por ingresar");
      }
      console.log(err.message);

    } finally {
      setIsProcessing(false); // Desactivar loading siempre
    }
    //validndo entrada de valores de los inputs inicial en dolares y bolivianos

  }
  //validar los inputs de la proforma pero debe espeerar a que termine de escribir o rellenar los inputs
  // Función de validación mejorada
  function validarPlazo() {
    // Convertir a número (por si viene como string)
    const plazoNum = Number(plazo);

    if (plazoNum < 1 || plazoNum > 18) {
      Alert.alert("Error", "El plazo debe estar entre 1 y 18 meses");
      setPlazo('');
      return false;
    }
    if (plazoNum === '') {
      Alert.alert("Error", "El plazo no puede ser vacio");
      setPlazo('');
      return false;
    }

    return true;
  }
  function validarIncial() {
    //console.log("validando inicial", inicialDolares, precioDolares);
    if (Number(inicialDolares) > Number(precioDolares)) {
      Alert.alert("Error", "El monto inicial no puede ser mayor al precio de la moto");
      setInicialDolares('');
      setInicialBolivianos('');
      return false; // Indicate failure
    }
    if (Number(inicialDolares) < (Number(precioDolares) * 0.20)) {
      //calcular el 14.57% del precio de la moto
      var porcentaje1457 = Number(precioDolares) * 0.20;
      Alert.alert("Aviso", `El monto inicial no puede ser menor al 20% del precio de la moto \n (${porcentaje1457.toFixed(2)} $US)`);
      setInicialDolares('');
      setInicialBolivianos('');
      return false; // Indicate failure
    }
    return true; // Indicate success
  }
  //funcion para volver a la pagina de login sin usar navigate
  // CUOTA MENSUAL

  const calcularCuotaMensual = () => {

    const costoMoto = precioDolares
    const inicialBs = (inicialBolivianos - costoVarios[0].descuento_inicial) / costoVarios[0].tipo_cambio
    const interesAnual = costoVarios[0].interes_anual / 12
    const costoFormulario = costoVarios[0].formulario / costoVarios[0].tipo_cambio
    const plazoMes = plazo
    const montoFinanciando = costoMoto - inicialBs
    const factorInteres = Math.pow(1 + interesAnual, plazoMes)
    const cuotaMensual = (montoFinanciando * interesAnual * factorInteres) / (factorInteres - 1)
    const cuotaTotal = cuotaMensual + costoFormulario

    return cuotaTotal.toFixed(2);

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


  return (
    <ScrollView style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={true}>
      <View style={styles.container}>
        <View style={styles.logo}>
          {/* boton de logout*/}
          <TouchableOpacity
            style={{ position: "absolute", top: 30, right: 190 }}
            onPress={() => {
              Alert.alert(
                "Cerrar sesión",
                "¿Estás seguro de que deseas salir?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Salir",
                    onPress: async () => {
                      // Usa setTimeout para asegurar la ejecución
                      setTimeout(async () => {
                        //console.log("1 - Esto SÍ se debería ver");
                        await AsyncStorage.removeItem('userData');// Eliminar datos de sesión
                        // Redirige al puente login (que luego carga tu pantalla real)
                        router.replace("/login");

                        if (Platform.OS === "android") {
                          setTimeout(() => BackHandler.exitApp(), 100);
                        }
                      }, 100);
                    }
                  }
                ]
              );
            }}
          >
            <Image source={Logout} style={styles.logout} />
          </TouchableOpacity>
          <Logo />
          <Link asChild href="/cliente">
            <TouchableHighlight style={styles.iconContainer} underlayColor="transparent">
              <Image source={Cliente} style={styles.bcliente} />
            </TouchableHighlight>
          </Link>
        </View>
        <View style={styles.Title}>
          <Text style={{ fontFamily: 'ZillaSlab-Bold', fontSize: 18, color: "grey", paddingTop: 20 }}> PROFORMA </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Image source={imagen ? { uri: imagen } : require('../assets/img/Navi/navi.webp')} style={styles.motosh} />
        </View>
        <TextInput placeholder="NOMBRE DEL CLIENTE"
          style={[styles.textInput, isFocusedInput4 ? styles.inputFocused : null]}
          value={nombreCliente}
          onFocus={() => setIsFocusedInput4(true)}   // Activa al seleccionar
          onBlur={() => setIsFocusedInput4(false)}  // Desactiva al salir
          onChangeText={setNombreCliente} />
        <TextInput placeholder="TELEFONO DEL CLIENTE"
          style={[styles.textInput, isFocusedInput5 ? styles.inputFocused : null]}
          onFocus={() => setIsFocusedInput5(true)}   // Activa al seleccionar
          onBlur={() => setIsFocusedInput5(false)}  // Desactiva al salir 
          keyboardType="numeric" value={telefonoCliente}
          onChangeText={setTelefonoCliente} />
        <Text style={styles.textM}> MODELO </Text>
        <View style={styles.select}>

          <Picker
            selectedValue={selectedValue}
            onValueChange={(value) => handleModeloChange(value)}
            style={styles.picker}
          >
            {/* Opciones de motos con "Seleccionar Moto" sin qu eaparezca en el centro el defautl*/}
            <Picker.Item label="Seleccionar Moto" value={null} style={styles.textM} />
            {/* Opciones de motos */}
            {/* Dividir las opciones en dos columnas */}
            {data.length === 0 && <Picker.Item label="Cargando..." value={null} />}
            {data.length > 0 && data.map(moto => (
              <Picker.Item key={moto.id_motos} label={moto.modelo} value={moto.id_motos} />
            ))}

          </Picker>

        </View>
        <Text style={styles.textM}> PLAZO </Text>
        <View style={styles.plazo}>
          <TextInput
            placeholder="Ingrese Mes"
            style={[
              styles.textInputPlazo,
              isFocusedInput1 ? styles.inputFocused : null // Esto evita errores si isFocused no existe
            ]}
            keyboardType="numeric"
            //valor minimo 12 y valor maximo 24
            maxLength={2}
            value={plazo}
            ///estilo para el foco al seleccionar el input
            onFocus={() => setIsFocusedInput1(true)}   // Activa al seleccionar
            // Desactiva al salir y llamamr a la funcion de validar
            onEndEditing={validarPlazo}
            onChangeText={(text) => {
              setPlazo(text);

            }}
          />
          <Text style={styles.textMeses}> MESES </Text>
        </View>
        <View style={styles.monedas}>
          <Text style={styles.text}>$US</Text>
          <Text style={styles.text}>BS</Text>
        </View>
        <Text style={styles.titlePrecio}>Precio:</Text>
        <View style={styles.precioContainer}>
          <TextInput
            placeholder="PRECIO $US"
            style={styles.preciosus}
            value={precioDolares.toString()} // Ensure value is a string
            editable={false}
            keyboardType="numeric" />
          <TextInput
            placeholder="PRECIO Bs"
            style={styles.preciobs}
            value={precioBolivianos.toString()} // Ensure value is a string
            editable={false}
            keyboardType="numeric" />
        </View>
        <Text style={styles.titleInicial}>Inicial:</Text>
        <View style={styles.incialContainer}>
          <TextInput
            //llmar a la funcion para validar el input
            placeholder="INICIAL $US"
            value={inicialDolares}
            onEndEditing={validarIncial}
            onChangeText={handleInicialDolaresChange}
            style={[styles.inicialsus,
            isFocusedInput2 ? styles.inputFocused : null
            ]}
            ///estilo para el foco al seleccionar el input
            onFocus={() => setIsFocusedInput2(true)}   // Activa al seleccionar
            onBlur={() => setIsFocusedInput2(false)}  // Desactiva al salir
            keyboardType="numeric" />
          <TextInput
            placeholder="INICIAL BS"
            value={inicialBolivianos}
            onEndEditing={validarIncial}
            onChangeText={handleInicialBolivianosChange}
            style={[styles.inicialbs,
            isFocusedInput3 ? styles.inputFocused : null
            ]}
            ///estilo para el foco al seleccionar el input
            onFocus={() => setIsFocusedInput3(true)}   // Activa al seleccionar
            onBlur={() => setIsFocusedInput3(false)}  // Desactiva al salir
            keyboardType="numeric" />
        </View>
          <TouchableHighlight
            style={[styles.button, isProcessing && { opacity: 0.7 }]}
            onPress={handlePress}
            disabled={isProcessing}
          >
            <Text style={styles.textButton}>PROCESAR</Text>
          </TouchableHighlight>

          {isProcessing && (
            <View style={styles.processingOverlay}>
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#FF0000" />
                <Text style={styles.processingText}>PROCESANDO...</Text>
              </View>
            </View>
          )}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}>
          <Proforma
            nombre={nombreCliente}
            telefono={telefonoCliente}
            modelo={modeloSeleccionado}
            plazo={plazo}
            precioDolares={precioDolares}
            precioBolivianos={precioBolivianos}
            inicialDolares={inicialDolares}
            inicialBolivianos={inicialBolivianos}
            cuotaMes={calcularCuotaMensual()}
            asesor={asesorData}
            id_asesor={idAsesor}
            id_sucursal={idSucursal}
            imagen={imagen}
            tipoCambio={costoVarios[0].tipo_cambio}
          />
        </Modal>
      </View>
      <StatusBar style='auto' />
    </ScrollView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 10
  },
  logo: {
    height: 100,
    width: 100,
    top: 10
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    left: 180,
  },
  bcliente: {
    width: 60,
    height: 60,
  },
  logout: {
    transform: [{ rotate: '180deg' }],
    width: 40,
    height: 40,
  },
  motosh: {
    height: 190,
    width: 310,
  },
  textInput: {
    borderBottomWidth: 1,
    width: '90%',
    textAlign: "center",
    marginTop: 10,
    padding: 8,
  },
  textM: {
    marginTop: 20,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 0,
  },
  select: {
    margin: 0,
    width: '60%',
  },

  plazo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 30
  },
  textInputPlazo: {
    borderColor: '#ccc',
    padding: 8,
    textAlign: "center",
    borderBottomWidth: 1,
  },
  inputFocused: {
    borderColor: '#FF0000',  // Color del borde al seleccionar (rojo)
  },
  textMeses: {
    marginLeft: 10,
    alignSelf: 'center',
  },
  monedas: {
    flexDirection: "row",
    gap: 141,
    left: 20,
    top: 15
  },
  text: {
    color: 'grey',
    fontWeight: "bold"
  },
  titlePrecio: {
    color: 'grey',
    fontWeight: 'bold',
    left: -155,
    top: 35
  },
  precioContainer: {
    flexDirection: "row",
    gap: 70,
    top: 10
  },
  preciosus: {
    borderBottomWidth: 1,
    width: 125,
    textAlign: "center",
    left: 35
  },
  preciobs: {
    borderBottomWidth: 1,
    width: 125,
    textAlign: "center"
  },
  titleInicial: {
    color: 'grey',
    fontWeight: 'bold',
    left: -155,
    top: 45
  },
  incialContainer: {
    flexDirection: "row",
    gap: 70,
    top: 20
  },
  inicialsus: {
    borderBottomWidth: 1,
    width: 125,
    textAlign: "center",
    left: 35
  },
  inicialbs: {
    borderBottomWidth: 1,
    width: 125,
    textAlign: "center",
  },
  button: {
    backgroundColor: '#FF0000',
    borderRadius: 20,
    height: 40,
    width: 300,
    marginTop: 40
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(0, 0, 0)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  textButton: {
    textAlign: 'center',
    color: 'white',
    paddingTop: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelar: {
    backgroundColor: '#FF0000',
    borderRadius: 20,
    height: 40,
    width: 300,
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