import urllib.request, json, sys

def search_github():
    url = "https://api.github.com/search/repositories?q=3D-Game-of-Life&sort=stars"
    req = urllib.request.Request(url, headers={'User-Agent': 'ReplicatorResearch/1.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("GitHub repos found:", data.get('total_count', 0))
            for item in data.get('items', [])[:6]:
                print(f"- {item['full_name']}: {item['description']}")
                print(f"  URL: {item['html_url']}")
    except Exception as e:
        print("GitHub Error:", e)

search_github()
