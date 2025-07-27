const runInContainer = require("./runInContainer");

const runSandbox = async (language, code) => {
  try {
    const result = await runInContainer({ language, code });
    return result;
  } catch (error) {
    return {
      success: false,
      output: error.message,
    };
  }
};

module.exports = runSandbox;