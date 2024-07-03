# YMA Storage

类似 VueX 的 Storage 存储

## Usage

```js
const createStorage = require('yma-storage');
const storage = createStorage({
    namespace: 'yma',
    force: true, // 强制更新
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

storage.commit('increment');

storage
    .dispatch('update', {
        count: 14,
    })
    .then(state => {
        console.log();
    });
```
