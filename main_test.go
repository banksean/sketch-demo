package main

import (
	"bytes"
	"os"
	"os/exec"
	"strings"
	"testing"
)

func TestMainWithDefaults(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	expected := "Hello, World!"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}
}

func TestMainWithFibonacci(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go", "--fib=10")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	expected := "Fibonacci(10) = 55"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}
}

func TestMainWithCustomName(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go", "--name=Tester")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	expected := "Hello, Tester!"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}
}

func TestMainWithVerbose(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go", "--name=Verbose", "--verbose")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	outputStr := string(output)
	expectedGreeting := "Greeting Verbose..."
	expectedHello := "Hello, Verbose!"
	expectedDone := "Done!"

	if !strings.Contains(outputStr, expectedGreeting) {
		t.Errorf("Expected output to contain %q, got %q", expectedGreeting, outputStr)
	}
	if !strings.Contains(outputStr, expectedHello) {
		t.Errorf("Expected output to contain %q, got %q", expectedHello, outputStr)
	}
	if !strings.Contains(outputStr, expectedDone) {
		t.Errorf("Expected output to contain %q, got %q", expectedDone, outputStr)
	}
}

func TestMainHelp(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go", "--help")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Help command failed: %v", err)
	}

	outputStr := string(output)
	expectedUsage := "Usage of"
	expectedNameFlag := "-name string"
	expectedVerboseFlag := "-verbose"

	if !strings.Contains(outputStr, expectedUsage) {
		t.Errorf("Expected output to contain %q, got %q", expectedUsage, outputStr)
	}
	if !strings.Contains(outputStr, expectedNameFlag) {
		t.Errorf("Expected output to contain %q, got %q", expectedNameFlag, outputStr)
	}
	if !strings.Contains(outputStr, expectedVerboseFlag) {
		t.Errorf("Expected output to contain %q, got %q", expectedVerboseFlag, outputStr)
	}
}

func TestBinaryExecution(t *testing.T) {
	// Build the binary first
	cmd := exec.Command("go", "build", "-o", "hello-world-cli-test")
	err := cmd.Run()
	if err != nil {
		t.Fatalf("Failed to build binary: %v", err)
	}

	// Clean up the binary after test
	defer func() {
		os.Remove("hello-world-cli-test")
	}()

	// Test the binary
	cmd = exec.Command("./hello-world-cli-test", "--name=Binary")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Binary execution failed: %v", err)
	}

	expected := "Hello, Binary!"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}
}

func TestBinaryExecutionVerbose(t *testing.T) {
	// Build the binary first
	cmd := exec.Command("go", "build", "-o", "hello-world-cli-test")
	err := cmd.Run()
	if err != nil {
		t.Fatalf("Failed to build binary: %v", err)
	}

	// Clean up the binary after test
	defer func() {
		os.Remove("hello-world-cli-test")
	}()

	// Test the binary with verbose flag
	cmd = exec.Command("./hello-world-cli-test", "--name=Binary", "--verbose")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Binary execution failed: %v", err)
	}

	outputStr := string(output)
	expectedGreeting := "Greeting Binary..."
	expectedHello := "Hello, Binary!"
	expectedDone := "Done!"

	if !strings.Contains(outputStr, expectedGreeting) {
		t.Errorf("Expected output to contain %q, got %q", expectedGreeting, outputStr)
	}
	if !strings.Contains(outputStr, expectedHello) {
		t.Errorf("Expected output to contain %q, got %q", expectedHello, outputStr)
	}
	if !strings.Contains(outputStr, expectedDone) {
		t.Errorf("Expected output to contain %q, got %q", expectedDone, outputStr)
	}
}

// Unit tests for individual functions

func TestFormatGreeting(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"default name", "World", "Hello, World!"},
		{"custom name", "Alice", "Hello, Alice!"},
		{"empty name", "", "Hello, !"},
		{"name with spaces", "John Doe", "Hello, John Doe!"},
		{"name with special chars", "Test-User_123", "Hello, Test-User_123!"},
		{"unicode name", "测试", "Hello, 测试!"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatGreeting(tt.input)
			if result != tt.expected {
				t.Errorf("formatGreeting(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestFormatVerbosePrefix(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"default name", "World", "Greeting World..."},
		{"custom name", "Alice", "Greeting Alice..."},
		{"empty name", "", "Greeting ..."},
		{"name with spaces", "John Doe", "Greeting John Doe..."},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatVerbosePrefix(tt.input)
			if result != tt.expected {
				t.Errorf("formatVerbosePrefix(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestFormatVerboseSuffix(t *testing.T) {
	result := formatVerboseSuffix()
	expected := "Done!"
	if result != expected {
		t.Errorf("formatVerboseSuffix() = %q, want %q", result, expected)
	}
}

func TestGreet(t *testing.T) {
	tests := []struct {
		name     string
		config   *Config
		expected string
	}{
		{
			"default config",
			&Config{Name: "World", Verbose: false},
			"Hello, World!\n",
		},
		{
			"verbose config",
			&Config{Name: "Alice", Verbose: true},
			"Greeting Alice...\nHello, Alice!\nDone!\n",
		},
		{
			"custom name non-verbose",
			&Config{Name: "Bob", Verbose: false},
			"Hello, Bob!\n",
		},
		{
			"empty name verbose",
			&Config{Name: "", Verbose: true},
			"Greeting ...\nHello, !\nDone!\n",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var buf bytes.Buffer
			greet(&buf, tt.config)
			result := buf.String()
			if result != tt.expected {
				t.Errorf("greet() output = %q, want %q", result, tt.expected)
			}
		})
	}
}

func TestConfig(t *testing.T) {
	// Test Config struct creation and field access
	config := &Config{
		Name:    "TestUser",
		Verbose: true,
	}

	if config.Name != "TestUser" {
		t.Errorf("Config.Name = %q, want %q", config.Name, "TestUser")
	}

	if config.Verbose != true {
		t.Errorf("Config.Verbose = %v, want %v", config.Verbose, true)
	}
}

// Edge case integration tests

func TestMainWithEmptyName(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go", "--name=")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	expected := "Hello, !"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}
}

func TestMainWithSpecialCharacters(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go", "--name=Test@User#123")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	expected := "Hello, Test@User#123!"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}
}

func TestMainWithUnicodeName(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go", "--name=测试用户")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	expected := "Hello, 测试用户!"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}
}

func TestMainWithLongName(t *testing.T) {
	longName := strings.Repeat("A", 100)
	cmd := exec.Command("go", "run", "main.go", "--name="+longName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	expected := "Hello, " + longName + "!"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}
}

// Benchmark tests

func BenchmarkFormatGreeting(b *testing.B) {
	for i := 0; i < b.N; i++ {
		formatGreeting("BenchmarkUser")
	}
}

func BenchmarkGreet(b *testing.B) {
	config := &Config{Name: "BenchmarkUser", Verbose: true}
	var buf bytes.Buffer
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		buf.Reset()
		greet(&buf, config)
	}
}

// Fibonacci function tests
func TestFib(t *testing.T) {
	tests := []struct {
		name     string
		input    int
		expected int
	}{
		{"zero", 0, 0},
		{"one", 1, 1},
		{"two", 2, 1},
		{"three", 3, 2},
		{"four", 4, 3},
		{"five", 5, 5},
		{"ten", 10, 55},
		{"fifteen", 15, 610},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := Fib(tt.input)
			if result != tt.expected {
				t.Errorf("Fib(%d) = %d, want %d", tt.input, result, tt.expected)
			}
		})
	}
}

func TestMainWithFibonacciZero(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go", "--fib=0")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	expected := "Fibonacci(0) = 0"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}
}

func TestMainWithoutFibFlag(t *testing.T) {
	cmd := exec.Command("go", "run", "main.go")
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("Command failed: %v", err)
	}

	// Should show default greeting, not Fibonacci
	expected := "Hello, World!"
	if !strings.Contains(string(output), expected) {
		t.Errorf("Expected output to contain %q, got %q", expected, string(output))
	}

	// Should not contain Fibonacci
	unexpected := "Fibonacci"
	if strings.Contains(string(output), unexpected) {
		t.Errorf("Expected output not to contain %q, got %q", unexpected, string(output))
	}
}
