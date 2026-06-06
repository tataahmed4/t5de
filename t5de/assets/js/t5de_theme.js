(function () {
    var STORAGE_KEY = "t5de.scale";
    var MIN = 0.75;
    var MAX = 2.0;
    var STEP = 0.05;

    function clamp(value) {
        if (isNaN(value)) {
            return 1;
        }
        if (value < MIN) {
            return MIN;
        }
        if (value > MAX) {
            return MAX;
        }
        return value;
    }

    function readScale() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw === null) {
                return 1;
            }
            return clamp(parseFloat(raw));
        } catch (e) {
            return 1;
        }
    }

    function writeScale(value) {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(value));
        } catch (e) {
        }
    }

    function applyScale(value) {
        var scale = clamp(value);
        var root = document.documentElement;
        if (root && root.style && root.style.setProperty) {
            root.style.setProperty("--scale", String(scale));
        }
        if (document.body) {
            if (document.body.classList) {
                document.body.classList.add("t5de-scaled");
            } else {
                document.body.className += " t5de-scaled";
            }
        }
        writeScale(scale);
        return scale;
    }

    function buildControl() {
        if (document.getElementById("t5de-scale-control")) {
            return;
        }
        var current = readScale();
        var wrap = document.createElement("div");
        wrap.id = "t5de-scale-control";
        wrap.className = "t5de-scale-control t5de-scaled";

        var label = document.createElement("span");
        label.className = "t5de-small";
        label.innerHTML = "UI Size";

        var range = document.createElement("input");
        range.type = "range";
        range.min = String(MIN);
        range.max = String(MAX);
        range.step = String(STEP);
        range.value = String(current);

        var value = document.createElement("span");
        value.className = "t5de-scale-value";
        value.innerHTML = Math.round(current * 100) + "%";

        range.addEventListener("input", function () {
            var v = applyScale(parseFloat(range.value));
            value.innerHTML = Math.round(v * 100) + "%";
        });

        wrap.appendChild(label);
        wrap.appendChild(range);
        wrap.appendChild(value);

        if (document.body) {
            document.body.appendChild(wrap);
        }
    }

    function init() {
        applyScale(readScale());
        buildControl();
    }

    window.t5deTheme = {
        apply: applyScale,
        read: readScale,
        buildControl: buildControl,
        MIN: MIN,
        MAX: MAX
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
