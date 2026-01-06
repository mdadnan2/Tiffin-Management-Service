module.exports = function (options, webpack) {
  return {
    ...options,
    output: {
      ...options.output,
      path: require('path').join(__dirname, 'dist'),
    },
  };
};
