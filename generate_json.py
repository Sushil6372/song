import os
import json

# Path to your music folder
music_dir = 'music'

# Get all .mp3 files
songs = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]

# Save to songs.json
with open('songs.json', 'w', encoding='utf-8') as f:
    json.dump(songs, f, indent=2)

print(f"✅ songs.json generated with {len(songs)} tracks.")
