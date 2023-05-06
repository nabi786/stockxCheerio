const express = require("express");
const app = express();
const PORT = 3000 || process.env.PORT;
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// routes Ends

app.use("/api/", require("./routes/products"));

// main routes
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Stockx Backnd working successfully" });
});

// page not found route
app.get("*", (req, res) => {
  res.status(404).json({ msg: "page not found" });
});

app.listen(PORT, () => {
  console.log(`server started successfully on PORT Number ${PORT}`);
});
