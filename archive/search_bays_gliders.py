import urllib.request, json, re, sys

# Search LifeWiki for Bays 3D gliders
def search_lifewiki():
    url = "https://conwaylife.com/w/api.php?action=query&list=search&srsearch=4555+glider&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("LifeWiki results:")
            for item in data.get('query', {}).get('search', []):
                print("-", item['title'], ":", re.sub('<[^<]+?>', '', item['snippet']))
    except Exception as e:
        print("LifeWiki API Error:", e)

search_lifewiki()
