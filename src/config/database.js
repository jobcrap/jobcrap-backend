const mongoose = require('mongoose')
const config = require('./index')

const connectDB = async (retryCount = 0) => {
  const maxRetries = 5
  const retryDelay = Math.min(5000 * Math.pow(2, retryCount), 30000) // Exponential backoff, max 30s

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 30000, // 30 seconds connection timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
      retryReads: true,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB')
    })

    mongoose.connection.on('error', (err) => {
      console.error(`Mongoose connection error: ${err}`)
    })

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB')
      // Attempt to reconnect
      if (retryCount < maxRetries) {
        console.log(
          `Attempting to reconnect... (${retryCount + 1}/${maxRetries})`
        )
        setTimeout(() => connectDB(retryCount + 1), retryDelay)
      }
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      console.log('Mongoose connection closed due to app termination')
      process.exit(0)
    })

    return conn
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    console.error(
      `Connection string: ${config.mongoUri.replace(/:[^:@]+@/, ':****@')}`
    ) // Hide password in logs

    if (retryCount < maxRetries) {
      console.log(
        `Retrying connection in ${retryDelay / 1000} seconds... (${
          retryCount + 1
        }/${maxRetries})`
      )
      setTimeout(() => connectDB(retryCount + 1), retryDelay)
    } else {
      console.error(
        '❌ Max retry attempts reached. Please check your MongoDB connection settings.'
      )
      console.error('Common issues:')
      console.error('1. Check if your IP is whitelisted in MongoDB Atlas')
      console.error('2. Verify your connection string is correct')
      console.error('3. Check your network/firewall settings')
      console.error('4. Ensure MongoDB Atlas cluster is running')
      process.exit(1)
    }
  }
}

module.exports = connectDB
