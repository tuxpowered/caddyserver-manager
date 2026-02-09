import requests
import json

base_url = "http://localhost:2019"

def fix():
    resp = requests.get(f"{base_url}/config/")
    config = resp.json()
    
    # 1. Simplify automation policies
    config['apps']['tls']['automation'] = {
        "policies": [
            {
                "subjects": ["secure.local", "localhost", "127.0.0.1", "::1", "103.7.60.64"],
                "issuers": [{"module": "internal"}]
            },
            {
                "subjects": [
                    "lyaritech.cloud", "*.lyaritech.cloud", "b.lyaritech.cloud", "ten.lyaritech.cloud",
                    "a.lyaritech.cloud", "bogiman.lyaritech.cloud", "isp.lyaritech.cloud",
                    "team.lyaritech.cloud", "any.lyaritech.cloud", "word.lyaritech.cloud",
                    "add.lyaritech.cloud", "aapnel.lyaritech.cloud", "vps.lyaritech.cloud"
                ],
                "issuers": [{"module": "acme"}]
            },
            {
                # Catch-all
                "issuers": [{"module": "internal"}]
            }
        ]
    }
    
    # 2. Fix the match paths to be more inclusive for the UI
    srv0_routes = config['apps']['http']['servers']['srv0']['routes']
    found_api = False
    for route in srv0_routes:
        if 'match' in route and any('/api/*' in p for p in route['match'][0].get('path', [])):
            route['match'][0]['path'] = ["/", "/api/*", "/terminal"]
            found_api = True
            print("[FIX] Updated main proxy route")
            
    if not found_api:
        # If not found, prepend a new global proxy
        srv0_routes.insert(0, {
            "handle": [{
                "handler": "reverse_proxy",
                "upstreams": [{"dial": "127.0.0.1:4000"}]
            }]
        })
        print("[FIX] Inserted global proxy route")

    # 3. PUT the whole config
    resp = requests.put(f"{base_url}/config/", json=config)
    print(f"Update status: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    fix()
