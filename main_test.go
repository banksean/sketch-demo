package main

import (
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
