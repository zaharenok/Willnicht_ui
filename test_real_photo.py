import requests
import json
import base64
import time

import io
from PIL import Image

# Local image path
image_path = "/Users/oleg/PythonBox HD/Willnicht_ui/IMG_1286.JPG"
webhook_url = "https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3"

def test_send_real_photo():
    print(f"1. Reading local image: {image_path}...")
    try:
        # Resize image to reduce payload size
        img = Image.open(image_path)
        img.thumbnail((1024, 1024))  # Resize to max 1024x1024
        
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=85)
        img_content = buffer.getvalue()
        
        print(f"   Resized image size: {len(img_content)} bytes.")
        
    except Exception as e:
        print(f"   Failed to process image: {e}")
        return

    print("2. Preparing Multipart Payload...")
    
    # Multipart payload
    # 'data' contains text fields
    data_payload = {
        "email": "olegzakharchenko@gmail.com",
        "user_language": "Russian",
        "marketplace_language": "German",
        "source_url": "https://www.willnicht.com/app#form1"
    }

    # 'files' contains the file stream
    # Key 'image' will be the field name in Make.com
    files_payload = {
        "image": ("image.jpg", img_content, "image/jpeg")
    }

    print("3. Sending to Webhook (Multipart/Form-Data)...")
    try:
        start_time = time.time()
        # requests automatically sets Content-Type to multipart/form-data when 'files' is present
        response = requests.post(
            webhook_url,
            data=data_payload,
            files=files_payload,
            timeout=60
        )
        elapsed = time.time() - start_time
        print(f"   Status Code: {response.status_code}")
        print(f"   Time Elapsed: {elapsed:.2f}s")
        print(f"   Response Body: {response.text}")
    except requests.exceptions.Timeout:
        print("   Result: TIMED OUT after 60s")
    except Exception as e:
        print(f"   Result: ERROR - {e}")

if __name__ == "__main__":
    test_send_real_photo()
