export const preferences = {
    state: () => {
        const uiType = localStorage.getItem("preference.uiType");
        const uiOption = localStorage.getItem("preference.uiOption");
        const uiTheme = localStorage.getItem("preference.uiTheme");
        const sceneBackground = localStorage.getItem("preference.sceneBackground");
        const sceneText = localStorage.getItem("preference.sceneText");

        return {
            rebootNeeded: false,
            uiType: uiType !== null ? uiType : "gradient",
            uiOption: uiOption !== null ? uiOption : "Shifter",
            uiTheme: uiTheme !== null ? uiTheme : "auto",
            sceneBackground: sceneBackground !== null ? sceneBackground : "DIMIGO",
            sceneText: sceneText !== null ? sceneText : "white",
            network: "",
            ip: "",
            hostname: ""
        }
    },
    mutations: {
        SOCKET_SYNC(state, { isSetup, preferences }) {
            if (!isSetup) return;
            localStorage.setItem("preference.uiType", preferences.ui.type);
            localStorage.setItem("preference.uiOption", preferences.ui.option);
            localStorage.setItem("preference.uiTheme", preferences.ui.theme);
            localStorage.setItem("preference.sceneBackground", preferences.scene.background);
            localStorage.setItem("preference.sceneText", preferences.scene.text);

            state.hostname = preferences.hostname;
            state.ip = preferences.ip;
            state.uiType = preferences.ui.type;
            state.uiOption = preferences.ui.option;
            state.uiTheme = preferences.ui.theme;
            state.rebootNeeded = preferences.rebootNeeded;
            state.sceneBackground = preferences.scene.background;
            state.sceneText = preferences.scene.text;
            state.network = preferences.network;
        },
        SOCKET_THEME(state, { type, value }) {
            switch (type) {
                case "type": 
                    state.uiType = value;
                    break;
                case "option": 
                    state.uiOption = value; 
                    break;
                case "theme": 
                    state.uiTheme = value;  
                    break;
            }
        },
        SOCKET_SCENE(state, { type, value }) {
            switch (type) {
                case "background": 
                    state.sceneBackground = value;
                    break;
                case "text": 
                    state.sceneText = value;
                    break;
            }
        },
        SOCKET_REBOOTNEEDED(state, rebootNeeded) {
            state.rebootNeeded = rebootNeeded;
        },
    },
    actions: {
        setTheme({ commit }, { type, value }) {
            switch (type) {
                case "type": 
                    localStorage.setItem("preference.uiType", value);
                    break;
                case "option": 
                    localStorage.setItem("preference.uiOption", value);
                    break;
                case "theme": 
                    localStorage.setItem("preference.uiTheme", value);
                    break;
            }

            this._vm.$socket.client.emit("theme", { type, value });
            commit("SOCKET_THEME", { type, value })
        },
        setScene({ commit }, { type, value }) {
            switch (type) {
                case "background": 
                    localStorage.setItem("preference.sceneBackground", value);
                    break;
                case "text": 
                    localStorage.setItem("preference.sceneText", value);
                    break;
            }
            this._vm.$socket.client.emit("scene", { type, value });

            commit("SOCKET_SCENE", { type, value })
        },
        setHostname({ commit }, hostname) {
            commit("SOCKET_HOSTNAME", hostname);
        }
    }
}