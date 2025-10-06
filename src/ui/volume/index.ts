export function Volume(video) {
  const volumeIcons = {
    high: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2-icon lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>`,
    mid: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume1-icon lucide-volume-1"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/></svg>`,
    low: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-icon lucide-volume"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/></svg>`,
    off: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-off-icon lucide-volume-off"><path d="M16 9a5 5 0 0 1 .95 2.293"/><path d="M19.364 5.636a9 9 0 0 1 1.889 9.96"/><path d="m2 2 20 20"/><path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"/><path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686"/></svg>`,
  };

  const volumeArea = document.createElement("div");
  volumeArea.className = "group flex items-center space-x-2 px-1";

  const volumebutton = document.createElement("div");
  volumebutton.className =
    "flex items-center justify-center size-5 cursor-pointer";

  const volumeSlider = document.createElement("div");
  volumeSlider.className =
    "relative flex items-center h-0.75 w-0 group-hover:w-16 bg-neutral-700 rounded-full cursor-pointer transition-all duration-300";

  const volumeProgress = document.createElement("div");
  volumeProgress.className = "h-full bg-white rounded-full";

  const volumeHandle = document.createElement("div");
  volumeHandle.className =
    "absolute w-2.25 h-2.25 bg-white rounded-full hidden group-hover:block";

  volumeSlider.appendChild(volumeProgress);
  volumeSlider.appendChild(volumeHandle);
  volumeArea.appendChild(volumebutton);
  volumeArea.appendChild(volumeSlider);

  function updateVolumeUI(volume: number) {
    volume = Math.max(0, Math.min(1, volume));
    volumeProgress.style.width = `${volume * 100}%`;
    volumeHandle.style.left = `${volume * 100}%`;
    volumeHandle.style.transform = `translateX(-50%)`;

    if (volume === 0.0) {
      volumebutton.innerHTML = volumeIcons.off;
    } else if (volume < 0.25) {
      volumebutton.innerHTML = volumeIcons.low;
    } else if (volume < 0.75) {
      volumebutton.innerHTML = volumeIcons.mid;
    } else {
      volumebutton.innerHTML = volumeIcons.high;
    }
  }

  volumeSlider.addEventListener("click", (event) => {
    const rect = volumeSlider.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const volume = offsetX / rect.width;
    video.volume = volume;
  });

  let isDraggingVolume = false;

  volumeSlider.addEventListener("mousedown", (event) => {
    isDraggingVolume = true;
    const rect = volumeSlider.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const volume = offsetX / rect.width;
    updateVolumeUI(volume);
  });

  document.addEventListener("mousemove", (event) => {
    if (isDraggingVolume) {
      const rect = volumeSlider.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const volume = offsetX / rect.width;
      updateVolumeUI(volume);
    }
  });

  document.addEventListener("mouseup", () => {
    localStorage.setItem("player_volume", (video.volume * 100).toString());
    isDraggingVolume = false;
  });

  video.addEventListener("volumechange", () => {
    const volume = parseFloat(video.volume.toFixed(2));
    console.log(volume);
    updateVolumeUI(volume);
  });

  if (localStorage.getItem("player_volume") === null) {
    localStorage.setItem("player_volume", "100");
  }

  const savedVolume =
    parseInt(localStorage.getItem("player_volume") || "100") / 100;
  video.volume = savedVolume;

  updateVolumeUI(savedVolume);

  return volumeArea;
}
