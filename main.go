package main

import (
	"flag"
	"fmt"
	"io"
	"os"
)

// Config holds the application configuration
type Config struct {
	Name    string
	Verbose bool
	WebMode bool
}

// parseFlags parses command line flags and returns a Config
func parseFlags() *Config {
	var config Config
	flag.StringVar(&config.Name, "name", "World", "Name to greet")
	flag.BoolVar(&config.Verbose, "verbose", false, "Enable verbose output")
	flag.BoolVar(&config.WebMode, "web", false, "Start web server mode")
	flag.Parse()
	return &config
}

// formatGreeting generates the greeting message
func formatGreeting(name string) string {
	return fmt.Sprintf("Hello, %s!", name)
}

// formatVerbosePrefix generates the verbose prefix message
func formatVerbosePrefix(name string) string {
	return fmt.Sprintf("Greeting %s...", name)
}

// formatVerboseSuffix generates the verbose suffix message
func formatVerboseSuffix() string {
	return "Done!"
}

// greet outputs the greeting messages to the provided writer
func greet(w io.Writer, config *Config) {
	if config.Verbose {
		fmt.Fprintln(w, formatVerbosePrefix(config.Name))
	}

	fmt.Fprintln(w, formatGreeting(config.Name))

	if config.Verbose {
		fmt.Fprintln(w, formatVerboseSuffix())
	}
}

// webModeFunc is a function pointer that can be set by web builds
var webModeFunc func()

func main() {
	config := parseFlags()

	if config.WebMode {
		if webModeFunc != nil {
			webModeFunc()
			return
		}
		fmt.Println("Web mode not available in CLI-only build.")
		fmt.Println("To use web mode, run: go build -o hello-web web_server.go main.go && ./hello-web --web")
		os.Exit(1)
	}

	greet(os.Stdout, config)
	os.Exit(0)
}
