import os
import shutil

from . import Patch


class InterfacePatch(Patch):
    def register(self, name, filename, pattern):
        if filename.startswith("imvuContent/"):
            filename = filename[12:]

        super(InterfacePatch, self).register(name, "imvuContent/{}".format(filename), pattern)

    def assets_dir(self):
        return os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")

    def deploy_asset(self, source, destination, context):
        if context.dry_run:
            return

        src = os.path.join(self.assets_dir(), source)
        dst = os.path.join(context.cwd, "imvuContent", destination)

        dst_dir = os.path.dirname(dst)
        if not os.path.isdir(dst_dir):
            os.makedirs(dst_dir)

        shutil.copyfile(src, dst)

    def setup(self, context):
        pass

    def cleanup(self, context):
        pass
