<script setup lang="ts">
import { useBasare } from "@/stores/basar";
import { sendRequest } from "@/utils/ServerBums";
import { addChecksum, checkChecksum } from "@/utils/checksum";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

export interface Item {
  id?: string | undefined;
  sellerId?: string;
  sellerNumber?: number;
  price: number;
  basarId: string;
  page: number;
  createdAt: string;
  editItem?: Item;
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
const sellerNumber = ref<number | undefined>(undefined);
const price = ref<number | undefined>(undefined);
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

function deleteItem(id?: string) {
  if (!id) return;
  sendRequest(route.fullPath, "/item/" + id, "delete").then(
    () => (items.value = items.value?.filter((item) => item.id !== id))
  );
}
function updateItem(newItem: Item) {
  if (!newItem.id) return;
  sendRequest(route.fullPath, "/item/", "put", {
    ...newItem,
    sellerNumber: Math.floor((newItem.sellerNumber ?? 0) / 10),
  }).then(() => {
    for (let i = 0; i < (items.value?.length ?? 0); i++) {
      if ((items.value as Item[])[i].id === newItem.id) {
        (items.value as Item[])[i] = {
          ...newItem,
          sellerNumber: Math.floor((newItem.sellerNumber ?? 0) / 10),
        };
        break;
      }
    }
  });
}

function test(e: any) {
  console.log(e);
}
</script>

<template>
  <div id="wrapper">
    <div id="header">
      <h1 @click="playAudio()">Items eintragen</h1>
      <p>{{ eintipper }}</p>
    </div>
    <div class="form" @keyup.+="page++" @keyup.-="page--">
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
            @keydown.+.prevent
            @keydown.-.prevent
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
            @keydown.+.prevent
            @keydown.-.prevent
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
      <div></div>
      <div></div>
      <template
        v-for="item in items?.sort((a, b) =>
          a.createdAt < b.createdAt ? 1 : -1
        )"
      >
        <template v-if="item.editItem">
          <div class="inputWrapper">
            <input
              :id="'page' + item.id"
              placeholder="Seite"
              type="number"
              v-model="item.editItem.page"
              min="0"
              @keyup.enter="sellerInput?.focus()"
            />
            <label :for="'page' + item.id">Seite</label>
          </div>
          <div class="inputWrapper">
            <input
              @keypress="test($event)"
              :id="'seller' + item.id"
              placeholder="Verkäufernummer"
              type="number"
              :min="addChecksum(basar?.lowestSellerNumber ?? 1)"
              :max="addChecksum(basar?.highestSellerNumber ?? 1)"
              v-model="item.editItem.sellerNumber"
              :class="checkChecksum(sellerNumber ?? 101) ? '' : 'error'"
            />
            <label :for="'seller' + item.id">Verkäufernummer</label>
          </div>
          <div class="inputWrapper">
            <input
              :id="'price' + item.id"
              placeholder="Preis"
              type="number"
              v-model="item.editItem.price"
              step="0.5"
            />
            <label :for="'price' + item.id">Preis</label>
          </div>

          <button @click="updateItem(item.editItem)">speichern</button>
          <button class="outlined" @click="item.editItem = undefined">
            abbrechen
          </button>
        </template>
        <template v-else>
          <p>{{ item.page }}</p>
          <p>{{ addChecksum(item.sellerNumber ?? 0) }}</p>
          <p>{{ item.price }}</p>
          <button
            @click="
              item.editItem = {
                ...item,
                sellerId: undefined,
                sellerNumber: addChecksum(item.sellerNumber ?? 0),
              }
            "
          >
            Bearbeiten
          </button>
          <button class="outlined" @click="deleteItem(item.id)">löschen</button>
        </template>
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
  grid-template-columns: repeat(3, max-content) 1fr 1fr;
}
</style>
