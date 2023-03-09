
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import { StatusBar } from 'react-native'

import { Loading } from './src/componentes/Loading';
import { Rotas } from './src/rotas';
import { Background } from './src/componentes/Backgound';

export default function App() {

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black
  });

  return (

    <Background>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#7fdec7"
        translucent />
      {fontsLoaded ? <Rotas /> : <Loading />}
    </Background>
  );
}
