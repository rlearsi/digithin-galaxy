#!/usr/bin/env python3
"""
Generates a 16-bit retro pixel art Earth globe (assets/earth_pixel_globe.webp)
strictly matching the Cobalt Core aesthetic and palette of Digithin Galaxy's celestial objects.

Features:
- Full Daylight Illumination (Zero directional night shadow): Since the planet rotates 360 deg
  in the game (earthAxisRotate animation), directional baked shadows are completely removed
  so continents and oceans rotate naturally without an unnatural rotating shadow blotch.
- Preserves rich global distribution of continents across the entire perimeter so colorful
  landmasses are continuously visible as the planet spins along the horizon.
- Complete removal of flat horizontal ice cuts at top and bottom (natural organic coasts).
- Palette strictly matching in-game space objects (green_bright, green_mid, cyan_mid,
  deep_blue, amber_mid, mountain).
- 2x2 retro dithering for subtle terrain depth and ocean transitions (Rule 20 compliant).
- Clean circular perimeter with neon cyan atmospheric glow.
"""

import math
import os
from PIL import Image, ImageDraw

def generate_pixel_earth():
    GRID_SIZE = 160
    cx, cy = 80.0, 80.0
    radius = 73.5

    # Strict Digithin Galaxy Celestial Objects Palette
    P = {
        'trans': (0, 0, 0, 0),
        'outline': (15, 23, 42, 255),
        'atmo_bright': (0, 229, 255, 255),
        'atmo_mid': (56, 189, 248, 230),
        'atmo_soft': (14, 165, 233, 140),
        'space_glow': (0, 229, 255, 40),
        # Oceans (Vibrant Daylight Palette - No dark shadow blotches)
        'ocean_shallow': (56, 189, 248, 255),   # Coastal cyan shelf (cyan_mid)
        'ocean_bright': (37, 99, 235, 255),    # Vibrant cobalt blue
        'ocean_mid': (29, 78, 216, 255),       # Mid aerospace blue
        'ocean_deep': (30, 58, 138, 255),      # Deep ocean blue
        # Continents & Biomes (Matching game objects palette)
        'land_bright': (105, 240, 174, 255),  # green_bright (Emerald highlight)
        'land_mid': (16, 185, 129, 255),      # green_mid (Primary continent green)
        'land_dark': (5, 150, 105, 255),      # green_dark (Lush forest)
        'land_deep': (6, 78, 59, 255),        # green_deep (Deep jungle)
        'mountain': (180, 83, 9, 255),        # mountain (Andes / Rockies ridge)
        'desert': (251, 191, 36, 255),        # amber_mid (Desert golden sand)
        'desert_dark': (217, 119, 6, 255),    # amber_dark (Desert scrub)
        # Ice & Polar features (Organic shapes, NO flat bars)
        'ice_white': (248, 250, 252, 255),
        'ice_blue': (186, 230, 253, 255),
        # Clouds
        'cloud_white': (255, 255, 255, 245),
        'cloud_soft': (226, 232, 240, 215),
        'cloud_shade': (56, 189, 248, 180),   # Light cyan under-cloud tint
    }

    img = Image.new('RGBA', (GRID_SIZE, GRID_SIZE), P['trans'])
    d = ImageDraw.Draw(img)

    # Continent seeds with rich coverage across the entire globe perimeter
    continents = [
        # South America (Tapering to the south, surrounded by water)
        (-10, -60, 28, 1.4, 'forest'),
        (-25, -55, 26, 1.3, 'forest'),
        (-38, -62, 22, 1.2, 'forest'),
        (-50, -68, 18, 1.1, 'mountain'),
        (-56, -67, 12, 0.9, 'tundra'),  # Tierra del Fuego

        # North America (Covering top-left perimeter and center)
        (35, -100, 32, 1.3, 'forest'),
        (55, -105, 30, 1.2, 'forest'),
        (65, -120, 24, 1.1, 'tundra'),  # Alaska / NW Canada
        (25, -85, 18, 1.0, 'forest'),   # Florida & Gulf
        (20, -100, 20, 1.1, 'desert'),  # Mexico

        # Africa (Spanning equatorial center and right perimeter)
        (24, 15, 30, 1.4, 'desert'),    # Sahara Desert
        (5, 20, 36, 1.5, 'forest'),     # Central Africa
        (-18, 22, 28, 1.3, 'forest'),   # Southern Africa
        (-32, 22, 20, 1.1, 'forest'),   # Cape region (South Africa)

        # Europe & Mediterranean
        (50, 15, 24, 1.2, 'forest'),
        (58, 40, 28, 1.1, 'forest'),
        (40, -4, 16, 1.0, 'desert'),    # Spain / Portugal

        # Asia (Massive coverage for eastern and northern edges)
        (45, 80, 42, 1.6, 'forest'),
        (30, 100, 36, 1.4, 'forest'),
        (60, 100, 38, 1.3, 'tundra'),   # Siberia
        (15, 78, 22, 1.1, 'forest'),    # India
        (20, 110, 26, 1.2, 'forest'),   # SE Asia

        # Australia & Oceania (Bottom-right coverage)
        (-25, 135, 26, 1.3, 'desert'),
        (-34, 140, 20, 1.1, 'forest'),

        # Organic Islands & Natural Polar Glaciers (NOT straight cuts!)
        (72, -40, 20, 1.1, 'ice'),      # Greenland (Glacial island)
        (64, -45, 14, 0.9, 'ice'),
        (36, 138, 16, 0.9, 'forest'),   # Japan
        (-4, 115, 20, 1.1, 'forest'),   # Indonesia
        (-75, -20, 22, 1.2, 'ice'),     # Antarctic coast (organic floe)
        (-78, 60, 24, 1.2, 'ice'),
    ]

    # Pre-render pixels inside sphere using spherical projection
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            dx = x - cx
            dy = y - cy
            dist = math.hypot(dx, dy)

            if dist > radius:
                continue

            # 3D Normal on unit sphere
            nx = dx / radius
            ny = (cy - y) / radius  # ny > 0 is North (Top), ny < 0 is South (Bottom)
            nz_sq = 1.0 - (nx * nx + ny * ny)
            if nz_sq < 0:
                continue
            nz = math.sqrt(nz_sq)

            # Spherical Coordinates: Latitude & Longitude
            lat = math.degrees(math.asin(ny))
            lon = math.degrees(math.atan2(nx, nz))

            # Multi-octave natural terrain noise for realistic fractal coastlines
            noise = (
                math.sin(lat * 0.40) * math.cos(lon * 0.40) * 4.2 +
                math.sin(lat * 0.85 + lon * 0.75) * 2.2
            )

            # Determine landmass presence and intensity
            is_land = False
            land_intensity = 0.0
            active_biome = 'forest'

            for clat, clon, csize, cscale, cbiome in continents:
                dlat = lat - clat
                dlon = (lon - clon + 180) % 360 - 180
                cdist = math.hypot(dlat, dlon * math.cos(math.radians(clat)))
                effective_radius = csize + noise

                if cdist < effective_radius:
                    intensity = (1.0 - (cdist / (effective_radius + 1.0))) * cscale
                    if intensity > land_intensity:
                        land_intensity = intensity
                        active_biome = cbiome
                        is_land = True

            # 2x2 retro checkerboard dithering for smooth pixel art transitions (Rule 20)
            dither = ((x ^ y) & 1) == 0

            # Concentric limb factor (1.0 at center, 0.0 at edge) - Rotationally Invariant!
            # Because it is radial from center, it looks identical at ANY rotation angle!
            limb = nz

            if is_land:
                # --- CONTINENT COLORING (Full Daylight - No Directional Shadow) ---
                if active_biome == 'ice':
                    # Organic glacial landmass
                    col = P['ice_white'] if (dither or limb > 0.4) else P['ice_blue']
                elif active_biome == 'desert':
                    # Golden desert (Sahara / Outback)
                    if land_intensity < 0.16:
                        col = P['ocean_shallow']
                    elif land_intensity < 0.45:
                        col = P['desert'] if dither else P['desert_dark']
                    elif land_intensity < 0.75:
                        col = P['desert']
                    else:
                        col = P['mountain'] if dither else P['desert_dark']
                elif active_biome == 'mountain':
                    # Mountain ridge
                    if land_intensity < 0.16:
                        col = P['ocean_shallow']
                    elif land_intensity < 0.55:
                        col = P['land_dark']
                    elif land_intensity < 0.80:
                        col = P['mountain'] if dither else P['desert_dark']
                    else:
                        col = P['mountain']
                elif active_biome == 'tundra':
                    # Sub-polar tundra
                    if land_intensity < 0.16:
                        col = P['ocean_shallow']
                    elif land_intensity < 0.55:
                        col = P['land_dark'] if dither else P['land_deep']
                    else:
                        col = P['ice_blue'] if dither else P['land_dark']
                else:
                    # Lush Forest Continents (Americas, Europe, Africa, Asia)
                    if land_intensity < 0.15:
                        col = P['ocean_shallow']
                    elif land_intensity < 0.38:
                        col = P['land_bright'] if dither else P['land_mid']
                    elif land_intensity < 0.70:
                        col = P['land_mid'] if dither else P['land_dark']
                    else:
                        col = P['land_dark'] if dither else P['land_deep']

            else:
                # --- OCEAN DEPTH SHADING (Full Daylight - Symmetric with respect to center) ---
                # Beautiful aerospace cobalt ocean with concentric spherical depth
                if limb > 0.65:
                    col = P['ocean_bright'] if dither else P['ocean_mid']
                elif limb > 0.35:
                    col = P['ocean_mid'] if dither else P['ocean_deep']
                else:
                    col = P['ocean_deep'] if dither else P['ocean_mid']

            # Dynamic Stylized Cloud Bands (Curving swirls across the sphere)
            cloud_val = (
                math.sin(lat * 0.16 + lon * 0.09) * 0.55 +
                math.sin(lat * 0.38 - lon * 0.14) * 0.35 +
                math.cos(lat * 0.22 + lon * 0.28) * 0.25
            )
            if cloud_val > 0.54 and abs(lat) < 70:
                if cloud_val > 0.72:
                    col = P['cloud_white']
                elif cloud_val > 0.60:
                    col = P['cloud_soft'] if dither else col

            d.point((x, y), fill=col)

    # Clean circular perimeter outline & aerospace atmosphere
    sphere_mask = Image.new('L', (GRID_SIZE, GRID_SIZE), 0)
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            if math.hypot(x - cx, y - cy) <= radius:
                sphere_mask.putpixel((x, y), 255)

    # 1px outline on perimeter pixels of sphere
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            if sphere_mask.getpixel((x, y)) == 255:
                touches_outside = False
                for ox, oy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx_p, ny_p = x + ox, y + oy
                    if nx_p < 0 or nx_p >= GRID_SIZE or ny_p < 0 or ny_p >= GRID_SIZE or sphere_mask.getpixel((nx_p, ny_p)) == 0:
                        touches_outside = True
                        break
                if touches_outside:
                    d.point((x, y), fill=P['outline'])

    # 1px atmospheric ring outside sphere
    for y in range(GRID_SIZE):
        for x in range(GRID_SIZE):
            if sphere_mask.getpixel((x, y)) == 0:
                touches_inside = False
                for ox, oy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    nx_p, ny_p = x + ox, y + oy
                    if 0 <= nx_p < GRID_SIZE and 0 <= ny_p < GRID_SIZE and sphere_mask.getpixel((nx_p, ny_p)) == 255:
                        touches_inside = True
                        break
                if touches_inside:
                    d.point((x, y), fill=P['atmo_bright'])
                else:
                    dist = math.hypot(x - cx, y - cy)
                    if dist <= radius + 1.8:
                        d.point((x, y), fill=P['atmo_soft'])
                    elif dist <= radius + 2.5:
                        d.point((x, y), fill=P['space_glow'])

    # 5x Nearest-Neighbor scaling for true retro chunky 16-bit pixels (160 * 5 = 800x800)
    SCALE = 5
    scaled_img = img.resize((GRID_SIZE * SCALE, GRID_SIZE * SCALE), Image.NEAREST)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_path = os.path.join(base_dir, 'assets', 'earth_pixel_globe.webp')
    scaled_img.save(target_path, 'WEBP', quality=95, lossless=True)
    print(f"Generated {target_path} ({scaled_img.size[0]}x{scaled_img.size[1]} px, {os.path.getsize(target_path)} bytes)")

if __name__ == '__main__':
    generate_pixel_earth()
