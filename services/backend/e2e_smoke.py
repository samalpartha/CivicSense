
import requests
import sys
import time

BASE_URL = "http://localhost:8081"

def test_health():
    print(f"Checking Health at {BASE_URL}/health ...", end=" ")
    try:
        res = requests.get(f"{BASE_URL}/health", timeout=5)
        if res.status_code == 200:
            print("✅ OK")
            return True
        else:
            print(f"❌ Failed: {res.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_stats():
    print(f"Checking Realtime Stats at {BASE_URL}/api/stats/realtime ...", end=" ")
    try:
        res = requests.get(f"{BASE_URL}/api/stats/realtime", timeout=5)
        if res.status_code == 200:
            data = res.json()
            # Basic schema validation
            if "events_today" in data and "active_alerts" in data:
                 print("✅ OK")
                 return True
            else:
                 print(f"❌ Invalid Schema: {data.keys()}")
                 return False
        else:
            print(f"❌ Failed: {res.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting E2E Smoke Test...")
    success = True
    success &= test_health()
    success &= test_stats()
    
    if success:
        print("🎉 E2E Tests Passed!")
        sys.exit(0)
    else:
        print("💥 E2E Tests Failed!")
        sys.exit(1)
