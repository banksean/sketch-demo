# Hello World CLI

A simple command-line application written in Go that greets users with customizable options. Now also available as a web application!

## Features

- 🏠 **Web Interface**: Beautiful web-based interface for easy interaction
- 🕸️ **REST API**: JSON API for programmatic access
- 📄 **Interactive Documentation**: Built-in documentation with examples
- 🔧 **Customizable greeting name** (defaults to "World")
- 📝 **Verbose output option**
- 📚 **Built-in help documentation**
- 🌐 **Cross-platform compatibility**

## Usage

### Web Application Mode

Start the web server:

```bash
go run web_server.go main.go --web
```

Then open your browser to:
- 🏠 **Main Interface**: http://localhost:8080
- 📄 **Documentation**: http://localhost:8080/docs  
- 🕸️ **API Endpoint**: http://localhost:8080/api/greet

### Command Line Mode

#### Running with Go

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

**CLI Version:**
```bash
# Build the CLI application
go build -o hello-world-cli main.go

# Run the binary
./hello-world-cli --name="Charlie" --verbose
```

**Web Version:**
```bash
# Build the web application
go build -o hello-world-web web_server.go main.go

# Run the web server
./hello-world-web --web
```

## Command Line Options

- `--name` (string): Name to greet (default: "World")
- `--verbose` (boolean): Enable verbose output with additional messages
- `--web` (boolean): Start web server mode
- `--help`: Show usage information

## API Usage

### REST API Endpoints

**Generate Greeting**
- `POST /api/greet` - Send JSON data
- `GET /api/greet?name=Alice&verbose=true` - Query parameters

**Example JSON Request:**
```json
{
  "name": "Alice",
  "verbose": true
}
```

**Example Response:**
```json
{
  "messages": [
    "Greeting Alice...",
    "Hello, Alice!",
    "Done!"
  ],
  "config": {
    "name": "Alice",
    "verbose": true
  }
}
```

### cURL Examples

```bash
# Simple greeting
curl "http://localhost:8080/api/greet?name=Alice"

# Verbose greeting
curl "http://localhost:8080/api/greet?name=Bob&verbose=true"

# POST request
curl -X POST "http://localhost:8080/api/greet" \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","verbose":true}'
```

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
├── main.go          # Main CLI application code
├── web_server.go    # Web server and API handlers
├── main_test.go     # Unit tests
├── go.mod          # Go module definition
└── README.md       # This documentation
```
