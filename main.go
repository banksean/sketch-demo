package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

// secureHeaders sets essential security headers
func secureHeaders(w http.ResponseWriter) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Frame-Options", "DENY")
	w.Header().Set("X-XSS-Protection", "1; mode=block")
	w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
	w.Header().Set("Content-Security-Policy", "default-src 'self'")
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
}

// logRequest logs basic request information
func logRequest(r *http.Request) {
	log.Printf("%s %s %s %s", r.RemoteAddr, r.Method, r.URL.Path, r.UserAgent())
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	// Log the request
	logRequest(r)

	// Only allow GET requests
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		fmt.Fprintf(w, "Method %s not allowed", r.Method)
		return
	}

	// Only serve root path
	if r.URL.Path != "/" {
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "Path %s not found", r.URL.Path)
		return
	}

	// Set security headers
	secureHeaders(w)

	// Send response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Hello, World!")
}

func main() {
	// Create server with timeouts
	server := &http.Server{
		Addr:         ":8081",
		Handler:      http.HandlerFunc(helloHandler),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Starting secure server on http://localhost:8081")
	log.Fatal(server.ListenAndServe())
}
