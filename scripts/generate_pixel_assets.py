#!/usr/bin/env python3
"""
Pixel Art Asset Generator for Digithin Galaxy
Generates 16-bit retro pixel art sprites matching the Cobalt Core style reference image.
- Falling celestial objects (sun, comet, station, satellite, moon, asteroid, probe, blackhole)
- Alien Bosses (xylarion, zorkon, vespera, kragthor, nebulor, xenor)
- Runic Skills (freezer, bomb, shield, vortex, slowdown, haste, dilation, autodestroy)
"""

import os
import math
from PIL import Image, ImageDraw

PALETTE = {
    'trans': (0, 0, 0, 0),
    'bg_dark': (22, 8, 41, 255),       # #160829
    'bg_card': (38, 20, 71, 255),      # #261447
    'bg_highlight': (58, 25, 104, 255),
    'white': (248, 250, 252, 255),
    'lavender_light': (226, 212, 240, 255),
    'lavender_mid': (192, 132, 252, 255),
    'lavender_dark': (126, 58, 180, 255),
    'cyan_bright': (0, 229, 255, 255), # #00E5FF
    'cyan_mid': (56, 189, 248, 255),   # #38BDF8
    'cyan_dark': (2, 132, 199, 255),   # #0284C7
    'pink_bright': (255, 64, 129, 255),# #FF4081
    'pink_mid': (224, 64, 251, 255),   # #E040FB
    'pink_dark': (162, 28, 175, 255),  # #A21CAF
    'green_bright': (105, 240, 174, 255), # #69F0AE
    'green_mid': (16, 185, 129, 255),  # #10B981
    'green_dark': (5, 150, 105, 255),  # #059669
    'amber_bright': (251, 191, 36, 255), # #FBBF24
    'amber_mid': (245, 158, 11, 255),  # #F59E0B
    'amber_dark': (180, 83, 9, 255),   # #B45309
    'red_bright': (248, 113, 113, 255),# #F87171
    'red_mid': (239, 68, 68, 255),     # #EF4444
    'red_dark': (185, 28, 28, 255),    # #B91C1C
    'outline': (15, 5, 29, 255),       # #0F051D
    'shadow': (30, 16, 53, 230),
    'silver_bright': (203, 213, 225, 255),
    'silver_mid': (148, 163, 184, 255),
    'silver_dark': (71, 85, 105, 255),
}

def create_sprite(w, h, scale=3):
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    return img

def save_scaled(img, path, scale=3):
    w, h = img.size
    scaled = img.resize((w * scale, h * scale), Image.NEAREST)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    scaled.save(path, 'WEBP', quality=95, lossless=True)
    print(f"Saved: {path} ({w*scale}x{h*scale})")

# ============================================================
# 1. CELESTIAL FALLING OBJECTS (28x28 scaled to 84x84)
# ============================================================

def draw_pixel_sun():
    img = create_sprite(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    
    # Outer corona rays (Cobalt Core style pixel rays)
    rays = [
        (13, 1), (14, 1), (13, 2), (14, 2),
        (13, 25), (14, 25), (13, 26), (14, 26),
        (1, 13), (1, 14), (2, 13), (2, 14),
        (25, 13), (25, 14), (26, 13), (26, 14),
        (5, 5), (6, 5), (5, 6), (22, 5), (21, 5), (22, 6),
        (5, 22), (6, 22), (5, 21), (22, 22), (21, 22), (22, 21),
        (9, 3), (18, 3), (9, 24), (18, 24),
        (3, 9), (3, 18), (24, 9), (24, 18)
    ]
    for rx, ry in rays:
        d.point((rx, ry), fill=PALETTE['amber_mid'])
    
    # Sun disk outline & layers
    for y in range(4, 24):
        for x in range(4, 24):
            dist = math.hypot(x - cx, y - cy)
            if dist <= 9.2:
                d.point((x, y), fill=PALETTE['outline'])
            if dist <= 8.5:
                d.point((x, y), fill=PALETTE['amber_dark'])
            if dist <= 7.5:
                d.point((x, y), fill=PALETTE['amber_mid'])
            if dist <= 6.0:
                d.point((x, y), fill=PALETTE['amber_bright'])
            if dist <= 4.0:
                d.point((x, y), fill=PALETTE['white'])
                
    # Solar surface specks
    d.point((11, 10), fill=PALETTE['amber_bright'])
    d.point((16, 15), fill=PALETTE['amber_bright'])
    d.point((10, 16), fill=PALETTE['amber_mid'])
    d.point((17, 11), fill=PALETTE['amber_mid'])
    
    return img

def draw_pixel_comet():
    img = create_sprite(28, 28)
    d = ImageDraw.Draw(img)
    
    # Glowing diagonal tail (from top-left to bottom-right nucleus)
    tail_pixels = [
        # Faint outer tail
        (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8),
        (4, 2), (5, 3), (6, 4), (7, 5), (8, 6), (9, 7),
        (2, 4), (3, 5), (4, 6), (5, 7), (6, 8), (7, 9),
        (5, 2), (6, 3), (7, 4), (8, 5), (9, 6), (10, 7),
        (2, 5), (3, 6), (4, 7), (5, 8), (6, 9), (7, 10)
    ]
    for px, py in tail_pixels:
        d.point((px, py), fill=PALETTE['pink_mid'])
        
    tail_mid = [
        (8, 7), (9, 8), (10, 9), (11, 10), (12, 11), (13, 12), (14, 13),
        (7, 8), (8, 9), (9, 10), (10, 11), (11, 12), (12, 13), (13, 14),
        (9, 7), (10, 8), (11, 9), (12, 10), (13, 11), (14, 12), (15, 13)
    ]
    for px, py in tail_mid:
        d.point((px, py), fill=PALETTE['cyan_dark'])
        
    tail_core = [
        (11, 11), (12, 12), (13, 13), (14, 14), (15, 15), (16, 16),
        (12, 11), (13, 12), (14, 13), (15, 14), (16, 15),
        (11, 12), (12, 13), (13, 14), (14, 15), (15, 16)
    ]
    for px, py in tail_core:
        d.point((px, py), fill=PALETTE['cyan_bright'])

    # Comet nucleus (head) at bottom-right
    cx, cy = 18.5, 18.5
    for y in range(14, 24):
        for x in range(14, 24):
            dist = math.hypot(x - cx, y - cy)
            if dist <= 4.8:
                d.point((x, y), fill=PALETTE['outline'])
            if dist <= 4.2:
                d.point((x, y), fill=PALETTE['cyan_dark'])
            if dist <= 3.2:
                d.point((x, y), fill=PALETTE['cyan_bright'])
            if dist <= 1.8:
                d.point((x, y), fill=PALETTE['white'])

    return img

def draw_pixel_space_station():
    img = create_sprite(28, 28)
    d = ImageDraw.Draw(img)
    
    # Solar Panels (Left and Right wings)
    # Left wing
    d.rectangle([2, 9, 8, 18], fill=PALETTE['outline'])
    d.rectangle([3, 10, 7, 17], fill=PALETTE['cyan_dark'])
    d.line([(5, 10), (5, 17)], fill=PALETTE['cyan_bright'])
    d.line([(3, 13), (7, 13)], fill=PALETTE['cyan_bright'])
    # Right wing
    d.rectangle([19, 9, 25, 18], fill=PALETTE['outline'])
    d.rectangle([20, 10, 24, 17], fill=PALETTE['cyan_dark'])
    d.line([(22, 10), (22, 17)], fill=PALETTE['cyan_bright'])
    d.line([(20, 13), (24, 13)], fill=PALETTE['cyan_bright'])
    
    # Connecting trusses
    d.rectangle([8, 13, 19, 14], fill=PALETTE['silver_mid'])
    d.rectangle([8, 12, 19, 12], fill=PALETTE['outline'])
    d.rectangle([8, 15, 19, 15], fill=PALETTE['outline'])
    
    # Central Station Habitation Core
    d.rectangle([11, 7, 16, 20], fill=PALETTE['outline'])
    d.rectangle([12, 8, 15, 19], fill=PALETTE['silver_bright'])
    
    # Station observation dome / windows
    d.point((13, 10), fill=PALETTE['cyan_bright'])
    d.point((14, 10), fill=PALETTE['cyan_bright'])
    d.point((13, 14), fill=PALETTE['cyan_bright'])
    d.point((14, 14), fill=PALETTE['cyan_bright'])
    
    # Docking hub & blinking beacon
    d.point((13, 6), fill=PALETTE['outline'])
    d.point((14, 6), fill=PALETTE['outline'])
    d.point((13, 5), fill=PALETTE['pink_bright']) # Red/pink antenna beacon
    d.point((14, 5), fill=PALETTE['white'])
    
    # Bottom communication module
    d.rectangle([12, 20, 15, 21], fill=PALETTE['silver_dark'])

    return img

def draw_pixel_satellite():
    img = create_sprite(28, 28)
    d = ImageDraw.Draw(img)
    
    # Diagonal angle satellite (sleek orbital look)
    # Solar arrays (extended top-right and bottom-left)
    # Left-down solar panel
    d.polygon([(4, 16), (10, 22), (8, 24), (2, 18)], fill=PALETTE['outline'])
    d.polygon([(5, 17), (9, 21), (8, 22), (4, 18)], fill=PALETTE['cyan_dark'])
    d.line([(5, 17), (8, 20)], fill=PALETTE['cyan_bright'])
    
    # Right-up solar panel
    d.polygon([(17, 4), (23, 10), (25, 8), (19, 2)], fill=PALETTE['outline'])
    d.polygon([(18, 5), (22, 9), (23, 8), (19, 4)], fill=PALETTE['cyan_dark'])
    d.line([(19, 5), (22, 8)], fill=PALETTE['cyan_bright'])
    
    # Main gold-foil cube body
    d.rectangle([10, 10, 17, 17], fill=PALETTE['outline'])
    d.rectangle([11, 11, 16, 16], fill=PALETTE['amber_mid'])
    d.rectangle([11, 11, 15, 13], fill=PALETTE['amber_bright'])
    d.point((13, 13), fill=PALETTE['white'])
    
    # Communication Dish / Antenna
    d.line([(15, 10), (19, 6)], fill=PALETTE['silver_bright'], width=1)
    d.arc([16, 4, 22, 10], start=180, end=360, fill=PALETTE['silver_bright'])
    d.point((19, 5), fill=PALETTE['pink_bright']) # Status LED

    return img

def draw_pixel_moon():
    img = create_sprite(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    
    # Moon disk
    for y in range(4, 24):
        for x in range(4, 24):
            dist = math.hypot(x - cx, y - cy)
            if dist <= 9.2:
                d.point((x, y), fill=PALETTE['outline'])
            elif dist <= 9.6:
                d.point((x, y), fill=PALETTE['lavender_dark'])
            if dist <= 8.5:
                # Shading from top-left (illuminated) to bottom-right (crater shadow)
                val = (x - cx) + (y - cy)
                if val < -3:
                    d.point((x, y), fill=PALETTE['white'])
                elif val < 3:
                    d.point((x, y), fill=PALETTE['lavender_light'])
                else:
                    d.point((x, y), fill=PALETTE['lavender_mid'])
                    
    # Lunar Craters
    craters = [
        (10, 10, 2.2, PALETTE['lavender_mid'], PALETTE['white']),
        (16, 12, 1.8, PALETTE['lavender_dark'], PALETTE['lavender_mid']),
        (12, 17, 2.6, PALETTE['lavender_dark'], PALETTE['lavender_mid']),
        (18, 17, 1.5, PALETTE['lavender_dark'], PALETTE['lavender_mid']),
        (8, 14, 1.2, PALETTE['lavender_mid'], PALETTE['white'])
    ]
    for kx, ky, kr, fill_c, rim_c in craters:
        for y in range(int(ky - kr - 1), int(ky + kr + 2)):
            for x in range(int(kx - kr - 1), int(kx + kr + 2)):
                if math.hypot(x - kx, y - ky) <= kr:
                    d.point((x, y), fill=fill_c)
        d.point((int(kx - kr + 0.5), int(ky - kr + 0.5)), fill=rim_c)

    return img

def draw_pixel_asteroid():
    img = create_sprite(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    
    # Irregular jagged asteroid polygon
    points = [
        (10, 5), (17, 4), (22, 8), (24, 14), (21, 20),
        (17, 23), (11, 24), (6, 20), (4, 14), (6, 8)
    ]
    d.polygon(points, fill=PALETTE['outline'])
    inner_pts = [(x + (0 if x==cx else (1 if x<cx else -1)), 
                  y + (0 if y==cy else (1 if y<cy else -1))) for x, y in points]
    d.polygon(inner_pts, fill=PALETTE['silver_dark'])
    
    # Shading layers & craters
    for y in range(6, 22):
        for x in range(6, 22):
            if math.hypot(x - cx, y - cy) <= 6.5:
                if x + y < 24:
                    d.point((x, y), fill=PALETTE['silver_mid'])
                if x + y < 19:
                    d.point((x, y), fill=PALETTE['silver_bright'])
                    
    # Impact pits
    d.rectangle([9, 10, 12, 12], fill=PALETTE['shadow'])
    d.point((10, 11), fill=PALETTE['outline'])
    d.rectangle([15, 14, 18, 16], fill=PALETTE['shadow'])
    d.point((16, 15), fill=PALETTE['outline'])
    d.point((11, 18), fill=PALETTE['outline'])
    
    return img

def draw_pixel_probe():
    img = create_sprite(28, 28)
    d = ImageDraw.Draw(img)
    
    # Retro Alien Probe / Mini UFO
    # Glass cockpit dome
    d.rectangle([10, 6, 17, 11], fill=PALETTE['outline'])
    d.rectangle([11, 7, 16, 11], fill=PALETTE['cyan_bright'])
    d.point((12, 8), fill=PALETTE['white'])
    d.point((13, 8), fill=PALETTE['white'])
    
    # Flying saucer rim
    d.polygon([(4, 14), (23, 14), (26, 17), (23, 19), (4, 19), (1, 17)], fill=PALETTE['outline'])
    d.polygon([(5, 15), (22, 15), (24, 17), (22, 18), (5, 18), (3, 17)], fill=PALETTE['silver_bright'])
    
    # Running sensor lights on the saucer
    d.point((6, 16), fill=PALETTE['pink_bright'])
    d.point((10, 16), fill=PALETTE['cyan_bright'])
    d.point((14, 16), fill=PALETTE['pink_bright'])
    d.point((18, 16), fill=PALETTE['cyan_bright'])
    d.point((21, 16), fill=PALETTE['pink_bright'])
    
    # Propulsion emitter
    d.rectangle([11, 19, 16, 20], fill=PALETTE['outline'])
    d.rectangle([12, 20, 15, 21], fill=PALETTE['cyan_mid'])
    d.point((13, 22), fill=PALETTE['cyan_bright'])
    d.point((14, 22), fill=PALETTE['cyan_bright'])
    d.point((13, 23), fill=PALETTE['white'])

    return img

def draw_pixel_blackhole():
    img = create_sprite(28, 28)
    d = ImageDraw.Draw(img)
    cx, cy = 13.5, 13.5
    
    # Swirling violet accretion disk
    for y in range(4, 24):
        for x in range(4, 24):
            dist = math.hypot(x - cx, y - cy)
            if 6.0 <= dist <= 9.5:
                angle = math.atan2(y - cy, x - cx)
                wave = math.sin(angle * 3.0)
                if wave > 0.2:
                    d.point((x, y), fill=PALETTE['pink_mid'])
                elif wave > -0.4:
                    d.point((x, y), fill=PALETTE['lavender_mid'])
                else:
                    d.point((x, y), fill=PALETTE['cyan_bright'])
                    
    # Event Horizon
    for y in range(7, 21):
        for x in range(7, 21):
            dist = math.hypot(x - cx, y - cy)
            if dist <= 5.8:
                d.point((x, y), fill=PALETTE['lavender_dark'])
            if dist <= 4.8:
                d.point((x, y), fill=PALETTE['outline'])
            if dist <= 4.0:
                d.point((x, y), fill=(8, 2, 16, 255)) # Pure black singularity
                
    # Photon ring edge highlight
    d.arc([9, 9, 18, 18], start=30, end=150, fill=PALETTE['white'])

    return img


# ============================================================
# 2. ALIEN BOSS SPRITES (36x36 scaled to 108x108)
# Inspired by Cobalt Core character portraits & pilots
# ============================================================

def draw_boss_xylarion():
    # Cyan Dreadnought Commander (Reptilian / Cyber Pilot with visor)
    img = create_sprite(36, 36)
    d = ImageDraw.Draw(img)
    
    # Portrait frame silhouette
    d.rounded_rectangle([3, 3, 32, 32], radius=5, fill=PALETTE['bg_dark'], outline=PALETTE['cyan_dark'], width=1)
    
    # Alien head shape (Teal / Cyan reptilian alien)
    # Head outline
    d.polygon([(11, 8), (24, 8), (28, 14), (27, 24), (23, 27), (12, 27), (8, 24), (7, 14)], fill=PALETTE['outline'])
    # Skin
    d.polygon([(12, 9), (23, 9), (27, 14), (26, 23), (22, 26), (13, 26), (9, 23), (8, 14)], fill=PALETTE['cyan_mid'])
    # Facial highlights
    d.polygon([(13, 10), (22, 10), (25, 13), (20, 16), (15, 16), (10, 13)], fill=PALETTE['cyan_bright'])
    
    # Cyber Visor (Cobalt Core tech goggles)
    d.rectangle([9, 14, 26, 18], fill=PALETTE['outline'])
    d.rectangle([10, 15, 25, 17], fill=PALETTE['pink_bright'])
    d.line([(12, 15), (16, 15)], fill=PALETTE['white'])
    d.line([(19, 15), (23, 15)], fill=PALETTE['white'])
    
    # Pilot flight collar & shoulders
    d.polygon([(6, 27), (29, 27), (32, 33), (3, 33)], fill=PALETTE['outline'])
    d.polygon([(7, 28), (28, 28), (31, 32), (4, 32)], fill=PALETTE['silver_dark'])
    # Collar trim
    d.line([(11, 28), (17, 32), (24, 28)], fill=PALETTE['cyan_bright'], width=2)
    # Chest insignia
    d.point((17, 30), fill=PALETTE['amber_bright'])
    d.point((18, 30), fill=PALETTE['amber_bright'])

    return img

def draw_boss_zorkon():
    # Green Insectoid Hive Alien (Large expressive dark eyes, antenna, chitin)
    img = create_sprite(36, 36)
    d = ImageDraw.Draw(img)
    
    d.rounded_rectangle([3, 3, 32, 32], radius=5, fill=PALETTE['bg_dark'], outline=PALETTE['green_dark'], width=1)
    
    # Antenna
    d.line([(12, 11), (7, 4)], fill=PALETTE['outline'], width=2)
    d.line([(12, 11), (7, 4)], fill=PALETTE['green_bright'])
    d.point((6, 3), fill=PALETTE['amber_bright'])
    d.line([(23, 11), (28, 4)], fill=PALETTE['outline'], width=2)
    d.line([(23, 11), (28, 4)], fill=PALETTE['green_bright'])
    d.point((29, 3), fill=PALETTE['amber_bright'])

    # Insectoid head
    d.polygon([(11, 10), (24, 10), (29, 17), (25, 26), (18, 28), (10, 26), (6, 17)], fill=PALETTE['outline'])
    d.polygon([(12, 11), (23, 11), (28, 17), (24, 25), (18, 27), (11, 25), (7, 17)], fill=PALETTE['green_mid'])
    d.polygon([(14, 12), (21, 12), (23, 14), (18, 16), (12, 14)], fill=PALETTE['green_bright'])
    
    # Huge glossy dark compound eyes
    # Left eye
    d.polygon([(8, 14), (14, 14), (15, 20), (9, 20)], fill=PALETTE['outline'])
    d.polygon([(9, 15), (13, 15), (14, 19), (10, 19)], fill=PALETTE['bg_dark'])
    d.point((10, 16), fill=PALETTE['cyan_bright'])
    d.point((11, 16), fill=PALETTE['white'])
    # Right eye
    d.polygon([(21, 14), (27, 14), (26, 20), (20, 20)], fill=PALETTE['outline'])
    d.polygon([(22, 15), (26, 15), (25, 19), (21, 19)], fill=PALETTE['bg_dark'])
    d.point((23, 16), fill=PALETTE['cyan_bright'])
    d.point((24, 16), fill=PALETTE['white'])

    # Mandibles
    d.point((16, 25), fill=PALETTE['green_dark'])
    d.point((19, 25), fill=PALETTE['green_dark'])
    d.point((17, 26), fill=PALETTE['white'])
    d.point((18, 26), fill=PALETTE['white'])

    # Armor plating
    d.polygon([(6, 28), (29, 28), (32, 33), (3, 33)], fill=PALETTE['outline'])
    d.polygon([(7, 29), (28, 29), (31, 32), (4, 32)], fill=PALETTE['green_dark'])
    d.line([(14, 29), (18, 32), (21, 29)], fill=PALETTE['green_bright'], width=1)

    return img

def draw_boss_vespera():
    # Psionic Mystic Alien (Lavender / Magenta psychic entity with third eye & mystical cowl)
    img = create_sprite(36, 36)
    d = ImageDraw.Draw(img)
    
    d.rounded_rectangle([3, 3, 32, 32], radius=5, fill=PALETTE['bg_dark'], outline=PALETTE['pink_mid'], width=1)
    
    # Psionic aura halo
    d.arc([8, 2, 27, 21], start=180, end=360, fill=PALETTE['pink_bright'], width=1)
    
    # Cowl / hood
    d.polygon([(10, 6), (25, 6), (30, 16), (27, 27), (8, 27), (5, 16)], fill=PALETTE['outline'])
    d.polygon([(11, 7), (24, 7), (29, 16), (26, 26), (9, 26), (6, 16)], fill=PALETTE['lavender_dark'])
    
    # Face inside cowl
    d.polygon([(12, 12), (23, 12), (25, 18), (21, 24), (14, 24), (10, 18)], fill=PALETTE['outline'])
    d.polygon([(13, 13), (22, 13), (24, 18), (20, 23), (15, 23), (11, 18)], fill=PALETTE['lavender_light'])
    
    # Third eye (glowing psychic gem on forehead)
    d.point((17, 10), fill=PALETTE['pink_bright'])
    d.point((18, 10), fill=PALETTE['white'])
    
    # Mystic glowing eyes
    d.rectangle([13, 16, 16, 17], fill=PALETTE['pink_bright'])
    d.point((14, 16), fill=PALETTE['white'])
    d.rectangle([(19, 16), (22, 17)], fill=PALETTE['pink_bright'])
    d.point((20, 16), fill=PALETTE['white'])
    
    # Mystic robe collar
    d.polygon([(6, 27), (29, 27), (32, 33), (3, 33)], fill=PALETTE['outline'])
    d.polygon([(7, 28), (28, 28), (31, 32), (4, 32)], fill=PALETTE['lavender_dark'])
    d.line([(12, 28), (17, 32), (23, 28)], fill=PALETTE['pink_mid'], width=2)
    d.point((17, 30), fill=PALETTE['cyan_bright'])

    return img

def draw_boss_kragthor():
    # Crimson Horned Warlord (Battle-scarred warrior alien with horns and heavy armor)
    img = create_sprite(36, 36)
    d = ImageDraw.Draw(img)
    
    d.rounded_rectangle([3, 3, 32, 32], radius=5, fill=PALETTE['bg_dark'], outline=PALETTE['red_mid'], width=1)
    
    # Warlord Horns
    # Left horn
    d.polygon([(9, 12), (4, 6), (3, 4), (7, 6), (11, 10)], fill=PALETTE['outline'])
    d.polygon([(8, 11), (5, 6), (4, 5), (7, 6), (10, 10)], fill=PALETTE['amber_bright'])
    # Right horn
    d.polygon([(26, 12), (31, 6), (32, 4), (28, 6), (24, 10)], fill=PALETTE['outline'])
    d.polygon([(27, 11), (30, 6), (31, 5), (28, 6), (25, 10)], fill=PALETTE['amber_bright'])
    
    # Heavy head / jaw
    d.polygon([(11, 9), (24, 9), (28, 17), (26, 26), (19, 28), (16, 28), (9, 26), (7, 17)], fill=PALETTE['outline'])
    d.polygon([(12, 10), (23, 10), (27, 17), (25, 25), (19, 27), (16, 27), (10, 25), (8, 17)], fill=PALETTE['red_mid'])
    d.polygon([(14, 11), (21, 11), (24, 14), (18, 16), (11, 14)], fill=PALETTE['red_bright'])
    
    # Fierce glowing eyes & battle scar
    d.rectangle([11, 15, 15, 17], fill=PALETTE['outline'])
    d.point((12, 16), fill=PALETTE['amber_bright'])
    d.point((13, 16), fill=PALETTE['white'])
    d.rectangle([20, 15, 24, 17], fill=PALETTE['outline'])
    d.point((21, 16), fill=PALETTE['amber_bright'])
    d.point((22, 16), fill=PALETTE['white'])
    # Battle scar over left eye
    d.line([(10, 13), (14, 20)], fill=PALETTE['outline'])
    d.line([(11, 14), (13, 19)], fill=PALETTE['amber_mid'])
    
    # Spiked heavy shoulder plates
    d.polygon([(4, 27), (31, 27), (33, 33), (2, 33)], fill=PALETTE['outline'])
    d.polygon([(5, 28), (30, 28), (32, 32), (3, 32)], fill=PALETTE['silver_dark'])
    d.line([(6, 28), (17, 32), (29, 28)], fill=PALETTE['red_dark'], width=2)
    d.point((6, 26), fill=PALETTE['silver_bright'])
    d.point((29, 26), fill=PALETTE['silver_bright'])

    return img

def draw_boss_nebulor():
    # Dark Matter Cosmic Entity (Starry void phantom with electric cyan gaze)
    img = create_sprite(36, 36)
    d = ImageDraw.Draw(img)
    
    d.rounded_rectangle([3, 3, 32, 32], radius=5, fill=PALETTE['bg_dark'], outline=PALETTE['lavender_dark'], width=1)
    
    # Swirling cosmic nebula mantle
    d.polygon([(10, 7), (25, 7), (30, 15), (28, 26), (23, 31), (12, 31), (7, 26), (5, 15)], fill=PALETTE['outline'])
    d.polygon([(11, 8), (24, 8), (29, 15), (27, 25), (22, 30), (13, 30), (8, 25), (6, 15)], fill=(18, 6, 34, 255))
    
    # Inner celestial star dust inside body
    star_specks = [(14, 11), (22, 12), (18, 14), (11, 20), (25, 21), (15, 27), (21, 26)]
    for sx, sy in star_specks:
        d.point((sx, sy), fill=PALETTE['lavender_light'])
        
    # Electric Cyan eyes without pupils (pure cosmic energy)
    d.polygon([(11, 16), (16, 14), (15, 18), (12, 19)], fill=PALETTE['cyan_bright'])
    d.point((13, 16), fill=PALETTE['white'])
    d.polygon([(24, 16), (19, 14), (20, 18), (23, 19)], fill=PALETTE['cyan_bright'])
    d.point((22, 16), fill=PALETTE['white'])
    
    # Core energy singularity on chest
    d.ellipse([15, 22, 20, 25], fill=PALETTE['pink_mid'], outline=PALETTE['cyan_bright'])
    d.point((17, 23), fill=PALETTE['white'])
    d.point((18, 23), fill=PALETTE['white'])

    return img

def draw_boss_xenor():
    # Mothership Supreme Alien Emperor (Regal gold cyber crown, imperial mantle)
    img = create_sprite(36, 36)
    d = ImageDraw.Draw(img)
    
    d.rounded_rectangle([3, 3, 32, 32], radius=5, fill=PALETTE['bg_dark'], outline=PALETTE['amber_bright'], width=1)
    
    # Royal Alien Crown / Crest
    crown_pts = [(11, 9), (14, 4), (17, 7), (20, 4), (23, 9)]
    d.polygon(crown_pts, fill=PALETTE['outline'])
    d.polygon([(12, 9), (14, 5), (17, 8), (20, 5), (22, 9)], fill=PALETTE['amber_bright'])
    d.point((14, 6), fill=PALETTE['white'])
    d.point((20, 6), fill=PALETTE['white'])
    d.point((17, 8), fill=PALETTE['pink_bright']) # Royal jewel
    
    # Royal Head
    d.polygon([(10, 10), (25, 10), (28, 17), (25, 25), (17, 27), (9, 25), (6, 17)], fill=PALETTE['outline'])
    d.polygon([(11, 11), (24, 11), (27, 17), (24, 24), (17, 26), (10, 24), (7, 17)], fill=PALETTE['lavender_mid'])
    d.polygon([(13, 12), (22, 12), (24, 14), (17, 16), (10, 14)], fill=PALETTE['lavender_light'])
    
    # Imperial Cyber Eyes
    d.rectangle([11, 16, 15, 18], fill=PALETTE['outline'])
    d.rectangle([12, 17, 14, 17], fill=PALETTE['cyan_bright'])
    d.point((13, 17), fill=PALETTE['white'])
    d.rectangle([20, 16, 24, 18], fill=PALETTE['outline'])
    d.rectangle([21, 17, 23, 17], fill=PALETTE['cyan_bright'])
    d.point((22, 17), fill=PALETTE['white'])
    
    # Imperial Cape & Gold Epaulettes
    d.polygon([(4, 27), (31, 27), (33, 33), (2, 33)], fill=PALETTE['outline'])
    d.polygon([(5, 28), (30, 28), (32, 32), (3, 32)], fill=PALETTE['pink_dark'])
    # Gold collar & mantle
    d.line([(8, 28), (17, 32), (27, 28)], fill=PALETTE['amber_bright'], width=2)
    d.point((17, 30), fill=PALETTE['white'])

    return img


# ============================================================
# 3. RUNIC SKILLS SPRITES (32x32 scaled to 96x96)
# ============================================================

def draw_skill_freezer():
    # Cryo Stasis Snowflake / Ice Crystal in Cyan & White
    img = create_sprite(32, 32)
    d = ImageDraw.Draw(img)
    cx, cy = 15.5, 15.5
    
    # 6-branch retro pixel snowflake
    # Vertical & Horizontal main stems
    d.line([(15, 4), (15, 27)], fill=PALETTE['outline'], width=3)
    d.line([(16, 4), (16, 27)], fill=PALETTE['outline'], width=3)
    d.line([(4, 15), (27, 15)], fill=PALETTE['outline'], width=3)
    d.line([(4, 16), (27, 16)], fill=PALETTE['outline'], width=3)
    
    d.line([(15, 5), (15, 26)], fill=PALETTE['cyan_bright'], width=2)
    d.line([(5, 15), (26, 15)], fill=PALETTE['cyan_bright'], width=2)
    d.line([(15, 7), (15, 24)], fill=PALETTE['white'], width=1)
    d.line([(7, 15), (24, 15)], fill=PALETTE['white'], width=1)
    
    # Diagonal branches
    d.line([(8, 8), (23, 23)], fill=PALETTE['cyan_bright'], width=1)
    d.line([(8, 23), (23, 8)], fill=PALETTE['cyan_bright'], width=1)
    
    # Crystal barbs
    barbs = [
        (12, 8), (18, 8), (12, 23), (18, 23),
        (8, 12), (8, 18), (23, 12), (23, 18)
    ]
    for bx, by in barbs:
        d.point((bx, by), fill=PALETTE['cyan_mid'])
        
    # Central crystal core
    d.rectangle([13, 13, 18, 18], fill=PALETTE['white'])
    d.point((15, 15), fill=PALETTE['cyan_bright'])

    return img

def draw_skill_bomb():
    # Cosmic Plasma Bomb with burning fuse
    img = create_sprite(32, 32)
    d = ImageDraw.Draw(img)
    cx, cy = 15.5, 17.5
    
    # Sparkling fuse at top-right
    d.line([(16, 9), (22, 5)], fill=PALETTE['silver_mid'], width=1)
    # Sparkles
    d.point((23, 4), fill=PALETTE['amber_bright'])
    d.point((24, 3), fill=PALETTE['white'])
    d.point((22, 3), fill=PALETTE['pink_bright'])
    d.point((24, 5), fill=PALETTE['pink_bright'])
    
    # Bomb cap
    d.rectangle([13, 8, 18, 11], fill=PALETTE['outline'])
    d.rectangle([14, 9, 17, 10], fill=PALETTE['silver_bright'])
    
    # Round Bomb Body
    for y in range(9, 27):
        for x in range(7, 25):
            dist = math.hypot(x - cx, y - cy)
            if dist <= 8.5:
                d.point((x, y), fill=PALETTE['outline'])
            if dist <= 7.5:
                d.point((x, y), fill=PALETTE['pink_dark'])
            if dist <= 6.5:
                d.point((x, y), fill=PALETTE['bg_dark'])
            if dist <= 4.5 and x < 15 and y < 17:
                d.point((x, y), fill=PALETTE['pink_mid'])
            if dist <= 2.5 and x < 14 and y < 15:
                d.point((x, y), fill=PALETTE['white'])
                
    # Warning Skull / Cross symbol in center
    d.point((14, 16), fill=PALETTE['amber_bright'])
    d.point((17, 16), fill=PALETTE['amber_bright'])
    d.line([(14, 19), (17, 19)], fill=PALETTE['amber_bright'])

    return img

def draw_skill_shield():
    # Hexagonal Planetary Shield / Aegis
    img = create_sprite(32, 32)
    d = ImageDraw.Draw(img)
    
    # Shield crest polygon
    outer_pts = [(15, 3), (25, 7), (25, 18), (15, 28), (6, 18), (6, 7)]
    d.polygon(outer_pts, fill=PALETTE['outline'])
    
    inner_pts = [(15, 5), (23, 8), (23, 17), (15, 26), (8, 17), (8, 8)]
    d.polygon(inner_pts, fill=PALETTE['green_dark'])
    
    core_pts = [(15, 8), (21, 10), (21, 16), (15, 23), (10, 16), (10, 10)]
    d.polygon(core_pts, fill=PALETTE['green_mid'])
    
    # Inner energy lattice & cross
    d.line([(15, 8), (15, 23)], fill=PALETTE['green_bright'], width=2)
    d.line([(10, 13), (21, 13)], fill=PALETTE['green_bright'], width=2)
    d.line([(15, 9), (15, 21)], fill=PALETTE['white'], width=1)
    d.line([(11, 13), (20, 13)], fill=PALETTE['white'], width=1)
    
    # Forcefield aura corners
    d.point((15, 4), fill=PALETTE['cyan_bright'])
    d.point((24, 7), fill=PALETTE['cyan_bright'])
    d.point((7, 7), fill=PALETTE['cyan_bright'])

    return img

def draw_skill_vortex():
    # Gravitational Vortex / Singularity in Violet & Magenta
    img = create_sprite(32, 32)
    d = ImageDraw.Draw(img)
    cx, cy = 15.5, 15.5
    
    # Spiral galaxy arms
    for y in range(4, 28):
        for x in range(4, 28):
            dist = math.hypot(x - cx, y - cy)
            if 3.0 <= dist <= 11.5:
                angle = math.atan2(y - cy, x - cx)
                spiral = (angle * 2.5 + dist * 0.75) % (math.pi * 2)
                if spiral < 1.2:
                    d.point((x, y), fill=PALETTE['pink_bright'])
                elif spiral < 2.0:
                    d.point((x, y), fill=PALETTE['lavender_mid'])
                elif spiral < 2.8:
                    d.point((x, y), fill=PALETTE['cyan_mid'])
                    
    # Dark singularity core
    for y in range(11, 21):
        for x in range(11, 21):
            dist = math.hypot(x - cx, y - cy)
            if dist <= 4.5:
                d.point((x, y), fill=PALETTE['outline'])
            if dist <= 3.2:
                d.point((x, y), fill=(10, 3, 20, 255))
                
    d.point((14, 14), fill=PALETTE['white'])
    d.point((15, 14), fill=PALETTE['cyan_bright'])

    return img

def draw_skill_slowdown():
    # Chrono Hourglass / Temporal Dilation Gear
    img = create_sprite(32, 32)
    d = ImageDraw.Draw(img)
    
    # Outer brass / lavender gear frame
    d.rectangle([7, 4, 24, 6], fill=PALETTE['outline'])
    d.rectangle([8, 5, 23, 6], fill=PALETTE['amber_bright'])
    d.rectangle([7, 25, 24, 27], fill=PALETTE['outline'])
    d.rectangle([8, 25, 23, 26], fill=PALETTE['amber_bright'])
    
    # Glass bulbs (Hourglass)
    glass_pts = [
        (9, 7), (22, 7), (18, 15), (22, 24), (9, 24), (13, 15)
    ]
    d.polygon(glass_pts, fill=PALETTE['outline'])
    inner_glass = [
        (10, 8), (21, 8), (17, 15), (21, 23), (10, 23), (14, 15)
    ]
    d.polygon(inner_glass, fill=PALETTE['bg_dark'])
    
    # Glowing neon cyan sands of time
    # Top sands
    d.polygon([(11, 11), (20, 11), (17, 14), (14, 14)], fill=PALETTE['cyan_mid'])
    d.line([(12, 11), (19, 11)], fill=PALETTE['cyan_bright'])
    # Stream of time
    d.line([(15, 14), (15, 18)], fill=PALETTE['white'])
    # Bottom accumulated sands
    d.polygon([(11, 22), (20, 22), (18, 19), (13, 19)], fill=PALETTE['cyan_bright'])
    d.point((15, 20), fill=PALETTE['white'])
    
    # Side energy pillars
    d.line([(7, 7), (7, 24)], fill=PALETTE['lavender_light'])
    d.line([(24, 7), (24, 24)], fill=PALETTE['lavender_light'])

    return img

def draw_skill_haste():
    # Overdrive Double Lightning / Warp Thruster
    img = create_sprite(32, 32)
    d = ImageDraw.Draw(img)
    
    # Main dynamic lightning bolt (left/primary)
    bolt1 = [
        (18, 3), (10, 14), (15, 14), (8, 28), (22, 12), (16, 12), (22, 3)
    ]
    d.polygon(bolt1, fill=PALETTE['outline'])
    bolt1_inner = [
        (18, 4), (11, 14), (16, 14), (10, 26), (21, 13), (16, 13), (21, 4)
    ]
    d.polygon(bolt1_inner, fill=PALETTE['amber_mid'])
    
    # Core bright strike
    d.line([(18, 6), (13, 13), (17, 13), (12, 23)], fill=PALETTE['white'], width=1)
    
    # Speed sparks
    d.point((6, 10), fill=PALETTE['amber_bright'])
    d.point((24, 8), fill=PALETTE['amber_bright'])
    d.point((25, 20), fill=PALETTE['white'])
    d.point((7, 22), fill=PALETTE['white'])

    return img

def draw_skill_dilation():
    # Spacetime Warp Gate / Grid Expansion
    img = create_sprite(32, 32)
    d = ImageDraw.Draw(img)
    cx, cy = 15.5, 15.5
    
    # Circular spacetime portal ring
    for y in range(4, 28):
        for x in range(4, 28):
            dist = math.hypot(x - cx, y - cy)
            if 8.5 <= dist <= 11.5:
                d.point((x, y), fill=PALETTE['outline'])
            if 9.0 <= dist <= 10.8:
                d.point((x, y), fill=PALETTE['lavender_dark'])
            if 9.5 <= dist <= 10.2:
                d.point((x, y), fill=PALETTE['pink_bright'])
                
    # 4 Warp Stabilizer Pylons
    pylons = [(15, 2), (16, 2), (15, 29), (16, 29), (2, 15), (2, 16), (29, 15), (29, 16)]
    for px, py in pylons:
        d.point((px, py), fill=PALETTE['cyan_bright'])
        
    # Warp Grid horizon lines inside portal
    for y in [11, 15, 19]:
        d.line([(10, y), (21, y)], fill=PALETTE['cyan_dark'])
    for x in [11, 15, 19]:
        d.line([(x, 10), (x, 21)], fill=PALETTE['cyan_dark'])
        
    # Central hyper-jump spark
    d.point((15, 15), fill=PALETTE['white'])
    d.point((16, 15), fill=PALETTE['white'])

    return img

def draw_skill_autodestroy():
    # Eco Cósmico Targeting Drone with laser reticle
    img = create_sprite(32, 32)
    d = ImageDraw.Draw(img)
    cx, cy = 15.5, 15.5
    
    # Targeting reticle ring (thin HUD circle)
    d.arc([4, 4, 27, 27], start=0, end=360, fill=PALETTE['outline'], width=2)
    d.arc([5, 5, 26, 26], start=0, end=360, fill=PALETTE['amber_mid'], width=1)
    
    # 4 Reticle tick marks
    d.line([(15, 2), (15, 7)], fill=PALETTE['amber_bright'], width=2)
    d.line([(15, 24), (15, 29)], fill=PALETTE['amber_bright'], width=2)
    d.line([(2, 15), (7, 15)], fill=PALETTE['amber_bright'], width=2)
    d.line([(24, 15), (29, 15)], fill=PALETTE['amber_bright'], width=2)
    
    # Drone core satellite in center
    d.rectangle([11, 11, 20, 20], fill=PALETTE['outline'])
    d.rectangle([12, 12, 19, 19], fill=PALETTE['silver_bright'])
    
    # Glowing Laser Eye in center
    d.rectangle([14, 14, 17, 17], fill=PALETTE['red_mid'])
    d.point((15, 15), fill=PALETTE['white'])
    
    # Diagonal micro thrusters
    d.point((9, 9), fill=PALETTE['cyan_bright'])
    d.point((22, 9), fill=PALETTE['cyan_bright'])
    d.point((9, 22), fill=PALETTE['cyan_bright'])
    d.point((22, 22), fill=PALETTE['cyan_bright'])

    return img


# ============================================================
# MAIN GENERATION ROUTINE
# ============================================================

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_dir = os.path.join(base_dir, 'assets')
    
    print("Generating pixel art assets for Digithin Galaxy...")
    
    # 1. Celestial Falling Objects
    obj_dir = os.path.join(assets_dir, 'objects')
    objects = {
        'sun.webp': draw_pixel_sun(),
        'comet.webp': draw_pixel_comet(),
        'station.webp': draw_pixel_space_station(),
        'satellite.webp': draw_pixel_satellite(),
        'moon.webp': draw_pixel_moon(),
        'asteroid.webp': draw_pixel_asteroid(),
        'probe.webp': draw_pixel_probe(),
        'blackhole.webp': draw_pixel_blackhole(),
    }
    for filename, sprite in objects.items():
        save_scaled(sprite, os.path.join(obj_dir, filename), scale=3) # 28x28 -> 84x84
        
    # 2. Alien Bosses
    boss_dir = os.path.join(assets_dir, 'bosses')
    bosses = {
        'alien_xylarion.webp': draw_boss_xylarion(),
        'alien_zorkon.webp': draw_boss_zorkon(),
        'alien_vespera.webp': draw_boss_vespera(),
        'alien_kragthor.webp': draw_boss_kragthor(),
        'alien_nebulor.webp': draw_boss_nebulor(),
        'alien_xenor.webp': draw_boss_xenor(),
    }
    for filename, sprite in bosses.items():
        save_scaled(sprite, os.path.join(boss_dir, filename), scale=3) # 36x36 -> 108x108
        
    # 3. Runic Skills
    skill_dir = os.path.join(assets_dir, 'skills')
    skills = {
        'freezer.webp': draw_skill_freezer(),
        'bomb.webp': draw_skill_bomb(),
        'shield.webp': draw_skill_shield(),
        'vortex.webp': draw_skill_vortex(),
        'slowdown.webp': draw_skill_slowdown(),
        'haste.webp': draw_skill_haste(),
        'dilation.webp': draw_skill_dilation(),
        'autodestroy.webp': draw_skill_autodestroy(),
    }
    for filename, sprite in skills.items():
        save_scaled(sprite, os.path.join(skill_dir, filename), scale=3) # 32x32 -> 96x96
        
    print("All pixel art assets generated successfully!")

if __name__ == '__main__':
    main()
