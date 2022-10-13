const { connect } = require("mongoose");
const { env } = require("process");

// console.log("env >>>>>>>>>>>", env);

exports.liveDB = () => {
  connect(env.MONGO_URI)
    .then((e) => console.log(`Connected to database: ${e.connections[0].host}`))
    .catch((err) => {
      console.error(`Error: ${err}`);
      process.exit();
    });
};
