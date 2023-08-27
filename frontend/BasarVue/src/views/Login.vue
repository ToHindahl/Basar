<script setup lang="ts">
import router from "@/router";
import { useBasare } from "@/stores/basar";
import { sendRequest } from "@/utils/ServerBums";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const username = ref("");
const password = ref("");

const isError = ref(false);
const isLoading = ref(false);

const basare = useBasare();

const route = useRoute();

if (!!localStorage.getItem("token"))
  router.push((route.query.redirect as string) ?? "/basare");

watch(route, () => {
  if (!!localStorage.getItem("token"))
    router.push((route.query.redirect as string) ?? "/basare");
});

function anmelden() {
  isLoading.value = true;
  sendRequest((route.query.redirect as string) ?? "/basare", "/login", "post", {
    username: username.value,
    password: password.value,
  })
    .then(async (response) => {
      const reponseJson = await response.json();
      localStorage.setItem("token", reponseJson.token);
      basare.userToken = reponseJson.token;
      localStorage.setItem("username", reponseJson.username);
      basare.reload();
      router.push((route.query.redirect as string) ?? "/basare");
    })
    .catch((error) => {
      console.log(error);
      isError.value = true;
      isLoading.value = false;
    });
}
</script>
<template>
  <h1>Einloggen</h1>
  <div class="inputWrapper">
    <input id="name" placeholder="Platz Name" type="text" v-model="username" />
    <label for="name">Platz Name</label>
  </div>
  <div class="inputWrapper">
    <input
      id="password"
      placeholder="Passwort"
      type="password"
      v-model="password"
    />
    <label for="password">Passwort</label>
  </div>

  <button @click="anmelden()">{{ isLoading ? "läd..." : "Anmelden" }}</button>
  <p v-if="isError">Fehler</p>
</template>
<style lang="less"></style>
