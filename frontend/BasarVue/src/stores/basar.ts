import { sendRequest } from "@/utils/ServerBums";
import { defineStore } from "pinia";
import { ref } from "vue";

export interface Basar {
  id?: string;
  name: string;
  date: string;
  location: string;
  organizer: string;
  commission: number;
  maxItemsPerSeller: number;
  lowestSellerNumber: number;
  highestSellerNumber: number;
  commissionFreeSellers: number;
}

export const useBasare = defineStore("basar", () => {
  let basare = ref<Basar[] | null | undefined>(undefined);
  function loadAllCases() {
    sendRequest("/basar", "get")
      .then(async (response) => (basare.value = await response.json()))
      .catch(() => (basare.value = null));
  }
  loadAllCases();
  function createBasar(basar: Basar) {
    return sendRequest("/basar", "post", basar).then((response) => {
      loadAllCases();
      return response;
    });
  }

  return {
    basare,
    reload: loadAllCases,
    create: createBasar,
  };
});
