package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWebGreet(t *testing.T) {
	tests := []struct {
		name     string
		config   WebConfig
		expected []string
	}{
		{
			name:     "default config",
			config:   WebConfig{Name: "World", Verbose: false},
			expected: []string{"Hello, World!"},
		},
		{
			name:     "verbose config",
			config:   WebConfig{Name: "Test", Verbose: true},
			expected: []string{"Greeting Test...", "Hello, Test!", "Done!"},
		},
		{
			name:     "empty name",
			config:   WebConfig{Name: "", Verbose: false},
			expected: []string{"Hello, !"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := webGreet(&tt.config)
			if len(result) != len(tt.expected) {
				t.Errorf("Expected %d messages, got %d", len(tt.expected), len(result))
				return
			}
			for i, expected := range tt.expected {
				if result[i] != expected {
					t.Errorf("Expected message %d to be %q, got %q", i, expected, result[i])
				}
			}
		})
	}
}

func TestAPIGreetHandlerPOST(t *testing.T) {
	tests := []struct {
		name            string
		requestBody     string
		expectedStatus  int
		expectedName    string
		expectedVerbose bool
	}{
		{
			name:            "valid request",
			requestBody:     `{"name":"Alice","verbose":true}`,
			expectedStatus:  http.StatusOK,
			expectedName:    "Alice",
			expectedVerbose: true,
		},
		{
			name:            "minimal request",
			requestBody:     `{"name":"Bob"}`,
			expectedStatus:  http.StatusOK,
			expectedName:    "Bob",
			expectedVerbose: false,
		},
		{
			name:           "invalid json",
			requestBody:    `{invalid json}`,
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", "/api/greet", strings.NewReader(tt.requestBody))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			apiGreetHandler(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
				return
			}

			if tt.expectedStatus == http.StatusOK {
				var response GreetingResponse
				if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}

				if response.Config.Name != tt.expectedName {
					t.Errorf("Expected name %q, got %q", tt.expectedName, response.Config.Name)
				}

				if response.Config.Verbose != tt.expectedVerbose {
					t.Errorf("Expected verbose %v, got %v", tt.expectedVerbose, response.Config.Verbose)
				}

				if len(response.Messages) == 0 {
					t.Error("Expected at least one message in response")
				}
			}
		})
	}
}

func TestAPIGreetHandlerGET(t *testing.T) {
	tests := []struct {
		name            string
		queryParams     string
		expectedName    string
		expectedVerbose bool
	}{
		{
			name:            "with name and verbose",
			queryParams:     "?name=Charlie&verbose=true",
			expectedName:    "Charlie",
			expectedVerbose: true,
		},
		{
			name:            "with name only",
			queryParams:     "?name=David",
			expectedName:    "David",
			expectedVerbose: false,
		},
		{
			name:            "no parameters",
			queryParams:     "",
			expectedName:    "World",
			expectedVerbose: false,
		},
		{
			name:            "verbose false",
			queryParams:     "?name=Eve&verbose=false",
			expectedName:    "Eve",
			expectedVerbose: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/greet"+tt.queryParams, nil)
			w := httptest.NewRecorder()

			apiGreetHandler(w, req)

			if w.Code != http.StatusOK {
				t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
				return
			}

			var response GreetingResponse
			if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
				t.Fatalf("Failed to decode response: %v", err)
			}

			if response.Config.Name != tt.expectedName {
				t.Errorf("Expected name %q, got %q", tt.expectedName, response.Config.Name)
			}

			if response.Config.Verbose != tt.expectedVerbose {
				t.Errorf("Expected verbose %v, got %v", tt.expectedVerbose, response.Config.Verbose)
			}

			if len(response.Messages) == 0 {
				t.Error("Expected at least one message in response")
			}
		})
	}
}

func TestHomeHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	homeHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	body := w.Body.String()
	expectedContent := []string{
		"Hello World Web CLI",
		"Name to greet:",
		"Generate Greeting",
		"Enable verbose output",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("Expected response to contain %q", content)
		}
	}
}

func TestDocsHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/docs", nil)
	w := httptest.NewRecorder()

	docsHandler(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	body := w.Body.String()
	expectedContent := []string{
		"Documentation",
		"API Endpoints",
		"Generate Greeting",
		"POST",
		"/api/greet",
		"GET",
		"cURL Examples",
	}

	for _, content := range expectedContent {
		if !strings.Contains(body, content) {
			t.Errorf("Expected response to contain %q", content)
		}
	}
}

func TestHomeHandlerNotFound(t *testing.T) {
	req := httptest.NewRequest("GET", "/nonexistent", nil)
	w := httptest.NewRecorder()

	homeHandler(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status %d for non-root path, got %d", http.StatusNotFound, w.Code)
	}
}
