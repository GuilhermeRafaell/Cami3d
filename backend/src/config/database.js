const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Opções de conexão recomendadas
      maxPoolSize: 10, // Máximo de 10 conexões no pool
      serverSelectionTimeoutMS: 5000, // Timeout para seleção do servidor
      socketTimeoutMS: 45000, // Timeout para operações de socket
      family: 4 // Usar IPv4, pular tentativas IPv6
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Event listeners para monitoramento da conexão
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
