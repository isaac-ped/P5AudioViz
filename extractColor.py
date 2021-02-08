"""Tiny script to extract js-formatted colors from xml dumps """
from typing import DefaultDict
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import defaultdict
colors = defaultdict(list)

for file in Path('color_schemes/').glob("*.xml"):
    tree = ET.parse(file)
    for cset in tree.findall('colorset'):
        for color in cset.findall("color"):
            colors[file.name.split('.')[0]].append("#"+color.attrib['rgb'])

import json
print(json.dumps(colors, indent=2))

with open("colorschemes_final.js", "w") as f:
    for colorname, hexcolors in colors.items():
        f.write(f"CS_{colorname.upper()}={json.dumps(hexcolors)}\n")