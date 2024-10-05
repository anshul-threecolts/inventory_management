const connection = require('./db-connection.js');
const bcrypt = require('bcryptjs');

// Add User
exports.addUser = (req, res) => {
    const { first_name, last_name, mobile_number, email, password, role, permission } = req.body;
    if (!first_name || !last_name || !mobile_number || !email || !password || !role || !permission) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const checkUserQuery = 'SELECT email FROM users WHERE email = ? AND status = ?';
    connection.db.execute(checkUserQuery, [email, 'ACTIVE'], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }
        const insertUserQuery = 'INSERT INTO users (first_name, last_name, mobile_number, email, password, role, created_at, status, permission) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)';
        const hashedPassword = bcrypt.hashSync(password, 8);
        connection.db.execute(insertUserQuery, [first_name, last_name, mobile_number, email, hashedPassword, role, 'ACTIVE', permission], (err, results) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ success: false, message: 'Error registering user' });
            }

            res.status(201).json({ success: true, message: 'User registered successfully' });
        });
    });
}

// Get active users list
exports.getUserList = (req, res) => {
    let { page, keyword, date_from, date_to } = req.query;

    const limit = 10;
    page = page ? parseInt(page, 10) : 1;

    if (isNaN(page) || page < 1) {
        return res.status(400).json({ success: false, message: 'Invalid page value' });
    }

    const offset = (page - 1) * limit;

    let query = `
        SELECT id, first_name, last_name, CONCAT(first_name, ' ', last_name) AS name, mobile_number, email, role, permission, created_at
        FROM users 
        WHERE status = 'ACTIVE' AND isCustomer = false`;

    if (date_from && date_to) {
        query += ` AND  DATE(created_at) between DATE('${date_from}') AND DATE('${date_to}') `;
    } else if (date_from) {
        query += ` AND  DATE(created_at) >= DATE('${date_from}') `;
    } else if (date_to) {
        query += ` AND  DATE(created_at) <= DATE('${date_to}') `;
    }

    let countQuery = `SELECT COUNT(*) AS total FROM users WHERE status = 'ACTIVE' AND isCustomer = false`;

    if (date_from && date_to) {
        countQuery += ` AND  DATE(created_at) between DATE('${date_from}') AND DATE('${date_to}') `;
    } else if (date_from) {
        countQuery += ` AND  DATE(created_at) >= DATE('${date_from}') `;
    } else if (date_to) {
        countQuery += ` AND  DATE(created_at) <= DATE('${date_to}') `;
    }

    let queryParams = [];
    let countParams = [];

    if (keyword) {
        query += ` AND (CONCAT(first_name, ' ', last_name) LIKE ? OR email LIKE ?)`;
        countQuery += ` AND (CONCAT(first_name, ' ', last_name) LIKE ? OR email LIKE ?)`;
        queryParams.push(`%${keyword}%`, `%${keyword}%`);
        countParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    connection.db.execute(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        connection.db.execute(countQuery, countParams, (err, countResults) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database query error' });
            }

            const totalRecords = countResults[0].total;
            const totalPages = Math.ceil(totalRecords / limit);

            res.status(200).json({
                success: true,
                data: results,
                pagination: {
                    totalRecords,
                    totalPages,
                    currentPage: page,
                    pageSize: limit,
                },
            });
        });
    });
}

// Update active user
exports.updateUser = (req, res) => {
    const { userId } = req.params;
    const { first_name, last_name, mobile_number, email, role, permission, password } = req.body;

    if (!first_name || !last_name || !mobile_number || !email || !role || !permission) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const updateFields = [];
    const queryParams = [];

    if (first_name) {
        updateFields.push('first_name = ?');
        queryParams.push(first_name);
    }
    if (last_name) {
        updateFields.push('last_name = ?');
        queryParams.push(last_name);
    }
    if (mobile_number) {
        updateFields.push('mobile_number = ?');
        queryParams.push(mobile_number);
    }
    if (email) {
        updateFields.push('email = ?');
        queryParams.push(email);
    }
    if (role) {
        updateFields.push('role = ?');
        queryParams.push(role);
    }
    if (permission) {
        updateFields.push('permission = ?');
        queryParams.push(permission);
    }
    if (password && password.length > 0) {
        updateFields.push('password = ?');
        const hashedPassword = bcrypt.hashSync(password, 8);
        queryParams.push(hashedPassword);
    }

    queryParams.push(userId);

    if (updateFields.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const updateUserQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = ?`;

    connection.db.execute(updateUserQuery, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User updated successfully' });
    });
}

// Delete user endpoint
exports.deletUser = (req, res) => {
    const { userId } = req.params;

    const deleteUserQuery = `UPDATE users SET status = 'DELETED' WHERE id = ?`;

    connection.db.execute(deleteUserQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ success: false, message: 'Error deleting user' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    });
}

