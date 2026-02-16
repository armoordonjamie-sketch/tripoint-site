import requests
import logging

WAZE_URL = "https://www.waze.com/"
HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "referer": WAZE_URL,
}
base_coords = {"lat": 47.498, "lon": 19.040} # EU
get_cord = 'SearchServer/mozi' # Try US server
address = 'tn9 1pp'

url_options = {
    "q": address,
    "lang": "eng",
    "origin": "livemap",
    "lat": base_coords["lat"],
    "lon": base_coords["lon"]
}

full_url = WAZE_URL + get_cord
print(f"Requesting: {full_url}")
try:
    response = requests.get(full_url, params=url_options, headers=HEADERS)
    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
