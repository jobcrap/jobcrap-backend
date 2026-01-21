const { User, Story, Comment, Vote } = require('../models')
const { AUTH_PROVIDERS } = require('../constants')

/**
 * Create a new user
 */
exports.createUser = async (userData) => {
  const user = await User.create(userData)
  return await User.findById(user._id).populate('storiesCount')
}

/**
 * Authenticate user
 */
exports.authenticateUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid credentials')
  }

  return await User.findById(user._id).populate('storiesCount')
}

/**
 * Get user by ID
 */
exports.getUserById = async (id) => {
  const user = await User.findById(id).populate('storiesCount')
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

/**
 * Get user by Firebase UID
 */
exports.getUserByFirebaseUid = async (firebaseUid) => {
  return await User.findOne({ firebaseUid })
}

/**
 * Sync Firebase User with MongoDB
 */
exports.syncFirebaseUser = async (decodedToken) => {
  try {
    // Extract data from Firebase decoded token
    const uid = decodedToken.uid
    const email = decodedToken.email
    const name = decodedToken.name || decodedToken.display_name || null
    const picture = decodedToken.picture || decodedToken.photoURL || null

    // Firebase sign-in provider detection
    // Firebase token structure: firebase.sign_in_provider contains values like 'google.com', 'password', etc.
    let firebaseProvider = decodedToken.firebase?.sign_in_provider

    // Fallback: check firebase.identities to determine provider
    if (!firebaseProvider && decodedToken.firebase?.identities) {
      const identities = decodedToken.firebase.identities
      if (identities['google.com']) {
        firebaseProvider = 'google.com'
      } else if (identities['instagram.com']) {
        firebaseProvider = 'instagram.com'
      } else if (identities['password']) {
        firebaseProvider = 'password'
      }
    }

    // Final fallback
    if (!firebaseProvider) {
      firebaseProvider = decodedToken.iss?.includes('google')
        ? 'google.com'
        : 'password'
    }

    // Map Firebase provider IDs to our enum values
    let providerId = AUTH_PROVIDERS.FIREBASE // default
    if (firebaseProvider === 'google.com') {
      providerId = AUTH_PROVIDERS.GOOGLE
    } else if (firebaseProvider === 'instagram.com') {
      providerId = AUTH_PROVIDERS.INSTAGRAM
    } else if (firebaseProvider === 'password') {
      providerId = AUTH_PROVIDERS.LOCAL
    } else {
      providerId = AUTH_PROVIDERS.FIREBASE
    }

    let user = await User.findOne({ firebaseUid: uid })

    if (!user) {
      // Check if user exists with same email but no UID (from old local auth)
      const existingEmailUser = await User.findOne({ email: email })
      if (existingEmailUser) {
        existingEmailUser.firebaseUid = uid
        // Fix invalid authProvider if it exists
        if (
          existingEmailUser.authProvider === 'google.com' ||
          !Object.values(AUTH_PROVIDERS).includes(
            existingEmailUser.authProvider
          )
        ) {
          existingEmailUser.authProvider = providerId
        } else if (existingEmailUser.authProvider === AUTH_PROVIDERS.LOCAL) {
          existingEmailUser.authProvider = providerId
        }
        await existingEmailUser.save()
        return existingEmailUser
      }

      // Generate username from email if name not available
      const username = name || email.split('@')[0]

      // Create new MongoDB user record linked to Firebase
      user = await User.create({
        firebaseUid: uid,
        email: email,
        username: username,
        avatar:
          picture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        authProvider: providerId,
      })
    } else {
      // Fix invalid authProvider if it exists
      if (
        user.authProvider === 'google.com' ||
        !Object.values(AUTH_PROVIDERS).includes(user.authProvider)
      ) {
        user.authProvider = providerId
      }

      // Update profile picture if missing or changed
      if (
        picture &&
        (!user.avatar ||
          user.avatar ===
          'https://cdn-icons-png.flaticon.com/512/149/149071.png')
      ) {
        user.avatar = picture
      }

      await user.save()
    }

    return await User.findById(user._id).populate('storiesCount')
  } catch (error) {
    console.error('Sync Error:', error.message)
    throw error
  }
}

/**
 * Update user profile
 */
exports.updateUserProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).populate('storiesCount')
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

/**
 * Get user statistics
 */
exports.getUserStats = async (userId) => {
  return await User.findById(userId)
}

/**
 * Fix users with invalid authProvider values
 * This is a utility function to migrate existing data
 */
exports.fixInvalidAuthProviders = async () => {
  const { AUTH_PROVIDERS } = require('../constants')
  const validProviders = Object.values(AUTH_PROVIDERS)

  // Find all users with invalid authProvider
  const users = await User.find({
    authProvider: { $nin: validProviders },
  })

  console.log(`Found ${users.length} users with invalid authProvider values`)

  for (const user of users) {
    let newProvider = AUTH_PROVIDERS.FIREBASE // default

    // Map common invalid values
    if (user.authProvider === 'google.com') {
      newProvider = AUTH_PROVIDERS.GOOGLE
    } else if (user.authProvider === 'instagram.com') {
      newProvider = AUTH_PROVIDERS.INSTAGRAM
    } else if (user.authProvider === 'password' || !user.firebaseUid) {
      newProvider = AUTH_PROVIDERS.LOCAL
    }

    user.authProvider = newProvider
    await user.save()
    console.log(
      `Fixed user ${user.email}: ${user.authProvider} -> ${newProvider}`
    )
  }

  return users.length
}

/**
 * Schedule account deletion (30-day grace period)
 */
exports.scheduleAccountDeletion = async (userId) => {
  const deletionDate = new Date()
  deletionDate.setDate(deletionDate.getDate() + 30)

  const user = await User.findByIdAndUpdate(
    userId,
    {
      isDeletionPending: true,
      deletionScheduledAt: deletionDate,
    },
    { new: true }
  ).populate('storiesCount')

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

/**
 * Cancel account deletion
 */
exports.cancelAccountDeletion = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isDeletionPending: false,
      deletionScheduledAt: null,
    },
    { new: true }
  ).populate('storiesCount')

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

/**
 * Permanently delete user and all associated data
 */
exports.deleteAccountPermanently = async (userId) => {
  // 1. Find all stories by this user
  const userStories = await Story.find({ author: userId });
  const storyIds = userStories.map(s => s._id);

  // 2. Delete all votes cast by user OR on user's stories
  await Vote.deleteMany({
    $or: [
      { user: userId },
      { story: { $in: storyIds } }
    ]
  });

  // 3. Delete all comments authored by user OR on user's stories
  await Comment.deleteMany({
    $or: [
      { author: userId },
      { story: { $in: storyIds } }
    ]
  });

  // 4. Delete all stories by user
  await Story.deleteMany({ author: userId });

  // 5. Delete the user account
  const user = await User.findByIdAndDelete(userId);

  return user;
};

/**
 * Process all pending deletions that have reached their scheduled date
 */
exports.processPendingDeletions = async () => {
  const now = new Date()
  const usersToDelete = await User.find({
    isDeletionPending: true,
    deletionScheduledAt: { $lte: now },
  })

  if (usersToDelete.length > 0) {
    console.log(`Processing permanent deletion for ${usersToDelete.length} users`)
  }

  for (const user of usersToDelete) {
    try {
      await this.deleteAccountPermanently(user._id)
      console.log(`Permanently deleted user: ${user.email}`)
    } catch (error) {
      console.error(`Failed to delete user ${user.email}:`, error.message)
    }
  }

  return usersToDelete.length
}
