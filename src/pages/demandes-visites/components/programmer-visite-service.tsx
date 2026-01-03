import {BaseKey} from "@refinedev/core";
import {API_URL} from "@/configs";

import {axiosInstance} from "@/lib/providers/utils";


export const programmerVisite = (
    id: BaseKey | undefined,
    dateString: string | string[]) => {
    try {
        const response = axiosInstance.post(`${API_URL}/demandes-visites/action/programmer/${id}`, {
            datesDemandeVisite: [{"date": dateString}]
        })
        response.then(value => console.log(value))
    }catch (error){
        console.error('Error during API call:', error)
    }
}





