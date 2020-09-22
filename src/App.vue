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
          <b-card no-body>
            <template v-slot:header>
              <h4>
                Current Channel List
                <b-button
                  variant="primary"
                  class="float-right"
                  @click="exportToSdxFile"
                >Export to sdx file</b-button>
              </h4>
            </template>
            <draggable
              class="list-group"
              :list="currentChannelList"
              group="channelList"
              @change="currentChannelListChanged"
              handle=".handle"
            >
              <div class="list-group-item" v-for="channel in currentChannelList" :key="channel.id">
                <channel-box
                  :channel="channel"
                  @remove="removeCurrentChannel"
                  @name-changed="currentChannelListChanged"
                ></channel-box>
              </div>
            </draggable>
          </b-card>
        </b-col>
        <b-col>
          <div class="sticky" ref="tempChannelListStickyRef">
            <b-card no-body>
              <template v-slot:header>
                <h4>Temp Channel List</h4>
              </template>
              <draggable
                class="list-group"
                :list="tempChannelList"
                group="channelList"
                @change="tempChannelListChanged"
                handle=".handle"
              >
                <div class="list-group-item" v-for="channel in tempChannelList" :key="channel.id">
                  <channel-box
                    :channel="channel"
                    @remove="removeTempChannel"
                    @name-changed="currentChannelListChanged"
                  ></channel-box>
                </div>
              </draggable>
            </b-card>
            <b-card class="mt-2" no-body>
              <template v-slot:header>
                <h4>
                  Removed Channel List
                  <b-button
                    variant="secondary"
                    class="float-right"
                    v-b-toggle:removed-channel-list-collapse
                  >
                    <span class="when-open">Close</span>
                    <span class="when-closed">Open</span>
                  </b-button>
                </h4>
              </template>
              <b-collapse id="removed-channel-list-collapse">
                <draggable
                  class="list-group"
                  :list="removedChannelList"
                  group="channelList"
                  @change="removedChannelListChanged"
                  handle=".handle"
                >
                  <div
                    class="list-group-item"
                    v-for="channel in removedChannelList"
                    :key="channel.id"
                  >
                    <channel-box
                      :channel="channel"
                      @remove="removeRemovedChannel"
                      @name-changed="removedChannelListChanged"
                    ></channel-box>
                  </div>
                </draggable>
              </b-collapse>
            </b-card>
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
import channelBox from "./ChannelBox";

export default {
  name: "App",
  components: {
    draggable,
    channelBox,
  },
  data() {
    var savedTextSdx = localStorage.getItem("textSdx") || "";
    var savedCurrentChannelList =
      JSON.parse(localStorage.getItem("currentChannelList") || "[]") || [];
    var savedTempChannelList =
      JSON.parse(localStorage.getItem("tempChannelList") || "[]") || [];
    var savedRemovedChannelList =
      JSON.parse(localStorage.getItem("removedChannelList") || "[]") || [];
    return {
      fileSdx: null,
      textSdx: savedTextSdx,
      currentChannelList: savedCurrentChannelList,
      tempChannelList: savedTempChannelList,
      removedChannelList: savedRemovedChannelList,
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
    removedChannelListChanged() {
      localStorage.setItem(
        "removedChannelList",
        JSON.stringify(this.removedChannelList)
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
      saveAs(
        blob,
        "channel-list-" +
          new Date()
            .toISOString()
            .replace(/[^0-9]/g, "")
            .substr(0, 12) +
          ".sdx"
      );
    },
    removeCurrentChannel(channelId) {
      var index = this.currentChannelList.findIndex((x) => x.id === channelId);
      var removedChannelArray = this.currentChannelList.splice(index, 1);
      this.removedChannelList.push(...removedChannelArray);
      this.currentChannelListChanged();
      this.removedChannelListChanged();
    },
    removeTempChannel(channelId) {
      var index = this.tempChannelList.findIndex((x) => x.id === channelId);
      var removedChannelArray = this.tempChannelList.splice(index, 1);
      this.removedChannelList.push(...removedChannelArray);
      this.tempChannelListChanged();
      this.removedChannelListChanged();
    },
    removeRemovedChannel(channelId) {
      var index = this.removedChannelList.findIndex((x) => x.id === channelId);
      this.removedChannelList.splice(index, 1);
      this.removedChannelListChanged();
    },
  },
};
</script>

<style>
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}
.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}
</style>
