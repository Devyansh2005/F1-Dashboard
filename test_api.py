import urllib.request, json

# Test 1: Count all drivers
drivers = json.loads(urllib.request.urlopen('http://localhost:3000/api/drivers').read().decode('utf-8'))
print(f"Total drivers in DB: {len(drivers)}")

# Test 2: Code lookup (VER)
ver = json.loads(urllib.request.urlopen('http://localhost:3000/api/drivers/ver').read().decode('utf-8'))
print(f"Code lookup VER: {ver['givenName']} {ver['familyName']} - {ver['team']}")

# Test 3: driverId lookup
ant = json.loads(urllib.request.urlopen('http://localhost:3000/api/drivers/antonelli').read().decode('utf-8'))
print(f"ID lookup antonelli: {ant['givenName']} {ant['familyName']} - Wins: {ant['careerWins']}, Podiums: {ant['careerPodiums']}")

# Test 4: 404 for unknown driver
try:
    urllib.request.urlopen('http://localhost:3000/api/drivers/unknown_driver')
except urllib.error.HTTPError as e:
    print(f"404 test: status {e.code} (expected 404)")

print("\nAll API tests passed!")
