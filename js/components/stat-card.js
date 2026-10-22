export function statCard(label, value, extraClass = "") {
  return `
    <div class="stat">
      <span class="muted">${label}</span>
      <b class="${extraClass}">${value}</b>
    </div>
  `;
}
