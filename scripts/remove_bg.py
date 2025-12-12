
from rembg import remove
from PIL import Image
import os

input_path = 'public/icon.png'
output_path = 'public/icon_transparent.png'

print(f"🎨 Processing {input_path}...")

if not os.path.exists(input_path):
    print("❌ Error: Input file not found!")
    exit(1)

try:
    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path)
    print(f"✅ Background removed! Saved to {output_path}")
except Exception as e:
    print(f"❌ Error: {e}")
