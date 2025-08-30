import os
import json
import tkinter as tk
from tkinter import messagebox
import pygame

# Initialize pygame mixer
pygame.mixer.init()

# Load songs from 'music' folder
music_dir = 'music'
songs = [f for f in os.listdir(music_dir) if f.endswith('.mp3')]

# Save song list to JSON
with open('songs.json', 'w', encoding='utf-8') as f:
    json.dump(songs, f, indent=2)

# GUI setup
root = tk.Tk()
root.title("My Music Player")
root.geometry("400x200")
root.configure(bg="#f0f0f0")

# Current song index
current_index = 0

# Function to play song
def play_song():
    if songs:
        song_path = os.path.join(music_dir, songs[current_index])
        pygame.mixer.music.load(song_path)
        pygame.mixer.music.play()
        status_label.config(text=f"Playing: {songs[current_index]}")
    else:
        messagebox.showwarning("No Songs", "No .mp3 files found in the 'music' folder.")

# Function to stop song
def stop_song():
    pygame.mixer.music.stop()
    status_label.config(text="Stopped")

# Play button (dark green)
play_button = tk.Button(root, text="▶ Play", bg="#006400", fg="white", font=("Arial", 12), command=play_song)
play_button.pack(pady=10)

# Stop button
stop_button = tk.Button(root, text="■ Stop", bg="#8B0000", fg="white", font=("Arial", 12), command=stop_song)
stop_button.pack(pady=5)

# Status label
status_label = tk.Label(root, text="Ready", bg="#f0f0f0", font=("Arial", 10))
status_label.pack(pady=10)

# Run the GUI
root.mainloop()
