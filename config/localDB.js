const { connect } = require("mongoose");
const { env } = require("process");

// console.log("env >>>>>>>>>>>", env);

exports.localDB = () => {
  connect(env.LOCAL_MONGO_URI)
    .then((e) => console.log(`Connected to database: ${e.connections[0].host}`))
    .catch((err) => {
      console.error(`Error: ${err}`);
      process.exit();
    });
};
