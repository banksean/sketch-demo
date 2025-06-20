# Hello World CLI

A simple command-line application written in Go that greets users with customizable options.

## Features

- Customizable greeting name (defaults to "World")
- Verbose output option
- Built-in help documentation
- Cross-platform compatibility

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
- `--help`: Show usage information

## Development

### Running Tests

```bash
go test -v
```

The test suite includes:
- Default behavior testing
- Custom name parameter testing
- Verbose output testing
- Help documentation testing
- Binary execution testing

### Project Structure

```
.
├── main.go          # Main application code
├── main_test.go     # Unit tests
├── go.mod          # Go module definition
└── README.md       # This documentation
```
