<template>
    <modal  name="sceneModal"
            width="100%"
            height="100%"
            transition="slide"
            overlayTransition="fade"
            id="modal">
        <transition :name="`slide-${slideDirection}`">
            <div v-if="page === 0" key="1">
                <div class="header">
                    <span></span>
                    <span class="title">Scene's</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
                </div>

                <div class="content scenes">
                    <button id="create" @click="openCreate">
                        <i class="fas fa-plus"></i>
                        Scene aanmaken
                    </button>
                    <div class="list">
                        <button
                            class="gradient"
                            v-for="(scene, index) in $store.state.scenes" :key="`${scene.name}${index}`" 
                            :style="{ background: getGradient(scene.background), color: scene.textColor }"
                            :class="{ active: $store.state.activeScene === scene.name }"
                            @click="() => applyScene(scene.name)">{{scene.name}}</button>
                    </div>
                </div>
            </div>
        

            <div v-if="page === 1" key="2">
                <div class="header">
                    <span class="back" @click="() => { page = 0 }"><span class="far fa-chevron-left"></span></span>
                    <span class="title">Scene aanmaken</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
                </div>
                <div class="content create">
                    <div v-if="sceneExists()" class="warning">
                        <span class="far fa-exclamation-triangle"></span>
                        Er bestaat al een scene met de naam {{sceneName}}. Deze zal worden overschreven.
                    </div>
                    <article>
                        <div class="title">Voorbeeld</div>
                        <button class="gradient" :style="{ color: textColor, background: getGradient(backgroundName) }">{{sceneName === "" ? "Scene naam" : sceneName}}</button>
                    </article>

                    <article>
                        <div class="setting">
                            <div class="title">Scenenaam</div>
                            <input type="text" v-model="sceneName" placeholder="Scene naam">  
                        </div>

                        <div class="setting">
                            <div class="title">Achtergrond</div>
                            <button class="background-select" @click="() => { page = 2 }">
                                <span class="text">Selecteer achtergrond</span> 
                                <span class="far fa-chevron-right"></span>
                            </button>
                        </div>

                        <div class="setting font-color">
                            <div class="title">Tekstkleur</div>
                            <button :class="{ active: textColor === 'white' }" @click="() => {textColor = 'white'}">Wit</button>
                            <button :class="{ active: textColor === 'black' }" @click="() => {textColor = 'black'}">Zwart</button>
                        </div>
                                     
                        <button class="create" :disabled="sceneName === ''" @click="saveScene">Aanmaken</button>
                    </article>
                </div>
            </div>
            <div v-if="page === 2" key="3">
                <div class="header">
                    <span class="back" @click="() => { page = 1 }"><span class="far fa-chevron-left"></span></span>
                    <span class="title">Gradients</span>
                    <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
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
            sceneName: "",
            slideDirection: "left",
            sceneFavorite: false,
            backgroundName: "",
            textColor: "white"
        }
    },
    methods: {
        getGradient,
        openCreate() {
            this.backgroundName = this.$store.state.preferences.sceneBackground;
            this.textColor = this.$store.state.preferences.sceneText;
            this.page = 1;
        },
        handleBackground(gradient) {
            this.backgroundName = gradient.name;
            this.page = 1;
        },
        openModal() {
            this.$modal.show('sceneModal')
        },
        closeModal() {
            this.$modal.hide('sceneModal')
            this.page = 0;
        },
        saveScene() {
            console.log("12")
            this.$store.dispatch("saveScene", { name: this.sceneName, background: this.backgroundName, textColor: this.textColor });
            this.sceneName = "";
            this.backgroundName = this.$store.state.preferences.sceneBackground;
            this.textColor = this.$store.state.preferences.sceneText;
            this.page = 0;
        },
        applyScene(scene) {
            this.$store.dispatch("applyScene", scene);
            this.closeModal()
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
        // font-size: 14px;
        outline: 0;
        border: none;
        background: var(--background);
        border-radius: 8px;
    }
    .content.scenes {
        grid-template-rows: 50px 1fr;

        .list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: min-content;
            column-gap: 10px;
            row-gap: 10px;
            button {
                border: none;
            }
        }
    }

    .content.create {
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
                    .far {
                        position: relative;
                        top: 1px;
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
            }
            // padding: 15px;
            // border-radius: 8px;
            // background: var(--background);
            // row-gap: 10px;
            // span {
            //     font-weight: bold;
            // }

            .gradient {
                width: 100%;
            }
        }
    }

    .content.gradients {
        
    }
    // #app + #modal {
    //     overflow: hidden;
    // }
    /* body.modal-open {
        overflow: hidden;
    } */
    

    // .preview {
    //     background: var(--background);
    //     padding: 15px;
    //     border-radius: 12px;
    // }

    // .preview > span {
    //     display: block;
    //     font-weight: bold;
    //     margin-bottom: 15px;
    // }

    // .preview > button {
    //     width: 100%;
    // }

    // .name {
    //     margin-top: 15px;
    // }

    // .name > span {
    //     /* font-weight: bold; */
    // }
    // .name > input {
    //     height: 35px;
    //     border-radius: 12px;
    //     border: solid 1px lightgray
    // }

    // .content.list {
    //     grid-template-rows: 45px 1fr;
    // }

    // .content.create {
    //     grid-template-rows: min-content min-content min-content min-content min-content;
    // }

    // .content > #create {
    //     border-radius: 8px;
    //     border: none;
    //     background: aqua;
    //     outline: 0;
    //     height: 45px;
    // }
    
    // .content > #scenes {
    //     display: grid;
    //     grid-template-columns: 1fr 1fr;
    //     grid-template-rows: min-content;
    //     column-gap: 10px;
    //     row-gap: 10px;
    // }

    // .content > #scenes > button, .example {
    //     box-shadow: 2px 3px 10px 0px rgba(0,0,0,0.15);
    //     outline: 0;
    //     padding: 20px;
    //     border-radius: 12px;
    //     border: none;
    //     background:#f80759;
    //     color: white;
    // }
</style>
