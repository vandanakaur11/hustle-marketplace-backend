const cors = require("cors");
const express = require("express");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const createHttpError = require("http-errors");
const path = require("path");

const app = express();

// Middlewares
app.use(
  session({
    secret: "secretforhustlemarketplace",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 604800000 }, // cookie expire after 7 days
  })
);

// Setup Cors
const corsOption = {
  origin: "*",
  methods: "GET,POST,PUT,PATCH,DELETE",
};

app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup for file uploading
app.use(
  fileUpload({
    debug: true,
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "./tmp"),
  })
);

// Public access for uploads folder
app.use(express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    message: "Hello From Express App...",
  });
});

// Setup routes
app.use("/api/v1/categories", require("./routes/categoryRoutes"));
app.use("/api/v1/roles", require("./routes/roleRoutes"));
app.use("/api/v1/sub-categories", require("./routes/subCategoryRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));

// Error handling for unknown routes
app.use(() => {
  throw createHttpError(404, "Route not found!");
});

const errorHandler = (err, req, res, next) => {
  console.log(err.message, err.statusCode);

  if (res.headersSent) return next(err);

  res
    .status(err.statusCode || 500)
    .json({ message: err.message || "An Unknown Error!" });
};

app.use(errorHandler);

module.exports = app;
