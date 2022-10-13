const dotenv = require("dotenv");
const logger = require("morgan");
const { env } = require("process");
const { localDB } = require("./config/localDB");
const { liveDB } = require("./config/liveDB");

dotenv.config({ path: "./config.env" });

// console.log("env >>>>>>>>", env);

const app = require("./app");

const runningEnvironment = env.NODE_ENV;

if (runningEnvironment === "development") {
  app.use(logger("dev"));

  // Connect to local database
  localDB();
} else {
  // Connect to live database
  liveDB();
}

const PORT = Number(env.PORT) || 5000;

app.listen(PORT, () =>
  console.log(`Server running in ${runningEnvironment} mode on port ${PORT}`)
);
