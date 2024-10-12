const path = require('path');

exports.getAdminPanel = async (req, res) => {
    res.sendFile(path.join(__dirname, '../public/adminpanel.html'));
}