#!/usr/bin/env python3
"""
Generates a 16-bit retro pixel art Earth globe (assets/earth_pixel_globe.webp)
matching the Cobalt Core aesthetic of Digithin Galaxy.
"""

import math
import os
from PIL import Image, ImageDraw

def generate_pixel_earth():
    # Low-res pixel grid
    GRID_SIZE = 160
    cx, cy = 80, 80
    radius = 74

    # Palette
    P = {
        'trans': (0, 0, 0, 0),
        'space_glow': (0, 229, 255, 40),
        'atmo_bright': (0, 229, 255, 255),
        'atmo_mid': (56, 189, 248, 240),
        'atmo_soft': (14, 165, 233, 160),
        'ocean_shallow': (6, 182, 212, 255),
        'ocean_bright': (37, 99, 235, 255),
        'ocean_mid': (29, 78, 216, 255),
        'ocean_deep': (30, 58, 138, 255),
        'ocean_dark': (15, 23, 42, 255),
        'land_bright': (52, 211, 153, 255),
        'land_mid': (16, 185, 129, 255),
        'land_dark': (5, 150, 105, 255),
        'land_deep': (4, 120, 87, 255),
        'mountain': (180, 83, 9, 255),
        'desert': (245, 158, 11, 255),
        'ice_white': (248, 250, 252, 255),
        'ice_blue': (186, 230, 253, 255),
        'cloud_white': (255, 255, 255, 240),
        'cloud_soft': (226, 232, 240, 200),
        'cloud_shadow': (15, 23, 42, 120),
    }

    img = Image.new('RGBA', (GRID_SIZE, GRID_SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Continent seeds: spherical coordinates (lat, lon) on 3D sphere
    # Continents: Americas (South/North), Europe/Africa, Asia/Australia
    continents = [
        # South America
        (-15, -60, 28, 1.4),
        (-35, -65, 22, 1.1),
        (-0, -65, 20, 1.3),
        # North America
        (35, -100, 32, 1.3),
        (55, -105, 30, 1.2),
        (25, -85, 16, 1.0),
        # Africa
        (5, 20, 36, 1.5),
        (-20, 22, 26, 1.2),
        (25, 15, 28, 1.3),
        # Europe
        (50, 15, 22, 1.2),
        (58, 40, 26, 1.1),
        # Asia
        (45, 80, 42, 1.6),
        (30, 100, 34, 1.4),
        (60, 100, 38, 1.3),
        (15, 78, 18, 1.0),  # India
        # Australia
        (-25, 135, 22, 1.3),
        # Islands
        (65, -40, 18, 1.0), # Greenland
        (36, 138, 14, 0.9), # Japan
        (-4, 115, 18, 1.1), # Indonesia
    ]

    # Pre-render pixels using spherical projection
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            dx = x - cx
            dy = y - cy
            dist = math.hypot(dx, dy)

            if dist > radius + 2:
                continue

            # Outer atmospheric glow ring
            if dist > radius:
                if dist <= radius + 1.2:
                    d.point((x, y), fill=P['atmo_soft'])
                continue

            # 3D Normal on unit sphere
            nx = dx / radius
            ny = dy / radius
            nz_sq = 1.0 - (nx * nx + ny * ny)
            if nz_sq < 0:
                continue
            nz = math.sqrt(nz_sq)

            # Spherical Coordinates: Latitude & Longitude
            lat = math.degrees(math.asin(ny))
            lon = math.degrees(math.atan2(nx, nz))

            # Polar Ice Caps
            if abs(lat) > 68:
                ice_col = P['ice_white'] if abs(lat) > 74 or (int(x + y) % 3 != 0) else P['ice_blue']
                d.point((x, y), fill=ice_col)
                continue

            # Check if landmass
            is_land = False
            land_intensity = 0.0

            for clat, clon, csize, cscale in continents:
                dlat = lat - clat
                dlon = (lon - clon + 180) % 360 - 180
                cdist = math.hypot(dlat, dlon * math.cos(math.radians(clat)))
                # Add irregular perimeter using high-frequency noise
                noise = math.sin(lat * 0.45) * math.cos(lon * 0.45) * 4.5 + math.sin(lat * 0.9 + lon * 0.8) * 2.5
                if cdist < (csize + noise):
                    is_land = True
                    land_intensity = max(land_intensity, 1.0 - (cdist / (csize + noise + 1)))

            # Limb shading factor (darker toward planetary horizon edge)
            limb = nz  # 1.0 at center, 0.0 at horizon edge

            if is_land:
                # Coastal shallow water border
                if land_intensity < 0.12:
                    col = P['ocean_shallow']
                elif land_intensity < 0.35:
                    col = P['land_bright']
                elif land_intensity < 0.65:
                    col = P['land_mid']
                elif land_intensity < 0.85:
                    col = P['land_dark']
                else:
                    col = P['mountain'] if (int(x * 3 + y * 5) % 4 == 0) else P['land_deep']
            else:
                # Ocean depth grading
                if limb > 0.7:
                    col = P['ocean_bright'] if (int(x + y * 2) % 6 == 0) else P['ocean_mid']
                elif limb > 0.4:
                    col = P['ocean_mid']
                elif limb > 0.2:
                    col = P['ocean_deep']
                else:
                    col = P['ocean_dark']

            # Pixel Clouds bands (curving swirls across the sphere)
            cloud_val = (
                math.sin(lat * 0.18 + lon * 0.08) * 0.6 +
                math.sin(lat * 0.4 - lon * 0.15) * 0.4 +
                math.cos(lat * 0.25 + lon * 0.3) * 0.3
            )
            # High swirl cloud streaks
            if cloud_val > 0.52 and abs(lat) < 66:
                # Cloud shadow beneath cloud (slightly offset down-right)
                if cloud_val > 0.68:
                    col = P['cloud_white']
                else:
                    col = P['cloud_soft']

            # Edge atmospheric limb lighting
            if dist >= radius - 2.5:
                # Blend with vibrant atmospheric neon cyan
                col = P['atmo_bright'] if dist >= radius - 1.2 else P['atmo_mid']

            d.point((x, y), fill=col)

    # 4x Nearest-Neighbor scaling for true retro chunky 16-bit pixels
    scale = 5  # 160 * 5 = 800x800
    scaled_img = img.resize((GRID_SIZE * scale, GRID_SIZE * scale), Image.NEAREST)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_path = os.path.join(base_dir, 'assets', 'earth_pixel_globe.webp')
    scaled_img.save(target_path, 'WEBP', quality=95, lossless=True)
    print(f"Generated {target_path} ({scaled_img.size[0]}x{scaled_img.size[1]} px, {os.path.getsize(target_path)} bytes)")

if __name__ == '__main__':
    generate_pixel_earth()
