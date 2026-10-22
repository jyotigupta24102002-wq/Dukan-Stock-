export function initBottomNav(go) {
  document.querySelectorAll("#bottomNav button").forEach((button) => {
    button.addEventListener("click", () => go(button.dataset.t));
  });
}

export function updateBottomNav(tab, visible = true) {
  const nav = document.querySelector("#bottomNav");
  if (!nav) return;

  nav.style.display = visible ? "flex" : "none";

  nav.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("on", button.dataset.t === tab);
  });
}
