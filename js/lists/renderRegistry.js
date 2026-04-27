var renderRegistry = {
  "prev-builds": function(_props, f) {
    return `
      <div class="panel-hero">${f("field-main-image", "hero")}</div>
      <h3><a href="${f("node-url")}" target="_blank">${f("node-title") || "Building"}</a></h3>
      <hr/>
      ${f()}
    `;
  },
  "curr-builds": function(_props, f) {
    return `
      <div class="panel-hero">${f("field-main-image", "hero")}</div>
      <h3><a href="${f("node-url")}" target="_blank">${f("node-title") || "Building"}</a></h3>
      <hr/>
      ${f()}
    `;
  },
};
