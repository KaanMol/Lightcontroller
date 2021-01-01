<template>
    <main class="setup">
        <!-- <header>
          <span class="title">Goedenavond</span>
          <span class="far fa-cog"></span>
        </header>

        <section class="temperature">
          <div class="room">
            <span class="far fa-thermometer-half"></span>
            <span class="value">22°C</span>
          </div>
          <div class="room">
            <span class="far fa-humidity"></span>
            <span class="value">22%</span>
          </div>
        </section> -->
        <header>
            <span class="title">Verbinden met WiFi</span>
            <span></span>
            <!-- <span @click="openSettingsModal" class="far fa-cog"></span> -->
        </header>
        <transition :name="`slide-${slideDirection}`" mode="out-in">
            <section v-if="page === 0" key="1">
                <div class="title">
                    <span></span>
                    <!-- <button class="far fa-chevron-left" @click="() => page = 0"></button>  -->
                    <span>WiFi netwerk kiezen</span>
                </div>
                <div class="content">
                    <button class="network"
                        v-for="network in $store.state.setup.networks"
                        :key="network.ssid"
                        @click="() => selectNetwork(network)">
                        <span class="fas" :class="signalIcon(network.signalLevel)"></span>
                        <span class="ssid">{{network.ssid}}</span>
                        <span class="far fa-chevron-right"></span>
                    </button>
                    <!-- <span></span> -->
                </div>
            </section>

            <section v-if="page === 1" key="2">
                <div class="title">
                    <button class="far fa-chevron-left" @click="previous"></button> 
                    Netwerk gegevens
                </div>
                <div class="content">
                    <div class="group">
                        <div>Netwerk naam</div>
                        <input type="text" :value="ssid" disabled>
                    </div>
                    <div class="group">
                        <div>Netwerk wachtwoord</div>
                        <input type="text" v-model="password" placeholder="Netwerk wachtwoord">
                    </div>
                    
                    <button class="connect" :disabled="!password.length" @click="() => { page = 2; oldPage = 1; }">Volgende</button>
                </div>
            </section>

            <section v-if="page === 2" key="3">
                <div class="title">
                    <button class="far fa-chevron-left" @click="previous"></button> 
                    Kloppen deze gegevens?
                </div>
                <div class="content confirm">
                    <div class="group">
                        <div>Netwerk naam</div>
                        <div>{{ssid}}</div>
                    </div>

                    <div v-if="password" class="group">
                        <div>Netwerk wachtwoord</div>
                        <div>{{password}}</div>
                    </div>
                    <button class="connect" @click="connect">Verbinden</button>
                </div>
            </section>
            <section class="loading" v-if="page === 3" key="4">
                <div v-if="usingHostname">Je wordt automatisch doorgestuurd</div>
                <div v-else>Volg het scherm voor verdere instructies</div>
                <span>
                    <i class="loader far fa-spinner-third"></i>
                    <span class="text">Apparaat aan het instellen...</span>
                </span>
                
            </section>
        </transition>
    </main> 
</template>

<script>
export default {
    name: 'Loading',
    data() {
        return {
            oldPage: 2,
            page: 0,
            slideDirection: "left",
            ssid: "",
            password: ""
        }
    },
    methods: {
        selectNetwork(network) {
            this.ssid = network.ssid;
            this.password = "";
            this.oldPage = 0;

            if (network.encrypted) {
                this.page = 1;
            } else {
                this.page = 2;
            }
            
        },
        previous() {
            this.page = this.oldPage;
            this.oldPage--;
        },
        connect() {
            this.page = 3;
            this.$socket.client.emit("connectNetwork", { 
                ssid: this.ssid, 
                password: this.password
            });
        },
        signalIcon(strength) {
            if (strength > -50) {
                return "fa-wifi";
            } else if (strength > -70) {
                return "fa-wifi-2";
            } else {
                return "fa-wifi-1";
            }
        },
    },
    watch: {
        page (to, from) {
            if (to > from) {
                this.slideDirection = "left";
            } else {
                this.slideDirection = "right";
            }
        }
    },
    computed: {
        usingHostname: () => {
            if (window.location.hostname.split(".")[0] === "emma") {
                return true
            }

            return false;
        }
    }
}
</script>

<style lang="scss" scoped>
main {
    grid-template-rows: min-content 1fr;
    padding-bottom: 15px;
    max-height: 100% !important;
    height: unset;
    position: relative;
    overflow: hidden;
}

section {
    div.title {
        font-weight: bold;
        font-size: 17px;
        display: grid;
        grid-template-columns: 40px 1fr;
        column-gap: 10px;
        height: 40px;
        box-sizing: content-box;
        align-items: center;
        button {
            font-size: 14px;
            background: none;
            box-shadow: none;
        }
    }
    display: grid;
    grid-template-rows: 70px 1fr;
    height: 100%;
    grid-area: content;
    overflow: auto;
    padding: 0;
    div.title {
        padding: 15px;
    }
}

.connect {
    margin-top: 35px;
}

.content {
    padding: 0px 15px 15px 15px;
    display: grid;

    grid-template-columns: 1fr;
    grid-auto-rows: min-content;
    row-gap: 10px;
    overflow: auto;
    
    &.confirm {
        text-align: center;
        .group {
            &:first-child {
                margin-bottom: 20px;
            }
            & > div:first-of-type {
                font-weight: bold;
            }
        }
    }

    .group {
        & > div:first-of-type {
            margin-bottom: 5px;
        }
    }
    
    .network {
        overflow: auto;
        background: var(--buttons);
        display: grid;
        grid-template-columns: min-content 1fr min-content;
        font-size: 14px;
        padding: 15px;
        align-items: center;
        text-align: left;
        column-gap: 15px;
        :first-child {
            font-size: 20px;
        }
    }
}


.loader {
  font-size: 25px;
  animation: spin 2s infinite linear;
}

section.loading {
  justify-items: center;
  align-items: center;
  display: grid;
  grid-template-rows: max-content max-content;
  row-gap: 30px;
  padding: 20px;
  column-gap: 15px;
  font-weight: bold;
  div {
      font-weight: normal;
  }
}

section.loading .text {
  position: relative; 
  top: -3px;
  margin-left: 20px;
} 

@keyframes spin {
    from {transform:rotate(0deg);}
    to {transform:rotate(360deg);}
}
</style>
