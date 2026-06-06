(function () {
    var API_USER_BY_NAME = "https://api.imvu.com/user?username=";
    var API_USER_BY_ID = "https://api.imvu.com/user/user-";
    var API_PRODUCTS = "https://api.imvu.com/product?creator=";
    var SHOP_PRODUCT = "https://www.imvu.com/shop/product.php?products=";

    function el(tag, cls, html) {
        var node = document.createElement(tag);
        if (cls) {
            node.className = cls;
        }
        if (html !== undefined && html !== null) {
            node.innerHTML = html;
        }
        return node;
    }

    function request(url, callback) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.withCredentials = true;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            callback(null, JSON.parse(xhr.responseText));
                        } catch (e) {
                            callback(e, null);
                        }
                    } else {
                        callback(new Error("HTTP " + xhr.status), null);
                    }
                }
            };
            xhr.send();
        } catch (e) {
            callback(e, null);
        }
    }

    function extractId(denorm, key) {
        if (!denorm) {
            return null;
        }
        var entry = denorm[key];
        if (!entry || !entry.data || !entry.data.id) {
            return null;
        }
        return entry.data.id;
    }

    function resolveCreator(query, callback) {
        var trimmed = ("" + query).trim();
        if (/^\d+$/.test(trimmed)) {
            request(API_USER_BY_ID + trimmed, function (err, data) {
                callback(err, trimmed, data);
            });
            return;
        }
        request(API_USER_BY_NAME + encodeURIComponent(trimmed), function (err, data) {
            if (err || !data || !data.denormalized) {
                callback(err || new Error("not found"), null, null);
                return;
            }
            var keys = Object.keys(data.denormalized);
            var cid = null;
            for (var i = 0; i < keys.length; i++) {
                var d = data.denormalized[keys[i]].data;
                if (d && d.legacy_cid) {
                    cid = "" + d.legacy_cid;
                    break;
                }
            }
            callback(cid ? null : new Error("not found"), cid, data);
        });
    }

    function fetchProducts(cid, callback) {
        request(API_PRODUCTS + cid + "&limit=100", function (err, data) {
            if (err || !data) {
                callback(err || new Error("no products"), []);
                return;
            }
            var ids = [];
            if (data.denormalized) {
                var keys = Object.keys(data.denormalized);
                for (var i = 0; i < keys.length; i++) {
                    var rel = data.denormalized[keys[i]].relations;
                    if (rel && rel.ref) {
                        var parts = ("" + rel.ref).split("-");
                        var pid = parts[parts.length - 1];
                        if (/^\d+$/.test(pid)) {
                            ids.push(pid);
                        }
                    }
                }
            }
            callback(null, ids);
        });
    }

    function renderProducts(container, ids) {
        container.innerHTML = "";
        if (!ids.length) {
            container.appendChild(el("div", "t5de-small", "No products found."));
            return;
        }
        var grid = el("div", "t5de-row");
        for (var i = 0; i < ids.length; i++) {
            (function (pid) {
                var card = el("div", "t5de-card t5de-col");
                var idLabel = el("div", "t5de-small", "ID: " + pid);
                var wearBtn = el("button", "t5de-btn t5de-btn-primary", "Wear");
                wearBtn.addEventListener("click", function () {
                    if (window.t5deWear) {
                        window.t5deWear(pid);
                    }
                });
                var shopBtn = el("button", "t5de-btn t5de-btn-secondary", "Open");
                shopBtn.addEventListener("click", function () {
                    try {
                        window.open(SHOP_PRODUCT + pid, "_blank");
                    } catch (e) {
                    }
                });
                card.appendChild(idLabel);
                card.appendChild(wearBtn);
                card.appendChild(shopBtn);
                grid.appendChild(card);
            })(ids[i]);
        }
        container.appendChild(grid);
    }

    function buildPanel() {
        if (document.getElementById("t5de-designer-search")) {
            return;
        }
        var panel = el("div", "t5de-card t5de-col t5de-scaled");
        panel.id = "t5de-designer-search";

        var title = el("div", "t5de-title", "Designer Search");
        var row = el("div", "t5de-row");
        var input = el("input");
        input.type = "search";
        input.placeholder = "Designer name or ID";
        var button = el("button", "t5de-btn t5de-btn-primary", "Search");
        var status = el("div", "t5de-small", "");
        var results = el("div", "t5de-col");

        function run() {
            var q = input.value;
            if (!q || !q.trim()) {
                return;
            }
            status.innerHTML = "Searching...";
            results.innerHTML = "";
            resolveCreator(q, function (err, cid) {
                if (err || !cid) {
                    status.innerHTML = "Designer not found.";
                    return;
                }
                status.innerHTML = "Creator ID: " + cid + " (products remain even if account is suspended)";
                fetchProducts(cid, function (perr, ids) {
                    if (perr) {
                        status.innerHTML = "Could not load products.";
                        return;
                    }
                    status.innerHTML = "Creator ID: " + cid + " - " + ids.length + " products";
                    renderProducts(results, ids);
                });
            });
        }

        button.addEventListener("click", run);
        input.addEventListener("keydown", function (e) {
            if (e.keyCode === 13) {
                run();
            }
        });

        row.appendChild(input);
        row.appendChild(button);
        panel.appendChild(title);
        panel.appendChild(row);
        panel.appendChild(status);
        panel.appendChild(results);

        if (document.body) {
            document.body.appendChild(panel);
        }
    }

    window.t5deDesignerSearch = {
        build: buildPanel,
        resolveCreator: resolveCreator,
        fetchProducts: fetchProducts
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", buildPanel);
    } else {
        buildPanel();
    }
})();
