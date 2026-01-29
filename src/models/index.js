// Central export for all models
const User = require('./User');
const Story = require('./Story');
const Comment = require('./Comment');
const Vote = require('./Vote');
const Report = require('./Report');
const SystemSetting = require('./SystemSetting');

module.exports = {
    User,
    Story,
    Comment,
    Vote,
    Report,
    SystemSetting
};
