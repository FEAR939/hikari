export function Toggle(callback) {
  const toggle = document.createElement("div");
  toggle.className = "h-4 min-w-8 rounded-full bg-neutral-800";

  const toggleNob = document.createElement("div");
  toggleNob.className =
    "w-4 h-4 rounded-full bg-white transition-transform duration-300";

  toggle.appendChild(toggleNob);

  let toggleState = false;

  toggle.addEventListener("click", () => {
    toggleState = !toggleState;
    toggleNob.style.transform = toggleState
      ? "translateX(100%)"
      : "translateX(0)";
    callback(toggleState);
  });

  toggle.setState = (state: boolean) => {
    toggleState = state;
    toggleNob.style.transform = toggleState
      ? "translateX(100%)"
      : "translateX(0)";
  };

  toggle.getState = () => toggleState;

  return toggle;
}
