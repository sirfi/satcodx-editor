<template>
  <b-input-group>
    <template v-slot:prepend>
      <b-input-group-text class="handle" title="Move">
        <b-icon-arrows-move></b-icon-arrows-move>
      </b-input-group-text>
    </template>
    <b-form-input v-model="channel.name" @input="inputName" maxLength="20"></b-form-input>
    <template v-slot:append>
      <b-input-group-text>{{channel.frequencyNumber}}</b-input-group-text>
      <b-button variant="danger" title="Remove" @click="$emit('remove', channel.id)">
        <b-icon-x></b-icon-x>
      </b-button>
    </template>
  </b-input-group>
</template>

<script>
import satcodx from "./satcodx";

export default {
  props: {
    channel: {
      type: Object,
      required: true,
    },
  },
  methods: {
    inputName(){
      this.channel.rawLine = satcodx.changeName(this.channel.rawLine, this.channel.name);
      this.$emit('name-changed', this.channel.id);
    }
  },
};
</script>

<style scoped>
.input-group-text.handle {
  cursor: move;
}
</style>