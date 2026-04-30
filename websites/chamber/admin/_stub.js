/* Lightweight admin stub-page builder used by minor admin sections.
   Each calls AdminStub.render({ active, title, sub, body }). */
window.AdminStub = {
  render({ active, title, sub, body }) {
    document.body.innerHTML = `
      <div class="admin-shell">
        <div data-admin="side"></div>
        <main class="admin-main">
          <div data-admin="top"></div>
          <div class="admin-content">
            <div class="admin-page-head">
              <div><div class="admin-page-head__sub">${sub}</div><h1>${title}</h1></div>
            </div>
            ${body}
          </div>
        </main>
      </div>
      <div data-admin="ai"></div>`;
    AdminShell.mount({ active });
  }
};
