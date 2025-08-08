package main

import (
	"flag"
	"fmt"
	"io"
	"os"
	"strings"
)

// Config holds the application configuration
type Config struct {
	Name    string
	Verbose bool
	Fib     int
	ShowFib bool
} // parseFlags parses command line flags and returns a Config
func parseFlags() *Config {
	var config Config
	flag.StringVar(&config.Name, "name", "World", "Name to greet")
	flag.BoolVar(&config.Verbose, "verbose", false, "Enable verbose output")
	flag.IntVar(&config.Fib, "fib", 0, "Calculate Fibonacci number")
	flag.Parse()

	// Check if fib flag was explicitly provided
	for _, arg := range os.Args {
		if arg == "--fib" || strings.HasPrefix(arg, "--fib=") {
			config.ShowFib = true
			break
		}
	}

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

// Fib calculates the Fibonacci number for a given integer
func Fib(n int) int {
	if n <= 1 {
		return n
	}
	a, b := 0, 1
	for i := 2; i <= n; i++ {
		a, b = b, a+b
	}
	return b
}

// greet outputs the greeting messages to the provided writer
func greet(w io.Writer, config *Config) {
	// Handle Fibonacci calculation
	if config.ShowFib {
		result := Fib(config.Fib)
		fmt.Fprintf(w, "Fibonacci(%d) = %d\n", config.Fib, result)
		return
	}

	if config.Verbose {
		fmt.Fprintln(w, formatVerbosePrefix(config.Name))
	}

	fmt.Fprintln(w, formatGreeting(config.Name))

	if config.Verbose {
		fmt.Fprintln(w, formatVerboseSuffix())
	}
}

func main() {
	config := parseFlags()
	greet(os.Stdout, config)
	os.Exit(0)
}
