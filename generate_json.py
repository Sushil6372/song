import os
import json

music_dir = 'music'
songs = []

for f in os.listdir(music_dir):
    if f.endswith('.mp3'):
        # Format: artist-language-title.mp3
        parts = f[:-4].split('-', 2)
        if len(parts) == 3:
            artist, language, title = parts
        else:
            artist, language, title = "", "", f[:-4]
        songs.append({
            "file": f,
            "artist": artist.strip().title(),
            "language": language.strip().title(),
            "title": title.strip().title()
        })

with open('songs.json', 'w', encoding='utf-8') as f:
    json.dump(songs, f, indent=2)

print(f"✅ songs.json generated with {len(songs)} tracks.")
