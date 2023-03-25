
import { supabase } from '../Supabase/database';

export interface location {
  Longitude: number | null,
  Latitude: number | null
}

export async function Dadosgeolocal(idCaixa: number | null): Promise<location | undefined> {
  return new Promise(async (resolve) => {

    let { data: local, error: localErr } = await supabase.from('caixa').select('Latitude, Longitude').eq('id_caixa', idCaixa)

    if (localErr) {
      console.log(localErr);
      return
    }
    // @ts-ignore
    const Latitude = local[0].Latitude;
    // @ts-ignore
    const Longitude = local[0].Longitude;

    resolve({ Latitude, Longitude })


  })
}