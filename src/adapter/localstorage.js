module.exports = {
    get: function (key) {
        return window.localStorage.getItem(key);
    },
    set: function (key, value) {
        return window.localStorage.setItem(key, value);
    },
};
