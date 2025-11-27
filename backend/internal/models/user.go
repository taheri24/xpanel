package models

import (
	"context"
	"log/slog"
	"time"

	"github.com/taheri24/xpanel/backend/internal/database"
	"go.uber.org/fx"
)

type User struct {
	ID        int       `db:"id" json:"id" example:"1" description:"User ID"`
	Username  string    `db:"username" json:"username" example:"john_doe" description:"Username"`
	Email     string    `db:"email" json:"email" example:"john@example.com" description:"Email address"`
	CreatedAt time.Time `db:"created_at" json:"created_at" description:"Creation timestamp"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at" description:"Last update timestamp"`
}

type UserRepository struct {
	db *database.DB
}

func NewUserRepository(db *database.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetAll(ctx context.Context) ([]User, error) {
	var users []User
	query := `SELECT id, username, email, created_at, updated_at FROM users`

	err := r.db.SelectContext(ctx, &users, query)
	if err != nil {
		slog.Error("Failed to get all users", "error", err)
		return nil, err
	}

	slog.Info("Retrieved users", "count", len(users))
	return users, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id int) (*User, error) {
	var user User
	query := `SELECT id, username, email, created_at, updated_at FROM users WHERE id = @p1`

	err := r.db.GetContext(ctx, &user, query, id)
	if err != nil {
		slog.Error("Failed to get user by ID", "id", id, "error", err)
		return nil, err
	}

	slog.Info("Retrieved user", "id", id, "username", user.Username)
	return &user, nil
}

func (r *UserRepository) Create(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (username, email, created_at, updated_at)
		VALUES (@p1, @p2, @p3, @p4);
		SELECT SCOPE_IDENTITY();
	`

	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	var id int
	err := r.db.GetContext(ctx, &id, query, user.Username, user.Email, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		slog.Error("Failed to create user", "username", user.Username, "error", err)
		return err
	}

	user.ID = id
	slog.Info("User created successfully", "id", user.ID, "username", user.Username)
	return nil
}

func (r *UserRepository) Update(ctx context.Context, user *User) error {
	query := `
		UPDATE users
		SET username = @p1, email = @p2, updated_at = @p3
		WHERE id = @p4
	`

	user.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(ctx, query, user.Username, user.Email, user.UpdatedAt, user.ID)
	if err != nil {
		slog.Error("Failed to update user", "id", user.ID, "error", err)
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	slog.Info("User updated", "id", user.ID, "rows_affected", rowsAffected)
	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM users WHERE id = @p1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		slog.Error("Failed to delete user", "id", id, "error", err)
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	slog.Info("User deleted", "id", id, "rows_affected", rowsAffected)
	return nil
}

// Module exports the models module for fx
var Module = fx.Options(
	fx.Provide(NewUserRepository),
)
