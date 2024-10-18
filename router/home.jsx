import React from "react";
import { View, Text ,StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "../components/logo";
import { useFonts } from "expo-font";

export function HomeScreen() {
  const insets = useSafeAreaInsets();

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
    <View style= {{ paddingTop: insets.top, paddingBottom: insets.bottom}}>
      <ScrollView>
        <View style= {styles.logo}>
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
    height: 90
  },
  Title: {
    alignItems: "center"
  }
});


