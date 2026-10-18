#!/usr/bin/env python3
"""
Full Pixel Art Asset Generator for Digithin Galaxy
Generates 16-bit retro pixel art sprites matching the Cobalt Core style reference image:
1. Micro rock fragments for letters and syllables (assets/rocks/rock1.webp .. rock5.webp)
2. All 75 concrete space objects for all words in the game (assets/objects/<key>.webp)
"""

import os
import math
from PIL import Image, ImageDraw

P = {
    'trans': (0, 0, 0, 0),
    'outline': (15, 5, 29, 255),
    'shadow': (30, 16, 53, 230),
    'white': (248, 250, 252, 255),
    'lavender_light': (226, 212, 240, 255),
    'lavender_mid': (192, 132, 252, 255),
    'lavender_dark': (126, 58, 180, 255),
    'cyan_bright': (0, 229, 255, 255),
    'cyan_mid': (56, 189, 248, 255),
    'cyan_dark': (2, 132, 199, 255),
    'cyan_deep': (8, 47, 73, 255),
    'pink_bright': (255, 64, 129, 255),
    'pink_mid': (224, 64, 251, 255),
    'pink_dark': (162, 28, 175, 255),
    'green_bright': (105, 240, 174, 255),
    'green_mid': (16, 185, 129, 255),
    'green_dark': (5, 150, 105, 255),
    'green_deep': (6, 78, 59, 255),
    'amber_bright': (254, 240, 138, 255),
    'amber_mid': (251, 191, 36, 255),
    'amber_dark': (217, 119, 6, 255),
    'amber_deep': (120, 53, 15, 255),
    'red_bright': (248, 113, 113, 255),
    'red_mid': (239, 68, 68, 255),
    'red_dark': (185, 28, 28, 255),
    'red_deep': (127, 29, 29, 255),
    'silver_bright': (226, 232, 240, 255),
    'silver_mid': (148, 163, 184, 255),
    'silver_dark': (71, 85, 105, 255),
    'silver_deep': (30, 41, 59, 255),
    'rust': (194, 65, 12, 255),
    'terracotta': (154, 52, 18, 255),
    'ice_blue': (186, 230, 253, 255),
    'deep_blue': (30, 58, 138, 255),
    'gold': (245, 158, 11, 255),
}

def make_img(w=28, h=28):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))

def save_scaled(img, path, scale=3):
    w, h = img.size
    scaled = img.resize((w * scale, h * scale), Image.NEAREST)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scaled.save(path, 'WEBP', quality=95, lossless=True)

# ============================================================
# 1. MICRO ROCK FRAGMENTS (For Letters & Syllables)
# ============================================================

def draw_rock1():
    img = make_img(20, 20)
    d = ImageDraw.Draw(img)
    pts = [(8, 4), (13, 4), (16, 8), (15, 13), (11, 16), (6, 14), (4, 9)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(x, y) for x, y in [(8, 5), (12, 5), (15, 8), (14, 12), (11, 15), (7, 13), (5, 9)]], fill=P['silver_dark'])
    d.polygon([(8, 5), (12, 5), (13, 8), (9, 9), (6, 8)], fill=P['silver_mid'])
    d.point((9, 6), fill=P['silver_bright'])
    return img

def draw_rock2():
    img = make_img(20, 20)
    d = ImageDraw.Draw(img)
    pts = [(9, 4), (15, 6), (16, 12), (12, 16), (6, 15), (4, 10), (6, 6)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(9, 5), (14, 7), (15, 11), (11, 15), (7, 14), (5, 10), (7, 7)], fill=P['silver_deep'])
    d.line([(8, 6), (13, 8)], fill=P['lavender_mid'])
    d.point((10, 7), fill=P['white'])
    return img

def draw_rock3():
    img = make_img(20, 20)
    d = ImageDraw.Draw(img)
    pts = [(7, 5), (14, 5), (17, 10), (13, 16), (6, 15), (3, 10)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(7, 6), (13, 6), (16, 10), (12, 15), (7, 14), (4, 10)], fill=(30, 20, 45, 255))
    d.point((8, 8), fill=P['cyan_bright'])
    d.point((12, 11), fill=P['cyan_mid'])
    d.point((7, 12), fill=P['cyan_bright'])
    return img

def draw_rock4():
    img = make_img(20, 20)
    d = ImageDraw.Draw(img)
    pts = [(10, 4), (15, 7), (16, 13), (11, 16), (5, 13), (6, 7)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(10, 5), (14, 7), (15, 12), (11, 15), (6, 12), (7, 7)], fill=P['silver_dark'])
    d.polygon([(10, 5), (13, 7), (11, 10), (7, 8)], fill=P['lavender_mid'])
    d.point((10, 6), fill=P['lavender_light'])
    return img

def draw_rock5():
    img = make_img(20, 20)
    d = ImageDraw.Draw(img)
    pts = [(8, 4), (14, 5), (17, 11), (13, 16), (6, 15), (4, 9)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(8, 5), (13, 6), (16, 11), (12, 15), (7, 14), (5, 9)], fill=P['terracotta'])
    d.polygon([(8, 5), (12, 6), (11, 9), (6, 8)], fill=P['amber_dark'])
    d.point((9, 6), fill=P['amber_bright'])
    return img

# ============================================================
# 2. PLANETS & CELESTIAL SPHERES
# ============================================================

def draw_sphere(base_clr, high_clr, shadow_clr, spot_clr=None, bands=None):
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    for y in range(3, 25):
        for x in range(3, 25):
            dist = math.hypot(x - cx, y - cy)
            if dist <= 8.8:
                d.point((x, y), fill=P['outline'])
            if dist <= 8.0:
                diag = (x - cx) + (y - cy)
                clr = base_clr
                if diag < -3:
                    clr = high_clr
                elif diag > 3:
                    clr = shadow_clr
                d.point((x, y), fill=clr)
    if bands:
        for by, bclr in bands:
            for x in range(6, 22):
                if math.hypot(x - cx, by - cy) <= 7.8:
                    d.point((x, by), fill=bclr)
    if spot_clr:
        d.ellipse(spot_clr[0], fill=spot_clr[1])
    return img

def draw_sun():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    rays = [(13, 1), (14, 1), (13, 26), (14, 26), (1, 13), (1, 14), (26, 13), (26, 14),
            (5, 5), (22, 5), (5, 22), (22, 22), (9, 3), (18, 3), (9, 24), (18, 24),
            (3, 9), (3, 18), (24, 9), (24, 18)]
    for rx, ry in rays:
        d.point((rx, ry), fill=P['amber_mid'])
    for y in range(4, 24):
        for x in range(4, 24):
            dist = math.hypot(x - cx, y - cy)
            if dist <= 9.0: d.point((x, y), fill=P['outline'])
            if dist <= 8.2: d.point((x, y), fill=P['amber_dark'])
            if dist <= 7.2: d.point((x, y), fill=P['amber_mid'])
            if dist <= 5.8: d.point((x, y), fill=P['amber_bright'])
            if dist <= 3.8: d.point((x, y), fill=P['white'])
    return img

def draw_mercury():
    img = draw_sphere(P['silver_dark'], P['silver_mid'], P['silver_deep'])
    d = ImageDraw.Draw(img)
    d.point((10, 10), fill=P['silver_deep'])
    d.point((15, 15), fill=P['silver_deep'])
    d.point((12, 17), fill=P['amber_dark'])
    return img

def draw_venus():
    img = draw_sphere(P['amber_mid'], P['amber_bright'], P['amber_dark'], bands=[(11, P['amber_dark']), (14, P['amber_bright']), (17, P['amber_dark'])])
    return img

def draw_earth():
    img = draw_sphere(P['deep_blue'], P['cyan_mid'], (15, 23, 42, 255))
    d = ImageDraw.Draw(img)
    # Continents
    d.polygon([(10, 9), (13, 8), (14, 12), (9, 13)], fill=P['green_mid'])
    d.polygon([(15, 12), (18, 11), (19, 16), (14, 15)], fill=P['green_mid'])
    d.polygon([(11, 16), (13, 15), (14, 19), (12, 20)], fill=P['green_mid'])
    # White clouds
    d.line([(9, 10), (12, 10)], fill=P['white'])
    d.line([(15, 13), (17, 13)], fill=P['white'])
    return img

def draw_mars():
    img = draw_sphere(P['rust'], P['red_bright'], P['red_deep'])
    d = ImageDraw.Draw(img)
    # White north ice cap
    d.line([(12, 6), (15, 6)], fill=P['white'])
    d.polygon([(11, 12), (16, 12), (14, 15)], fill=P['red_deep'])
    return img

def draw_jupiter():
    bands = [(9, P['amber_dark']), (11, P['amber_mid']), (13, P['rust']), (15, P['amber_dark']), (17, P['terracotta']), (19, P['amber_dark'])]
    img = draw_sphere(P['amber_mid'], P['amber_bright'], P['terracotta'], bands=bands)
    d = ImageDraw.Draw(img)
    # Great Red Spot
    d.ellipse([16, 14, 19, 16], fill=P['red_mid'], outline=P['red_deep'])
    return img

def draw_saturn():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    # Back ring
    d.arc([1, 10, 26, 17], start=180, end=360, fill=P['amber_bright'], width=2)
    # Saturn body
    for y in range(6, 22):
        for x in range(6, 22):
            if math.hypot(x - cx, y - cy) <= 6.8:
                d.point((x, y), fill=P['outline'])
            if math.hypot(x - cx, y - cy) <= 6.0:
                d.point((x, y), fill=P['amber_mid'])
    # Front ring
    d.arc([1, 10, 26, 17], start=0, end=180, fill=P['amber_bright'], width=2)
    d.arc([3, 11, 24, 16], start=0, end=180, fill=P['white'], width=1)
    return img

def draw_uranus():
    img = draw_sphere(P['cyan_mid'], P['cyan_bright'], P['cyan_dark'])
    d = ImageDraw.Draw(img)
    # Vertical faint ring
    d.ellipse([11, 3, 16, 24], outline=P['ice_blue'])
    return img

def draw_neptune():
    bands = [(11, P['cyan_mid']), (15, P['deep_blue']), (18, P['cyan_dark'])]
    img = draw_sphere(P['deep_blue'], P['cyan_mid'], (8, 20, 60, 255), bands=bands)
    d = ImageDraw.Draw(img)
    d.line([(10, 13), (14, 13)], fill=P['white']) # High altitude storm cloud
    return img

def draw_pluto():
    img = draw_sphere(P['silver_dark'], P['silver_mid'], P['silver_deep'])
    d = ImageDraw.Draw(img)
    # Heart shape (Tombaugh Regio)
    d.polygon([(12, 12), (14, 10), (16, 12), (14, 15)], fill=P['white'])
    return img

def draw_ceres():
    img = draw_sphere(P['silver_dark'], P['silver_mid'], P['silver_deep'])
    d = ImageDraw.Draw(img)
    d.point((13, 13), fill=P['white']) # Bright salt spot in Occator crater
    d.point((14, 13), fill=P['white'])
    return img

def draw_exoplanet():
    img = draw_sphere(P['lavender_dark'], P['pink_mid'], (30, 10, 50, 255))
    d = ImageDraw.Draw(img)
    d.polygon([(11, 10), (15, 9), (13, 14)], fill=P['cyan_bright'])
    d.polygon([(14, 14), (18, 13), (16, 17)], fill=P['cyan_bright'])
    return img

# ============================================================
# 3. MOONS
# ============================================================

def draw_moon():
    img = draw_sphere(P['silver_mid'], P['silver_bright'], P['silver_dark'])
    d = ImageDraw.Draw(img)
    d.ellipse([9, 9, 12, 12], fill=P['silver_dark'])
    d.ellipse([15, 13, 17, 15], fill=P['silver_dark'])
    d.ellipse([11, 16, 14, 18], fill=P['silver_dark'])
    return img

def draw_titan():
    # Golden haze
    img = draw_sphere(P['amber_dark'], P['amber_mid'], P['amber_deep'])
    d = ImageDraw.Draw(img)
    d.ellipse([11, 13, 15, 16], fill=P['deep_blue']) # Methane sea
    return img

def draw_phobos():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Irregular lumpy potato
    pts = [(9, 6), (17, 6), (21, 11), (19, 19), (13, 21), (7, 18), (5, 12)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(x, y) for x, y in [(9, 7), (16, 7), (20, 11), (18, 18), (13, 20), (8, 17), (6, 12)]], fill=P['rust'])
    d.ellipse([12, 8, 16, 12], fill=P['red_deep']) # Stickney crater
    d.point((14, 10), fill=P['outline'])
    return img

def draw_deimos():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    pts = [(10, 8), (17, 8), (20, 13), (16, 18), (9, 17), (7, 12)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(10, 9), (16, 9), (19, 13), (15, 17), (10, 16), (8, 12)], fill=P['silver_dark'])
    d.point((12, 12), fill=P['silver_mid'])
    return img

def draw_europa():
    img = draw_sphere(P['white'], P['silver_bright'], P['ice_blue'])
    d = ImageDraw.Draw(img)
    # Red-brown cracked ice lines
    d.line([(9, 9), (16, 14)], fill=P['rust'], width=1)
    d.line([(12, 16), (18, 10)], fill=P['rust'], width=1)
    d.line([(8, 14), (14, 18)], fill=P['terracotta'], width=1)
    return img

def draw_io():
    img = draw_sphere(P['amber_bright'], P['white'], P['amber_mid'])
    d = ImageDraw.Draw(img)
    # Volcanic sulfur calderas (black/red)
    d.point((10, 11), fill=P['outline'])
    d.point((11, 11), fill=P['red_mid'])
    d.point((15, 14), fill=P['outline'])
    d.point((16, 14), fill=P['red_mid'])
    d.point((12, 17), fill=P['outline'])
    return img

def draw_triton():
    img = draw_sphere(P['pink_dark'], P['lavender_light'], (40, 15, 60, 255))
    d = ImageDraw.Draw(img)
    # Nitrogen ice geyser plume
    d.line([(13, 8), (13, 5)], fill=P['cyan_bright'])
    return img

def draw_callisto():
    img = draw_sphere(P['silver_deep'], P['silver_dark'], (15, 10, 25, 255))
    d = ImageDraw.Draw(img)
    # Bright impact craters
    for pt in [(9, 9), (16, 11), (12, 16), (18, 17)]:
        d.point(pt, fill=P['white'])
    return img

def draw_charon():
    img = draw_sphere(P['silver_dark'], P['silver_mid'], P['silver_deep'])
    d = ImageDraw.Draw(img)
    # Reddish north polar spot (Mordor Macula)
    d.polygon([(11, 6), (16, 6), (14, 9)], fill=P['rust'])
    return img

def draw_enceladus():
    img = draw_sphere(P['white'], P['silver_bright'], P['ice_blue'])
    d = ImageDraw.Draw(img)
    # Blue tiger stripes
    d.line([(11, 18), (13, 22)], fill=P['cyan_bright'])
    d.line([(14, 18), (16, 22)], fill=P['cyan_bright'])
    return img

def draw_ganymede():
    img = draw_sphere(P['silver_mid'], P['silver_bright'], P['silver_deep'])
    d = ImageDraw.Draw(img)
    d.line([(8, 12), (18, 12)], fill=P['silver_bright']) # Grooved bands
    d.line([(9, 15), (17, 15)], fill=P['silver_deep'])
    return img

# ============================================================
# 4. SPACECRAFT, SATELLITES, PROBES & TECH
# ============================================================

def draw_ship():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Delta spacecraft
    pts = [(13, 4), (20, 20), (14, 17), (7, 20)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(13, 5), (19, 19), (14, 16), (8, 19)], fill=P['silver_bright'])
    d.point((13, 9), fill=P['cyan_bright']) # Cockpit
    d.point((14, 9), fill=P['cyan_bright'])
    d.line([(11, 20), (16, 20)], fill=P['pink_bright']) # Thruster
    d.point((13, 22), fill=P['cyan_bright'])
    return img

def draw_probe():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.rectangle([10, 8, 17, 15], fill=P['outline'])
    d.rectangle([11, 9, 16, 14], fill=P['gold'])
    d.line([(6, 11), (21, 11)], fill=P['cyan_bright'], width=2)
    d.line([(13, 4), (13, 8)], fill=P['silver_bright'])
    d.point((13, 4), fill=P['red_mid'])
    return img

def draw_drone():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.line([(6, 6), (21, 21)], fill=P['silver_mid'], width=2)
    d.line([(6, 21), (21, 6)], fill=P['silver_mid'], width=2)
    d.ellipse([11, 11, 16, 16], fill=P['silver_bright'], outline=P['outline'])
    d.point((13, 13), fill=P['cyan_bright'])
    for pt in [(6, 6), (21, 6), (6, 21), (21, 21)]:
        d.point(pt, fill=P['green_bright'])
    return img

def draw_rover():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.rectangle([7, 11, 20, 17], fill=P['silver_bright'], outline=P['outline'])
    d.line([(10, 6), (10, 11)], fill=P['silver_mid']) # Mast
    d.point((10, 6), fill=P['cyan_bright']) # Camera eye
    # 6 wheels
    for wx in [7, 13, 19]:
        d.rectangle([wx-1, 18, wx+1, 21], fill=P['silver_deep'], outline=P['outline'])
    return img

def draw_module():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.polygon([(9, 7), (18, 7), (21, 14), (6, 14)], fill=P['silver_bright'], outline=P['outline'])
    d.rectangle([7, 14, 20, 19], fill=P['gold'], outline=P['outline'])
    d.line([(7, 19), (4, 23)], fill=P['silver_mid'])
    d.line([(20, 19), (23, 23)], fill=P['silver_mid'])
    return img

def draw_capsule():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    pts = [(13, 6), (20, 18), (7, 18)]
    d.polygon(pts, fill=P['silver_bright'], outline=P['outline'])
    d.line([(7, 18), (20, 18)], fill=P['terracotta'], width=2) # Heat shield
    d.point((13, 12), fill=P['cyan_bright']) # Porthole
    return img

def draw_hubble():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.rectangle([11, 5, 16, 22], fill=P['silver_bright'], outline=P['outline'])
    d.rectangle([11, 5, 16, 8], fill=P['silver_deep']) # Aperture
    d.line([(4, 13), (11, 13)], fill=P['cyan_mid'], width=2)
    d.line([(16, 13), (23, 13)], fill=P['cyan_mid'], width=2)
    return img

def draw_webb():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Silver kite sunshield
    d.polygon([(13, 16), (24, 20), (13, 24), (3, 20)], fill=P['silver_bright'], outline=P['outline'])
    # Gold hexagonal mirror
    d.polygon([(10, 8), (17, 8), (20, 13), (17, 17), (10, 17), (7, 13)], fill=P['gold'], outline=P['outline'])
    d.point((13, 13), fill=P['amber_bright'])
    return img

def draw_voyager():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Big white dish
    d.ellipse([7, 6, 20, 14], fill=P['white'], outline=P['outline'])
    d.rectangle([11, 14, 16, 18], fill=P['gold'])
    d.line([(6, 18), (21, 18)], fill=P['silver_mid'])
    d.point((13, 10), fill=P['amber_mid'])
    return img

def draw_sputnik():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([9, 9, 18, 18], fill=P['silver_bright'], outline=P['outline'])
    d.point((11, 11), fill=P['white'])
    # 4 long diagonal whip antennas
    d.line([(9, 14), (2, 23)], fill=P['silver_mid'])
    d.line([(11, 16), (4, 25)], fill=P['silver_mid'])
    d.line([(16, 11), (25, 4)], fill=P['silver_mid'])
    d.line([(14, 9), (23, 2)], fill=P['silver_mid'])
    return img

def draw_rocket():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.polygon([(13, 4), (16, 9), (11, 9)], fill=P['red_mid'])
    d.rectangle([11, 9, 16, 20], fill=P['white'], outline=P['outline'])
    d.polygon([(11, 17), (7, 21), (11, 20)], fill=P['red_mid'])
    d.polygon([(16, 17), (20, 21), (16, 20)], fill=P['red_mid'])
    d.line([(12, 21), (15, 21)], fill=P['amber_bright'], width=2)
    d.point((13, 23), fill=P['amber_mid'])
    return img

def draw_satellite():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.rectangle([11, 10, 16, 17], fill=P['gold'], outline=P['outline'])
    # Blue solar wings
    d.rectangle([3, 11, 9, 16], fill=P['cyan_dark'], outline=P['outline'])
    d.rectangle([18, 11, 24, 16], fill=P['cyan_dark'], outline=P['outline'])
    d.line([(13, 6), (13, 10)], fill=P['silver_bright'])
    d.point((13, 5), fill=P['pink_bright'])
    return img

def draw_telescope():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.polygon([(7, 7), (18, 18), (16, 20), (5, 9)], fill=P['silver_bright'], outline=P['outline'])
    d.ellipse([16, 16, 21, 21], fill=P['cyan_bright'])
    d.line([(11, 14), (8, 24)], fill=P['silver_dark'])
    d.line([(14, 17), (17, 24)], fill=P['silver_dark'])
    return img

def draw_starship():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([8, 10, 19, 17], fill=P['silver_bright'], outline=P['outline'])
    d.rectangle([12, 4, 15, 23], fill=P['cyan_dark'], outline=P['outline'])
    d.point((13, 7), fill=P['cyan_bright'])
    return img

def draw_cosmonaut():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([9, 8, 18, 17], fill=P['silver_bright'], outline=P['outline'])
    d.point((13, 12), fill=P['cyan_bright'])
    d.line([(6, 12), (9, 12)], fill=P['silver_mid'])
    d.line([(18, 12), (21, 12)], fill=P['silver_mid'])
    return img

def draw_astronaut():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.rectangle([10, 6, 17, 12], fill=P['white'], outline=P['outline'])
    d.rectangle([12, 8, 15, 10], fill=P['gold']) # Visor
    d.rectangle([9, 13, 18, 20], fill=P['white'], outline=P['outline'])
    d.line([(8, 14), (6, 18)], fill=P['white'], width=2)
    d.line([(19, 14), (21, 18)], fill=P['white'], width=2)
    return img

def draw_space_station():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.rectangle([3, 10, 8, 17], fill=P['cyan_dark'], outline=P['outline'])
    d.rectangle([19, 10, 24, 17], fill=P['cyan_dark'], outline=P['outline'])
    d.rectangle([8, 12, 19, 15], fill=P['silver_mid'])
    d.rectangle([11, 7, 16, 20], fill=P['silver_bright'], outline=P['outline'])
    d.point((13, 10), fill=P['cyan_bright'])
    return img

def draw_space_shuttle():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.polygon([(13, 4), (16, 10), (16, 21), (11, 21), (11, 10)], fill=P['white'], outline=P['outline'])
    d.point((13, 5), fill=P['outline']) # Black nose
    d.polygon([(11, 17), (4, 21), (11, 21)], fill=P['silver_deep'])
    d.polygon([(16, 17), (23, 21), (16, 21)], fill=P['silver_deep'])
    return img

def draw_solar_probe():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.rectangle([8, 6, 19, 9], fill=P['white'], outline=P['outline']) # Heat shield
    d.rectangle([10, 10, 17, 16], fill=P['gold'], outline=P['outline'])
    d.line([(5, 12), (10, 12)], fill=P['cyan_mid'])
    d.line([(17, 12), (22, 12)], fill=P['cyan_mid'])
    return img

def draw_lunar_module():
    return draw_module()

def draw_orbital_station():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([5, 5, 22, 22], outline=P['silver_bright'], width=2)
    d.line([(5, 13), (22, 13)], fill=P['silver_mid'])
    d.line([(13, 5), (13, 22)], fill=P['silver_mid'])
    d.ellipse([11, 11, 16, 16], fill=P['cyan_dark'], outline=P['outline'])
    return img

def draw_rover_vehicle():
    return draw_rover()

def draw_orbital_telescope():
    return draw_hubble()

def draw_space_capsule():
    return draw_capsule()

def draw_base():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.arc([6, 10, 21, 23], start=180, end=360, fill=P['silver_bright'], width=3)
    d.line([(5, 21), (22, 21)], fill=P['silver_dark'], width=2)
    d.point((13, 14), fill=P['cyan_bright'])
    return img

def draw_dome():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.arc([5, 8, 22, 24], start=180, end=360, fill=P['cyan_bright'], width=2)
    d.line([(5, 20), (22, 20)], fill=P['silver_mid'], width=2)
    d.point((10, 13), fill=P['white'])
    d.point((16, 13), fill=P['white'])
    return img

def draw_ring():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([3, 8, 24, 19], outline=P['amber_bright'], width=2)
    d.ellipse([6, 10, 21, 17], outline=P['white'], width=1)
    return img

# ============================================================
# 5. ROCKS, METEOROIDS & STELLAR PHENOMENA
# ============================================================

def draw_rock():
    return draw_rock1()

def draw_meteor():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Glowing fiery tail
    for i in range(12):
        d.line([(4 + i, 4 + i), (8 + i, 8 + i)], fill=P['amber_mid'])
        d.line([(3 + i, 5 + i), (7 + i, 9 + i)], fill=P['red_mid'])
    d.ellipse([14, 14, 22, 22], fill=P['white'], outline=P['outline'])
    d.ellipse([15, 15, 21, 21], fill=P['amber_bright'])
    return img

def draw_meteorite():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    pts = [(9, 6), (18, 5), (22, 12), (18, 21), (10, 22), (5, 15)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(9, 7), (17, 6), (21, 12), (17, 20), (10, 21), (6, 15)], fill=P['silver_deep'])
    d.ellipse([11, 10, 14, 13], fill=P['outline'])
    d.ellipse([15, 14, 18, 17], fill=P['outline'])
    return img

def draw_asteroid():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    pts = [(10, 5), (17, 4), (22, 8), (24, 14), (21, 20), (17, 23), (11, 24), (6, 20), (4, 14), (6, 8)]
    d.polygon(pts, fill=P['outline'])
    d.polygon([(10, 6), (16, 5), (21, 9), (23, 14), (20, 19), (16, 22), (11, 23), (7, 19), (5, 14), (7, 9)], fill=P['silver_dark'])
    d.ellipse([9, 10, 12, 12], fill=P['shadow'])
    d.ellipse([15, 14, 18, 16], fill=P['shadow'])
    return img

def draw_comet():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    for i in range(14):
        d.line([(3 + i, 3 + i), (7 + i, 7 + i)], fill=P['cyan_mid'])
        d.line([(2 + i, 4 + i), (6 + i, 8 + i)], fill=P['pink_mid'])
    d.ellipse([15, 15, 22, 22], fill=P['white'], outline=P['outline'])
    d.ellipse([16, 16, 21, 21], fill=P['cyan_bright'])
    return img

def draw_bolide():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    for i in range(12):
        d.line([(3 + i, 3 + i), (8 + i, 8 + i)], fill=P['green_bright'])
        d.line([(4 + i, 2 + i), (9 + i, 7 + i)], fill=P['pink_bright'])
    d.ellipse([13, 13, 23, 23], fill=P['white'], outline=P['outline'])
    d.point((17, 17), fill=P['cyan_bright'])
    return img

def draw_fragment():
    return draw_rock2()

def draw_aerolite():
    return draw_rock3()

def draw_meteoroid():
    return draw_rock4()

def draw_boulder():
    return draw_rock5()

def draw_trojan_asteroid():
    return draw_asteroid()

def draw_giant_asteroid():
    return draw_asteroid()

def draw_star():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.line([(13, 3), (13, 24)], fill=P['white'], width=2)
    d.line([(3, 13), (24, 13)], fill=P['white'], width=2)
    d.ellipse([10, 10, 17, 17], fill=P['amber_bright'], outline=P['outline'])
    d.point((13, 13), fill=P['white'])
    return img

def draw_white_dwarf():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([7, 7, 20, 20], fill=P['cyan_bright'], outline=P['outline'])
    d.ellipse([9, 9, 18, 18], fill=P['white'])
    return img

def draw_red_giant():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([4, 4, 23, 23], fill=P['red_dark'], outline=P['outline'])
    d.ellipse([6, 6, 21, 21], fill=P['red_mid'])
    d.ellipse([9, 9, 18, 18], fill=P['amber_mid'])
    return img

def draw_pulsar():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Sweeping beams
    d.line([(2, 2), (25, 25)], fill=P['cyan_bright'], width=2)
    d.ellipse([10, 10, 17, 17], fill=P['white'], outline=P['outline'])
    return img

def draw_quasar():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Vertical jets
    d.line([(13, 2), (13, 25)], fill=P['pink_bright'], width=3)
    d.ellipse([7, 10, 20, 17], fill=P['amber_bright'], outline=P['outline'])
    d.ellipse([11, 11, 16, 16], fill=P['outline'])
    return img

def draw_magnetar():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([4, 8, 23, 19], outline=P['lavender_mid'], width=2)
    d.ellipse([9, 9, 18, 18], fill=P['pink_bright'], outline=P['outline'])
    d.point((13, 13), fill=P['white'])
    return img

def draw_black_hole():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    for y in range(4, 24):
        for x in range(4, 24):
            dist = math.hypot(x - cx, y - cy)
            if 6.0 <= dist <= 9.5:
                d.point((x, y), fill=P['pink_mid'])
            elif dist <= 5.0:
                d.point((x, y), fill=P['outline'])
    d.arc([8, 8, 19, 19], start=20, end=160, fill=P['white'], width=1)
    return img

def draw_nebula():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([5, 8, 19, 19], fill=P['pink_dark'])
    d.ellipse([10, 5, 22, 18], fill=P['lavender_mid'])
    d.ellipse([12, 11, 23, 22], fill=P['cyan_dark'])
    d.point((12, 12), fill=P['white'])
    d.point((17, 14), fill=P['amber_bright'])
    return img

def draw_galaxy():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    for y in range(4, 24):
        for x in range(4, 24):
            dist = math.hypot(x - cx, y - cy)
            if 3.0 <= dist <= 10.5:
                angle = math.atan2(y - cy, x - cx)
                spiral = (angle * 2.0 + dist * 0.8) % (math.pi * 2)
                if spiral < 1.3:
                    d.point((x, y), fill=P['cyan_mid'])
                elif spiral < 2.4:
                    d.point((x, y), fill=P['lavender_mid'])
    d.ellipse([11, 11, 16, 16], fill=P['amber_bright'], outline=P['outline'])
    d.point((13, 13), fill=P['white'])
    return img

def draw_andromeda():
    return draw_galaxy()

def draw_milky_way():
    return draw_galaxy()

def draw_supernova():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    d.ellipse([4, 4, 23, 23], fill=P['pink_mid'], outline=P['outline'])
    d.ellipse([7, 7, 20, 20], fill=P['amber_bright'])
    d.ellipse([10, 10, 17, 17], fill=P['white'])
    # Flare spikes
    d.line([(13, 1), (13, 26)], fill=P['cyan_bright'])
    d.line([(1, 13), (26, 13)], fill=P['cyan_bright'])
    return img


def draw_radiation():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Concentric ionization rings
    d.ellipse([5, 5, 22, 22], outline=P['green_mid'])
    d.ellipse([7, 7, 20, 20], fill=P['green_deep'])
    # Radiation lobes (3 blades)
    d.pieslice([6, 6, 21, 21], start=0, end=60, fill=P['green_bright'])
    d.pieslice([6, 6, 21, 21], start=120, end=180, fill=P['green_bright'])
    d.pieslice([6, 6, 21, 21], start=240, end=300, fill=P['green_bright'])
    # Center core
    d.ellipse([11, 11, 16, 16], fill=P['outline'])
    d.ellipse([12, 12, 15, 15], fill=P['cyan_bright'])
    # Particle sparks
    d.point((4, 4), fill=P['green_bright'])
    d.point((23, 5), fill=P['green_bright'])
    d.point((14, 25), fill=P['green_bright'])
    return img

def draw_antimatter():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Containment field rings
    d.ellipse([4, 4, 23, 23], outline=P['cyan_bright'])
    d.ellipse([6, 6, 21, 21], outline=P['pink_mid'])
    # Dark annihilation singularity center
    d.ellipse([9, 9, 18, 18], fill=P['lavender_dark'])
    d.ellipse([11, 11, 16, 16], fill=P['outline'])
    # Positron annihilation flash
    d.point((13, 13), fill=P['white'])
    d.point((14, 13), fill=P['white'])
    d.point((13, 14), fill=P['pink_bright'])
    d.point((14, 14), fill=P['cyan_bright'])
    # Orbiting anti-particles
    d.point((6, 10), fill=P['pink_bright'])
    d.point((21, 17), fill=P['cyan_bright'])
    d.point((10, 21), fill=P['pink_bright'])
    d.point((17, 6), fill=P['cyan_bright'])
    return img

def draw_wormhole():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    for y in range(3, 25):
        for x in range(3, 25):
            dist = math.hypot(x - cx, y - cy)
            if 9.0 <= dist <= 11.5:
                ang = math.atan2(y - cy, x - cx)
                if math.sin(ang * 3 + dist) > 0:
                    d.point((x, y), fill=P['cyan_mid'])
                else:
                    d.point((x, y), fill=P['pink_mid'])
            elif 5.5 <= dist < 9.0:
                d.point((x, y), fill=P['lavender_dark'])
            elif dist < 5.5:
                d.point((x, y), fill=P['outline'])
    # Distant exit aperture point
    d.ellipse([12, 12, 15, 15], fill=P['cyan_bright'])
    d.point((13, 13), fill=P['white'])
    d.point((14, 14), fill=P['amber_bright'])
    return img

def draw_freighter():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Central fuselage
    d.rectangle([11, 4, 16, 21], fill=P['silver_dark'], outline=P['outline'])
    d.rectangle([12, 5, 15, 19], fill=P['silver_mid'])
    # Command bridge
    d.rectangle([12, 5, 15, 8], fill=P['cyan_bright'])
    # Side cargo containers
    d.rectangle([6, 9, 10, 18], fill=P['amber_mid'], outline=P['outline'])
    d.rectangle([7, 10, 9, 17], fill=P['amber_bright'])
    d.rectangle([17, 9, 21, 18], fill=P['amber_mid'], outline=P['outline'])
    d.rectangle([18, 10, 20, 17], fill=P['amber_bright'])
    # Dual ion thrusters
    d.rectangle([10, 22, 12, 24], fill=P['silver_deep'], outline=P['outline'])
    d.rectangle([15, 22, 17, 24], fill=P['silver_deep'], outline=P['outline'])
    d.point((11, 25), fill=P['cyan_bright'])
    d.point((16, 25), fill=P['cyan_bright'])
    return img

def draw_vesta():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Protoplanet Vesta: chunky, rocky asteroid with giant southern impact basin
    pts = [
        (8, 6), (18, 5), (22, 10), (23, 17), (19, 23),
        (12, 24), (6, 20), (5, 12)
    ]
    d.polygon(pts, fill=P['silver_mid'], outline=P['outline'])
    # Southern impact crater (Rheasilvia basin)
    d.ellipse([10, 15, 18, 21], fill=P['silver_dark'], outline=P['outline'])
    d.point((14, 18), fill=P['silver_deep']) # Central peak
    # Rocky terrain details & silicate patches
    d.line([(8, 9), (13, 8)], fill=P['silver_bright'])
    d.line([(16, 11), (20, 13)], fill=P['rust'])
    d.point((9, 14), fill=P['white'])
    d.point((17, 7), fill=P['silver_bright'])
    return img

def draw_wildcard_bomb():
    img = make_img(28, 28)
    d = ImageDraw.Draw(img)
    # Cosmic Plasma Detonator Bomb: pulsing explosive core with bright spikes
    d.ellipse([5, 5, 22, 22], fill=P['pink_mid'], outline=P['outline'])
    d.ellipse([8, 8, 19, 19], fill=P['amber_bright'])
    d.ellipse([11, 11, 16, 16], fill=P['white'])
    # Explosive blast flares
    d.line([(13, 1), (13, 26)], fill=P['cyan_bright'], width=2)
    d.line([(1, 13), (26, 13)], fill=P['cyan_bright'], width=2)
    # Corner spark fragments
    d.point((5, 5), fill=P['amber_bright'])
    d.point((22, 5), fill=P['amber_bright'])
    d.point((5, 22), fill=P['amber_bright'])
    d.point((22, 22), fill=P['amber_bright'])
    d.point((13, 13), fill=P['white'])
    return img

# ============================================================
# MASTER MAPPING & EXECUTION
# ============================================================

OBJECT_GENERATORS = {
    # 0..12 Planets & Moons
    'sun': draw_sun,
    'moon': draw_moon,
    'rock': draw_rock,
    'mercury': draw_mercury,
    'venus': draw_venus,
    'vesta': draw_vesta,
    'mars': draw_mars,
    'jupiter': draw_jupiter,
    'saturn': draw_saturn,
    'uranus': draw_uranus,
    'neptune': draw_neptune,
    'pluto': draw_pluto,
    'ceres': draw_ceres,
    'wildcard_bomb': draw_wildcard_bomb,
    # 13..22 Known Moons
    'titan': draw_titan,
    'phobos': draw_phobos,
    'deimos': draw_deimos,
    'europa': draw_europa,
    'io': draw_io,
    'triton': draw_triton,
    'callisto': draw_callisto,
    'charon': draw_charon,
    'enceladus': draw_enceladus,
    'ganymede': draw_ganymede,
    # 23..31 Space Hazards & Colliding Objects
    'asteroid': draw_asteroid,
    'comet': draw_comet,
    'meteor': draw_meteor,
    'meteorite': draw_meteorite,
    'bolide': draw_bolide,
    'fragment': draw_fragment,
    'aerolite': draw_aerolite,
    'meteoroid': draw_meteoroid,
    'boulder': draw_boulder,
    # 32..47 Space Technology & Vessels
    'satellite': draw_satellite,
    'probe': draw_probe,
    'telescope': draw_telescope,
    'hubble': draw_hubble,
    'webb': draw_webb,
    'voyager': draw_voyager,
    'sputnik': draw_sputnik,
    'rocket': draw_rocket,
    'capsule': draw_capsule,
    'module': draw_module,
    'rover': draw_rover,
    'ship': draw_ship,
    'drone': draw_drone,
    'starship': draw_starship,
    'space_shuttle': draw_space_shuttle,
    'space_station': draw_space_station,
    # 48..57 Cosmic Phenomena & Star Systems
    'star': draw_star,
    'galaxy': draw_galaxy,
    'nebula': draw_nebula,
    'supernova': draw_supernova,
    'pulsar': draw_pulsar,
    'quasar': draw_quasar,
    'magnetar': draw_magnetar,
    'exoplanet': draw_exoplanet,
    'andromeda': draw_andromeda,
    'milky_way': draw_milky_way,
    # 58..61 User Mandated Keeps
    'radiation': draw_radiation,
    'antimatter': draw_antimatter,
    'black_hole': draw_black_hole,
    'wormhole': draw_wormhole,
    # 62..74 Explorers, Stars & Specialized Craft
    'astronaut': draw_astronaut,
    'cosmonaut': draw_cosmonaut,
    'white_dwarf': draw_white_dwarf,
    'red_giant': draw_red_giant,
    'solar_probe': draw_solar_probe,
    'lunar_module': draw_lunar_module,
    'giant_asteroid': draw_asteroid,
    'orbital_station': draw_orbital_station,
    'trojan_asteroid': draw_trojan_asteroid,
    'orbital_telescope': draw_hubble,
    'space_capsule': draw_capsule,
    'rover_vehicle': draw_rover,
    'freighter': draw_freighter,
}

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_dir = os.path.join(base_dir, 'assets')

    # 1. Micro rocks for letters & syllables
    rocks_dir = os.path.join(assets_dir, 'rocks')
    rocks = {
        'rock1.webp': draw_rock1(),
        'rock2.webp': draw_rock2(),
        'rock3.webp': draw_rock3(),
        'rock4.webp': draw_rock4(),
        'rock5.webp': draw_rock5(),
    }
    for filename, sprite in rocks.items():
        save_scaled(sprite, os.path.join(rocks_dir, filename), scale=3)
    print(f"Generated {len(rocks)} micro-rock fragments for letters and syllables in assets/rocks/")

    # 2. All concrete space objects
    obj_dir = os.path.join(assets_dir, 'objects')
    count = 0
    for key, fn in OBJECT_GENERATORS.items():
        sprite = fn()
        save_scaled(sprite, os.path.join(obj_dir, f"{key}.webp"), scale=3)
        count += 1
    print(f"Generated {count} concrete space objects in assets/objects/")

if __name__ == '__main__':
    main()
