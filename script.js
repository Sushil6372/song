const musicFolder = 'music/';
const trackList = document.getElementById('trackList');
const artistNav = document.getElementById('artistNav');
const searchInput = document.getElementById('searchInput');
const darkModeBtn = document.getElementById('darkModeBtn');
const globalVolume = document.getElementById('globalVolume');
const shuffleTopBtn = document.getElementById('shuffleTopBtn');
const playAllBtn = document.getElementById('playAllBtn');
const shuffleAllBtn = document.getElementById('shuffleAllBtn');

const playerBar = document.getElementById('playerBar');
const playerSongTitle = document.getElementById('playerSongTitle');
const playerSongArtist = document.getElementById('playerSongArtist');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const repeatBtn = document.getElementById('repeatBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

let allSongs = [];
let currentAudio = null;
let currentArtist = 'All Songs';
let currentIndex = -1;
let isShuffle = false;
let isRepeat = false;
let playQueue = [];

document.body.classList.add('dark');
darkModeBtn.classList.add('active');

// Fetch songs and initialize
fetch('songs.json')
  .then(res => res.json())
  .then(files => {
    allSongs = files;
    createArtistNav();
    showSongsByArtist('All Songs');
  });

// Create navigation buttons for all artists
function createArtistNav() {
  artistNav.innerHTML = '';
  const artists = Array.from(new Set(allSongs.map(song => song.artist).filter(a => a))).sort();
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All Songs';
  allBtn.className = 'active';
  allBtn.addEventListener('click', () => {
    setActiveArtist('All Songs');
    showSongsByArtist('All Songs');
  });
  artistNav.appendChild(allBtn);

  artists.forEach(artist => {
    const btn = document.createElement('button');
    btn.textContent = artist;
    btn.addEventListener('click', () => {
      setActiveArtist(artist);
      showSongsByArtist(artist);
    });
    artistNav.appendChild(btn);
  });
}

// Set active button style
function setActiveArtist(artist) {
  currentArtist = artist;
  Array.from(artistNav.children).forEach(btn => {
    btn.classList.toggle('active', btn.textContent === artist);
  });
}

// Show songs for selected artist or all, with poster and Play/Shuffle
function showSongsByArtist(artist, filter = '') {
  trackList.innerHTML = '';

  // Top Play/Shuffle
  document.querySelector('.top-actions').style.display = 'flex';

  // Show poster if not "All Songs"
  if (artist !== 'All Songs') {
    const img = document.createElement('img');
    img.src = `poster/${artist.toLowerCase()}.jpg`;
    img.alt = artist;
    img.className = 'artist-poster';
    img.onerror = () => { img.style.display = 'none'; };
    trackList.appendChild(img);

    const artistHeader = document.createElement('h2');
    artistHeader.textContent = artist;
    trackList.appendChild(artistHeader);
  }

  let filtered = allSongs;
  if (artist !== 'All Songs') {
    filtered = filtered.filter(song => song.artist === artist);
  }
  if (filter) {
    const f = filter.toLowerCase();
    filtered = filtered.filter(song =>
      (song.title && song.title.toLowerCase().includes(f)) ||
      (song.artist && song.artist.toLowerCase().includes(f))
    );
  }
  filtered.forEach((song, idx) => {
    const track = createTrackElement(song, idx, filtered);
    trackList.appendChild(track);
  });

  // Update Play/Shuffle buttons to play only current list
  playAllBtn.onclick = () => {
    playQueue = filtered;
    currentIndex = 0;
    playSong(playQueue[currentIndex]);
  };
  shuffleAllBtn.onclick = () => {
    playQueue = [...filtered];
    currentIndex = Math.floor(Math.random() * playQueue.length);
    playSong(playQueue[currentIndex]);
    isShuffle = true;
    shuffleBtn.classList.add('active');
  };
}

// Helper to create a track element with artist image and audio controls
function createTrackElement(song, idx, songList) {
  const track = document.createElement('div');
  track.className = 'track';

  // Artist image (circle)
  const artistImg = document.createElement('img');
  artistImg.className = 'artist-thumb';
  if (song.artist) {
    artistImg.src = `poster/${song.artist.toLowerCase()}.jpg`;
    artistImg.onerror = () => {
      artistImg.src = 'default-avatar.png'; // fallback image
      artistImg.classList.add('default');
    };
  } else {
    artistImg.src = 'default-avatar.png';
    artistImg.classList.add('default');
  }

  const playBtn = document.createElement('button');
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
  playBtn.className = 'play-btn';

  playBtn.addEventListener('click', () => {
    playQueue = songList;
    currentIndex = idx;
    playSong(song);
  });

  const title = document.createElement('span');
  title.textContent = song.title;

  track.appendChild(artistImg);
  track.appendChild(playBtn);
  track.appendChild(title);

  track.dataset.idx = idx;
  return track;
}

// Play the current song and update player bar
function playSong(song) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  currentAudio = new Audio(musicFolder + song.file);
  playerSongTitle.textContent = song.title;
  playerSongArtist.textContent = song.artist || '';
  playerBar.style.display = 'flex';
  currentAudio.volume = globalVolume.value;
  currentAudio.play();
  playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';

  // Scroll the playing track to top
  const tracks = document.querySelectorAll('.track');
  if (tracks[currentIndex]) {
    tracks[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Progress bar
  currentAudio.ontimeupdate = () => {
    progressBar.value = (currentAudio.currentTime / currentAudio.duration) * 100 || 0;
    currentTimeEl.textContent = formatTime(currentAudio.currentTime);
    durationEl.textContent = formatTime(currentAudio.duration);
  };
  progressBar.oninput = () => {
    if (currentAudio.duration) {
      currentAudio.currentTime = (progressBar.value / 100) * currentAudio.duration;
    }
  };

  // Autoplay next
  currentAudio.onended = () => {
    if (isRepeat) {
      playSong(playQueue[currentIndex]);
    } else if (isShuffle) {
      playRandom();
    } else if (currentIndex < playQueue.length - 1) {
      currentIndex++;
      playSong(playQueue[currentIndex]);
    }
  };
}

// Play/Pause button in player bar
playPauseBtn.addEventListener('click', () => {
  if (currentAudio) {
    if (currentAudio.paused) {
      currentAudio.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      currentAudio.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  }
});

// Next/Prev buttons
nextBtn.addEventListener('click', () => {
  if (isShuffle) {
    playRandom();
  } else if (currentIndex < playQueue.length - 1) {
    currentIndex++;
    playSong(playQueue[currentIndex]);
  }
});
prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    playSong(playQueue[currentIndex]);
  }
});

// Repeat and Shuffle buttons
repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active', isRepeat);
});
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
});

// Shuffle logic
function playRandom() {
  let next;
  do {
    next = Math.floor(Math.random() * playQueue.length);
  } while (playQueue.length > 1 && next === currentIndex);
  currentIndex = next;
  playSong(playQueue[currentIndex]);
}

// Search functionality
searchInput.addEventListener('input', () => {
  showSongsByArtist(currentArtist, searchInput.value);
});

// Dark mode toggle
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  darkModeBtn.classList.toggle('active');
});

// Global volume control
globalVolume.addEventListener('input', () => {
  if (currentAudio) {
    currentAudio.volume = globalVolume.value;
  }
});

// Shuffle button (for future use)
shuffleTopBtn.addEventListener('click', () => {
  shuffleAllBtn.click();
});

function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}