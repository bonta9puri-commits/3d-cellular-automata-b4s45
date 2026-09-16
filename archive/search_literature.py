import urllib.request
import json
import urllib.parse
import sys

def search_crossref(query):
    print(f"=== Searching Crossref for: {query} ===")
    url = 'https://api.crossref.org/works?query=' + urllib.parse.quote(query) + '&rows=6'
    req = urllib.request.Request(url, headers={'User-Agent': 'ReplicatorResearch/1.0 (mailto:test@example.com)'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            items = data.get('message', {}).get('items', [])
            for item in items:
                title = item.get('title', ['No title'])[0]
                year = item.get('created', {}).get('date-parts', [[None]])[0][0]
                doi = item.get('DOI', '')
                print(f"- [{year}] {title} (DOI: {doi})")
    except Exception as e:
        print('Error:', e)

search_crossref("three-dimensional cellular automata logic gates")
search_crossref("3D Game of Life glider gun Turing")
search_crossref("Carter Bays 3D Life gliders spaceships")
