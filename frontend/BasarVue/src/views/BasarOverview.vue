<script setup lang="ts">
import router from "@/router";
import { useBasare } from "@/stores/basar";
import { sendRequest } from "@/utils/ServerBums";
import {
  addChecksum,
  calcuateRangeFromLowerbound,
  calcuateRangeFromLowerboundWithChecksum,
  calculateChecksum,
  checkChecksum,
} from "@/utils/checksum";
import { computed, ref } from "vue";

const basare = useBasare();

const defaultBasar = {
  name: "",
  date: "",
  location: "",
  organizer: "",
  commission: 20,
  maxItemsPerSeller: 200,
  lowerbound: undefined,
  countSeller: undefined,
  commissionFreeSellers: undefined,

  isLoading: false,
  isError: false,
};
let neuerBasar = ref<typeof defaultBasar | undefined>(undefined);
const newBasarIsValid = computed(
  () =>
    !!neuerBasar.value?.name &&
    !!neuerBasar.value?.date &&
    !!neuerBasar.value?.location &&
    !!neuerBasar.value?.organizer &&
    Number.isInteger(neuerBasar.value?.commission) &&
    neuerBasar.value?.commission >= 0 &&
    neuerBasar.value?.commission <= 100 &&
    !!neuerBasar.value?.maxItemsPerSeller &&
    Number.isInteger(neuerBasar.value?.lowerbound) &&
    (neuerBasar.value?.lowerbound ?? 0) >= 0 &&
    !!neuerBasar.value?.countSeller
);
function createBasar() {
  if (!newBasarIsValid) return;
  if (neuerBasar.value) {
    neuerBasar.value.isLoading = true;
    neuerBasar.value.isError = false;
  }

  basare
    .create({
      name: "",
      date: "",
      location: "",
      organizer: "",
      maxItemsPerSeller: 200,
      commission: 20,
      commissionFreeSellers: 0,
      ...neuerBasar.value,
      ...calcuateRangeFromLowerbound(
        neuerBasar.value?.lowerbound ?? 100,
        neuerBasar.value?.countSeller ?? 1
      ),
    })
    .then(() => {
      neuerBasar.value = undefined;
    })
    .catch(() => {
      if (neuerBasar.value) {
        neuerBasar.value.isError = true;
        neuerBasar.value.isLoading = false;
      }
    });
}
</script>

<template>
  <h1>Basar Übersicht</h1>

  <div id="basare">
    <div id="header" class="basar">
      <p>Name</p>
      <p>Datum</p>
      <p>Nummernkreis</p>
      <button class="outlined" style="opacity: 0">Öffnen</button>
    </div>
    <template v-if="basare === undefined">Basare laden</template>
    <template v-if="basare === null"
      >Laden der Basare ist fehlgeschlagen</template
    >
    <template v-if="basare.basare?.length === 0"
      >Keine Basare vorhanden</template
    >
    <template v-if="(basare.basare?.length ?? 0) > 0">
      <div
        v-for="basar in basare.basare ?? []"
        class="basar"
        @click="router.push('/basar/' + basar.id ?? '')"
      >
        <p>{{ basar.name }}</p>
        <p>{{ basar.date }}</p>
        <p>
          {{ addChecksum(basar.lowestSellerNumber) }} –
          {{ addChecksum(basar.highestSellerNumber) }}
        </p>
        <button>Öffnen</button>
      </div>
    </template>
  </div>
  <button
    class="outlined"
    @click="neuerBasar = { ...defaultBasar }"
    v-if="!neuerBasar"
  >
    Basar erstellen
  </button>

  <div class="form" v-if="!!neuerBasar">
    <h2 style="margin-top: 1rem">Basar erstellen</h2>
    <div class="inputWrapper">
      <input
        id="name"
        placeholder="Name"
        type="text"
        v-model="neuerBasar.name"
      />
      <label for="name">Name</label>
    </div>
    <div class="inputWrapper">
      <input
        id="date"
        placeholder="Datum"
        type="text"
        v-model="neuerBasar.date"
      />
      <label for="date">Datum</label>
    </div>

    <div class="inputRow">
      <div class="inputWrapper">
        <input
          id="location"
          placeholder="Ort"
          type="text"
          v-model="neuerBasar.location"
        />
        <label for="location">Ort</label>
      </div>
      <div class="inputWrapper">
        <input
          id="organizer"
          placeholder="Organisator"
          type="text"
          v-model="neuerBasar.organizer"
        />
        <label for="organizer">Organisator</label>
      </div>
    </div>
    <div class="inputRow">
      <div class="inputWrapper">
        <input
          id="commission"
          placeholder="Komission (%)"
          type="number"
          min="0"
          max="100"
          v-model="neuerBasar.commission"
        />
        <label for="commission">Komission (%)</label>
      </div>
      <div class="inputWrapper">
        <input
          id="maxItemsPerSeller"
          placeholder="Max. Artikel pro Verkäufer"
          type="number"
          v-model="neuerBasar.maxItemsPerSeller"
        />
        <label for="maxItemsPerSeller">Max. Artikel pro Verkäufer</label>
      </div>
    </div>

    <div class="inputRow">
      <div class="inputWrapper">
        <input
          id="countItems"
          placeholder="Anzahl Verkäufer"
          type="number"
          min="1"
          v-model="neuerBasar.countSeller"
        />
        <label for="countItems">Anzahl Verkäufer</label>
      </div>
      <div class="inputWrapper">
        <input
          id="commissionFreeSellers"
          placeholder="davon kommissionsfrei"
          type="number"
          min="1"
          :max="neuerBasar.countSeller"
          v-model="neuerBasar.commissionFreeSellers"
        />
        <label for="commissionFreeSellers">davon kommissionsfrei</label>
      </div>
    </div>

    <div class="inputRow">
      <div class="inputWrapper">
        <input
          id="lowerbound"
          placeholder="Komission (%)"
          type="number"
          min="100"
          max="999"
          v-model="neuerBasar.lowerbound"
        />
        <label for="lowerbound">ab Nummer</label>
      </div>
      Nummernkreis:
      {{
        neuerBasar.lowerbound && neuerBasar.countSeller
          ? (() => {
              const range = calcuateRangeFromLowerboundWithChecksum(
                neuerBasar.lowerbound ?? 100,
                neuerBasar.countSeller ?? 1
              );
              return (
                range.lowestSellerNumber + " – " + range.highestSellerNumber
              );
            })()
          : "Undefiniert"
      }}
    </div>

    <button @click="createBasar()" :disabled="!newBasarIsValid">
      {{
        neuerBasar.isError
          ? "Basar speichern fehlgeschlagen"
          : neuerBasar.isLoading
          ? "Basar wird gespeichert..."
          : "Basar speichern"
      }}
    </button>
    <button class="outlined" @click="neuerBasar = undefined">Abbrechen</button>
  </div>
</template>

<style lang="less">
#basare {
  .basar {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr 0.75fr;
    padding: 0.5rem;
    border-radius: 0.5rem;
    gap: 1rem;
    align-items: center;
  }
  .basar:hover:not(#header) {
    background-color: lighten(#4ca0ad, 40%);
  }
  #header {
    /* background-color: green; */
    font-weight: bolder;
  }
}

.form {
  display: grid;
  flex-direction: column;
  gap: 0.5rem;

  .inputRow {
    align-items: baseline;
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    gap: 0.5rem;
  }
}
</style>
