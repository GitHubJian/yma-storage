const path = require('path');
const fse = require('fs-extra');
const os = require('os');

const storage = path.resolve(os.homedir(), 'storage');

const adapter = (function () {
    let $catched = null;
    let $filepath = null;
    let $key = null;

    function handleExit(key, value) {
        $key = $key || key;
        $filepath = $filepath || path.resolve(storage, $key + '.json');

        fse.ensureFileSync($filepath);

        fse.writeFileSync($filepath, JSON.stringify(value, null, 4), {
            encoding: 'utf-8',
        });
    }

    process.on('exit', function () {
        handleExit($key, $catched);
    });

    return {
        get(key) {
            if ($catched) {
                return $catched;
            }

            filepath = filepath || path.resolve(storage, key + '.json');

            fse.ensureFileSync(filepath);
            const content = fse.readFileSync(filepath, {
                encoding: 'utf-8',
            });

            let state;
            try {
                state = JSON.parse(content);
            } catch (e) {
                state = {};
            }

            return ($catched = state);
        },
        set(key, value) {
            $catched = value;

            setTimeout(function () {
                // 异步写入，异常退出时需要写入数据
                handleExit(key, value);
            });

            return true;
        },
    };
})();

module.exports = adapter;
