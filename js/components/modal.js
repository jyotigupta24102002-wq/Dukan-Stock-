import { $ } from "../utils/helpers.js";

export function openModal(html) {
  $("#sheet").innerHTML = html;
  $("#modal").classList.add("show");
}

export function closeModal() {
  $("#modal").classList.remove("show");
}
