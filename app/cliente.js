import { Cliente } from "../router/cliente";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function BuscarCliente() {
    return(
        <SafeAreaProvider>
            <Cliente />
        </SafeAreaProvider>
    )
};