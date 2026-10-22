export function emptyState(icon, message, action = "") {
  return `
    <div class="empty">
      <div class="ico">${icon}</div>
      <p>${message}</p>
      ${action}
    </div>
  `;
}
