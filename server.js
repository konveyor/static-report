const express = require("express");
const path = require("path");
const app = express(),
  bodyParser = require("body-parser");
const fs = require("fs");
// const setupProxy = require("./src/setupProxy");

const report_path = process.env.WINDUP_REPORT_PATH;

port = 8080;
buildDir = report_path;
// buildDir = path.join(__dirname, report_path);
// setupProxy(app);
expressInstance = express.static(buildDir, {
  extensions: ["json"],
});

app.use(bodyParser.json());
app.use(expressInstance);
app.use((req, res, next) => {
  const reqPath = req.path.endsWith("/") ? req.path.slice(0, -1) : req.path;
  const file = buildDir + reqPath + ".json";
  fs.stat(file, (errors, stats) => {
    if (stats) {
      res.sendFile(file);
    } else {
      next();
    }
  });
});

// Handles any requests that don't match the ones above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, `/${report_path}/index.html`));
});

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});
