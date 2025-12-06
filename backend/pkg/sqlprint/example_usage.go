package sqlprint

// Example usage documentation and helper functions for the SQL colorizer

import "fmt"

// ExampleBasicUsage demonstrates basic colorization
func ExampleBasicUsage() {
	sql := "SELECT * FROM users WHERE id = 1"
	fmt.Println(Colorize(sql))
}

// ExampleAdvancedUsage demonstrates advanced features
func ExampleAdvancedUsage() {
	sql := `
		SELECT u.id, u.name, COUNT(o.id) as order_count
		FROM users u
		LEFT JOIN orders o ON u.id = o.user_id
		WHERE u.created_at > '2024-01-01'
		GROUP BY u.id, u.name
		ORDER BY order_count DESC
	`

	// Colorize with colors enabled
	fmt.Println(Colorize(sql))
}

// ExampleWithComments demonstrates comment handling
func ExampleWithComments() {
	sql := `
		-- Get active users with their recent orders
		SELECT
			u.id,
			u.name,
			/* Count of orders placed in last 30 days */
			COUNT(CASE WHEN o.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_orders
		FROM users u
		LEFT JOIN orders o ON u.id = o.user_id
		WHERE u.status = 'active'
		GROUP BY u.id, u.name
	`

	fmt.Println(Colorize(sql))
}

// ExampleDisableColors demonstrates how to disable colors
func ExampleDisableColors() {
	sql := "SELECT id, name FROM users"

	// Disable colors globally
	EnableColorOutput(false)
	fmt.Println(Colorize(sql))

	// Re-enable for other operations
	EnableColorOutput(true)
}

// ExampleComplexQuery demonstrates a complex query with multiple features
func ExampleComplexQuery() {
	sql := `
		WITH active_users AS (
			-- CTE for active users
			SELECT id, name, email FROM users WHERE status = 'active'
		),
		user_stats AS (
			-- CTE for user statistics
			SELECT
				user_id,
				COUNT(*) as total_orders,
				SUM(amount) as total_spent,
				AVG(amount) as avg_order_value
			FROM orders
			WHERE created_at >= '2024-01-01'
			GROUP BY user_id
		)
		SELECT
			au.id,
			au.name,
			au.email,
			COALESCE(us.total_orders, 0) as total_orders,
			COALESCE(us.total_spent, 0.00) as total_spent,
			CASE
				WHEN us.total_spent > 1000 THEN 'Gold'
				WHEN us.total_spent > 500 THEN 'Silver'
				ELSE 'Bronze'
			END as tier,
			ROW_NUMBER() OVER (ORDER BY us.total_spent DESC) as customer_rank
		FROM active_users au
		LEFT JOIN user_stats us ON au.id = us.user_id
		WHERE us.total_orders > 0
		ORDER BY us.total_spent DESC
		LIMIT 100
	`

	fmt.Println(ColorizeFormatted(sql))
}

// ExampleWindowFunctions demonstrates window function colorization
func ExampleWindowFunctions() {
	sql := `
		SELECT
			employee_id,
			salary,
			department,
			AVG(salary) OVER (PARTITION BY department) as dept_avg_salary,
			ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank,
			LAG(salary) OVER (ORDER BY hire_date) as previous_salary,
			LEAD(salary) OVER (ORDER BY hire_date) as next_salary,
			FIRST_VALUE(salary) OVER (PARTITION BY department ORDER BY hire_date) as first_salary,
			LAST_VALUE(salary) OVER (PARTITION BY department ORDER BY hire_date) as last_salary
		FROM employees
		WHERE hire_date >= '2023-01-01'
	`

	fmt.Println(Colorize(sql))
}

// ExampleCreateTableStatement demonstrates DDL statement handling
func ExampleCreateTableStatement() {
	sql := `
		CREATE TABLE users (
			id INT PRIMARY KEY AUTO_INCREMENT,
			username VARCHAR(50) NOT NULL UNIQUE,
			email VARCHAR(100) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT fk_user_profile FOREIGN KEY (id) REFERENCES user_profiles(user_id)
		)
	`

	fmt.Println(Colorize(sql))
}

// ExampleUpdateStatement demonstrates UPDATE statement colorization
func ExampleUpdateStatement() {
	sql := `
		UPDATE users u
		INNER JOIN orders o ON u.id = o.user_id
		SET
			u.last_order_date = o.created_at,
			u.total_spent = u.total_spent + o.amount
		WHERE o.status = 'completed'
			AND u.updated_at < DATE_SUB(NOW(), INTERVAL 1 DAY)
	`

	fmt.Println(Colorize(sql))
}

// LogQueryWithColor is a helper function to log colored SQL queries
func LogQueryWithColor(sql string) {
	fmt.Println("=== SQL Query ===")
	fmt.Println(Colorize(sql))
	fmt.Println("==================")
}

// GetColoredSQL is a helper to get colored output directly
func GetColoredSQL(sql string) string {
	return Colorize(sql)
}

// GetColoredFormattedSQL is a helper to get colored and formatted output
func GetColoredFormattedSQL(sql string) string {
	return ColorizeFormatted(sql)
}
