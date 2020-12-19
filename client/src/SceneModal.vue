<template>
    <modal  name="sceneModal"
            width="100%"
            height="100%"
            :shiftY="0"
            transition="slide"
            overlayTransition="fade"
            id="modal">
        <template v-if="page === 0">
            <div class="header">
                <span></span>
                <span class="title">Scene's</span>
                <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
            </div>

            <div class="content list">
                <button id="create">
                    <span class="far fa-plus"></span>
                    <button @click="() => { page = 1 }">Scene aanmaken</button>
                </button>
                <div id="scenes" >
                    <button
                        v-for="(scene, index) in $store.getters.scenes" :key="`${scene.name}${index}`" 
                        :style="{ background: getBackground(scene.background) }"
                        @click="() => setScene(scene.name)">{{scene.name}}</button>
                </div>
            </div>
        </template>
        <template v-if="page === 1">
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
                <div class="preview">
                    <span>Voorbeeld</span>
                    <button class="example" :style="{ background }">{{sceneName === "" ? "Scene naam" : sceneName}}</button>
                </div>

                <div class="stack name">
                    <span>Scene naam</span>
                    <input type="text" v-model="sceneName">               
                </div>

                <div class="stack">
                    <span>Achtergrond</span>
                    <button class="example" :style="{ background }">{{gradient.name}}</button>
                </div>

                <!-- <div class="row">
                    Huidige overgang
                    <button @click="() => { page = 2 }">Overgang kiezen</button>
                </div> -->
                
                <button :disabled="sceneName === ''" @click="saveScene">Save</button>
            </div>
        </template>
        <template v-if="page === 2">
            <div class="header">
                <span class="back" @click="() => { page = 1 }"><span class="far fa-chevron-left"></span></span>
                <span class="title">Gradients</span>
                <span class="close" @click="closeModal"><span class="far fa-chevron-down"></span></span>
            </div>

            <div class="content">
                <GradientPicker v-on:background="handleBackground"/>
            </div>
        </template>
    </modal>
</template>

<script>
import gradients from "./gradients.json";
import GradientPicker from "./GradientPicker";

export default {
    name: 'Light',
    data() {
        return {
            page: 0,
            sceneName: "",
            gradient: {
                "name": "Shifter",
                "colors": ["#bc4e9c", "#f80759"]
            }
        }
    },
    methods: {
        handleBackground(gradient) {
            console.log
            this.gradient = gradient;
            this.page = 1;
        },
        getBackground(backgroundName) {
            const background = gradients.find(gradient => gradient.name === backgroundName);
            const colors = background.colors;

            return [
                `${colors[0]}`,
                `-webkit-linear-gradient(to top right, ${colors.join(", ")})`,
                `linear-gradient(to top right, ${colors.join(", ")})`
            ];
        },
        openModal() {
            this.$modal.show('sceneModal')
        },
        closeModal() {
            this.$modal.hide('sceneModal')
        },
        saveScene() {
            this.$store.dispatch("saveScene", { name: this.sceneName, background: this.gradient.name });
            this.sceneName = "";
            this.page = 0;
        },
        setScene(scene) {
            this.$store.dispatch("setScene", scene);
        },
        sceneExists() {
            const scenes = this.$store.getters.scenes.find(scene => scene.name.toLowerCase() === this.sceneName.toLowerCase());
            return scenes !== undefined;
        }
    },
    computed: {
        background() {
            return [
                `${this.gradient.colors[0]}`,
                `-webkit-linear-gradient(to top right, ${this.gradient.colors.join(", ")})`,
                `linear-gradient(to top right, ${this.gradient.colors.join(", ")})`
            ];
        }
    },
    components: {
        GradientPicker
    }
}
</script>

<style>
    /* .warning {
        background:
    } */
    #modal {
        margin-top: 50px;
    }

    #modal > .vm--modal {
        display: grid;
        grid-template-rows: 35px 1fr;
        row-gap: 15px;
    }

    .header {
        margin: 15px;
        display: grid;
        grid-template-columns: 30px 1fr 30px;
    }

    .header > .title {
        font-size: 18px;
        font-weight: bold; 
    }

    .content {
        padding: 15px;
        overflow: auto;
        display: grid;
        row-gap: 10px;
    }

    .preview {
        background: lightgray;
        padding: 15px;
        border-radius: 12px;
    }

    .preview > span {
        display: block;
        font-weight: bold;
        margin-bottom: 15px;
    }

    .preview > button {
        width: 100%;
    }

    .name {
        margin-top: 15px;
    }

    .name > span {
        /* font-weight: bold; */
    }
    .name > input {
        height: 35px;
        border-radius: 12px;
        border: solid 1px lightgray
    }

    .content.list {
        grid-template-rows: 45px 1fr;
    }

    .content.create {
        grid-template-rows: min-content min-content min-content min-content;
    }

    .content > #create {
        border-radius: 8px;
        border: none;
        background: aqua;
        outline: 0;
        height: 45px;
    }
    
    .content > #scenes {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: min-content;
        column-gap: 10px;
        row-gap: 10px;
    }

    .content > #scenes > button, .example {
        outline: 0;
        padding: 20px;
        border-radius: 12px;
        border: none;
        background:#f80759;
        color: white;
    }

    .slide-enter-active {
        animation: bounce-in .35s;
    }

    .slide-leave-active {
        animation: bounce-in .35s reverse;
    }

    @keyframes bounce-in {
        0% {
            transform: translateY(100%);
        }
        100% {
            transform: translateY(0%);
        }
    }
</style>
