<template>
    <modal  name="sceneModal"
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
                    <span class="title">Scènes</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
                </div>

                <div class="content scenes">
                    <button @click="openCreate">
                        <i class="fas fa-plus"></i>
                        Aanmaken
                    </button>
                    <button v-if="$store.state.activeScene !== ''" @click="openEdit">
                        <i class="fas fa-pencil"></i>
                        Bewerken
                    </button>
                    <div class="list">
                        <button
                            class="gradient"
                            v-for="(scene, index) in $store.state.scenes" :key="`${scene.name}${index}`" 
                            :style="{ background: getGradient(scene.background), color: scene.textColor }"
                            :class="{ active: $store.state.activeScene === scene.name }"
                            :disabled="$store.state.activeScene === scene.name"
                            @click="() => applyScene(scene.name)"><i v-if="$store.state.activeScene === scene.name" class="far fa-chevron-right"></i> <span>{{scene.name}}</span></button>
                    </div>
                </div>
            </div>
        

            <div v-if="page === 1" key="2">
                <div class="header">
                    <button @click="() => { page = 0 }"><span class="far fa-chevron-left"></span></button>
                    <span class="title">Scène aanmaken</span>
                    <button @click="closeModal"><span class="far fa-chevron-down"></span></button>
                </div>
                <div class="content create">
                    <div v-if="sceneExists()" class="warning">
                        <span class="far fa-exclamation-triangle"></span>
                        Er bestaat al een scène met de naam {{sceneName}}. Deze zal worden overschreven.
                    </div>
                    <article>
                        <div class="title">Voorbeeld</div>
                        <button class="gradient" :style="{ color: textColor, background: getGradient(backgroundName) }">{{sceneName === "" ? "Scène naam" : sceneName}}</button>
                    </article>

                    <article>
                        <div class="setting">
                            <div class="title">Scènenaam</div>
                            <input type="text" v-model="sceneName" placeholder="Scène naam">  
                        </div>

                        <div class="setting">
                            <div class="title">Achtergrond</div>
                            <button class="background-select" @click="() => { page = 3 }">
                                <span class="text">Selecteer achtergrond</span> 
                                <span class="far fa-chevron-right"></span>
                            </button>
                        </div>

                        <div class="setting font-color">
                            <div class="title">Tekstkleur</div>
                            <button :class="{ active: textColor === 'white' }" @click="() => {textColor = 'white'}">Wit</button>
                            <button :class="{ active: textColor === 'black' }" @click="() => {textColor = 'black'}">Zwart</button>
                        </div>
                                     
                        <button class="create" :disabled="sceneName === ''" @click="createScene">Aanmaken</button>
                    </article>
                </div>
            </div>
            <div v-if="page === 2" key="3">
                
                <div class="header">
                    <button @click="() => { page = 0 }"><span class="far fa-chevron-left"></span></button>
                    <span class="title">Scène bewerken</span>
                    <button @click="closeModal"><span class="far fa-chevron-down"></span></button>
                </div>
                <div class="content edit">
                    <article>
                        <div class="title">Voorbeeld</div>
                        <button class="gradient" :style="{ color: textColor, background: getGradient(backgroundName) }">{{sceneName === "" ? "Scène naam" : sceneName}}</button>
                    </article>

                    <article>
                        <div class="setting">
                            <div class="title">Scènenaam</div>
                            <input type="text" v-model="sceneName" placeholder="Scène naam">  
                        </div>

                        <div class="setting">
                            <div class="title">Achtergrond</div>
                            <button class="background-select" @click="() => { page = 3 }">
                                <span class="text">Selecteer achtergrond</span> 
                                <span class="far fa-chevron-right"></span>
                            </button>
                        </div>

                        <div class="setting font-color">
                            <div class="title">Tekstkleur</div>
                            <button :class="{ active: textColor === 'white' }" @click="() => {textColor = 'white'}">Wit</button>
                            <button :class="{ active: textColor === 'black' }" @click="() => {textColor = 'black'}">Zwart</button>
                        </div>
                                     
                        <button class="create" :disabled="sceneName === ''" @click="editScene">Bewerken</button>
                    </article>

                    <article>
                        <div class="setting">
                            <div class="title">Verwijderen</div>
                            <button @click="removeScene" class="remove">
                                <i class="far fa-trash-alt"></i> 
                                <span>Verwijder {{sceneName}}</span>
                            </button>
                        </div>
                    </article>
                    <span class="filler"></span>
                </div>
            </div>
            <div v-if="page === 3" key="4">
                <div class="header">
                    <button @click="handleReturn"><span class="far fa-chevron-left"></span></button>
                    <span class="title">Overgang kiezer</span>
                    <button @click="closeModal"><span class="far fa-chevron-down"></span></button>
                </div>

                <div class="content gradients">
                    <GradientPicker v-on:background="handleBackground"/>
                </div>
            </div>
        </transition>
    </modal>
</template>

<script>

import GradientPicker from "./GradientPicker";
import { getGradient } from "./utils"
export default {
    name: 'Light',
    data() {
        return {
            page: 0,
            edit: false,
            sceneName: "",
            slideDirection: "left",
            backgroundName: "",
            textColor: "white"
        }
    },
    methods: {
        getGradient,
        openCreate() {
            this.edit = false;
            this.backgroundName = this.$store.state.preferences.sceneBackground;
            this.textColor = this.$store.state.preferences.sceneText;
            this.sceneName = "";
            this.page = 1;
        },
        openEdit() {
            this.edit = true;
            const currentScene = this.$store.state.scenes.filter(scene => scene.name === this.$store.state.activeScene)[0]
            this.backgroundName = currentScene.background;
            this.textColor = currentScene.textColor;
            this.sceneName = currentScene.name;
            this.page = 2;
        },
        handleReturn() {
            if (this.edit) {
                this.page = 2;
            } else {
                this.page = 1;
            }
        },        
        handleBackground(gradient) {
            this.backgroundName = gradient.name;
            this.handleReturn()
        },
        openModal() {
            this.$modal.show('sceneModal')
        },
        closeModal() {
            this.$modal.hide('sceneModal')
            this.page = 0;
        },
        closed() {
            this.page = 0;
            this.edit = false;
            this.sceneName = "";
            this.backgroundName = "";
            this.textColor = "white";
            this.slideDirection = "none";
        },
        createScene() {
            this.$store.dispatch("createScene", { name: this.sceneName, background: this.backgroundName, textColor: this.textColor });
            this.sceneName = "";
            this.backgroundName = this.$store.state.preferences.sceneBackground;
            this.textColor = this.$store.state.preferences.sceneText;
            this.page = 0;
        },
        editScene() {
            this.$store.dispatch("editScene", { name: this.sceneName, background: this.backgroundName, textColor: this.textColor });
            this.page = 0;
        },
        removeScene() {
            this.$store.dispatch("removeScene", this.sceneName);
            this.page = 0;
        },
        applyScene(scene) {
            this.slideDirection = "none";
            this.$store.dispatch("applyScene", scene);
        },
        sceneExists() {
            const scenes = this.$store.state.scenes.find(scene => scene.name.toLowerCase() === this.sceneName.toLowerCase());
            return scenes !== undefined;
        }
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
    components: {
        GradientPicker
    }
}
</script>

<style lang="scss" scoped>
    button {
        .fas {
            margin-right: 10px;
        }
    }

    .content.scenes {
        grid-template-rows: min-content 1fr;
        grid-template-columns: 1fr 1fr;
        column-gap: 10px;

        .list {
            grid-column: 1 / 3;
            display: grid;
            grid-auto-rows: min-content;
            grid-template-columns: 1fr 1fr;
            column-gap: 10px;
            row-gap: 10px;
            .gradient {
                align-items: center;
                grid-template-columns: 30px 1fr;
                border: none;

                &:disabled { 
                    opacity: 1;
                }
                
                span {
                    grid-row: 1;
                    grid-column: 1 / 3;
                }

                .far {
                    grid-row: 1;
                    grid-column: 1;
                    font-size: 14px;
                }
            }        
        }
    }

    .content.create, .content.edit {
        grid-auto-rows: min-content;
        article {
            display: grid;
            grid-auto-rows: min-content;
            row-gap: 25px;
            .create {
                margin-top: 15px;
            }

            div.setting {
                div.title {
                    margin-bottom: 10px;
                }

                .background-select {
                    width: 100%;
                    text-align: left;
                    padding: 10px 20px;
                    .far {
                        position: relative;
                        top: 2px;
                        float: right;
                    }
                }
                
                &.font-color {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    column-gap: 15px;
                    button {
                        grid-row: 2;
                    }
                }

                .remove {
                    width: 100%;
                    background: var(--red);
                    color: white;
                    font-size: 14px;
                    .far {
                        font-size: 14px;
                        margin-right: 15px;
                    }
                }
            }

            .gradient {
                width: 100%;
            }
        }
    }
</style>
