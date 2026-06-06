from ...patch import InterfacePatch


class ThemeScalePatch(InterfacePatch):
    def __init__(self):
        super(ThemeScalePatch, self).__init__()

        self.register('THEME_IMPORT_CSS', 'shop/style.css', r'.more-info')
        self.register('THEME_LOAD_JS', 'shop/ShopMode.js', r'var categoryNames = \[\];')

    def setup(self, context):
        self.deploy_asset('css/themes.css', 't5de/themes.css', context)
        self.deploy_asset('js/t5de_theme.js', 't5de/t5de_theme.js', context)

    def patch(self, context):
        if context.pattern == 'THEME_IMPORT_CSS':
            context.write('@import url("../t5de/themes.css");\n\n')
            context.write(context.line)
        elif context.pattern == 'THEME_LOAD_JS':
            context.write('(function () {\n', indent=2)
            context.write('var s = document.createElement("script");\n', indent=3)
            context.write('s.src = "../t5de/t5de_theme.js";\n', indent=3)
            context.write('document.getElementsByTagName("head")[0].appendChild(s);\n', indent=3)
            context.write('if (document.body) { document.body.className += " t5de-scaled"; }\n', indent=3)
            context.write('})();\n', indent=2)
            context.write(context.line)
