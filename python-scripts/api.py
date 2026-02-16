from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import WazeRouteCalculator
import logging
import asyncio
from pydantic import BaseModel

# Patch EU search server to use the working US endpoint
WazeRouteCalculator.WazeRouteCalculator.COORD_SERVERS['EU'] = 'SearchServer/mozi'

# Configure logging
logger = logging.getLogger('WazeRouteCalculator')
logger.setLevel(logging.WARNING)

app = FastAPI(title="TriPoint Waze Zone API")

# Allow CORS for local development/frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASES = {
    'Tonbridge': 'TN9 1PP',
    'Eltham': 'SE9 4HA'
}
REGION = 'EU'

class ZoneResponse(BaseModel):
    postcode: str
    best_base_name: str
    best_base_address: str
    time_minutes: float
    distance_km: float
    zone: str
    details: dict

def get_zone(minutes: float) -> str:
    if minutes <= 25:
        return 'A'
    elif minutes <= 45:
        return 'B'
    elif minutes <= 60:
        return 'C'
    else:
        return 'Out of area'

def calculate_single_route(start: str, end: str):
    try:
        route = WazeRouteCalculator.WazeRouteCalculator(start, end, REGION)
        time_mins, distance_km = route.calc_route_info()
        return time_mins, distance_km
    except Exception as e:
        logger.error(f"Error calculating route {start} -> {end}: {e}")
        return None, None

@app.get("/calculate-zone", response_model=ZoneResponse)
async def calculate_zone(postcode: str):
    results = []
    
    # Calculate routes from all bases
    # Note: WazeRouteCalculator is synchronous and blocking. 
    # For a simple local tool, this is fine, but for high throughput, 
    # this should be run in a threadpool or use an async library.
    # We'll run it directly for now as per instructions.
    
    details = {}
    valid_results = []

    for base_name, base_address in BASES.items():
        # Running in functionality to avoid blocking main thread completely if expanded later
        # But here mostly for structure
        time_mins, dist_km = calculate_single_route(base_address, postcode)
        
        details[base_name] = {
            "time": time_mins,
            "distance": dist_km,
            "address": base_address
        }
        
        if time_mins is not None:
            valid_results.append({
                'base_name': base_name,
                'base_address': base_address,
                'time': time_mins,
                'distance': dist_km
            })

    if not valid_results:
        raise HTTPException(status_code=400, detail="Could not calculate routes for the provided postcode. It might be invalid or Waze API is unreachable.")

    # Find best result
    best_route = min(valid_results, key=lambda x: x['time'])
    zone = get_zone(best_route['time'])

    return ZoneResponse(
        postcode=postcode,
        best_base_name=best_route['base_name'],
        best_base_address=best_route['base_address'],
        time_minutes=round(best_route['time'], 2),
        distance_km=round(best_route['distance'], 2),
        zone=zone,
        details=details
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
