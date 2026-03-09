const fs = require("fs");
const path = require("path");

const LAYOUT_PLACEHOLDER = "<!-- LAYOUT -->";
const partialsDir = path.join(__dirname, "partials");
const layoutPath = path.join(partialsDir, "layout.html");
const templatePath = path.join(__dirname, "index.template.html");
const outputPath = path.join(__dirname, "index.html");

function build() {
  const layout = fs.readFileSync(layoutPath, "utf8");
  const template = fs.readFileSync(templatePath, "utf8");
  const output = template.replace(LAYOUT_PLACEHOLDER, layout);
  fs.writeFileSync(outputPath, output);
  const lineCount = output.split("\n").length;
  console.log("Built index.html from layout + template (" + lineCount + " lines)");
}

build();
