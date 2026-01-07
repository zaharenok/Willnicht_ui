#!/usr/bin/env python3
"""
Import willhaben.at cookies to Chrome for testing

NOTE: This script requires Chrome to be closed and will restart it.
Works on macOS only.

Usage:
    python3 import_cookies_to_chrome.py
"""

import json
import subprocess
import os
import shutil
from pathlib import Path

# Chrome Cookies database path (macOS)
CHROME_COOKIE_PATH = os.path.expanduser(
    "~/Library/Application Support/Google/Chrome/Default/Cookies"
)

# Backup path
BACKUP_PATH = CHROME_COOKIE_PATH + ".backup"

# Cookies file
COOKIES_FILE = "oleg.willhaben.at_cookies.json"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def backup_cookies():
    """Create backup of existing cookies"""
    if os.path.exists(CHROME_COOKIE_PATH):
        print(f"📦 Creating backup: {BACKUP_PATH}")
        shutil.copy2(CHROME_COOKIE_PATH, BACKUP_PATH)
        print("✅ Backup created successfully")
        return True
    else:
        print("⚠️  Chrome Cookies database not found")
        print("   Please make sure Chrome is installed and has been run at least once")
        return False

def import_cookies():
    """
    Import cookies to Chrome using chrome-cookies tool

    Note: This requires 'chrome-cookies' Python package or manual intervention
    """
    print_header("🍪 Importing Cookies to Chrome")

    # Check if cookies file exists
    if not os.path.exists(COOKIES_FILE):
        print(f"❌ Error: {COOKIES_FILE} not found")
        print(f"   Please make sure the file is in the current directory")
        return False

    # Load cookies
    with open(COOKIES_FILE, 'r') as f:
        cookies = json.load(f)

    print(f"📋 Loaded {len(cookies)} cookies from {COOKIES_FILE}")

    # Print willhaben.at cookies
    willhaben_cookies = [c for c in cookies if 'willhaben.at' in c.get('domain', '')]
    print(f"\n🌐 Found {len(willhaben_cookies)} willhaben.at cookies:")
    for cookie in willhaben_cookies:
        print(f"   • {cookie['name']} = {cookie['value'][:20]}...")

    print_header("⚠️  MANUAL IMPORT REQUIRED")
    print("""
Due to Chrome security restrictions, automatic cookie import is not possible.
Please use one of these methods:

Method 1: Using EditThisCookie Extension (Recommended)
1. Install EditThisCookie extension: https://chrome.google.com/webstore/detail/editthiscookie/
2. Open willhaben.at in Chrome
3. Click EditThisCookie icon
4. Select "Import" → "Choose File"
5. Select: """ + os.path.abspath(COOKIES_FILE) + """
6. Refresh willhaben.at

Method 2: Using Chrome DevTools
1. Open willhaben.at in Chrome
2. Open DevTools (F12) → Application → Cookies
3. Manually add each cookie from """ + COOKIES_FILE + """
4. Refresh the page

Method 3: Using selenium (for automated testing)
Run the automated test script instead
    """)

    # Check if user wants to try automated method
    response = input("\n🤖 Try automated import with selenium? (y/n): ").lower().strip()

    if response == 'y':
        try_selenium_import()

    return True

def try_selenium_import():
    """Try to import cookies using selenium"""
    print("\n🔧 Attempting automated import with selenium...")

    try:
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        from selenium.webdriver.common.by import By
        import time

        # Load cookies
        with open(COOKIES_FILE, 'r') as f:
            cookies = json.load(f)

        # Setup Chrome
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        driver = webdriver.Chrome(options=chrome_options)

        try:
            # First go to willhaben.at
            print("🌐 Opening willhaben.at...")
            driver.get("https://www.willhaben.at")

            # Add cookies
            print("🍪 Adding cookies...")
            for cookie in cookies:
                try:
                    # Remove Chrome-specific fields
                    cookie_dict = {
                        'name': cookie['name'],
                        'value': cookie['value'],
                        'domain': cookie['domain'],
                        'path': cookie.get('path', '/'),
                        'secure': cookie.get('secure', False),
                        'httpOnly': cookie.get('httpOnly', False),
                    }

                    # Add expiry if present
                    if 'expirationDate' in cookie:
                        cookie_dict['expiry'] = int(cookie['expirationDate'])

                    driver.add_cookie(cookie_dict)
                except Exception as e:
                    print(f"   ⚠️  Failed to add {cookie['name']}: {e}")

            # Refresh to apply cookies
            print("🔄 Refreshing page...")
            driver.refresh()
            time.sleep(2)

            print("✅ Cookies imported successfully!")
            print(f"\n📝 You can now test on willhaben.at")
            print(f"   Press Enter in this terminal when done testing to close browser...")

            input()  # Wait for user

        finally:
            driver.quit()

    except ImportError:
        print("❌ selenium not installed")
        print("   Install with: pip3 install selenium")
        print("   Also install ChromeDriver: brew install chromedriver")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print_header("🚀 Willnicht - Willhaben.at Cookie Importer")

    # Check Chrome
    if not os.path.exists(CHROME_COOKIE_PATH):
        print("⚠️  Chrome not detected or never run")
        print("   Opening Chrome for first time...")
        subprocess.run(['open', '-a', 'Google Chrome'])
        input("\nPress Enter after Chrome has opened...")

    # Backup
    if not backup_cookies():
        return

    # Import
    import_cookies()

    print("\n✨ Done! You can now test the Willnicht app")
    print(f"   Run: python3 -m http.server 8000")
    print(f"   Open: http://localhost:8000/app.html")

if __name__ == "__main__":
    main()
