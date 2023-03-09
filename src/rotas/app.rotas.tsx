import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HistoricoStatus } from "../telas/HistoricoStatus";
import { Login } from "../telas/Login";
import { Semanal } from "../telas/Semanal";
import { SemanalDetalhe } from "../telas/SemanalDetalhe";

const { Navigator, Screen } = createNativeStackNavigator();
export function AppRotas() {
  return (
    <Navigator screenOptions={{ headerShown: false }}>

      <Screen
        name="login" component={Login} />

      <Screen
        name="semanal" component={Semanal}
      />
      <Screen
        name="semanalDetalhes" component={SemanalDetalhe}
      />
      <Screen
        name="historicoStatus" component={HistoricoStatus} />

    </Navigator>
  )
}