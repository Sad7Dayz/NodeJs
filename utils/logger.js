const { createLogger, format, transports } = require("winston");
require("winston-mongodb");

const logger = createLogger({
  transports: [
    new transports.Console({
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: "server-info.log",
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.MongoDB({
      level: "error",
      db: process.env.MONGO_URI,
      options: {
        useunifiedTopology: true,
      },
      collection: "serverdata",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = logger;
