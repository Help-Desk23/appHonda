import React, { useEffect, useState } from "react";
import { View, Text ,StyleSheet, ScrollView, ActivityIndicator, Image, TextInput, TouchableHighlight, Modal, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "../components/logo";
import Cliente from "../assets/img/btn.png";
import { useFonts } from "expo-font";
import { io } from "socket.io-client";
import {useLocalSearchParams} from 'expo-router';
import { Picker } from "@react-native-picker/picker";
import {Proforma} from '../components/proforma';
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";

export function HomeScreen() {
  const insets = useSafeAreaInsets();
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
  const [ costoVarios, setCostoVarios ] = useState([{ interes_anual: 0, formulario: 0 }]);
  const [showAlert, setShowAlert] = useState(false);
  const [ modalVisible, setModalVisible] = useState(false);
  const [modeloSeleccionado, setModeloSeleccionado] = useState('');

  const tipoCambio = 6.97;

  // MOTOS

  const socket = io("http://192.168.2.242:4000")

  useEffect(() =>{
    socket.on("connect", () => {
      socket.emit("obtenerMotos");
      socket.emit("obtenerCostos");
    });

    socket.on("motos", (motos) => {
      setData(motos);
    });

    socket.on("costovarios", (costo) => {
      setCostoVarios(costo)
    })

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleModeloChange = (value) => {
    setSelectedValue(value);
    const motoSeleccionada = data.find(moto => moto.id_motos === value);
    if (motoSeleccionada) {
      setImagen(motoSeleccionada.img_motos);
      setPrecioDolares(motoSeleccionada.precious);
      setPrecioBolivianos((motoSeleccionada.precious * tipoCambio).toFixed(2));
      setModeloSeleccionado(motoSeleccionada.modelo);
    } else {
      setPrecioDolares('');
      setPrecioBolivianos('');
      setImagen('');
      setModeloSeleccionado('');
    }
  };

  const handleInicialDolaresChange = (text) => {
    setInicialDolares(text);
    
    if (!isNaN(parseFloat(text))) {
      
      const inicialBs = parseFloat(text) * tipoCambio;
      setInicialBolivianos(inicialBs.toFixed(2));
    }
  };

  const handleInicialBolivianosChange  = (text) => {
    setInicialBolivianos(text);

    if(!isNaN(parseFloat(text))) {
      const inicialDolares = parseFloat(text) / tipoCambio;
      setInicialDolares(inicialDolares.toFixed(2));
    }
  };

// POST CLIENTE

const handlePress = async () => {
  try {
    const responseCliente = await axios.post("http://192.168.2.242:4000/clientes", {
      nombre: nombreCliente,
      telefono: telefonoCliente,
    });

    if (responseCliente.data && responseCliente.data.id_cliente) {
      const idCliente = responseCliente.data.id_cliente;
      await axios.post("http://192.168.2.242:4000/proforma", {
        id_cliente: idCliente,
        id_motos: selectedValue,
        id_asesores: id_asesores,
        id_sucursal: id_sucursal,
        plazo: plazo,
        precious: precioDolares,
        inicialbs: inicialBolivianos,
        cuota_mes: calcularCuotaMensual()
        
    });
    } else {
      Alert.alert("Error", "No se pudo almacenar el nuevo cliente");
  }
    setShowAlert(true);
    setModalVisible(true);
  } catch (err) {
    Alert.alert("Error", "Faltan campos por ingresar");
  }
};
  


    // CUOTA MENSUAL

    const calcularCuotaMensual = () => {

      const costoMoto = precioDolares
      const descuentoIncial = 700
      const inicialBs = (inicialBolivianos - descuentoIncial) / tipoCambio
      const interesAnual = costoVarios[0].interes_anual / 12
      const costoFormulario = costoVarios[0].formulario / tipoCambio
      const plazoMes = plazo
      const montoFinanciando = costoMoto - inicialBs
      const factorInteres = Math.pow(1 + interesAnual, plazoMes)
      const cuotaMensual = (montoFinanciando * interesAnual * factorInteres) / ( factorInteres - 1)
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


  return(
    <ScrollView>
      <View style= {styles.container}>
          <View style= {styles.logo}>
            <Logo/>
            <Link asChild href="/cliente">
              <TouchableHighlight style={styles.iconContainer} underlayColor="transparent">
                <Image source={Cliente} style={styles.bcliente}/>
              </TouchableHighlight>
            </Link>
          </View>
          <View style={styles.Title}>
            <Text style={{ fontFamily:'ZillaSlab-Bold', fontSize: 18, color: "grey", paddingTop: 20}}> PROFORMA </Text>
          </View>
          <View style= {{flex: 1, alignItems: "center"}}>
            <Image source={ imagen ? {uri: imagen} : require('../assets/img/Navi/navi.png')} style= {styles.motosh} />
          </View>
            <TextInput placeholder= "NOMBRE DEL CLIENTE"  style = { styles.textInput } value={nombreCliente} onChangeText={setNombreCliente} />
            <TextInput placeholder= "TELEFONO DEL CLIENTE" style = { styles.textInput } keyboardType="numeric" value={telefonoCliente} onChangeText={setTelefonoCliente} />
          <Text style = { styles.textM }> MODELO </Text>
          <View style = { styles.select }>
            <Picker 
              selectedValue={selectedValue} 
              onValueChange={(value) => handleModeloChange(value)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccionar Moto" value={null}/>
                {data.map(moto => (
                  <Picker.Item key={moto.id_motos} label={moto.modelo}value={moto.id_motos} />
                ))}
            </Picker>
          </View>
          <Text style = { styles.textM }> PLAZO </Text>
          <View style={styles.plazo}>
            <TextInput 
                placeholder="Ingrese Mes" 
                style={styles.textInputPlazo}
                keyboardType="numeric"
                maxLength={2}
                value={plazo}
                onChangeText={setPlazo}    
            />
            <Text style={styles.textMeses}> MESES </Text>
          </View>
          <View style = { styles.monedas }>
            <Text style = { styles.text }>$US</Text>
            <Text style = { styles.text }>BS</Text>
          </View>
          <Text style = { styles.titlePrecio }>Precio:</Text>
          <View style = { styles.precioContainer }>
            <TextInput 
              placeholder="PRECIO $US"
              style = { styles.preciosus }
              value={precioDolares}
              onChangeText={setPrecioDolares}
              keyboardType="numeric" />
            <TextInput 
              placeholder="PRECIO Bs" 
              style = { styles.preciobs }
              value={precioBolivianos}
              keyboardType="numeric"/>
          </View>
          <Text style = { styles.titleInicial }>Inicial:</Text>
          <View style = { styles.incialContainer }>
            <TextInput
              placeholder="PRECIO $US"
              value={inicialDolares}
              onChangeText={handleInicialDolaresChange}   
              style = { styles.inicialsus }
              keyboardType="numeric"/>
            <TextInput
              placeholder="PRECIO BS" 
              value={inicialBolivianos}
              onChangeText={handleInicialBolivianosChange}
              style = { styles.inicialbs }
              keyboardType="numeric"/>
          </View>
          <TouchableHighlight style = { styles.button } onPress={ handlePress } >
            <Text style = { styles.textButton }> PROCESAR </Text>
          </TouchableHighlight>
          <Modal 
            animationType="slide" 
            transparent= {false} 
            visible= {modalVisible} 
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
                asesor={asesor}
                id_asesores={id_asesores}
                id_sucursal={id_sucursal}
                imagen={imagen}
                tipoCambio={tipoCambio}
              />
          </Modal>
      </View>
       <StatusBar style='auto'/>
    </ScrollView>
  )
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10
  },
  logo: {
    height: 100,
    width: 100,
    top: 20
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    left: 180,
  },
  bcliente:{
    width: 60,
    height: 60,
  },
  motosh: {
    height: 190,
    width: 310,
  },
  textInput: {
    borderBottomWidth: 1,
    width: '90%',
    textAlign: "center",
    top: 6,
  },
  textM: {
    textAlign: "center",
    paddingTop: 20,
    fontWeight: "bold",
    fontSize: 15
  },
  select: {
    width: '60%',
    left: 30
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
  textButton : {
    color: 'white',
    paddingTop: 8,
    paddingLeft: 120 
  },
});


