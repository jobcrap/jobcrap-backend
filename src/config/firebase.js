const admin = require('firebase-admin')
const config = require('./index')

// Initialize Firebase Admin
// In production, use service account JSON file path or environment variables
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    if (!privateKey) {
      throw new Error(
        'FIREBASE_PRIVATE_KEY is not set in environment variables'
      )
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle both escaped newlines (\n) and actual newlines
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
    console.log('✅ Firebase Admin Initialized')
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error.message)
    throw error
  }
}

module.exports = admin
