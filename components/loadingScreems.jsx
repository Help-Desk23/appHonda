import { View, Text, ActivityIndicator, StyleSheet } from "react-native";



export function LoadingScreems () {

    return(
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF0000" />
        </View>
    )
};


const styles = StyleSheet.create({
    loadingContainer: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
    },
  });