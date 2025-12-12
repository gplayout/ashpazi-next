
from PIL import Image, ImageColor

def lighten_greens(input_path, output_path):
    print(f"🎨 Opening {input_path}...")
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            r, g, b, a = item
            
            # Simple Green detection: G is dominant or close to dominant
            # and it's not white/grey (saturation check)
            if g > r and g > b:
                # It is greenish.
                # User wants it "Light Green / White".
                # Let's mix it with White (255, 255, 255)
                
                # Blend factor: 90% White, 10% Original
                nr = int(r * 0.1 + 255 * 0.9)
                ng = int(g * 0.1 + 255 * 0.9)
                nb = int(b * 0.1 + 255 * 0.9)
                new_data.append((nr, ng, nb, a))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path)
        print(f"✅ Saved lightened logo to {output_path}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    lighten_greens("public/icon.png", "public/icon.png")
