import sqlite3
conn = sqlite3.connect('backend/f1_dashboard.db')
rows = conn.execute("SELECT driverId, imageUrl FROM drivers WHERE imageUrl LIKE '/images%' ORDER BY driverId").fetchall()
print(f'{len(rows)} drivers with local images:')
for r in rows:
    print(f'  {r[0]} -> {r[1]}')
conn.close()
