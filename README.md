# Hello World CLI

A simple command-line application written in Go that greets users with customizable options. This project demonstrates clean Go architecture with proper separation of concerns, comprehensive testing, and professional code organization.

## Features

- Customizable greeting name (defaults to "World")
- Verbose output option with additional messaging
- Built-in help documentation
- Cross-platform compatibility
- Modular architecture with testable functions
- Comprehensive test suite with unit tests, integration tests, and benchmarks
- Clean separation between CLI parsing, business logic, and output formatting

## Architecture

The application follows Go best practices with:

- **Config struct**: Centralized configuration management
- **Parsing functions**: Clean separation of flag parsing logic
- **Formatting functions**: Dedicated functions for message formatting
- **Testable design**: Functions accept `io.Writer` for easy testing
- **Comprehensive tests**: Unit tests, integration tests, edge cases, and benchmarks

## Usage

### Running with Go

```bash
# Basic usage
go run main.go
# Output: Hello, World!

# Custom name
go run main.go --name="Alice"
# Output: Hello, Alice!

# Verbose output
go run main.go --name="Bob" --verbose
# Output:
# Greeting Bob...
# Hello, Bob!
# Done!

# Show help
go run main.go --help
```

### Building and Running the Binary

```bash
# Build the application
go build -o hello-world-cli

# Run the binary
./hello-world-cli --name="Charlie" --verbose
```

## Command Line Options

- `--name` (string): Name to greet (default: "World")
- `--verbose` (boolean): Enable verbose output with additional messages
- `--help`: Show usage information and available flags

## Development

### Running Tests

```bash
# Run all tests
go test -v

# Run tests with coverage
go test -v -cover

# Run benchmarks
go test -bench=.
```

The comprehensive test suite includes:

#### Integration Tests
- Default behavior testing
- Custom name parameter testing
- Verbose output testing
- Help documentation testing
- Binary execution testing
- Edge cases (empty names, special characters, Unicode, long names)

#### Unit Tests
- `formatGreeting()` function testing
- `formatVerbosePrefix()` function testing
- `formatVerboseSuffix()` function testing
- `greet()` function testing
- Config struct validation

#### Benchmark Tests
- Performance testing for core functions
- Memory allocation profiling

### Project Structure

```
.
├── main.go          # Main application with modular functions
├── main_test.go     # Comprehensive test suite
├── go.mod          # Go module definition
└── README.md       # This documentation
```

### Code Organization

**main.go** contains:
- `Config` struct for configuration management
- `parseFlags()` for command-line argument parsing
- `formatGreeting()` for main greeting message formatting
- `formatVerbosePrefix()` and `formatVerboseSuffix()` for verbose output
- `greet()` for the main greeting logic (accepts `io.Writer` for testability)
- `main()` function that orchestrates the application

**main_test.go** contains:
- Integration tests that execute the binary
- Unit tests for individual functions
- Edge case testing
- Unicode and special character support verification
- Benchmark tests for performance validation

## Testing Philosophy

This project demonstrates comprehensive testing practices:

1. **Integration Testing**: Tests the complete application flow by executing the binary
2. **Unit Testing**: Tests individual functions in isolation
3. **Edge Case Testing**: Handles empty inputs, special characters, and Unicode
4. **Performance Testing**: Benchmarks to ensure code performance
5. **Testable Design**: Functions accept interfaces (`io.Writer`) for easy mocking

## Requirements

- Go 1.24.3 or later
- No external dependencies (uses only Go standard library)

## Contributing

This project serves as an example of:
- Clean Go code architecture
- Comprehensive testing strategies
- Professional project organization
- Best practices for CLI applications

Feel free to use this as a template for your own Go CLI projects!
