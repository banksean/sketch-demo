package main

import "testing"

func TestFibonacci(t *testing.T) {
	tests := []struct {
		n        int
		expected int
	}{
		{0, 0},
		{1, 1},
		{2, 1},
		{3, 2},
		{4, 3},
		{5, 5},
		{6, 8},
		{7, 13},
		{8, 21},
		{9, 34},
		{10, 55},
		{15, 610},
		{20, 6765},
		{-1, 0}, // negative numbers should return 0
		{-5, 0},
	}

	for _, test := range tests {
		result := fibonacci(test.n)
		if result != test.expected {
			t.Errorf("fibonacci(%d) = %d; expected %d", test.n, result, test.expected)
		}
	}
}
