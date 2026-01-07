import requests
import json
import time

webhook_url = "https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3"

def send_test(name, payload, timeout=15):
    print(f"\n--- Testing: {name} ---")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    try:
        start_time = time.time()
        response = requests.post(
            webhook_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=timeout
        )
        elapsed = time.time() - start_time
        print(f"Result: Success (Status {response.status_code})")
        print(f"Time: {elapsed:.2f}s")
        print(f"Response: {response.text}")
    except requests.exceptions.Timeout:
        print(f"Result: TIMED OUT after {timeout}s")
    except Exception as e:
        print(f"Result: ERROR - {e}")

# Payload 1: The user's requested payload (URL in :0)
payload_user_req = [
    {
        ":0": "https://app-files-v1.softr-files.com/applications/14b19b9c-461d-436e-b2d0-aba854484ac8/uploads/e2dc10c0-46bc-455b-a404-c5e2d92554fd/image.jpg",
        "{user.email}": "olegzakharchenko@gmail.com",
        "language_choise": "Serbian",
        "PAGE_AND_SECTION": "https://www.willnicht.com/app#form1"
    }
]

# Payload 2: Mimic app.js (Base64 data URI in :0) - using a tiny dummy image
# Small red dot base64
base64_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
payload_base64 = [
    {
        ":0": base64_image,
        "{user.email}": "olegzakharchenko@gmail.com",
        "language_choise": "Serbian",
        "PAGE_AND_SECTION": "https://www.willnicht.com/app#form1"
    }
]

# Payload 3: Simple text in :0 (to check if it's just the URL fetching that hangs)
payload_text = [
    {
        ":0": "Just some text, not a URL",
        "{user.email}": "olegzakharchenko@gmail.com",
        "language_choise": "Serbian",
        "PAGE_AND_SECTION": "https://www.willnicht.com/app#form1"
    }
]

if __name__ == "__main__":
    print(f"Target: {webhook_url}")
    
    # 1. Test Simple Text
    send_test("Simple Text", payload_text)
    
    # 2. Test Base64 (Simulating App behavior)
    send_test("Base64 Dummy Image", payload_base64)
    
    # 3. Test User Request (URL)
    send_test("User Request (URL)", payload_user_req)
