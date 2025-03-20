import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codestake';

console.log('Testing MongoDB connection to:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    
    // Test creating a document in a collection
    const TestModel = mongoose.model('TestConnection', new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    }));
    
    return TestModel.create({ name: 'Test Connection ' + new Date().toISOString() });
  })
  .then(doc => {
    console.log('✅ Successfully created test document:', doc);
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('✅ Connection closed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }); 