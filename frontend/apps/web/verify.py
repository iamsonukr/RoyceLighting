import re
import urllib.request
html=urllib.request.urlopen("https://unsplash.com/photos/9Q7-dIbQ-p8", timeout=10).read().decode("utf-8", errors="ignore")
matches=re.findall(r'https://images\\.unsplash\\.com/[^"'> ]+', html)
seen=[]
for m in matches:
    if m not in seen:
        seen.append(m)
print("\n".join(seen[:20]))
