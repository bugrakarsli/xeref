
import os, shutil

# The execute_code tool writes files to /root (not /home/user)
src_base = os.path.expanduser("~/xeref-design-app")
dst_base = "/home/user/xeref-design-app"

if os.path.exists(src_base):
    # Copy entire tree to /home/user/
    if os.path.exists(dst_base):
        shutil.rmtree(dst_base)
    shutil.copytree(src_base, dst_base)
    count = sum(len(files) for _, _, files in os.walk(dst_base))
    print(f"Copied {count} files to {dst_base}")
else:
    print(f"Source not found: {src_base}")
    print("Files in ~:", os.listdir(os.path.expanduser("~")))
