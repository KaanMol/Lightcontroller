export const setup = {
    state: {
        completed: true,
        networks: []
    },
    mutations: {
        SOCKET_SYNC(state, value) {
            if (value.isSetup) { return; }
            
            state.completed = false;
            state.networks = value.networks;
        },
    }
}