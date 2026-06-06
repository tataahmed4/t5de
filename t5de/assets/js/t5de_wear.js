(function () {
    function callBridge(name, payload) {
        try {
            if (window.imvu && typeof window.imvu.call === "function") {
                window.imvu.call(name, payload);
                return true;
            }
        } catch (e) {
        }
        return false;
    }

    function wear(productId) {
        var pid = parseInt(productId, 10);
        if (isNaN(pid)) {
            return false;
        }
        if (callBridge("useProduct", { productId: pid })) {
            return true;
        }
        if (callBridge("sendChatCommand", { command: "*use " + pid })) {
            return true;
        }
        try {
            window.location.href = "imvu:use?product=" + pid;
            return true;
        } catch (e) {
            return false;
        }
    }

    function badgeFor(product) {
        if (!product) {
            return "";
        }
        var rating = product.rating || product.viewing_rating || "";
        var ap = product.is_ap === true || rating === "AP" || product.access_pass === true;
        if (ap) {
            return '<span class="t5de-badge ap">AP</span>';
        }
        return '<span class="t5de-badge ga">GA</span>';
    }

    window.t5deWear = wear;
    window.t5deBadgeFor = badgeFor;
})();
