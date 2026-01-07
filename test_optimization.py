import requests
import json
import base64

# Tiny red dot base64 for testing
base64_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
webhook_url = "https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3"

payload = [
    {
        "image": base64_image,
        "email": "olegzakharchenko@gmail.com",
        "language": "Serbian",
        "source_url": "https://www.willnicht.com/app#test_optimization"
    }
]

def test_optimized_payload():
    print("Sending OPTIMIZED payload...")
    print(f"Keys: {list(payload[0].keys())}")
    try:
        response = requests.post(
            webhook_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_optimized_payload()
