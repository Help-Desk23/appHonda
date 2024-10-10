import React from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/');
  };

  return (
    <View>
      <Text>Welcome to Home Screen!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;




/*import { View, Text ,StyleSheet, ScrollView } from "react-native";
import { Logo } from "../components/logo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { LoadingScreems } from "../components/loadingScreems";


export function HomeScreem () {
    const insets = useSafeAreaInsets();

    const [fontsLoaded] = useFonts({
        'ZillaSlab-Bold': require('../assets/fonts/ZillaSlab-Bold.ttf'),
      });

      if(!fontsLoaded){
        return <LoadingScreems/>;
      };


    return (
        <View style={{paddingTop: insets.top, paddingBottom: insets.bottton}}>
            <ScrollView>
                <View style={styles.logo}>
                    <Logo/>
                </View>
                <View style={styles.Title}>
                    <Text style={{ fontFamily:'ZillaSlab-Bold', fontSize: 20, color: "grey" }}> Proforma </Text>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    logo: {
        height: 90,
    },
    Title: {
        alignItems: "center"
    }
})*/
