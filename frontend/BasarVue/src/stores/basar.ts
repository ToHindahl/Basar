import router from "@/router";
import { sendRequest } from "@/utils/ServerBums";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useRoute } from "vue-router";

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
  const route = useRoute();

  let basare = ref<Basar[] | null | undefined>(undefined);
  var promise: Promise<any>;
  function loadAllCases() {
    promise = sendRequest(route.fullPath, "/basar", "get")
      .then(async (response) => (basare.value = await response.json()))
      .catch(() => (basare.value = null));
  }
  loadAllCases();
  function createBasar(basar: Basar) {
    return sendRequest(route.fullPath, "/basar", "post", basar).then(
      (response) => {
        loadAllCases();
        return response;
      }
    );
  }
  async function getBasarById(id: string): Promise<Basar | null> {
    await promise;
    return basare.value?.filter((basar) => basar.id === id).pop() ?? null;
  }

  function deleteBasar(id: string): Promise<any> {
    return sendRequest(route.fullPath, "/basar/" + id, "delete").then(
      (response) => {
        loadAllCases();
        return response;
      }
    );
  }
  function updateBasar(basar: Basar) {
    return sendRequest(route.fullPath, "/basar", "put", basar).then(
      (response) => {
        loadAllCases();
        return response;
      }
    );
  }

  return {
    basare,
    reload: loadAllCases,
    create: createBasar,
    update: updateBasar,
    getBasarById,
    deleteBasar,
  };
});
