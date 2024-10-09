import { Slot } from "expo-router";
import { Text, View } from "react-native";


export default function Layout() {
    return(
        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
            <Slot/>
        </View>
    )
}