const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const musicFolder = 'music/', trackList = $('#trackList');
const [searchInput, darkModeBtn, globalVolume, shuffleTopBtn] = ['#searchInput', '#darkModeBtn', '#globalVolume', '#shuffleTopBtn'].map($);

let currentAudio = null, currentPlayer = null, currentTrack = null, shouldRestartOnPlay = false;
const bottomPlayer = $('#bottomPlayer');
bottomPlayer.innerHTML = `
  <div class="bp-title"></div>
  <div class="bp-controls">
    <button class="bp-prev"><i class="fas fa-backward"></i></button>
    <button class="bp-play"><i class="fas fa-play"></i></button>
    <button class="bp-next"><i class="fas fa-forward"></i></button>
  </div>
  <div class="bp-progress">
    <span class="bp-current">0:00</span>
    <input type="range" class="bp-seek" value="0" min="0" step="1">
    <span class="bp-total">0:00</span>
  </div>
`;

function formatTime(s){let m=Math.floor(s/60),sec=Math.floor(s%60);return`${m}:${sec<10?'0':''}${sec}`;}
function fadeIn(audio){
  audio.volume=0; let v=0, t=parseFloat(globalVolume.value), step=t/30;
  let i = setInterval(()=>{v+=step;if(v>=t){audio.volume=t;clearInterval(i)}else audio.volume=v},100);
}
function stopAll(){
  $$('.track audio').forEach(a=>{a.pause();a.currentTime=0});
  $$('.player').forEach(p=>p.classList.remove('active'));
  $$('.controls button:nth-child(2)').forEach(btn=>btn.innerHTML='<i class="fas fa-play"></i>');
}

function moveTrackToTop(track){if(trackList.contains(track)){trackList.removeChild(track);trackList.insertBefore(track,trackList.firstChild)}}

function updateTrackUI(track, audio) {
  const playBtn = track.querySelector('.controls button:nth-child(2)');
  playBtn.innerHTML = audio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
  track.querySelector('.player').classList.toggle('active', !audio.paused);
}
function updateBottomPlayer(track, audio) {
  bottomPlayer.querySelector('.bp-title').textContent = track.dataset.name;
  bottomPlayer.querySelector('.bp-seek').max = Math.floor(audio.duration || 0);
  bottomPlayer.querySelector('.bp-total').textContent = formatTime(audio.duration || 0);
  bottomPlayer.querySelector('.bp-current').textContent = formatTime(audio.currentTime || 0);
  bottomPlayer.querySelector('.bp-play').innerHTML = audio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
  bottomPlayer.classList.add('active');
}
function hideBottomPlayer() { bottomPlayer.classList.remove('active'); }

fetch('songs.json').then(r=>r.json()).then(files=>{
  files.forEach((file,i)=>{
    const name = file.replace('.mp3','').replace(/_/g,' '), track = document.createElement('div');
    track.className = 'track'; track.dataset.name = name;
    track.innerHTML = `
      <div class="name">${name}</div>
      <div class="player">
        <div class="progress">
          <span>0:00</span>
          <input type="range" value="0" min="0" step="1" class="custom-seek">
          <span>0:00</span>
        </div>
        <div class="controls">
          <button><i class="fas fa-backward"></i></button>
          <button><i class="fas fa-play"></i></button>
          <button><i class="fas fa-forward"></i></button>
          <button><i class="fas fa-repeat"></i></button>
          <button><i class="fas fa-random"></i></button>
        </div>
      </div>
      <audio src="${musicFolder}${file}" preload="metadata"></audio>`;
    trackList.appendChild(track);

    const [title, player, audio] = [track.querySelector('.name'), track.querySelector('.player'), track.querySelector('audio')];
    const [progress, controls] = [player.querySelector('.progress'), player.querySelector('.controls')];
    const [currentTime, seekBar, totalTime] = [progress.children[0], progress.children[1], progress.children[2]];
    const [prevBtn, playPauseBtn, nextBtn, loopBtn, shuffleBtn] = controls.children;

    // Track click seek/play
    track.addEventListener('click', e => {
      // Allow only if not clicking controls or progress bar
      if (
        e.target.tagName === 'BUTTON' || e.target.tagName === 'I' ||
        e.target === seekBar
      ) return;
      const rect = track.getBoundingClientRect(), x = e.clientX - rect.left;
      const percent = Math.min(1, Math.max(0, x / rect.width));
      if (audio.duration) audio.currentTime = audio.duration * percent;
      playAudio(track, audio, true);
    });

    // Progress bar seeking
    seekBar.addEventListener('input', () => { audio.currentTime = seekBar.value; });
    seekBar.addEventListener('mousedown', () => { audio.pause(); });
    seekBar.addEventListener('mouseup', () => { playAudio(track, audio, false); });

    // Audio events
    audio.onloadedmetadata = _ => { totalTime.textContent = formatTime(audio.duration); seekBar.max = Math.floor(audio.duration); };
    audio.ontimeupdate = _ => {
      seekBar.value = Math.floor(audio.currentTime);
      currentTime.textContent = formatTime(audio.currentTime);
      // Update sticky player if this track is playing
      if (audio === currentAudio) {
        bottomPlayer.querySelector('.bp-current').textContent = formatTime(audio.currentTime);
        bottomPlayer.querySelector('.bp-seek').value = Math.floor(audio.currentTime);
      }
    };

    playPauseBtn.onclick = () => playAudio(track, audio, false);
    loopBtn.onclick = _ => { audio.loop = !audio.loop; loopBtn.classList.toggle('active') };
    shuffleBtn.onclick = _ => playRandom();
    nextBtn.onclick = _ => playNext(track.nextElementSibling);
    prevBtn.onclick = _ => playNext(track.previousElementSibling);
    audio.onended = _ => playNext(track.nextElementSibling);
    title.onclick = playPauseBtn.onclick;

    // Bottom player controls
    bottomPlayer.querySelector('.bp-play').onclick = () => {
      if (currentAudio) {
        if (currentAudio.paused) {
          if (shouldRestartOnPlay) currentAudio.currentTime = 0;
          currentAudio.play();
          shouldRestartOnPlay = false;
        } else {
          currentAudio.pause();
          shouldRestartOnPlay = true;
        }
        updateBottomPlayer(currentTrack, currentAudio);
        updateTrackUI(currentTrack, currentAudio);
      }
    };
    bottomPlayer.querySelector('.bp-prev').onclick = () => {
      if (currentTrack && currentTrack.previousElementSibling)
        playAudio(currentTrack.previousElementSibling, currentTrack.previousElementSibling.querySelector('audio'), false);
    };
    bottomPlayer.querySelector('.bp-next').onclick = () => {
      if (currentTrack && currentTrack.nextElementSibling)
        playAudio(currentTrack.nextElementSibling, currentTrack.nextElementSibling.querySelector('audio'), false);
    };
    bottomPlayer.querySelector('.bp-seek').addEventListener('input', e => {
      if (currentAudio) currentAudio.currentTime = e.target.value;
    });

    function playAudio(track, audio, seekedByTrack) {
      stopAll();
      if (audio.paused || seekedByTrack) {
        if (shouldRestartOnPlay || seekedByTrack) audio.currentTime = seekedByTrack ? audio.currentTime : 0;
        fadeIn(audio);
        audio.play();
        shouldRestartOnPlay = false;
      } else {
        audio.pause();
        shouldRestartOnPlay = true;
      }
      updateTrackUI(track, audio);
      currentAudio = audio; currentPlayer = player; currentTrack = track;
      updateBottomPlayer(track, audio);
      moveTrackToTop(track);
    }
    function playNext(next) {
      if (!next) return;
      playAudio(next, next.querySelector('audio'), false);
    }
    function playRandom() {
      const tracks = Array.from($$('.track')), r = tracks[Math.floor(Math.random()*tracks.length)];
      playAudio(r, r.querySelector('audio'), false);
    }
  });
  hideBottomPlayer(); // Hide until first play
});

darkModeBtn.onclick = _ => { document.body.classList.toggle('dark'); darkModeBtn.classList.toggle('active') };
globalVolume.oninput = _ => $$('.track audio').forEach(a=>a.volume = globalVolume.value);
shuffleTopBtn.onclick = _ => {
  const tracks = Array.from(trackList.children), shuffled = tracks.sort(()=>Math.random()-.5);
  trackList.innerHTML = '';
  if (currentAudio) {
    const active = currentAudio.closest('.track'), rest = shuffled.filter(t=>t!==active);
    trackList.appendChild(active); rest.forEach(t=>trackList.appendChild(t));
  } else shuffled.forEach(t=>trackList.appendChild(t));
  shuffleTopBtn.classList.add('active');
};
searchInput.oninput = _ => {
  const q = searchInput.value.toLowerCase();
  $$('.track').forEach(t=>t.style.display = t.dataset.name.toLowerCase().includes(q)?'':'none');
};
