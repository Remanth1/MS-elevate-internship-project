import http.server
import socketserver
import json
import random
from datetime import datetime, timedelta

PORT = 8000

# Generate robust mock data matching the Power BI scenario
services = ["EC2", "RDS", "S3", "Lambda", "CloudFront"]
instance_types = ["t3.micro", "m5.large", "r5.xlarge", "c5.2xlarge", "t3.medium", "None"]
environments = ["Production", "Staging", "Development", "Testing"]

def generate_mock_data():
    data = []
    start_date = datetime.now() - timedelta(days=365)
    for i in range(500):
        # Generate random dates over the last year
        random_days = random.randint(0, 365)
        date = start_date + timedelta(days=random_days)
        service = random.choice(services)
        
        # Assign instance types logically
        if service == "EC2":
            instance = random.choice(["t3.micro", "m5.large", "r5.xlarge", "c5.2xlarge", "t3.medium"])
            cost = random.uniform(5.0, 500.0)
        elif service == "RDS":
             instance = random.choice(["db.m5.large", "db.r5.xlarge", "db.t3.medium"])
             cost = random.uniform(20.0, 800.0)
        else:
            instance = "None"
            cost = random.uniform(1.0, 150.0)
            
        environment = random.choice(environments)
        
        # Production naturally costs more
        if environment == "Production":
            cost *= 1.5
            
        data.append({
            "Date": date.strftime("%Y-%m-%d"),
            "Service": service,
            "Instance_Type": instance,
            "Environment": environment,
            "Cost": round(cost, 2)
        })
    return data

MOCK_DATA = generate_mock_data()

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/data':
            # Serve our mock JSON data
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(MOCK_DATA).encode('utf-8'))
        else:
            # Serve standard files (HTML, CSS, JS)
            super().do_GET()

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving dashboard at http://localhost:{PORT}")
    print("Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
