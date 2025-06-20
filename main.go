package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	var name string
	var verbose bool

	flag.StringVar(&name, "name", "World", "Name to greet")
	flag.BoolVar(&verbose, "verbose", false, "Enable verbose output")
	flag.Parse()

	if verbose {
		fmt.Printf("Greeting %s...\n", name)
	}

	fmt.Printf("Hello, %s!\n", name)

	if verbose {
		fmt.Println("Done!")
	}

	os.Exit(0)
}
