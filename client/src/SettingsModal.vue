<template>
    <modal  name="settingsModal"
            width="100%"
            height="100%"
            transition="slide"
            overlayTransition="fade"
            id="modal">
        <transition :name="`slide-${slideDirection}`">
            <div v-if="page === 0" key="1">
                <div class="header">
                    <span></span>
                    <span class="title">Instellingen</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
                </div>

                <div class="content settings">
                    <div id="reboot" v-if="$store.state.preferences.rebootNeeded">
                        Het systeem moet herstarten om bepaalde instellingen toe te passen.
                    </div>
                    <article class="general">
                        <div class="title">Netwerk <span @click="() => { page = 1 }">Aanpassen</span> </div>
                        <div class="row">
                            <span>Netwerknaam</span>    
                            <span>{{$store.state.preferences.network}}</span>
                        </div>
                        <div class="row">
                            <span>LAN-IP</span>    
                            <span>192.168.1.47</span>
                        </div>
                        <div class="row">
                            <span>Hostnaam</span>    
                            <span>{{$store.state.preferences.hostname}}</span>
                        </div>
                    </article>

                    <article class="general">
                        <div class="title">Thuisscherm <span @click="() => { page = 2 }">Aanpassen</span></div>
                        <div class="row">
                            <span>Thema</span>    
                            <span>{{$store.state.preferences.uiTheme}}</span>
                        </div>
                        <div class="row">
                            <span>Achtergrond type</span>    
                            <span>{{$store.state.preferences.uiType}}</span>
                        </div>
                        <div v-if="$store.state.preferences.uiType === 'gradient'" class="row">
                            <span>Achtergrond</span>    
                            <span>{{$store.state.preferences.uiOption}}</span>
                        </div>
                    </article>

                    <article class="general">
                        <div class="title">Scenes <span @click="() => { page = 3 }">Aanpassen</span></div>
                        <div class="row">
                            <span>Standaard overgang</span>    
                            <span>{{$store.state.preferences.sceneBackground}}</span>
                        </div>
                        <div class="row">
                            <span>Standaard tekstkleur</span>    
                            <span>{{$store.state.preferences.sceneText}}</span>
                        </div>
                    </article>

                    <article class="general system">
                        <div class="title">Systeem</div>

                        <button @click="reboot">Herstarten</button>
                        
                        <button @click="() => { page = 4 }">Fabrieksinstellingen</button>
                    </article>    

                    <span></span>              
                </div>
            </div>
            <div v-if="page === 1" key="2">
                <div class="header">
                    <span class="back" @click="() => { page = 0 }"><span class="far fa-chevron-left"></span></span>
                    <span class="title">Instellingen <span class="far fa-chevron-right"></span> WiFi</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
                </div>

                <div class="content">
                    <div v-if="!hostname.length" class="waning">Hostnaam kan niet leeg zijn</div>
                    <article>
                        <div class="setting">
                            <div class="title">Hostnaam</div>
                            <input type="text" v-model="hostname" maxlength="50" placeholder="Hostnaam">  
                        </div>
                                     
                        <!-- <button class="create" :disabled="sceneName === ''" @click="saveScene">Aanmaken</button> -->
                    </article>     
                </div>
            </div>

            <div v-if="page === 2" key="3">
                <div class="header">
                    <span class="back" @click="() => { page = 0 }"><span class="far fa-chevron-left"></span></span>
                    <span class="title">Instellingen <span class="far fa-chevron-right"></span> Thuisscherm</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
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
                            <button @click="() => setTheme('type', 'gradient')" :class="{ active: $store.state.preferences.uiType === 'gradient' }">Overgang</button>  
                        </div>
                    </article> 
                    <article v-if="$store.state.preferences.uiType === 'gradient'">
                        <div class="setting theme">
                            <div class="title">Overgang keuze</div>
                            <div class="row">
                                <span>Overgang</span>
                                <span>{{$store.state.preferences.uiOption}}</span>
                            </div>
                            <button class="background-select" @click="() => { page = 5; oldPage = 2; }">
                                <span class="text">Verander keuze</span> 
                                <span class="far fa-chevron-right"></span>
                            </button>
                        </div>
                    </article>          
                </div>
            </div>

            <div v-if="page === 3" key="4">
                <div class="header">
                    <span class="back" @click="() => { page = 0 }"><span class="far fa-chevron-left"></span></span>
                    <span class="title">Instellingen <span class="far fa-chevron-right"></span> Scenes</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
                </div>

                <div class="content">
                    <article>
                        <div class="setting theme">
                            <div class="title">Achtergrondkleur</div>
                            <div class="row">
                                <span>Overgang</span>
                                <span>{{$store.state.preferences.sceneBackground}}</span>
                            </div>

                            <button class="background-select" @click="() => { page = 5; oldPage = 3; }">
                                <span class="text">Overgang kiezer</span> 
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
                    <span class="back" @click="() => { page = 0 }"><span class="far fa-chevron-left"></span></span>
                    <span class="title">Fabrieksinstellingen</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
                </div>

                <div class="content">
                    <div class="danger">Deze actie kan <b>niet</b> ongedaan gemaakt worden</div>
                     <article>
                        <div class="setting theme">
                            <div class="title">Gegevens behoud</div>
                            <div class="row">
                                <span>Behoud scenes</span>
                                <input type="checkbox" v-model="preserveScenes">
                            </div>
                        </div>
                        <div class="row">
                            <span>Behoud scene standaarden</span>
                            <input type="checkbox" v-model="preserveDefaults">
                        </div>  
                        <div class="row">
                            <span>Behoud thuisscherm</span>
                            <input type="checkbox" v-model="preserveTheme">
                        </div>
                    </article> 
                    <article>
                        <div class="setting theme">
                            <div class="title">Weet u het zeker?</div>
                            <button class="reset" @click="factoryReset">Ik weet het zeker.</button>
                        </div>
                    </article> 
                </div>
            </div>

            <div v-if="page === 5" key="6">
                <div class="header">
                    <span class="back" @click="() => { page = oldPage }"><span class="far fa-chevron-left"></span></span>
                    <span class="title">Overgang kiezer</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
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
            preserveTheme: false
        }
    },
    methods: {
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
        reboot() {
            this.$socket.client.emit("reboot");
        },
        factoryReset() {
            this.$socket.client.emit("reset", {
                theme: this.preserveTheme,
                default: this.preserveDefaults,
                scenes: this.preserveScenes
            });
        }
    },
    watch: {
        hostname(newVal) {
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
    // max-height: calc(100% - 20px) !important;
    // padding-bottom: 55px;
    display: grid;
    row-gap: 15px;
    grid-template-columns: 1fr;
    grid-auto-rows: min-content;
    > span {
        height: 5px;
    }
}

article {
    &.general {
        row-gap: 5px;
    }
    &.system {
        button {
            width: 100%;
            &:first-of-type {
                margin-bottom: 15px;
            }
        }
        // display: grid;
        // grid-template-rows: min-content 1fr 1fr;
        // row-gap: 15px;
    }
    .setting {
        &.theme {
            display: grid;
            grid-template-columns: 1fr;
            row-gap: 10px;
            button {
                padding: 10px;
            }
        }
    }
}

.reset {
    background: #D1152C;
    color: white;
}
</style>
