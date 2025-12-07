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

// ANSI color codes
const (
	colorGreen  = "\033[32m"
	colorCyan   = "\033[36m"
	colorYellow = "\033[33m"
	colorReset  = "\033[0m"
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

// Execute processes CLI commands with the format: env [action] [arg1] [arg2] or unzip [zipfile] [target]
func (ch *CommandHandler) Execute(args []string) error {
	if len(args) < 2 {
		return ch.printUsage()
	}

	command := args[1]

	// Create a flag set for this command
	flagSet := flag.NewFlagSet(command, flag.ContinueOnError)
	flagSet.Usage = func() {} // Suppress default help

	switch command {
	case "env":
		return ch.handleEnvCommand(args, flagSet)
	case "unzip":
		return ch.handleUnzipCommand(args, flagSet)
	case "download":
		return ch.handleDownloadCommand(args, flagSet)
	case "hash":
		return ch.handleHashCommand(args, flagSet)
	default:
		return fmt.Errorf("unknown command: %s", command)
	}
}

// handleEnvCommand processes env-specific commands
func (ch *CommandHandler) handleEnvCommand(args []string, flagSet *flag.FlagSet) error {
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
	case "SLIST":
		return ch.handleSimpleList(env)
	case "SHOW":
		return ch.handleShow(env, args[3:], flagSet)
	default:
		return fmt.Errorf("unknown action: %s", args[2])
	}
}

// handleUnzipCommand processes unzip-specific commands
func (ch *CommandHandler) handleUnzipCommand(args []string, flagSet *flag.FlagSet) error {
	// Define flags with defaults
	zipFile := flagSet.String("zipfile", "update.zip", "path to the zip file")
	target := flagSet.String("target", "./tmp-update", "target directory for extraction")

	// Parse remaining arguments
	flagSet.Parse(args[2:])
	remaining := flagSet.Args()

	// Override with positional arguments if provided
	if len(remaining) > 0 {
		*zipFile = remaining[0]
	}
	if len(remaining) > 1 {
		*target = remaining[1]
	}

	return ch.handleUnzip(*zipFile, *target)
}

// handleUnzip performs the unzip operation
func (ch *CommandHandler) handleUnzip(zipFile, target string) error {
	zm := NewZipManager(zipFile, target)

	if err := zm.Extract(); err != nil {
		return fmt.Errorf("unzip failed: %w", err)
	}

	absPath, _ := filepath.Abs(target)
	fmt.Printf("✓ Extracted: %s -> %s\n", zipFile, absPath)
	return nil
}

// handleDownloadCommand processes download-specific commands
func (ch *CommandHandler) handleDownloadCommand(args []string, flagSet *flag.FlagSet) error {
	// Define flags with defaults
	downloadURL := flagSet.String("url", "", "URL to download from")
	target := flagSet.String("target", "", "target file path (optional, extracted from URL if not provided)")

	// Parse remaining arguments
	flagSet.Parse(args[2:])
	remaining := flagSet.Args()

	// Override with positional arguments if provided
	if len(remaining) > 0 {
		*downloadURL = remaining[0]
	}
	if len(remaining) > 1 {
		*target = remaining[1]
	}

	if *downloadURL == "" {
		return fmt.Errorf("URL is required\nUsage: exepath download <url> [target]")
	}

	return ch.handleDownload(*downloadURL, *target)
}

// handleDownload performs the download operation
func (ch *CommandHandler) handleDownload(downloadURL, target string) error {
	dm := NewDownloadManager(downloadURL, target)

	if err := dm.Download(); err != nil {
		return fmt.Errorf("download failed: %w", err)
	}

	absPath, _ := filepath.Abs(dm.GetTarget())
	fmt.Printf("✓ Downloaded: %s -> %s\n", downloadURL, absPath)
	return nil
}

// handleHashCommand processes hash-specific commands
func (ch *CommandHandler) handleHashCommand(args []string, flagSet *flag.FlagSet) error {
	// Define flags
	outFile := flagSet.String("outfile", "", "output file to write hash value only (optional)")

	// Parse remaining arguments
	flagSet.Parse(args[2:])
	remaining := flagSet.Args()

	// Ensure remaining has at least one element with empty string default
	if len(remaining) == 0 {
		remaining = append(remaining, "")
	}

	filePath := remaining[0]

	// If no filepath provided, use current process executable
	if filePath == "" {
		exePath, err := os.Executable()
		if err != nil {
			return fmt.Errorf("failed to get executable path: %w", err)
		}
		filePath = exePath
	}

	return ch.handleHash(filePath, *outFile)
}

// handleHash performs the hash computation
func (ch *CommandHandler) handleHash(filePath, outFile string) error {
	hm := NewHashManager(filePath)

	if outFile != "" {
		hm.SetOutFile(outFile)
	}

	hash, err := hm.ComputeSHA256AndWrite()
	if err != nil {
		return fmt.Errorf("hash computation failed: %w", err)
	}

	absPath, _ := filepath.Abs(filePath)
	if outFile != "" {
		outAbsPath, _ := filepath.Abs(outFile)
		fmt.Printf("SHA256(%s): %s\n", absPath, hash)
		fmt.Printf("✓ Hash written to: %s\n", outAbsPath)
	} else {
		fmt.Printf("SHA256(%s): %s\n", absPath, hash)
	}
	return nil
}

func (ch *CommandHandler) handleInteractiveMode(env *EnvManager) error {
	// Show LIST first
	if err := ch.handleList(env); err != nil {
		return err
	}

	fmt.Println()
	fmt.Println("Interactive mode. Type 'exit', 'q', or 'quit' (case-insensitive) to exit.")

	// Read from stdin in a loop
	scanner := bufio.NewScanner(os.Stdin)
	for {
		fmt.Print("Enter KEY=VALUE (or type 'exit'/'q'/'quit' to exit): ")

		if !scanner.Scan() {
			// Ctrl+C was pressed
			fmt.Println()
			return nil
		}

		input := strings.TrimSpace(scanner.Text())
		if input == "" {
			continue
		}

		// Check for exit commands (case-insensitive)
		lowerInput := strings.ToLower(input)
		if lowerInput == "exit" || lowerInput == "q" || lowerInput == "quit" {
			fmt.Println("Exiting interactive mode.")
			return nil
		}

		// Split by "=" separator
		parts := strings.SplitN(input, "=", 2)
		if len(parts) != 2 {
			fmt.Printf("Error: invalid format: expected KEY=VALUE, got '%s'\n", input)
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		if key == "" {
			fmt.Println("Error: key cannot be empty")
			continue
		}

		// UPSERT the key-value pair
		_, exists := env.List()[key]

		if err := env.Add(key, value); err != nil {
			fmt.Printf("Error: %v\n", err)
			continue
		}

		if err := env.Save(); err != nil {
			fmt.Printf("Error: %v\n", err)
			continue
		}

		if exists {
			fmt.Printf("✓ Updated: %s=%s\n", key, value)
		} else {
			fmt.Printf("✓ Added: %s=%s\n", key, value)
		}
	}
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
		fmt.Printf("%s%s%s%s=%s%s%s\n", colorGreen, key, colorReset, colorCyan, colorYellow, entries[key], colorReset)
	}
	fmt.Printf("\nTotal: %d variables\n", len(entries))
	return nil
}

func (ch *CommandHandler) handleSimpleList(env *EnvManager) error {
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
	fmt.Fprintf(os.Stderr, `Usage: exepath [command] [options]

Commands:

ENV MANAGEMENT:
  exepath env [action] [arg1] [arg2]

    Actions (case-insensitive):
      ADD <key> <value>      Add or overwrite an environment variable
      DELETE <key>           Delete an environment variable
      UPDATE <key> <value>   Update an existing environment variable
      UPSERT <key> <value>   Add or update an environment variable
      LIST                   List all environment variables (with colored output)
      SLIST                  Simple list without colors
      SHOW <key>             Show a specific environment variable

    Interactive Mode:
      exepath env            Enter interactive mode (shows LIST, then prompts for KEY=VALUE input)

    Examples:
      exepath env ADD DB_HOST localhost
      exepath env DELETE OLD_VAR
      exepath env UPDATE SERVER_PORT 8081
      exepath env UPSERT API_KEY secret123
      exepath env LIST
      exepath env SLIST
      exepath env SHOW SERVER_PORT
      exepath env             (Interactive mode)

ZIP FILE EXTRACTION:
  exepath unzip [zipfile] [target]

    Options:
      -zipfile <path>   Path to the zip file (default: update.zip)
      -target <path>    Target directory for extraction (default: ./tmp-update)

    Positional arguments override flags.

    Examples:
      exepath unzip                                     (uses defaults: update.zip -> ./tmp-update)
      exepath unzip -zipfile=app.zip -target=./build   (using flags)
      exepath unzip app.zip ./extracted                 (using positional arguments)

URL DOWNLOAD:
  exepath download <url> [target]

    Arguments:
      <url>             URL to download from (required)
      [target]          Target file path (optional, filename extracted from URL if not provided)

    Options:
      -url <url>        URL to download from (as flag)
      -target <path>    Target file path (as flag)

    Positional arguments override flags.

    Examples:
      exepath download https://example.com/file.zip                    (downloads to ./file.zip)
      exepath download https://example.com/archive.tar.gz ./myfile     (downloads to ./myfile)
      exepath download -url=https://example.com/file.bin -target=out   (using flags)

FILE HASH COMPUTATION:
  exepath hash [file] [--outfile <path>]

    Arguments:
      [file]            Path to the file to hash (optional, defaults to current executable)

    Options:
      --outfile <path>  Write hash value only to a file (optional, no SHA256 prefix)

    Hash Algorithm:
      SHA256 (hex output)

    Examples:
      exepath hash
      exepath hash ./config.yaml
      exepath hash /path/to/executable
      exepath hash ./config.yaml --outfile hash.txt
      exepath hash /path/to/app.exe --outfile ./checksums/app.sha256

`)
	return flag.ErrHelp
}
