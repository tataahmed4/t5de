from ...patch import InterfacePatch


class MarketWearPatch(InterfacePatch):
    def __init__(self):
        super(MarketWearPatch, self).__init__()

        self.register('MARKET_ADD_ELEMENT', 'shop/ShopMode.js', r'class="more-info')
        self.register('MARKET_ADD_SELECTOR', 'shop/ShopMode.js', r'dialog\.elMoreInfo =')
        self.register('MARKET_ADD_CONTENT', 'shop/ShopMode.js', r'var categoryNames = \[\];')
        self.register('MARKET_LOAD_JS', 'shop/ShopMode.js', r'dialog\.elMoreInfo =')
        self.register('MARKET_ADD_CSS', 'shop/style.css', r'.more-info')

    def setup(self, context):
        self.deploy_asset('js/t5de_wear.js', 't5de/t5de_wear.js', context)

    def patch(self, context):
        if context.pattern == 'MARKET_ADD_ELEMENT':
            context.write(context.line)
            context.write('\'<div class="t5de-market-actions t5de-scaled">\' +\n', indent=2)
            context.write('\'<span class="t5de-access" data-ui-name="AccessBadge"></span>\' +\n', indent=2)
            context.write('\'<button class="t5de-btn t5de-btn-primary t5de-wear" data-ui-name="WearButton">Wear</button>\' +\n', indent=2)
            context.write('\'</div>\' +\n', indent=2)
        elif context.pattern == 'MARKET_LOAD_JS':
            context.write(context.line)
            context.write('(function () {\n', indent=1)
            context.write('var s = document.createElement("script");\n', indent=2)
            context.write('s.src = "../t5de/t5de_wear.js";\n', indent=2)
            context.write('document.getElementsByTagName("head")[0].appendChild(s);\n', indent=2)
            context.write('})();\n', indent=1)
        elif context.pattern == 'MARKET_ADD_SELECTOR':
            context.write(context.line)
            context.write('dialog.elAccessBadge = dialog.innerElement.querySelector("span.t5de-access");\n', indent=1)
            context.write('dialog.elWearButton = dialog.innerElement.querySelector("button.t5de-wear");\n', indent=1)
        elif context.pattern == 'MARKET_ADD_CONTENT':
            context.write('if (this.elAccessBadge && window.t5deBadgeFor) {\n', indent=2)
            context.write('this.elAccessBadge.innerHTML = window.t5deBadgeFor(product);\n', indent=3)
            context.write('}\n', indent=2)
            context.write('if (this.elWearButton) {\n', indent=2)
            context.write('var t5deProductId = product.id;\n', indent=3)
            context.write('this.elWearButton.onclick = function () {\n', indent=3)
            context.write('if (window.t5deWear) { window.t5deWear(t5deProductId); }\n', indent=4)
            context.write('};\n', indent=3)
            context.write('}\n', indent=2)
            context.write(context.line)
        elif context.pattern == 'MARKET_ADD_CSS':
            context.write('div#panel_product_info .t5de-market-actions {\n')
            context.write('    display: flex;\n')
            context.write('    align-items: center;\n')
            context.write('    gap: calc(var(--gap) * var(--scale));\n')
            context.write('    margin-top: 6px;\n')
            context.write('}\n\n')
            context.write('div#panel_product_info .t5de-market-actions .t5de-wear {\n')
            context.write('    margin-left: auto;\n')
            context.write('}\n\n')
            context.write(context.line)
