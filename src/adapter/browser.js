module.exports = {
    get: function (key) {
        let value;
        try {
            value = JSON.parse(window.localStorage.getItem(key));
        } catch (e) {
            value = {};
        }

        return value;
    },
    set: function (key, value) {
        window.localStorage.setItem(key, JSON.stringify(value, null, 4));

        return true;
    },
};
