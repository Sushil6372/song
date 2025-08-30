import os

music_dir = 'music'

artists = {
    "divine": ("hindi", [
        "Baazigar.mp3",
        "Rain.mp3",
        "Hisaab.mp3",
        "100 Million.mp3",
        "3_59.mp3",
        "Aag.mp3",
        "Baazigar.mp3",
        "Bornfire.mp3",
        "Mera Bhai.mp3",
        "Mirchi.mp3",
        "O Sajna.mp3",
        "Rain.mp3",
        "Shehnai.mp3",
        "Straight Ballin.mp3",
        "Flex Kar.mp3",
        "Punya Paap.mp3",
        "Bornfire.mp3",
        # Add more Divine songs here
    ]),
    "arijit": ("hindi", [
        "Kaise Hua.mp3",
        "Apna Bana Le.mp3",
        "Bekhayali.mp3",

        # Add more Arijit songs here
    ]),
    "emiway": ("hindi", [
        "Pain.mp3",
        "Tu Tera Dekhe.mp3",
        
    ]),
    "raftar": ("hindi", [
        "Never Back Down.mp3",
        "RAASHAH.mp",
        "Paagal.mp3",
    ]),
    "krsna": ("hindi", [
        "Been a While.mp3",
        "Blowing Up.mp3",
    ]),
    # Add more artists here
}

for artist, (language, song_list) in artists.items():
    for old_name in song_list:
        if old_name.lower().endswith('.mp3'):
            title = old_name[:-4]
            new_name = f"{artist}-{language}-{title}.mp3"
            old_path = os.path.join(music_dir, old_name)
            new_path = os.path.join(music_dir, new_name)
            if os.path.exists(old_path):
                os.rename(old_path, new_path)
                print(f"Renamed: {old_name} -> {new_name}")
            else:
                print(f"File not found: {old_name}")