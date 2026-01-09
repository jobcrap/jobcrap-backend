// Application Constants

const STORY_CATEGORIES = [
  'dark', 'funny', 'scary', 'heartbreaking', 'heartwarming', 'absurd', 'unbelievable', 'disgusting', 'spicy', 'other'
];

const TRIGGER_WARNINGS = ['violence', 'trauma', 'nudity', 'mental_health', 'discrimination', 'substance_abuse'];

const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

const AUTH_PROVIDERS = {
  LOCAL: 'local',
  FIREBASE: 'firebase',
  GOOGLE: 'google',
  INSTAGRAM: 'instagram'
};

const VOTE_TYPES = {
  UPVOTE: 'upvote',
  DOWNVOTE: 'downvote'
};

const REPORT_STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

const LIMITS = {
  STORY_TEXT_MIN: 1,
  STORY_TEXT_MAX: 700,
  STORY_SENTENCES_MAX: 7,
  COMMENT_TEXT_MAX: 500,
  PROFESSION_MAX: 100,
  SHARE_ID_LENGTH: 10
};

module.exports = {
  STORY_CATEGORIES,
  TRIGGER_WARNINGS,
  USER_ROLES,
  AUTH_PROVIDERS,
  VOTE_TYPES,
  REPORT_STATUS,
  PAGINATION,
  LIMITS
};
