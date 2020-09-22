<template>
  <div id="app">
    <b-container class="py-3">
      <b-form-file
        v-model="fileSdx"
        :state="Boolean(fileSdx)"
        placeholder="Choose a SatcoDX file or drop it here..."
        drop-placeholder="Drop SatcoDX file here..."
        accept=".sdx"
        class="mb-3"
        @input="inputFileSdx"
      ></b-form-file>

      <b-row>
        <b-col>
          <h3>
            Current Channel List
            <b-button
              variant="primary"
              class="float-right"
              @click="exportToSdxFile"
            >Export to sdx file</b-button>
          </h3>
          <draggable
            class="list-group"
            :list="currentChannelList"
            group="channelList"
            @change="currentChannelListChanged"
          >
            <div
              class="list-group-item"
              v-for="element in currentChannelList"
              :key="element.id"
            >{{ element.name }}</div>
          </draggable>
        </b-col>
        <b-col>
          <div class="sticky" ref="tempChannelListStickyRef">
            <h3>Temp Channel List</h3>
            <draggable
              class="list-group"
              :list="tempChannelList"
              group="channelList"
              @change="tempChannelListChanged"
            >
              <div
                class="list-group-item"
                v-for="element in tempChannelList"
                :key="element.id"
              >{{ element.name }}</div>
            </draggable>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import satcodx from "./satcodx";
import stickyfilljs from "stickyfilljs";
import { saveAs } from "file-saver";

export default {
  name: "App",
  components: {
    draggable,
  },
  data() {
    var savedTextSdx = localStorage.getItem("textSdx") || "";
    var savedCurrentChannelList =
      JSON.parse(localStorage.getItem("currentChannelList") || "[]") || [];
    var savedTempChannelList =
      JSON.parse(localStorage.getItem("tempChannelList") || "[]") || [];
    return {
      fileSdx: null,
      textSdx: savedTextSdx,
      currentChannelList: savedCurrentChannelList,
      tempChannelList: savedTempChannelList,
    };
  },
  created() {
    stickyfilljs.add([this.$refs.tempChannelListStickyRef]);
  },
  methods: {
    inputFileSdx() {
      this.readFileSdx();
    },
    readFileSdx() {
      var that = this;
      var fr = new FileReader();
      fr.onload = function () {
        that.textSdx = fr.result;
        that.parseFileSdx();
      };

      fr.readAsText(this.fileSdx, "ISO-8859-9");
    },
    parseFileSdx() {
      localStorage.setItem("textSdx", this.textSdx);
      this.currentChannelList = satcodx.parseText(this.textSdx);
      this.currentChannelListChanged();
    },
    currentChannelListChanged() {
      localStorage.setItem(
        "currentChannelList",
        JSON.stringify(this.currentChannelList)
      );
    },
    tempChannelListChanged() {
      localStorage.setItem(
        "tempChannelList",
        JSON.stringify(this.tempChannelList)
      );
    },
    exportToSdxFile() {
      var exportTextSdx = "";
      for (let index = 0; index < this.currentChannelList.length; index++) {
        const channel = this.currentChannelList[index];
        exportTextSdx +=
          channel.rawLine + (channel.id.startsWith("103") ? "\n" : "\r\n");
      }
      exportTextSdx += "\0";
      var exportTextSdxCharArray = new Uint8Array(exportTextSdx.length);
      for (var i = 0; i < exportTextSdxCharArray.length; i++) {
        exportTextSdxCharArray[i] = exportTextSdx.charCodeAt(i);
      }
      var blob = new Blob([exportTextSdxCharArray], { type: "text/plain" });
      saveAs(blob, "channel-list-" + new Date().toISOString().replace(/[^0-9]/g,"").substr(0,12) + ".sdx");
    },
  },
};
</script>

<style>
#app {
}
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}
</style>
