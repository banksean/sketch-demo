package main

import (
	"fmt"
	"log"
	"net/http"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World!")
}

func main() {
	http.HandleFunc("/", helloHandler)

	port := ":8081"
	log.Printf("Starting server on http://localhost%s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
