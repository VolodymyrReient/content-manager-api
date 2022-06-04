const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

const pathToFile = path.resolve("./data.json");
const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/resources", (req, res) => {
  const resources = getResources();

  res.send(resources);
});

app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;

  resource.createAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();

  resources.unshift(resource);

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file");
    }

    return res.send("Data has been saved!");
  });
});

app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const resource = resources.find((item) => item.id === id);

  res.send(resource);
});

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const resourceIndex = resources.findIndex((item) => item.id === id);
  const activeResource = resources.find((item) => item.status === "active");

  if (resources[resourceIndex].status === "complete") {
    return res
      .status(422)
      .send("Cannot update because resource has been completed");
  }

  resources[resourceIndex] = req.body;

  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("There is active resource already!");
    }

    resources[resourceIndex].status = "active";
    resources[resourceIndex].activationTime = new Date();
  }

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file");
    }

    return res.send("Data has been updated!");
  });
});

app.get("/api/active-resource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find((item) => item.status === "active");

  res.send(activeResource);
});

app.listen(PORT, () => {
  console.log("Server is listening on port: " + PORT);
});
