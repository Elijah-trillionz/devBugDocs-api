const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`db connected to ${dbConnection.connection.host}`);
  } catch (err) {
    console.log(err)
    process.exit(1);
  }
};

module.exports = connectDB;
