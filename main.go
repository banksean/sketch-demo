package main

import (
	"flag"
	"fmt"
	"os"
)

// fibonacci calculates the nth Fibonacci number
func fibonacci(n int) int {
	if n < 0 {
		return 0
	}
	if n <= 1 {
		return n
	}

	a, b := 0, 1
	for i := 2; i <= n; i++ {
		a, b = b, a+b
	}
	return b
}

func main() {
	// Define the -fib flag
	fibFlag := flag.Int("fib", -1, "Calculate and print the Fibonacci value of the given number")

	// Parse command line flags
	flag.Parse()

	// Check if the fib flag was provided
	if *fibFlag == -1 {
		fmt.Println("Usage: go run main.go -fib <number>")
		fmt.Println("Example: go run main.go -fib 10")
		os.Exit(1)
	}

	// Calculate and print the Fibonacci value
	result := fibonacci(*fibFlag)
	fmt.Printf("Fibonacci(%d) = %d\n", *fibFlag, result)
}
