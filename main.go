package main

import (
	"flag"
	"fmt"
	"os"
)

// fibonacci calculates the nth Fibonacci number
func fibonacci(n int) int {
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
	var name string
	var verbose bool
	var fib int

	flag.StringVar(&name, "name", "World", "Name to greet")
	flag.BoolVar(&verbose, "verbose", false, "Enable verbose output")
	flag.IntVar(&fib, "fib", -1, "Calculate Fibonacci number")
	flag.Parse()

	// If fib flag is provided, calculate and print Fibonacci
	if fib >= 0 {
		result := fibonacci(fib)
		fmt.Printf("Fibonacci(%d) = %d\n", fib, result)
		os.Exit(0)
	}

	if verbose {
		fmt.Printf("Greeting %s...\n", name)
	}

	fmt.Printf("Hello, %s!\n", name)

	if verbose {
		fmt.Println("Done!")
	}

	os.Exit(0)
}
