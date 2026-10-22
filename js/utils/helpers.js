export const $ = (selector) => document.querySelector(selector);

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const esc = (value) =>
  String(value == null ? "" : value).replace(
    /[&<>"]/g,
    (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[c])
  );

export const val = (id) => ($( "#" + id) || { value: "" }).value.trim();

export function armed(button, fn) {
  if (button.dataset.a) {
    fn();
    return;
  }

  button.dataset.a = "1";
  button.dataset.o = button.textContent;
  button.textContent = "Pakka? Dobara dabao";

  setTimeout(() => {
    button.dataset.a = "";
    button.textContent = button.dataset.o;
  }, 3000);
}
