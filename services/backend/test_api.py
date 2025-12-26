#!/usr/bin/env python3
"""
Quick API test script for CivicSense backend.
Tests that all endpoints are accessible and properly documented.
"""
import requests
import json
from typing import Dict, Any


BASE_URL = "http://localhost:8081"


def print_section(title: str):
    """Print a formatted section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def test_endpoint(method: str, endpoint: str, data: Dict[str, Any] = None) -> bool:
    """
    Test an API endpoint.
    
    Args:
        method: HTTP method (GET, POST, etc.)
        endpoint: Endpoint path
        data: Request body for POST requests
        
    Returns:
        True if test passed, False otherwise
    """
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        print(f"📍 {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print(f"   ✅ SUCCESS")
            response_data = response.json()
            print(f"   Response preview: {json.dumps(response_data, indent=2)[:200]}...")
            return True
        else:
            print(f"   ⚠️  Status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection failed - is the backend running?")
        print(f"   Start with: cd services/backend && ./deploy.sh")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_openapi_docs() -> bool:
    """Test that OpenAPI documentation is accessible."""
    print_section("OpenAPI Documentation")
    
    endpoints = {
        "OpenAPI JSON": "/openapi.json",
        "Swagger UI": "/docs",
        "ReDoc": "/redoc"
    }
    
    all_passed = True
    
    for name, endpoint in endpoints.items():
        url = f"{BASE_URL}{endpoint}"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: {url}")
            else:
                print(f"❌ {name}: Failed with status {response.status_code}")
                all_passed = False
        except Exception as e:
            print(f"❌ {name}: {e}")
            all_passed = False
    
    return all_passed


def main():
    """Run all API tests."""
    print("\n" + "="*60)
    print("  CivicSense API Test Suite")
    print("="*60)
    
    results = []
    
    # Test 1: Root endpoint
    print_section("Test 1: Root Endpoint")
    results.append(test_endpoint("GET", "/"))
    
    # Test 2: Health endpoint
    print_section("Test 2: Health Check")
    results.append(test_endpoint("GET", "/health"))
    
    # Test 3: Query endpoint
    print_section("Test 3: Query Endpoint")
    test_query = {
        "message": "Is it safe to go outside?",
        "context": {
            "user_type": "general",
            "location": "Downtown"
        }
    }
    results.append(test_endpoint("POST", "/api/query", test_query))
    
    # Test 4: OpenAPI docs
    results.append(test_openapi_docs())
    
    # Summary
    print_section("Test Summary")
    passed = sum(results)
    total = len(results)
    
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        print("\n📚 Access Swagger UI: http://localhost:8000/docs")
        print("📚 Access ReDoc: http://localhost:8000/redoc")
        print("📚 Access OpenAPI JSON: http://localhost:8000/openapi.json")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        print("\nTroubleshooting:")
        print("1. Ensure backend is running: cd services/backend && ./deploy.sh")
        print("2. Check backend logs for errors")
        print("3. Verify .env file has correct credentials")
        return 1


if __name__ == "__main__":
    exit(main())

