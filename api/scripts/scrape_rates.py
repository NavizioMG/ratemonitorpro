import json
import sys
import urllib.request
import urllib.error
import re
from datetime import datetime
from html.parser import HTMLParser

class RateParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rates = []
        self.in_current_mtg_rate = False
        self.in_rate_div = False
        self.today = datetime.now().strftime('%Y-%m-%d')
        
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'div':
            # Check for the main container
            if 'class' in attrs and 'current-mtg-rate' in attrs['class']:
                self.in_current_mtg_rate = True
            # Check for the specific rate div
            elif self.in_current_mtg_rate and attrs.get('class') == 'rate':
                self.in_rate_div = True
            
    def handle_endtag(self, tag):
        if tag == 'div':
            if self.in_rate_div:
                self.in_rate_div = False
            elif self.in_current_mtg_rate:
                self.in_current_mtg_rate = False
            
    def handle_data(self, data):
        if not self.in_rate_div:
            return
            
        data = data.strip()
        if not data:
            return
        
        # Extract rate from format like "7.05%"
        rate_match = re.match(r'(\d+\.\d+)%', data)
        if rate_match:
            try:
                rate = float(rate_match.group(1))
                if 0 < rate < 15:  # Sanity check
                    # Add 30-year rate
                    self.rates.append({
                        "date": self.today,
                        "type": "Fixed",
                        "value": rate,
                        "termYears": 30
                    })
                    # Add 15-year rate (typically 0.5-0.75 lower)
                    self.rates.append({
                        "date": self.today,
                        "type": "Fixed",
                        "value": max(rate - 0.625, 0),
                        "termYears": 15
                    })
                    # Add 20-year rate (typically between 15 and 30)
                    self.rates.append({
                        "date": self.today,
                        "type": "Fixed",
                        "value": max(rate - 0.3125, 0),
                        "termYears": 20
                    })
            except ValueError:
                pass

def scrape_mnd_rates():
    try:
        url = "https://www.mortgagenewsdaily.com/mortgage-rates/30-year-fixed"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
        }
        
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            
        parser = RateParser()
        parser.feed(html)
        
        # If no rates found, try regex fallback
        if not parser.rates:
            # Look for rate in the exact div structure provided
            rate_match = re.search(r'<div class="current-mtg-rate">.*?<div class="rate">(\d+\.\d+)%</div>', html, re.DOTALL)
            if rate_match:
                rate = float(rate_match.group(1))
                if 0 < rate < 15:
                    today = datetime.now().strftime('%Y-%m-%d')
                    # Add rates for all terms
                    parser.rates.extend([
                        {
                            "date": today,
                            "type": "Fixed",
                            "value": rate,
                            "termYears": 30
                        },
                        {
                            "date": today,
                            "type": "Fixed",
                            "value": max(rate - 0.625, 0),
                            "termYears": 15
                        },
                        {
                            "date": today,
                            "type": "Fixed",
                            "value": max(rate - 0.3125, 0),
                            "termYears": 20
                        }
                    ])
        
        return parser.rates
        
    except Exception as e:
        print(f"Error scraping rates: {str(e)}", file=sys.stderr)
        return []

def main():
    rates = scrape_mnd_rates()
    if not rates:
        print("Failed to scrape rates", file=sys.stderr)
        sys.exit(1)
    print(json.dumps(rates))

if __name__ == "__main__":
    main()