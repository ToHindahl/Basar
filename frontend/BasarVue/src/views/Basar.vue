<script setup lang="ts">
import router from "@/router";
import { useBasare } from "@/stores/basar";
import {
  addChecksum,
  calcuateRangeFromLowerbound,
  calcuateRangeFromLowerboundWithChecksum,
} from "@/utils/checksum";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const basare = useBasare();
const basarId = useRoute().params.id as string;
const basar = ref(await basare.getBasarById(basarId));
const editBasar = ref();
function prepareEditBasar() {
  editBasar.value = {
    ...basar.value,
    lowerbound: basar.value?.lowestSellerNumber,
    countSeller:
      (basar.value?.highestSellerNumber ?? 1) -
      (basar.value?.lowestSellerNumber ?? 1) +
      1,
  };
  popup.value = "editBasar";
}
const popup = ref<string | undefined>(undefined);
function handleDeleteBasar() {
  basare.deleteBasar(basarId).then(() => router.replace("/"));
}

const editBasarIsValid = computed(
  () =>
    !!editBasar.value?.name &&
    !!editBasar.value?.date &&
    !!editBasar.value?.location &&
    !!editBasar.value?.organizer &&
    Number.isInteger(editBasar.value?.commission) &&
    editBasar.value?.commission >= 0 &&
    editBasar.value?.commission <= 100 &&
    !!editBasar.value?.maxItemsPerSeller &&
    Number.isInteger(editBasar.value?.lowerbound) &&
    (editBasar.value?.lowerbound ?? 0) >= 0 &&
    !!editBasar.value?.countSeller
);
function updateBasar() {
  if (!editBasarIsValid) return;
  if (editBasar.value) {
    editBasar.value.isLoading = true;
    editBasar.value.isError = false;
  }

  basare
    .update({
      name: "",
      date: "",
      location: "",
      organizer: "",
      maxItemsPerSeller: 200,
      commission: 20,
      commissionFreeSellers: 0,
      ...editBasar.value,
      ...calcuateRangeFromLowerbound(
        editBasar.value?.lowerbound ?? 100,
        editBasar.value?.countSeller ?? 1
      ),
    })
    .then(async () => {
      popup.value = undefined;
      basar.value = await basare.getBasarById(basarId);
    })
    .catch(() => {
      if (editBasar.value) {
        editBasar.value.isError = true;
        editBasar.value.isLoading = false;
      }
    });
}
</script>

<template>
  <template v-if="basar === null">
    <h1>Fehler</h1>
    <p>Der Basar mit der Id "{{ basarId }}" konnte nicht geladen werden.</p>
    <p>Vielleicht hilft Neuladen der Seite...</p>
  </template>
  <template v-else-if="basar === undefined"> <h1>Läd...</h1></template>
  <template v-else>
    <div id="header">
      <h1>{{ basar.name }}</h1>
      <p>{{ basar.date }}</p>
    </div>
    <div class="basarTable">
      <p>Ort:</p>
      <p>{{ basar.location }}</p>
      <p>Organisator*in:</p>
      <p>{{ basar.organizer }}</p>
      <p>Commission:</p>
      <p>{{ basar.commission }}%</p>
      <p>max. Artikel pro Verkäufer:</p>
      <p>{{ basar.maxItemsPerSeller }}</p>
      <p>Verkäufer ohne Kommission:</p>
      <p>{{ basar.commissionFreeSellers }}</p>
      <p>Nummernkreis</p>
      <p>
        {{ addChecksum(basar.lowestSellerNumber) }} –
        {{ addChecksum(basar.highestSellerNumber) }}
      </p>
    </div>
    <button @click="router.push('/basar/' + basarId + '/eintragen')">
      Artikel eintragen
    </button>
    <button @click="prepareEditBasar()">Bearbeiten</button>
    <button class="outlined" @click="popup = 'delete'">Löschen</button>
    <div id="popupBg" v-if="!!popup">
      <div id="popup">
        <template v-if="popup === 'delete'">
          <h3>Diesen Basar wirklich löschen?</h3>
          <button @click="popup = undefined">Nein, abbrechen</button>
          <button class="outlined" @click="handleDeleteBasar()">
            Ja, löschen
          </button>
        </template>

        <template v-if="popup === 'editBasar'">
          <div class="form">
            <h2 style="margin-top: 1rem">Basar erstellen</h2>
            <div class="inputWrapper">
              <input
                id="name"
                placeholder="Name"
                type="text"
                v-model="editBasar.name"
              />
              <label for="name">Name</label>
            </div>
            <div class="inputWrapper">
              <input
                id="date"
                placeholder="Datum"
                type="text"
                v-model="editBasar.date"
              />
              <label for="date">Datum</label>
            </div>

            <div class="inputRow">
              <div class="inputWrapper">
                <input
                  id="location"
                  placeholder="Ort"
                  type="text"
                  v-model="editBasar.location"
                />
                <label for="location">Ort</label>
              </div>
              <div class="inputWrapper">
                <input
                  id="organizer"
                  placeholder="Organisator"
                  type="text"
                  v-model="editBasar.organizer"
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
                  v-model="editBasar.commission"
                />
                <label for="commission">Komission (%)</label>
              </div>
              <div class="inputWrapper">
                <input
                  id="maxItemsPerSeller"
                  placeholder="Max. Artikel pro Verkäufer"
                  type="number"
                  v-model="editBasar.maxItemsPerSeller"
                />
                <label for="maxItemsPerSeller"
                  >Max. Artikel pro Verkäufer</label
                >
              </div>
            </div>

            <div class="inputRow">
              <div class="inputWrapper">
                <input
                  id="countItems"
                  placeholder="Anzahl Verkäufer"
                  type="number"
                  min="1"
                  v-model="editBasar.countSeller"
                />
                <label for="countItems">Anzahl Verkäufer</label>
              </div>
              <div class="inputWrapper">
                <input
                  id="commissionFreeSellers"
                  placeholder="davon kommissionsfrei"
                  type="number"
                  min="1"
                  :max="editBasar.countSeller"
                  v-model="editBasar.commissionFreeSellers"
                />
                <label for="commissionFreeSellers">davon kommissionsfrei</label>
              </div>
            </div>

            <div class="inputRow">
              <!-- <div class="inputWrapper">
                <input
                  id="lowerbound"
                  placeholder="Komission (%)"
                  type="number"
                  min="100"
                  max="999"
                  v-model="editBasar.lowerbound"
                />
                <label for="lowerbound">ab Nummer</label>
              </div> -->
              Nummernkreis:
              {{
                editBasar.lowerbound && editBasar.countSeller
                  ? (() => {
                      const range = calcuateRangeFromLowerboundWithChecksum(
                        editBasar.lowerbound ?? 100,
                        editBasar.countSeller ?? 1
                      );
                      return (
                        range.lowestSellerNumber +
                        " – " +
                        range.highestSellerNumber
                      );
                    })()
                  : "Undefiniert"
              }}
            </div>

            <button @click="updateBasar()" :disabled="!editBasarIsValid">
              {{
                editBasar.isError
                  ? "Basar speichern fehlgeschlagen"
                  : editBasar.isLoading
                  ? "Basar wird gespeichert..."
                  : "Basar speichern"
              }}
            </button>
            <button class="outlined" @click="popup = undefined">
              Abbrechen
            </button>
          </div>
        </template>
      </div>
    </div>
  </template>
</template>

<style lang="less">
#header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: baseline;
}
.basarTable {
  gap: 1rem;
  display: grid;
  grid-template-columns: max-content max-content;
}

#popupBg {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: #00000055;
  display: flex;
  place-content: center;
  place-items: center;
  place-self: center;
  #popup {
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: white;
    display: grid;
    gap: 1rem;
  }
}
</style>
