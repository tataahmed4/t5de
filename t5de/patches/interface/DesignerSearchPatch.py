from ...patch import InterfacePatch


class DesignerSearchPatch(InterfacePatch):
    def __init__(self):
        super(DesignerSearchPatch, self).__init__()

        self.register('DESIGNER_LOAD_JS', 'shop/ShopMode.js', r'var categoryNames = \[\];')
        self.register('DESIGNER_ADD_CSS', 'shop/style.css', r'.more-info')

    def setup(self, context):
        self.deploy_asset('js/t5de_designer_search.js', 't5de/t5de_designer_search.js', context)

    def patch(self, context):
        if context.pattern == 'DESIGNER_LOAD_JS':
            context.write('(function () {\n', indent=2)
            context.write('var s = document.createElement("script");\n', indent=3)
            context.write('s.src = "../t5de/t5de_designer_search.js";\n', indent=3)
            context.write('document.getElementsByTagName("head")[0].appendChild(s);\n', indent=3)
            context.write('})();\n', indent=2)
            context.write(context.line)
        elif context.pattern == 'DESIGNER_ADD_CSS':
            context.write('#t5de-designer-search {\n')
            context.write('    position: fixed;\n')
            context.write('    top: calc(10px * var(--scale));\n')
            context.write('    right: calc(10px * var(--scale));\n')
            context.write('    width: calc(320px * var(--scale));\n')
            context.write('    max-height: 70vh;\n')
            context.write('    overflow-y: auto;\n')
            context.write('    z-index: 9999;\n')
            context.write('    background: rgba(20, 20, 28, 0.96);\n')
            context.write('    color: #fff;\n')
            context.write('    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5);\n')
            context.write('}\n\n')
            context.write('#t5de-designer-search .t5de-card {\n')
            context.write('    min-width: calc(86px * var(--scale));\n')
            context.write('    align-items: center;\n')
            context.write('}\n\n')
            context.write('#t5de-scale-control {\n')
            context.write('    position: fixed;\n')
            context.write('    bottom: calc(10px * var(--scale));\n')
            context.write('    right: calc(10px * var(--scale));\n')
            context.write('    z-index: 9999;\n')
            context.write('    background: rgba(20, 20, 28, 0.96);\n')
            context.write('    color: #fff;\n')
            context.write('    border-radius: calc(var(--radius) * var(--scale));\n')
            context.write('}\n\n')
            context.write(context.line)
