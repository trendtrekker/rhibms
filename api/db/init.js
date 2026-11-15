// Schema initialization runs from the repository's db:init command.
module.exports = function handler(req, res) {
  return res.status(404).json({ success: false, error: 'Not found.' });
};
