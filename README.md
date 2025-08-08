# Hello World CLI

A simple command-line tool that greets users with "Hello, World!" by default.

## Features

- Customizable greeting name with `-name` flag
- Verbose output mode with `-verbose` flag
- Fibonacci calculator with `-fib` flag

## Usage

```bash
# Default greeting
./hello-world-cli

# Custom name
./hello-world-cli -name=YourName

# Verbose mode
./hello-world-cli -verbose

# Calculate Fibonacci number
./hello-world-cli -fib=10

# Combine flags
./hello-world-cli -name=YourName -verbose
```

## Installation

```bash
go build -o hello-world-cli
```

## Testing

```bash
go test
```
