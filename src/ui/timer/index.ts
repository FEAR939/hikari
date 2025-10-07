export function Timer(
  label: string,
  duration: number,
  onCancelCallback: () => any,
) {
  const timer = document.createElement("div");
  timer.className =
    "relative h-10 w-full outline-1 outline-[#1a1a1a] rounded-md flex items-center justify-center";

  const timerProgress = document.createElement("div");
  timerProgress.className = "absolute left-0 h-full bg-[#1a1a1a] rounded-md";
  timerProgress.style.width = "0%";

  const timerLabel = document.createElement("div");
  timerLabel.className = "absolute";
  timerLabel.textContent = label;

  const timerCancel = document.createElement("div");
  timerCancel.className = "absolute right-2 size-5 cursor-pointer";
  timerCancel.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x size-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  `;

  timerCancel.addEventListener("click", () => {
    timer.remove();
    onCancelCallback();
  });

  timer.appendChild(timerProgress);
  timer.appendChild(timerLabel);
  timer.appendChild(timerCancel);

  function start() {
    timerProgress.offsetWidth;
    timerProgress.style.transition = `width ${duration}s linear`;
    timerProgress.style.width = "100%";
    setTimeout(() => {
      if (!timer) return;
      timer.remove();
    }, duration * 1000);
  }

  timer.start = start;

  return timer;
}
