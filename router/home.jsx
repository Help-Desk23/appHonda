import { View, Text ,StyleSheet } from "react-native";
import { Logo } from "../components/logo";


export function HomeScreem () {
    return (
        <View>
            <View style={styles.logo}>
                <Logo/>
            </View>
            <Text style={styles.text}> Home </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "#000"
    },
})
