import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { unwrapBody } from "@/lib/helpers/api-response.helper";

export interface ImaaiSettings {
  /** HH:mm, fuseau Africa/Abidjan */
  morningPulseTime: string;
  /** HH:mm, fuseau Africa/Abidjan */
  autoBlockTime: string;
  claudeModel: string;
  availableModels: string[];
}

export type ImaaiSettingsUpdate = Partial<Omit<ImaaiSettings, "availableModels">>;

const KEY = "admin-imaai-settings";
const URL = `${API_URL}/admin/imaai-settings`;

/** GET /admin/imaai-settings */
export function useImaaiSettings() {
  return useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>(URL);
      return unwrapBody<ImaaiSettings>(res.data);
    },
    retry: false,
  });
}

/** PUT /admin/imaai-settings (mise à jour partielle) */
export function useUpdateImaaiSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ImaaiSettingsUpdate) => {
      const res = await axiosInstance.put<unknown>(URL, payload);
      return unwrapBody<ImaaiSettings>(res.data);
    },
    onSuccess: (data) => queryClient.setQueryData([KEY], data),
  });
}
