-- Create users table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
);

-- Sample data (optional, for development)
-- INSERT INTO users (username, email, created_at, updated_at)
-- VALUES
--     ('john_doe', 'john@example.com', GETDATE(), GETDATE()),
--     ('jane_smith', 'jane@example.com', GETDATE(), GETDATE());
