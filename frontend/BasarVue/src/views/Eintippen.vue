<script setup lang="ts">
import { useBasare } from "@/stores/basar";
import { sendRequest } from "@/utils/ServerBums";
import { addChecksum, checkChecksum } from "@/utils/checksum";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

export interface Item {
  id?: string | undefined;
  sellerId?: string;
  sellerNumber?: number;
  price: number;
  basarId: string;
  page: number;
  createdAt: string;
}
const route = useRoute();
const basarId = route.params.id;
const seller = ref<{ id: string; sellerNumber: number }[] | null>(
  await sendRequest(route.fullPath, "/seller/basar/" + basarId).then(
    (response) => response.json().catch(() => null)
  )
);
const items = ref<Item[] | null | undefined>(
  await sendRequest(route.fullPath, "/item/" + route.params.id + "/creator")
    .then((response) => response.json())
    .then((response: Item[]) =>
      response.map((item) => {
        return {
          ...item,
          sellerNumber: seller.value
            ?.filter((seller) => seller.id === item.sellerId)
            .reduce((prev, curr) => curr.sellerNumber, 0),
        };
      })
    )
    .catch(() => null)
);
const sellerInput = ref(null);
const priceInput = ref(null);

const eintipper = localStorage.getItem("username");
const basare = useBasare();
const basar = await basare.getBasarById(basarId as string);
const sellerNumber = ref(undefined);
const price = ref(undefined);
const page = ref(0);
const isValid = computed(() => {
  console.log(basar);
  console.log(price.value);
  console.log(
    sellerNumber.value ?? 0,
    checkChecksum(sellerNumber.value ?? 0),
    (sellerNumber.value ?? 0) >= addChecksum(basar?.lowestSellerNumber ?? 1),
    (sellerNumber.value ?? 0) <= addChecksum(basar?.highestSellerNumber ?? 1),
    !!price.value
  );
  return (
    checkChecksum(sellerNumber.value ?? 0) &&
    (sellerNumber.value ?? 0) >= addChecksum(basar?.lowestSellerNumber ?? 1) &&
    (sellerNumber.value ?? 0) <= addChecksum(basar?.highestSellerNumber ?? 1) &&
    !!price.value
  );
});

const errorAudio = new Audio("/button.mp3");

function pushItem() {
  if (!isValid.value) return errorAudio.play();

  const sellerNumberUglyWorkaround = sellerNumber.value;
  sendRequest(route.fullPath, "/item/", "post", {
    sellerNumber: Math.floor((sellerNumber.value ?? 0) / 10),
    price: price.value,
    basarId: basarId,
    page: page.value,
  })
    .then(async (response) => {
      const responseJson = await response.json();
      console.log(responseJson);
      items.value?.push({
        ...responseJson,
        sellerNumber: Math.floor(sellerNumberUglyWorkaround / 10),
      });
    })
    .catch(() => {
      items.value = null;
      errorAudio.play();
    });
  sellerNumber.value = undefined;
  price.value = undefined;
  sellerInput.value?.focus();
}

const search = ref({
  page: "",
  price: "",
  sellerNumber: "",
});
</script>

<template>
  <div id="wrapper">
    <div id="header">
      <h1 @click="playAudio()">Items eintragen</h1>
      <p>{{ eintipper }}</p>
    </div>
    <div class="form">
      <div class="inputRow" id="item">
        <div class="inputWrapper">
          <input
            id="page"
            placeholder="Seite"
            type="number"
            v-model="page"
            min="0"
            @keyup.enter="sellerInput?.focus()"
          />
          <label for="page">Seite</label>
        </div>
        <div class="inputWrapper">
          <input
            ref="sellerInput"
            id="seller"
            placeholder="Verkäufernummer"
            type="number"
            :min="addChecksum(basar?.lowestSellerNumber ?? 1)"
            :max="addChecksum(basar?.highestSellerNumber ?? 1)"
            v-model="sellerNumber"
            :class="checkChecksum(sellerNumber ?? 101) ? '' : 'error'"
            @keyup.enter="priceInput?.focus()"
          />
          <label for="seller">Verkäufernummer</label>
        </div>
        <div class="inputWrapper">
          <input
            ref="priceInput"
            id="price"
            placeholder="Preis"
            type="number"
            v-model="price"
            @keyup.enter="pushItem()"
            step="0.5"
          />
          <label for="price">Preis</label>
        </div>
        <button @click="pushItem()" :disabled="!isValid">Hinzufügen</button>
      </div>
    </div>
    <audio src="/DasWarJaGarnichts.mp3">Test</audio>
    <p v-if="items === null">
      Fehler beim Laden der bereits eingetragenen Items. Lad mal neu...
    </p>
    <div v-else class="items">
      <p><strong>Seite</strong></p>
      <p><strong>Verkäufernummer</strong></p>
      <p><strong>Preis</strong></p>
      <template
        v-for="item in items?.sort((a, b) =>
          a.createdAt < b.createdAt ? 1 : -1
        )"
      >
        <p>{{ item.page }}</p>
        <p>{{ addChecksum(item.sellerNumber ?? 0) }}</p>
        <p>{{ item.price }}</p>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
#wrapper {
  display: grid;
  gap: 3rem;
  place-items: center;
}

#item {
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
.items {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, max-content);
}
</style>
