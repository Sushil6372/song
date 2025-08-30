const musicFolder = 'music/';
const trackList = document.getElementById('trackList');
const searchInput = document.getElementById('searchInput');
const darkModeBtn = document.getElementById('darkModeBtn');
const globalVolume = document.getElementById('globalVolume');
const shuffleTopBtn = document.getElementById('shuffleTopBtn');

let currentAudio = null;
let currentPlayer = null;

document.body.classList.add('dark');
darkModeBtn.classList.add('active');

fetch('songs.json')
  .then(res => res.json())
  .then(files => {
    files.forEach((file, i) => {
      const name = file.replace('.mp3', '').replace(/_/g, ' ');

      const track = document.createElement('div');
      track.className = 'track';
      track.setAttribute('data-name', name);

      const title = document.createElement('div');
      title.className = 'name';
      title.textContent = name;

      const audio = document.createElement('audio');
      audio.src = `${musicFolder}${file}`;
      audio.preload = 'metadata';

      const player = document.createElement('div');
      player.className = 'player';

      const progress = document.createElement('div');
      progress.className = 'progress';

      const currentTime = document.createElement('span');
      currentTime.textContent = '0:00';

      const seekBar = document.createElement('input');
      seekBar.type = 'range';
      seekBar.value = 0;
      seekBar.min = 0;
      seekBar.step = 1;

      const totalTime = document.createElement('span');
      totalTime.textContent = '0:00';

      progress.appendChild(currentTime);
      progress.appendChild(seekBar);
      progress.appendChild(totalTime);

      const controls = document.createElement('div');
      controls.className = 'controls';

      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '<i class="fas fa-backward"></i>';

      const playPauseBtn = document.createElement('button');
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';

      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '<i class="fas fa-forward"></i>';

      const loopBtn = document.createElement('button');
      loopBtn.innerHTML = '<i class="fas fa-repeat"></i>';

      const shuffleBtn = document.createElement('button');
      shuffleBtn.innerHTML = '<i class="fas fa-random"></i>';

      controls.appendChild(prevBtn);
      controls.appendChild(playPauseBtn);
      controls.appendChild(nextBtn);
      controls.appendChild(loopBtn);
      controls.appendChild(shuffleBtn);

      player.appendChild(progress);
      player.appendChild(controls);

      track.appendChild(title);
      track.appendChild(player);
      track.appendChild(audio);
      trackList.appendChild(track);
      audio.addEventListener('loadedmetadata', () => {
        totalTime.textContent = formatTime(audio.duration);
        seekBar.max = Math.floor(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        seekBar.value = Math.floor(audio.currentTime);
        currentTime.textContent = formatTime(audio.currentTime);
      });

      seekBar.addEventListener('input', () => {
        audio.currentTime = seekBar.value;
      });

      playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
          if (audio.currentTime > 0) {
            audio.play();
          } else {
            stopOthers();
            fadeIn(audio);
            audio.play();
          }
          playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
          player.classList.add('active');
          currentAudio = audio;
          currentPlayer = player;
          moveTrackToTop(track);
        } else {
          audio.pause();
          playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
      });

      loopBtn.addEventListener('click', () => {
        audio.loop = !audio.loop;
        loopBtn.classList.toggle('active');
      });

      shuffleBtn.addEventListener('click', () => {
        const tracks = Array.from(document.querySelectorAll('.track'));
        const random = tracks[Math.floor(Math.random() * tracks.length)];
        const randomAudio = random.querySelector('audio');
        stopOthers();
        fadeIn(randomAudio);
        randomAudio.play();
        random.querySelector('.player').classList.add('active');
        currentAudio = randomAudio;
        currentPlayer = random.querySelector('.player');
        random.querySelector('.controls button:nth-child(2)').innerHTML = '<i class="fas fa-pause"></i>';
        moveTrackToTop(random);
      });

      nextBtn.addEventListener('click', () => {
        const next = track.nextElementSibling;
        if (next) {
          moveTrackToTop(track);
          const nextAudio = next.querySelector('audio');
          stopOthers();
          fadeIn(nextAudio);
          nextAudio.play();
          next.querySelector('.player').classList.add('active');
          currentAudio = nextAudio;
          currentPlayer = next.querySelector('.player');
          next.querySelector('.controls button:nth-child(2)').innerHTML = '<i class="fas fa-pause"></i>';
          moveTrackToTop(next);
        }
      });

      prevBtn.addEventListener('click', () => {
        const tracks = Array.from(trackList.children);
        const index = tracks.indexOf(track);
        const prev = tracks[index - 1];
        if (prev) {
          const prevAudio = prev.querySelector('audio');
          stopOthers();
          fadeIn(prevAudio);
          prevAudio.play();
          prev.querySelector('.player').classList.add('active');
          currentAudio = prevAudio;
          currentPlayer = prev.querySelector('.player');
          prev.querySelector('.controls button:nth-child(2)').innerHTML = '<i class="fas fa-pause"></i>';
          moveTrackToTop(prev);
        }
      });

      audio.addEventListener('ended', () => {
        moveTrackToTop(track);
        const next = track.nextElementSibling;
        if (next) {
          const nextAudio = next.querySelector('audio');
          stopOthers();
          fadeIn(nextAudio);
          nextAudio.play();
          next.querySelector('.player').classList.add('active');
          currentAudio = nextAudio;
          currentPlayer = next.querySelector('.player');
          next.querySelector('.controls button:nth-child(2)').innerHTML = '<i class="fas fa-pause"></i>';
          moveTrackToTop(next);
        }
      });

      title.addEventListener('click', () => {
        stopOthers();
        fadeIn(audio);
        audio.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        player.classList.add('active');
        currentAudio = audio;
        currentPlayer = player;
        moveTrackToTop(track);
      });
    });
  });

darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  darkModeBtn.classList.toggle('active');
});

globalVolume.addEventListener('input', () => {
  const volume = globalVolume.value;
  document.querySelectorAll('audio').forEach(audio => {
    audio.volume = volume;
  });
});

shuffleTopBtn.addEventListener('click', () => {
  const tracks = Array.from(trackList.children);
  const shuffled = tracks.sort(() => Math.random() - 0.5);

  if (currentAudio) {
    const activeTrack = currentAudio.closest('.track');
    const filtered = shuffled.filter(t => t !== activeTrack);
    trackList.innerHTML = '';
    trackList.appendChild(activeTrack);
    filtered.forEach(track => trackList.appendChild(track));
  } else {
    trackList.innerHTML = '';
    shuffled.forEach(track => trackList.appendChild(track));
  }

  shuffleTopBtn.classList.add('active');
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll('.track').forEach(track => {
    const name = track.getAttribute('data-name').toLowerCase();
    track.style.display = name.includes(query) ? '' : 'none';
  });
});

function stopOthers() {
  document.querySelectorAll('audio').forEach(a => {
    a.pause();
    a.currentTime = 0;
  });
  document.querySelectorAll('.player').forEach(p => {
    p.classList.remove('active');
  });
  document.querySelectorAll('.controls button:nth-child(2)').forEach(btn => {
    btn.innerHTML = '<i class="fas fa-play"></i>';
  });
}

function fadeIn(audio) {
  audio.volume = 0;
  let vol = 0;
  const target = parseFloat(globalVolume.value);
  const step = target / 30;
  const interval = setInterval(() => {
    vol += step;
    if (vol >= target) {
      audio.volume = target;
      clearInterval(interval);
    } else {
      audio.volume = vol;
    }
  }, 100);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function moveTrackToTop(track) {
  if (trackList.contains(track)) {
    trackList.removeChild(track);
    trackList.insertBefore(track, trackList.firstChild);
  }
}
