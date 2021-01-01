<template>
    <modal  name="settingsModal"
            width="100%"
            height="100%"
            transition="slide"
            overlayTransition="fade"
            @closed="closed"
            id="modal">
        <transition :name="`slide-${slideDirection}`">
            <div v-if="page === 0" key="1">
                <div class="header">
                    <span></span>
                    <span class="title">Instellingen</span>
                    <button @click="closeModal"><span class="far fa-chevron-down"></span></button>
                </div>

                <div class="content settings">
                    <article v-if="$store.state.preferences.rebootNeeded" class="warning">
                        <i class="far fa-exclamation-triangle"></i>
                        Het systeem moet herstarten om bepaalde instellingen toe te passen.
                    </article>
                    <article class="general">
                        <div class="title">
                            Netwerk 
                            <button @click="() => { page = 1 }">
                                Bewerken 
                                <span class="far fa-chevron-right"></span>
                            </button>
                        </div>
                        <div class="row">
                            <span>Netwerknaam</span>    
                            <span>{{$store.state.preferences.network}}</span>
                        </div>
                        <div class="row">
                            <span>LAN-IP</span>    
                            <span>{{$store.state.preferences.ip}}</span>
                        </div>
                        <div class="row">
                            <span>Hostnaam</span>    
                            <span>{{$store.state.preferences.hostname}}</span>
                        </div>
                    </article>

                    <article class="general">
                        <div class="title">
                            Thuisscherm 
                            <button @click="() => { page = 2 }">
                                Bewerken 
                                <span class="far fa-chevron-right"></span>
                            </button>
                        </div>
                        <div class="row">
                            <span>Thema</span>    
                            <span v-if="$store.state.preferences.uiTheme === 'light'">Licht</span>
                            <span v-if="$store.state.preferences.uiTheme === 'dark'">Donker</span>
                            <span v-if="$store.state.preferences.uiTheme === 'auto'">Systeem voorkeur</span>
                        </div>
                        <div class="row">
                            <span>Achtergrond kleur</span>    
                            <span v-if="$store.state.preferences.uiType === 'white'">Wit</span>
                            <span v-if="$store.state.preferences.uiType === 'black'">Zwart</span>
                            <span v-if="$store.state.preferences.uiType === 'gradient'">Kleurovergang</span>
                        </div>
                        <div v-if="$store.state.preferences.uiType === 'gradient'" class="row">
                            <span>Kleurovergang</span>    
                            <span>{{$store.state.preferences.uiOption}}</span>
                        </div>
                    </article>

                    <article class="general">
                        <div class="title">
                            Scènes 
                            <button @click="() => { page = 3 }">
                                Bewerken 
                                <span class="far fa-chevron-right"></span>
                            </button>
                        </div>
                        <div class="row">
                            <span>Standaard kleurovergang</span>    
                            <span>{{$store.state.preferences.sceneBackground}}</span>
                        </div>
                        <div class="row">
                            <span>Standaard tekstkleur</span>    
                            <span v-if="$store.state.preferences.sceneText === 'white'">Wit</span>
                            <span v-if="$store.state.preferences.sceneText === 'black'">Zwart</span>
                        </div>
                    </article>

                    <article class="general system">
                        <div class="title">Systeem</div>

                        <button @click="reboot">Herstarten</button>
                        
                        <button @click="() => { page = 4 }">Apparaat resetten</button>
                    </article>    

                    <span></span>              
                </div>
            </div>
            <div v-if="page === 1" key="2">
                <div class="header">
                    <button @click="() => { page = 0; hostname = this.$store.state.preferences.hostname }"><span class="far fa-chevron-left"></span></button>
                    <span class="title">Netwerk instellingen</span>
                    <button @click="closeModal"><span class="far fa-chevron-down"></span></button>
                </div>

                <div class="content">
                    <article v-if="!hostname.length" class="warning">
                        <i class="far fa-exclamation-triangle"></i>
                        Hostnaam kan niet leeg zijn
                    </article>
                    <article v-if="hostname !== $store.state.preferences.hostname && hostname.length" class="warning">
                        <i class="far fa-exclamation-triangle"></i>
                        Indien je een snelkoppeling hebt gemaakt, zal je deze opnieuw moeten maken.
                    </article>
                    <article>
                        <div class="setting theme hostname">
                            <div class="title">Hostnaam</div>
                            <input type="text" v-model="hostname" maxlength="50" placeholder="Hostnaam">  
                            <button class="hostname" :disabled="hostname.length === 0 || hostname === $store.state.preferences.hostname" @click="setHostname">Bewerken</button>
                        </div>
                    </article>
                </div>
            </div>

            <div v-if="page === 2" key="3">
                <div class="header">
                    <button @click="() => { page = 0 }"><span class="far fa-chevron-left"></span></button>
                    <span class="title">Thuisscherm instellingen</span>
                    <button @click="closeModal"><span class="far fa-chevron-down"></span></button>
                </div>

                <div class="content">
                    <article>
                        <div class="setting theme">
                            <div class="title">Thema</div>
                            <button @click="() => setTheme('theme', 'light')" :class="{ active: $store.state.preferences.uiTheme === 'light' }">Licht</button>
                            <button @click="() => setTheme('theme', 'dark')" :class="{ active: $store.state.preferences.uiTheme === 'dark' }">Donker</button>
                            <button @click="() => setTheme('theme', 'auto')" :class="{ active: $store.state.preferences.uiTheme === 'auto' }">Systeem voorkeur</button>  
                        </div>
                    </article> 
                    <article>
                        <div class="setting theme">
                            <div class="title">Achtergrondkleur</div>
                            <button @click="() => setTheme('type', 'white')" :class="{ active: $store.state.preferences.uiType === 'white' }">Wit</button>
                            <button @click="() => setTheme('type', 'black')" :class="{ active: $store.state.preferences.uiType === 'black' }">Zwart</button>
                            <button @click="() => setTheme('type', 'gradient')" :class="{ active: $store.state.preferences.uiType === 'gradient' }">Kleurovergang</button>  
                        </div>
                    </article> 
                    <article v-if="$store.state.preferences.uiType === 'gradient'">
                        <div class="setting theme">
                            <div class="title">Kleurovergang</div>
                            <div class="row">
                                <span>Huidige kleurovergang</span>
                                <span>{{$store.state.preferences.uiOption}}</span>
                            </div>
                            <button class="change" @click="() => { page = 5; oldPage = 2; }">
                                <span class="text">Kleurovergang bewerken</span> 
                                <span class="far fa-chevron-right"></span>
                            </button>
                        </div>
                    </article>          
                </div>
            </div>

            <div v-if="page === 3" key="4">
                <div class="header">
                    <button @click="() => { page = 0 }"><span class="far fa-chevron-left"></span></button>
                    <span class="title">Scène instellingen</span>
                    <button @click="closeModal"><span class="far fa-chevron-down"></span></button>
                </div>

                <div class="content">
                    <article>
                        <div class="title">Scène voorbeeld</div>
                        <button class="gradient" :style="{ color: $store.state.preferences.sceneText, background: getGradient($store.state.preferences.sceneBackground) }">Voorbeeld tekst</button>
                    </article>
                    <article>
                        <div class="setting theme">
                            <div class="title">Achtergrond</div>
                            <div class="row">
                                <span>Kleurovergang</span>
                                <span>{{$store.state.preferences.sceneBackground}}</span>
                            </div>

                            <button class="change" @click="() => { page = 5; oldPage = 3; }">
                                <span class="text">Kleurovergang bewerken</span> 
                                <span class="far fa-chevron-right"></span>
                            </button>
                        </div>
                    </article> 
                    <article>
                        <div class="setting theme">
                            <div class="title">Tekst kleur</div>
                            <button @click="() => setScene('text', 'white')" :class="{ active: $store.state.preferences.sceneText === 'white' }">Wit</button>
                            <button @click="() => setScene('text', 'black')" :class="{ active: $store.state.preferences.sceneText === 'black' }">Zwart</button>
                        </div> 
                    </article>     
                </div>
            </div>

            <div v-if="page === 4" key="5">
                <div class="header">
                    <button @click="() => { page = 0; preserveScenes = false; preserveDefaults = false; preserveTheme = false; }"><span class="far fa-chevron-left"></span></button>
                    <span class="title">Apparaat resetten</span>
                    <button @click="closeModal"><span class="far fa-chevron-down"></span></button>
                </div>

                <div class="content">
                    <div class="danger">Deze actie kan <b>niet</b> ongedaan gemaakt worden</div>
                     <article>
                        <div class="setting theme">
                            <div class="title">Gegevens behoud</div>
                            <div class="row">
                                <span>Behoud scènes</span>
                                <input type="checkbox" v-model="preserveScenes">
                            </div>
                        </div>
                        <div class="row">
                            <span>Behoud scène standaarden</span>
                            <input type="checkbox" v-model="preserveDefaults">
                        </div>  
                        <div class="row">
                            <span>Behoud thuisscherm</span>
                            <input type="checkbox" v-model="preserveTheme">
                        </div>
                    </article> 
                    <article>
                        <div class="setting theme">
                            <div class="title">Weet je het zeker?</div>
                            <button class="reset" @click="factoryReset">Bevestig reset</button>
                        </div>
                    </article> 
                </div>
            </div>

            <div v-if="page === 5" key="6">
                <div class="header">
                    <button class="back" @click="() => { page = oldPage }"><span class="far fa-chevron-left"></span></button>
                    <span class="title">Kleurovergangen</span>
                    <button class="close" @click="closeModal"><span class="far fa-chevron-down"></span></button>
                </div>

                <div class="content">
                    <GradientPicker v-on:background="handleOption"/>      
                </div>
            </div>
            
        </transition>
    </modal>
</template>

<script>
import GradientPicker from "./GradientPicker";
import { getGradient } from "./utils"
export default {
    name: 'Settings',
    data() {
        return {
            oldPage: 2,
            page: 0,
            slideDirection: "left",
            hostname: this.$store.state.preferences.hostname,
            preserveScenes: false,
            preserveDefaults: false,
            preserveTheme: false,
        }
    },
    methods: {
        getGradient,
        handleOption(gradient) {
            if (this.oldPage === 2) {
                this.setTheme("option", gradient.name);
            } else {
                this.setScene("background", gradient.name);
            }

            this.page = this.oldPage;
        },
        setScene(type, value) {
            this.$store.dispatch("setScene", { type, value });
        },
        setTheme(type, value) {
            this.$store.dispatch("setTheme", { type, value });
        },
        openModal() {
            this.$modal.show('settingsModal')
        },
        closeModal() {
            this.$modal.hide('settingsModal')
            this.page = 0;
        },
        closed() {
            this.hostname = this.$store.state.preferences.hostname;
            this.preserveScenes = false;
            this.preserveDefaults = false;
            this.preserveTheme = false;
            this.page = 0;
        },
        setHostname() {
            this.$socket.client.emit("setHostname", this.hostname);
            this.hostname = this.$store.state.preferences.hostname;
            this.page = 0;
        },
        reboot() {
            this.$socket.client.emit("reboot");
        },
        factoryReset() {
            this.$socket.client.emit("reset", {
                theme: this.preserveTheme,
                scene: this.preserveDefaults,
                scenes: this.preserveScenes
            });
        }
    },
    watch: {
        hostname(newVal) {
            if (newVal.length > 50) return;
            let re = /[^A-Z0-9]/gi;
            this.$set(this, 'hostname', newVal.replace(re, ''));
        },
        page (to, from) {
            if (to > from) {
                this.slideDirection = "left";
            } else {
                this.slideDirection = "right";
            }
        }
    },
    components: {
        GradientPicker
    }
}
</script>

<style lang="scss" scoped>
.content.settings {
    display: grid;
    row-gap: 15px;
    grid-template-columns: 1fr;
    grid-auto-rows: min-content;
    > span {
        height: 5px;
    }
}

.row {
    align-items: center;
}

.change {
    width: 100%;
    text-align: left;
    padding: 10px 20px !important;
    .far {
        position: relative;
        top: 2px;
        float: right;
    }
}

article {
    &.general {
        row-gap: 10px;
        .title {
            button {
                right: 0;
                background: var(--buttons); 
                border-radius: 8px;
                padding: 10px;
                float: right;
                .far {
                    position: relative;
                    top: 2px;
                    margin-left: 7px;
                }
            }
        }
    }
    &.system {
        button {
            width: 100%;
            &:first-of-type {
                margin-bottom: 15px;
            }
        }
    }
    .setting {
        &.theme {
            display: grid;
            grid-template-columns: 1fr;    
            row-gap: 10px;
            button {
                padding: 10px;
            }

            &.hostname {
                grid-auto-rows: min-content;
                button {
                    margin-top: 30px;
                }
            }
        }
    }
}

.reset {
    background: var(--red);
    color: white;
}
</style>
