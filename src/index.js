const localstorage = require('./adapter/localstorage');

function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

function getState(state, storage) {
    try {
        return state.call(storage);
    } catch (e) {
        console.warn('state functions should return an object');

        return {};
    }
}

function initState(storage, initState) {
    let state =
        typeof initState === 'function'
            ? getState(initState, storage)
            : initState || {};

    if (!isPlainObject(state)) {
        state = {};

        console.warn('state functions should return an object');
    }

    storage.state = state;
}

function registerGetters(storage, getters) {
    storage.getters = {};

    Object.keys(getters || {}).forEach(function (key) {
        Object.defineProperty(storage.getters, key, {
            get() {
                const state = storage.state;
                const fn = getters[key];
                if (typeof fn !== 'function') {
                    throw new Error('getter must be function');
                }

                return fn.call(null, state);
            },
            enumerable: true,
        });
    });
}

function registerMutations(storage, mutations) {
    storage._mutations = mutations;
}

function registerActions(storage, actions) {
    storage._actions = Object.create(null);

    Object.keys(actions).forEach(function (key) {
        const action = actions[key];
        const handler = action.handler || action;

        const entry = function (state, payload) {
            return new Promise(resolve => {
                function commit(type, payload) {
                    storage.commit(type, payload);

                    resolve(state);
                }

                handler(
                    {
                        commit: commit,
                        state: state,
                    },
                    payload
                );
            });
        };

        storage._actions[key] = entry;
    });
}

function Storage(options, adapter) {
    const that = this;

    this._committing = false;
    this.namespace = options.namespace;
    // 适配器
    this.adapter = adapter || localstorage;

    // 初始化 state
    if (options.force) {
        initState(this, options.state);
    }

    // 绑定 storage 对象
    const {dispatch, commit} = this;
    this.dispatch = function boundDispatch(type, payload) {
        return dispatch.call(that, type, payload);
    };
    this.commit = function boundCommit(type, payload, options) {
        return commit.call(that, type, payload, options);
    };

    registerGetters(this, options.getters);
    registerMutations(this, options.mutations || {});
    registerActions(this, options.actions || {});
}

Object.defineProperty(Storage.prototype, 'state', {
    get() {
        const ns = encodeURIComponent(this.namespace);

        return JSON.parse(this.adapter.get(ns));
    },
    set(val) {
        const ns = encodeURIComponent(this.namespace);

        return this.adapter.set(ns, JSON.stringify(val));
    },
});

Storage.prototype.commit = function (type, payload) {
    const state = this.state;
    const entry = this._mutations[type];

    this.withCommit(() => {
        entry(state, payload);
    });

    this.state = state;
};

Storage.prototype.dispatch = function (type, payload) {
    const state = this.state;
    const entry = this._actions[type];

    return entry(state, payload);
};

Storage.prototype.withCommit = function (fn) {
    const committing = this._committing;
    this._committing = true;

    fn();

    this._committing = committing;
};

function createStorage(options) {
    return new Storage(options);
}
createStorage.Storage = Storage;

module.exports = createStorage;
