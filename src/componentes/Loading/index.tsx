
import { View, ActivityIndicator } from "react-native";
import { TEMA } from "../../tema/tema";
import { styles } from "./styles";

export function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={TEMA.COLORS.PRIMARY} />
    </View>
  )
}