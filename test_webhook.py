import requests
import json

webhook_url = "https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3"
data = [
    {
        ":0": "https://app-files-v1.softr-files.com/applications/14b19b9c-461d-436e-b2d0-aba854484ac8/uploads/e2dc10c0-46bc-455b-a404-c5e2d92554fd/image.jpg",
        "{user.email}": "olegzakharchenko@gmail.com",
        "language_choise": "Serbian",
        "PAGE_AND_SECTION": "https://www.willnicht.com/app#form1"
    }
]

def test_webhook():
    print(f"Sending request to {webhook_url}...")
    try:
        response = requests.post(
            webhook_url,
            json=data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_webhook()
