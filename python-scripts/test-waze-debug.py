import WazeRouteCalculator
import logging

logger = logging.getLogger('WazeRouteCalculator.WazeRouteCalculator')
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
logger.addHandler(handler)

from_address = 'SW1A 1AA'
to_address = 'EC1A 1BB'
region = 'EU'
try:
    print(f"Testing route from {from_address} to {to_address}")
    route = WazeRouteCalculator.WazeRouteCalculator(from_address, to_address, region)
    print("Route calculated successfully")
    print(route.calc_route_info())
except Exception as e:
    print(f"Error: {e}")
