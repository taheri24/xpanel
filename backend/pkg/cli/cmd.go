package cli

import (
	"bufio"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// CommandHandler handles CLI commands
type CommandHandler struct {
	envPath string
}

// NewCommandHandler creates a new CommandHandler
func NewCommandHandler(envPath string) *CommandHandler {
	return &CommandHandler{
		envPath: envPath,
	}
}

// Execute processes CLI commands with the format: env [action] [arg1] [arg2]
func (ch *CommandHandler) Execute(args []string) error {
	if len(args) < 2 {
		return ch.printUsage()
	}

	command := args[1]

	// Create a flag set for this command
	flagSet := flag.NewFlagSet(command, flag.ContinueOnError)
	flagSet.Usage = func() {} // Suppress default help

	if command != "env" {
		return fmt.Errorf("unknown command: %s", command)
	}

	env := NewEnvManager(ch.envPath)

	// Load existing .env file
	if err := env.Load(); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("error loading .env file: %w", err)
	}

	// Interactive mode if no action provided
	if len(args) < 3 {
		return ch.handleInteractiveMode(env)
	}

	action := strings.ToUpper(args[2])

	switch action {
	case "ADD":
		return ch.handleAdd(env, args[3:], flagSet)
	case "DELETE":
		return ch.handleDelete(env, args[3:], flagSet)
	case "UPDATE":
		return ch.handleUpdate(env, args[3:], flagSet)
	case "UPSERT":
		return ch.handleUpsert(env, args[3:], flagSet)
	case "LIST":
		return ch.handleList(env)
	case "SHOW":
		return ch.handleShow(env, args[3:], flagSet)
	default:
		return fmt.Errorf("unknown action: %s", args[2])
	}
}

func (ch *CommandHandler) handleInteractiveMode(env *EnvManager) error {
	// Show LIST first
	if err := ch.handleList(env); err != nil {
		return err
	}

	fmt.Println()
	fmt.Print("Enter KEY=VALUE (or press Ctrl+C to exit): ")

	// Read from stdin
	scanner := bufio.NewScanner(os.Stdin)
	if !scanner.Scan() {
		return nil
	}

	input := strings.TrimSpace(scanner.Text())
	if input == "" {
		return nil
	}

	// Split by "=" separator
	parts := strings.SplitN(input, "=", 2)
	if len(parts) != 2 {
		return fmt.Errorf("invalid format: expected KEY=VALUE, got '%s'", input)
	}

	key := strings.TrimSpace(parts[0])
	value := strings.TrimSpace(parts[1])

	if key == "" {
		return fmt.Errorf("key cannot be empty")
	}

	// UPSERT the key-value pair
	_, exists := env.List()[key]

	if err := env.Add(key, value); err != nil {
		return err
	}

	if err := env.Save(); err != nil {
		return err
	}

	if exists {
		fmt.Printf("✓ Updated: %s=%s\n", key, value)
	} else {
		fmt.Printf("✓ Added: %s=%s\n", key, value)
	}

	return nil
}

func (ch *CommandHandler) handleAdd(env *EnvManager, args []string, flagSet *flag.FlagSet) error {
	flagSet.Parse(args)
	remaining := flagSet.Args()

	if len(remaining) < 2 {
		return fmt.Errorf("ADD requires: key value\nUsage: exepath env ADD <key> <value>")
	}

	key := remaining[0]
	value := remaining[1]

	if err := env.Add(key, value); err != nil {
		return err
	}

	if err := env.Save(); err != nil {
		return err
	}

	fmt.Printf("✓ Added: %s=%s\n", key, value)
	return nil
}

func (ch *CommandHandler) handleDelete(env *EnvManager, args []string, flagSet *flag.FlagSet) error {
	flagSet.Parse(args)
	remaining := flagSet.Args()

	if len(remaining) < 1 {
		return fmt.Errorf("DELETE requires: key\nUsage: exepath env DELETE <key>")
	}

	key := remaining[0]

	if err := env.Delete(key); err != nil {
		return err
	}

	if err := env.Save(); err != nil {
		return err
	}

	fmt.Printf("✓ Deleted: %s\n", key)
	return nil
}

func (ch *CommandHandler) handleUpdate(env *EnvManager, args []string, flagSet *flag.FlagSet) error {
	flagSet.Parse(args)
	remaining := flagSet.Args()

	if len(remaining) < 2 {
		return fmt.Errorf("UPDATE requires: key value\nUsage: exepath env UPDATE <key> <value>")
	}

	key := remaining[0]
	value := remaining[1]

	if err := env.Update(key, value); err != nil {
		return err
	}

	if err := env.Save(); err != nil {
		return err
	}

	fmt.Printf("✓ Updated: %s=%s\n", key, value)
	return nil
}

func (ch *CommandHandler) handleUpsert(env *EnvManager, args []string, flagSet *flag.FlagSet) error {
	flagSet.Parse(args)
	remaining := flagSet.Args()

	if len(remaining) < 2 {
		return fmt.Errorf("UPSERT requires: key value\nUsage: exepath env UPSERT <key> <value>")
	}

	key := remaining[0]
	value := remaining[1]

	// Check if key exists
	_, exists := env.List()[key]

	if err := env.Add(key, value); err != nil {
		return err
	}

	if err := env.Save(); err != nil {
		return err
	}

	if exists {
		fmt.Printf("✓ Updated: %s=%s\n", key, value)
	} else {
		fmt.Printf("✓ Added: %s=%s\n", key, value)
	}
	return nil
}

func (ch *CommandHandler) handleList(env *EnvManager) error {
	entries := env.List()

	// Get file info
	fileInfo, err := os.Stat(env.GetFilePath())
	if err == nil {
		absPath, _ := filepath.Abs(env.GetFilePath())
		fmt.Printf(".env File: %s\n", absPath)
		fmt.Printf("Size: %d bytes\n", fileInfo.Size())
		fmt.Println()
	}

	if len(entries) == 0 {
		fmt.Println("No environment variables found.")
		return nil
	}

	// Sort keys for consistent output
	keys := make([]string, 0, len(entries))
	for key := range entries {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	fmt.Println("Environment Variables:")
	fmt.Println("======================")
	for _, key := range keys {
		fmt.Printf("%s=%s\n", key, entries[key])
	}
	fmt.Printf("\nTotal: %d variables\n", len(entries))
	return nil
}

func (ch *CommandHandler) handleShow(env *EnvManager, args []string, flagSet *flag.FlagSet) error {
	flagSet.Parse(args)
	remaining := flagSet.Args()

	if len(remaining) < 1 {
		return fmt.Errorf("SHOW requires: key\nUsage: exepath env SHOW <key>")
	}

	key := remaining[0]

	value, err := env.Get(key)
	if err != nil {
		return err
	}

	fmt.Printf("%s=%s\n", key, value)
	return nil
}

func (ch *CommandHandler) printUsage() error {
	fmt.Fprintf(os.Stderr, `Usage: exepath env [action] [arg1] [arg2]

Actions (case-insensitive):
  ADD <key> <value>      Add or overwrite an environment variable
  DELETE <key>           Delete an environment variable
  UPDATE <key> <value>   Update an existing environment variable
  UPSERT <key> <value>   Add or update an environment variable
  LIST                   List all environment variables
  SHOW <key>             Show a specific environment variable

Interactive Mode:
  exepath env            Enter interactive mode (shows LIST, then prompts for KEY=VALUE input)

Examples:
  exepath env ADD DB_HOST localhost
  exepath env DELETE OLD_VAR
  exepath env UPDATE SERVER_PORT 8081
  exepath env UPSERT API_KEY secret123
  exepath env LIST
  exepath env SHOW SERVER_PORT
  exepath env             (Interactive mode)

`)
	return flag.ErrHelp
}
