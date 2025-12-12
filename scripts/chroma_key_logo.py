
from PIL import Image

def clean_background(input_path, output_path, tolerance=30):
    print(f"🎨 Opening {input_path}...")
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        # Get background color from top-left pixel
        bg_color = datas[0]
        print(f"🔍 Detected Background Color: {bg_color}")

        new_data = []
        for item in datas:
            # Check difference (Manhattan distance)
            diff = sum([abs(item[i] - bg_color[i]) for i in range(3)])
            
            # If close to background color, make transparent
            if diff < tolerance:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"✅ Saved transparent logo to {output_path}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    clean_background("public/icon.png", "public/icon.png")
