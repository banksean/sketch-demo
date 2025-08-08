package main

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHelloHandler_ValidGETRequest(t *testing.T) {
	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	helloHandler(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check response body
	expected := "Hello, World!"
	if rr.Body.String() != expected {
		t.Errorf("handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}

func TestHelloHandler_SecurityHeaders(t *testing.T) {
	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	helloHandler(rr, req)

	// Define expected security headers
	expectedHeaders := map[string]string{
		"X-Content-Type-Options":  "nosniff",
		"X-Frame-Options":         "DENY",
		"X-Xss-Protection":        "1; mode=block",
		"Referrer-Policy":         "strict-origin-when-cross-origin",
		"Content-Security-Policy": "default-src 'self'",
		"Content-Type":            "text/plain; charset=utf-8",
	}

	// Check each security header
	for header, expectedValue := range expectedHeaders {
		if actualValue := rr.Header().Get(header); actualValue != expectedValue {
			t.Errorf("handler returned wrong %s header: got %v want %v",
				header, actualValue, expectedValue)
		}
	}
}

func TestHelloHandler_InvalidMethod(t *testing.T) {
	invalidMethods := []string{"POST", "PUT", "DELETE", "PATCH", "OPTIONS"}

	for _, method := range invalidMethods {
		t.Run(method, func(t *testing.T) {
			req, err := http.NewRequest(method, "/", nil)
			if err != nil {
				t.Fatal(err)
			}

			rr := httptest.NewRecorder()
			helloHandler(rr, req)

			// Check status code
			if status := rr.Code; status != http.StatusMethodNotAllowed {
				t.Errorf("handler returned wrong status code for %s: got %v want %v",
					method, status, http.StatusMethodNotAllowed)
			}

			// Check response body contains method name
			expectedSubstring := "Method " + method + " not allowed"
			if !strings.Contains(rr.Body.String(), expectedSubstring) {
				t.Errorf("handler returned unexpected body for %s: got %v, expected to contain %v",
					method, rr.Body.String(), expectedSubstring)
			}
		})
	}
}

func TestHelloHandler_InvalidPath(t *testing.T) {
	invalidPaths := []string{"/invalid", "/test", "/api", "/health", "/favicon.ico"}

	for _, path := range invalidPaths {
		t.Run(path, func(t *testing.T) {
			req, err := http.NewRequest("GET", path, nil)
			if err != nil {
				t.Fatal(err)
			}

			rr := httptest.NewRecorder()
			helloHandler(rr, req)

			// Check status code
			if status := rr.Code; status != http.StatusNotFound {
				t.Errorf("handler returned wrong status code for %s: got %v want %v",
					path, status, http.StatusNotFound)
			}

			// Check response body contains path
			expectedSubstring := "Path " + path + " not found"
			if !strings.Contains(rr.Body.String(), expectedSubstring) {
				t.Errorf("handler returned unexpected body for %s: got %v, expected to contain %v",
					path, rr.Body.String(), expectedSubstring)
			}
		})
	}
}

func TestHelloHandler_RequestLogging(t *testing.T) {
	// Capture log output
	var buf bytes.Buffer
	originalOutput := log.Writer()
	log.SetOutput(&buf)
	defer log.SetOutput(originalOutput) // Reset to original after test

	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}
	req.RemoteAddr = "127.0.0.1:12345"
	req.Header.Set("User-Agent", "test-agent")

	rr := httptest.NewRecorder()
	helloHandler(rr, req)

	// Check that log contains expected information
	logOutput := buf.String()
	expectedParts := []string{
		"127.0.0.1:12345",
		"GET",
		"/",
		"test-agent",
	}

	for _, part := range expectedParts {
		if !strings.Contains(logOutput, part) {
			t.Errorf("log output missing expected part %q: got %q", part, logOutput)
		}
	}
}

func TestSecureHeaders(t *testing.T) {
	rr := httptest.NewRecorder()
	secureHeaders(rr)

	// Define expected security headers
	expectedHeaders := map[string]string{
		"X-Content-Type-Options":  "nosniff",
		"X-Frame-Options":         "DENY",
		"X-Xss-Protection":        "1; mode=block",
		"Referrer-Policy":         "strict-origin-when-cross-origin",
		"Content-Security-Policy": "default-src 'self'",
		"Content-Type":            "text/plain; charset=utf-8",
	}

	// Check each security header
	for header, expectedValue := range expectedHeaders {
		if actualValue := rr.Header().Get(header); actualValue != expectedValue {
			t.Errorf("secureHeaders() set wrong %s header: got %v want %v",
				header, actualValue, expectedValue)
		}
	}
}

func TestLogRequest(t *testing.T) {
	// Capture log output
	var buf bytes.Buffer
	originalOutput := log.Writer()
	log.SetOutput(&buf)
	defer log.SetOutput(originalOutput) // Reset to original after test

	req, err := http.NewRequest("POST", "/api/test", nil)
	if err != nil {
		t.Fatal(err)
	}
	req.RemoteAddr = "192.168.1.1:54321"
	req.Header.Set("User-Agent", "custom-user-agent/1.0")

	logRequest(req)

	// Check that log contains expected information
	logOutput := buf.String()
	expectedParts := []string{
		"192.168.1.1:54321",
		"POST",
		"/api/test",
		"custom-user-agent/1.0",
	}

	for _, part := range expectedParts {
		if !strings.Contains(logOutput, part) {
			t.Errorf("log output missing expected part %q: got %q", part, logOutput)
		}
	}
}

// Benchmark tests
func BenchmarkHelloHandler(b *testing.B) {
	// Disable logging during benchmark to avoid noise
	originalOutput := log.Writer()
	log.SetOutput(io.Discard)
	defer log.SetOutput(originalOutput)

	req, _ := http.NewRequest("GET", "/", nil)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rr := httptest.NewRecorder()
		helloHandler(rr, req)
	}
}
