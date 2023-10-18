/*
  CommonJS module for log4js
  DO not import this module; it wont work
 */

const { createWriteStream } = require('node:fs');

// Generates an appender function
const TTYAppender = (layout, device) => {
  const tty = createWriteStream(device);
  // This is the appender function itself
  return (loggingEvent) => {
    tty.write(`${layout(loggingEvent)}\n`);
  };
}

const configure = (config, layouts) =>  {
  // the default layout for the appender
  let layout = layouts['console_layout'];
  // check if there is another layout specified
  if (config.layout) {
    // load the layout
    layout = layouts.layout(config.layout.type, config.layout);
  }
  //create a new appender instance
  return TTYAppender(layout, config.device);
}

module.exports.configure = configure
