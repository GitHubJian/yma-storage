const createStorage = require('../src');

const storage = new createStorage({
    namespace: 'wps',
    force: true,
    state: {
        count: 1,
    },
    getters: {
        todo(state) {
            return state.count;
        },
    },
    mutations: {
        increment(state, payload) {
            state.count = payload.count;
        },
    },
    actions: {
        update(context, payload) {
            setTimeout(function () {
                context.commit('increment', payload);
            });
        },
    },
});

// storage.commit('increment');
console.log(storage.getters.todo);
// storage
//     .dispatch('update', {
//         count: 14,
//     })
//     .then(() => {
//         console.log(storage.getters.todo);
//     });
