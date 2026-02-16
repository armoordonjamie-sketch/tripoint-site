import WazeRouteCalculator
import logging
import sys

# Patch EU search server to use the working US endpoint
WazeRouteCalculator.WazeRouteCalculator.COORD_SERVERS['EU'] = 'SearchServer/mozi'

def get_route_time(start_address, end_address, region='EU'):
    try:
        route = WazeRouteCalculator.WazeRouteCalculator(start_address, end_address, region)
        route_time, route_distance = route.calc_route_info()
        return route_time, route_distance
    except Exception as e:
        # print(f"Error calculating route from {start_address} to {end_address}: {e}")
        return None, None

def get_zone(minutes):
    if minutes <= 25:
        return 'A'
    elif minutes <= 45:
        return 'B'
    elif minutes <= 60:
        return 'C'
    else:
        return 'Out of area'

if __name__ == "__main__":
    # configure logging
    logger = logging.getLogger('WazeRouteCalculator.WazeRouteCalculator')
    logger.setLevel(logging.WARNING) # Reduce noise
    handler = logging.StreamHandler()
    logger.addHandler(handler)

    if len(sys.argv) < 2:
        print("Usage: python test-waze.py <destination_postcode>")
        sys.exit(1)

    destination = sys.argv[1]
    
    bases = {
        'Tonbridge (PM/Sat)': 'TN9 1PP',
        'Eltham (AM)': 'SE9 4HA'
    }
    region = 'EU'

    print(f"Calculating routes to: {destination}...\n")

    results = []

    for base_name, base_address in bases.items():
        print(f"--- Checking {base_name} [{base_address}] ---")
        time_mins, dist_km = get_route_time(base_address, destination, region)
        
        if time_mins is not None:
            print(f"Time: {time_mins:.2f} mins, Distance: {dist_km:.2f} km\n")
            results.append({
                'base_name': base_name,
                'base_address': base_address,
                'time': time_mins,
                'distance': dist_km
            })
        else:
            print("Failed to calculate route.\n")

    if results:
        # Find best result based on time
        best_route = min(results, key=lambda x: x['time'])
        zone = get_zone(best_route['time'])
        
        print("-" * 40)
        print(f"🏆 BEST OPTION:")
        print(f"   Base: {best_route['base_name']}")
        print(f"   Time: {best_route['time']:.2f} mins")
        print(f"   Zone: {zone}")
        print("-" * 40)
    else:
        print("Could not compare routes due to errors.")