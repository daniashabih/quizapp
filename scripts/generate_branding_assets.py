import os
from PIL import Image, ImageOps, ImageDraw
from collections import deque

SOURCE_PATH = r"C:/Users/dania.shabih/.gemini/antigravity/brain/1c0784a1-f8b6-4e92-940f-c98df526b1d2/.user_uploaded/media_1792146071809_bb0cd748.jpg"
WORKSPACE_DIR = r"D:/quizapp"

def create_transparent_logo(img_rgb):
    """
    Remove outer white background while preserving:
    - Inner white badge of bug (with </> inside)
    - Dark green bug body and black legs
    - HangBug wordmark and tagline
    - Loops of letters in the text become transparent
    """
    w, h = img_rgb.size
    
    # 1. Flood-fill from outer edges to find all external background pixels
    visited = set()
    q = deque()
    
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
        visited.add((x, 0))
        visited.add((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
        visited.add((0, y))
        visited.add((w - 1, y))
        
    def is_white(rgb):
        return rgb[0] >= 238 and rgb[1] >= 238 and rgb[2] >= 238

    while q:
        x, y = q.popleft()
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                if is_white(img_rgb.getpixel((nx, ny))):
                    visited.add((nx, ny))
                    q.append((nx, ny))
                    
    # 2. Build RGBA image
    rgba = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    for y in range(h):
        for x in range(w):
            pix = img_rgb.getpixel((x, y))
            # If in outer background: transparent
            if (x, y) in visited:
                rgba.putpixel((x, y), (255, 255, 255, 0))
            elif y >= 620 and is_white(pix):
                # Inside letters of wordmark/tagline: transparent
                rgba.putpixel((x, y), (255, 255, 255, 0))
            else:
                # Solid content: preserve original RGB at full opacity
                rgba.putpixel((x, y), (pix[0], pix[1], pix[2], 255))
                
    return rgba

def create_dark_mode_logo(rgba_img):
    """
    Creates a variant optimized for dark surfaces:
    - Black 'Hang' wordmark and black text in tagline converted to crisp light (#FCFAF4)
    - Dark green 'Bug' wordmark made slightly brighter/vibrant (#2E9E78) for high contrast
    - The pixel bug has its dark green and black legs, with a subtle light contour/edge or crisp presentation
    """
    w, h = rgba_img.size
    dark_rgba = rgba_img.copy()
    
    for y in range(h):
        for x in range(w):
            r, g, b, a = dark_rgba.getpixel((x, y))
            if a == 0:
                continue
            
            # Wordmark and tagline section (y >= 620)
            if y >= 620:
                # If it's black or very dark (e.g. 'Hang' or 'Learn - Test - Prove')
                if r < 40 and g < 40 and b < 40:
                    dark_rgba.putpixel((x, y), (252, 250, 244, a))
                # If it's dark green ('Bug' wordmark)
                elif g > 60 and r < 40:
                    # Boost to vibrant green for dark background
                    dark_rgba.putpixel((x, y), (46, 175, 125, a))
            else:
                # Bug icon: keep authentic pixel art
                # If black legs/antennae, keep them, but let's ensure high visibility
                pass
                
    return dark_rgba

def create_compact_logo(bug_rgba, wm_rgba, is_dark=False):
    """
    Creates a horizontal compact logo:
    [ Bug Icon ]  HangBug
    """
    # Crop bug to its non-transparent bbox
    bbox_bug = bug_rgba.getbbox()
    bug_cropped = bug_rgba.crop(bbox_bug)
    
    # Crop wordmark
    bbox_wm = wm_rgba.getbbox()
    wm_cropped = wm_rgba.crop(bbox_wm)
    
    # Target heights: bug ~ 180px, wordmark ~ 120px
    target_bug_h = 180
    target_bug_w = int(bug_cropped.width * (target_bug_h / bug_cropped.height))
    bug_scaled = bug_cropped.resize((target_bug_w, target_bug_h), Image.Resampling.LANCZOS)
    
    target_wm_h = 115
    target_wm_w = int(wm_cropped.width * (target_wm_h / wm_cropped.height))
    wm_scaled = wm_cropped.resize((target_wm_w, target_wm_h), Image.Resampling.LANCZOS)
    
    gap = 24
    padding_x = 24
    padding_y = 16
    
    canvas_w = padding_x * 2 + target_bug_w + gap + target_wm_w
    canvas_h = padding_y * 2 + max(target_bug_h, target_wm_h)
    
    compact_img = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    
    # Paste bug
    bug_y = padding_y + (max(target_bug_h, target_wm_h) - target_bug_h) // 2
    compact_img.paste(bug_scaled, (padding_x, bug_y), bug_scaled)
    
    # Paste wordmark
    wm_x = padding_x + target_bug_w + gap
    wm_y = padding_y + (max(target_bug_h, target_wm_h) - target_wm_h) // 2
    compact_img.paste(wm_scaled, (wm_x, wm_y), wm_scaled)
    
    return compact_img

def main():
    print(f"Loading source image from: {SOURCE_PATH}")
    img_orig = Image.open(SOURCE_PATH).convert('RGB')
    w, h = img_orig.size
    
    # 1. Full transparent logo
    print("Generating full transparent logo...")
    logo_transparent = create_transparent_logo(img_orig)
    
    # 2. Full white background logo (clean 1024x1024)
    logo_full_white = img_orig.copy()
    
    # 3. Full dark mode logo
    print("Generating dark background variant...")
    logo_dark = create_dark_mode_logo(logo_transparent)
    
    # 4. Icon only
    print("Extracting icon-only variant...")
    # Bug bounds: Y from 214 to 618, X from 318 to 705
    bug_rgba = logo_transparent.crop((315, 210, 708, 620))
    
    # Center bug in square 512x512
    icon_512 = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    # Scale bug to 420x438
    b_scale = 430 / bug_rgba.height
    b_new_w = int(bug_rgba.width * b_scale)
    b_new_h = int(bug_rgba.height * b_scale)
    bug_sized = bug_rgba.resize((b_new_w, b_new_h), Image.Resampling.LANCZOS)
    icon_512.paste(bug_sized, ((512 - b_new_w) // 2, (512 - b_new_h) // 2), bug_sized)
    
    # White background icon (512x512)
    icon_white_512 = Image.new('RGBA', (512, 512), (255, 255, 255, 255))
    icon_white_512.paste(bug_sized, ((512 - b_new_w) // 2, (512 - b_new_h) // 2), bug_sized)
    
    # Brand background icon (#193D35 background with clean circular/rounded white badge)
    icon_brand_512 = Image.new('RGBA', (512, 512), (25, 61, 53, 255))
    draw = ImageDraw.Draw(icon_brand_512)
    draw.ellipse([32, 32, 480, 480], fill=(255, 255, 255, 255))
    # Paste bug inside white circle
    b_inner_scale = 360 / bug_rgba.height
    b_in_w = int(bug_rgba.width * b_inner_scale)
    b_in_h = int(bug_rgba.height * b_inner_scale)
    bug_inner = bug_rgba.resize((b_in_w, b_in_h), Image.Resampling.LANCZOS)
    icon_brand_512.paste(bug_inner, ((512 - b_in_w) // 2, (512 - b_in_h) // 2), bug_inner)
    
    # 5. Android Adaptive Foreground Layer (432x432 with bug centered inside 260px safe circle)
    print("Generating Android adaptive icon foreground layer...")
    adaptive_fg = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
    # Max dimension inside safe circle is ~240px
    ad_scale = 240 / max(bug_rgba.width, bug_rgba.height)
    ad_w = int(bug_rgba.width * ad_scale)
    ad_h = int(bug_rgba.height * ad_scale)
    bug_adaptive = bug_rgba.resize((ad_w, ad_h), Image.Resampling.LANCZOS)
    adaptive_fg.paste(bug_adaptive, ((432 - ad_w) // 2, (432 - ad_h) // 2), bug_adaptive)
    
    # 6. Wordmark extraction for compact logo
    wm_rgba = logo_transparent.crop((290, 636, 732, 775))
    wm_dark_rgba = logo_dark.crop((290, 636, 732, 775))
    
    print("Generating compact horizontal logos...")
    compact_logo = create_compact_logo(bug_rgba, wm_rgba, is_dark=False)
    compact_logo_dark = create_compact_logo(bug_rgba, wm_dark_rgba, is_dark=True)
    
    compact_white = Image.new('RGBA', compact_logo.size, (255, 255, 255, 255))
    compact_white.paste(compact_logo, (0, 0), compact_logo)
    
    # Directories to write to:
    dirs = [
        os.path.join(WORKSPACE_DIR, "public", "branding"),
        os.path.join(WORKSPACE_DIR, "src", "assets", "branding"),
        os.path.join(WORKSPACE_DIR, "mobile", "assets", "images", "branding"),
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        
    # Save standard branding assets into each directory
    for dest_dir in dirs:
        logo_full_white.save(os.path.join(dest_dir, "hangbug-logo-full.png"), format="PNG", optimize=True)
        logo_transparent.save(os.path.join(dest_dir, "hangbug-logo-transparent.png"), format="PNG", optimize=True)
        logo_dark.save(os.path.join(dest_dir, "hangbug-logo-dark.png"), format="PNG", optimize=True)
        compact_logo.save(os.path.join(dest_dir, "hangbug-logo-compact.png"), format="PNG", optimize=True)
        compact_logo_dark.save(os.path.join(dest_dir, "hangbug-logo-compact-dark.png"), format="PNG", optimize=True)
        compact_white.save(os.path.join(dest_dir, "hangbug-logo-compact-white.png"), format="PNG", optimize=True)
        icon_512.save(os.path.join(dest_dir, "hangbug-icon.png"), format="PNG", optimize=True)
        icon_white_512.save(os.path.join(dest_dir, "hangbug-icon-white.png"), format="PNG", optimize=True)
        icon_brand_512.save(os.path.join(dest_dir, "hangbug-icon-brand.png"), format="PNG", optimize=True)
        adaptive_fg.save(os.path.join(dest_dir, "hangbug-adaptive-foreground.png"), format="PNG", optimize=True)
        print(f"Branding assets saved to {dest_dir}")
        
    # Also update legacy/existing asset paths:
    # 1. mobile/assets/images/
    os.makedirs(os.path.join(WORKSPACE_DIR, "mobile", "assets", "images"), exist_ok=True)
    icon_512.save(os.path.join(WORKSPACE_DIR, "mobile", "assets", "images", "icon.png"), format="PNG", optimize=True)
    logo_transparent.save(os.path.join(WORKSPACE_DIR, "mobile", "assets", "images", "logo.png"), format="PNG", optimize=True)
    
    # 2. src/assets/
    os.makedirs(os.path.join(WORKSPACE_DIR, "src", "assets"), exist_ok=True)
    logo_transparent.save(os.path.join(WORKSPACE_DIR, "src", "assets", "logo.png"), format="PNG", optimize=True)
    icon_512.save(os.path.join(WORKSPACE_DIR, "src", "assets", "icon.png"), format="PNG", optimize=True)
    
    # 3. public/
    icon_white_512.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(WORKSPACE_DIR, "public", "favicon.png"), format="PNG", optimize=True)
    icon_white_512.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(WORKSPACE_DIR, "public", "apple-touch-icon.png"), format="PNG", optimize=True)
    icon_white_512.save(os.path.join(WORKSPACE_DIR, "public", "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    
    # 4. Generate Android mipmap launcher icons:
    res_dir = os.path.join(WORKSPACE_DIR, "mobile", "android", "app", "src", "main", "res")
    mipmap_specs = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    drawable_specs = {
        "drawable-mdpi": (108, 108),
        "drawable-hdpi": (162, 162),
        "drawable-xhdpi": (216, 216),
        "drawable-xxhdpi": (324, 324),
        "drawable-xxxhdpi": (432, 432),
    }
    
    for folder, size in mipmap_specs.items():
        target_dir = os.path.join(res_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        # Launcher icon (legacy, with white background so bug is crisp)
        icon_white_512.resize((size, size), Image.Resampling.LANCZOS).save(
            os.path.join(target_dir, "launcher_icon.png"), format="PNG", optimize=True
        )
        icon_white_512.resize((size, size), Image.Resampling.LANCZOS).save(
            os.path.join(target_dir, "ic_launcher.png"), format="PNG", optimize=True
        )
        print(f"Generated {folder}/launcher_icon.png ({size}x{size})")
        
    for folder, (dw, dh) in drawable_specs.items():
        target_dir = os.path.join(res_dir, folder)
        os.makedirs(target_dir, exist_ok=True)
        adaptive_fg.resize((dw, dh), Image.Resampling.LANCZOS).save(
            os.path.join(target_dir, "ic_launcher_foreground.png"), format="PNG", optimize=True
        )
        print(f"Generated {folder}/ic_launcher_foreground.png ({dw}x{dh})")
        
    print("All branding assets generated successfully!")

if __name__ == "__main__":
    main()
