export function Toggle(callback) {
  const toggle = document.createElement("div");
  toggle.className =
    "h-4 min-w-8 w-8 max-w-8 rounded-full transition-background duration-150 bg-neutral-800";

  const toggleNob = document.createElement("div");
  toggleNob.className =
    "w-4 h-4 rounded-full bg-white transition-transform duration-150 translate-x-0";

  toggle.appendChild(toggleNob);

  let toggleState = false;

  function updateState() {
    if (toggleState) {
      toggle.className = toggle.className.replace(
        "bg-neutral-800",
        "bg-green-400",
      );
      toggleNob.className = toggleNob.className.replace(
        "translate-x-0",
        "translate-x-full",
      );
    } else {
      toggle.className = toggle.className.replace(
        "bg-green-400",
        "bg-neutral-800",
      );
      toggleNob.className = toggleNob.className.replace(
        "translate-x-full",
        "translate-x-0",
      );
    }
  }

  toggle.addEventListener("click", () => {
    toggleState = !toggleState;
    updateState();
    callback(toggleState);
  });

  toggle.setState = (state: boolean) => {
    toggleState = state;
    updateState();
  };

  toggle.getState = () => toggleState;

  return toggle;
}
