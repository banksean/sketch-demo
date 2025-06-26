package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strconv"
)

type WebConfig struct {
	Name    string `json:"name"`
	Verbose bool   `json:"verbose"`
}

type GreetingResponse struct {
	Messages []string  `json:"messages"`
	Config   WebConfig `json:"config"`
}

// webGreet generates greeting messages and returns them as a slice
func webGreet(config *WebConfig) []string {
	var messages []string

	if config.Verbose {
		messages = append(messages, formatVerbosePrefix(config.Name))
	}

	messages = append(messages, formatGreeting(config.Name))

	if config.Verbose {
		messages = append(messages, formatVerboseSuffix())
	}

	return messages
}

// homeHandler serves the main HTML page
func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	tmpl := `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World Web CLI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        input[type="text"]:focus {
            border-color: #007bff;
            outline: none;
        }
        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }
        button {
            background: #007bff;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        button:hover {
            background: #0056b3;
        }
        .result {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            border-radius: 5px;
            display: none;
        }
        .result.show {
            display: block;
        }
        .result pre {
            margin: 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
        }
        .nav {
            text-align: center;
            margin-bottom: 20px;
        }
        .nav a {
            color: #007bff;
            text-decoration: none;
            margin: 0 15px;
        }
        .nav a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav">
            <a href="/">🏠 Home</a>
            <a href="/docs">📄 Documentation</a>
            <a href="/api/greet?name=World&verbose=true">🕸️ API</a>
        </div>
        
        <h1>🌍 Hello World Web CLI</h1>
        
        <form id="greetForm">
            <div class="form-group">
                <label for="name">Name to greet:</label>
                <input type="text" id="name" name="name" value="World" placeholder="Enter a name">
            </div>
            
            <div class="form-group">
                <div class="checkbox-group">
                    <input type="checkbox" id="verbose" name="verbose">
                    <label for="verbose">Enable verbose output</label>
                </div>
            </div>
            
            <button type="submit">Generate Greeting</button>
        </form>
        
        <div id="result" class="result">
            <strong>Output:</strong>
            <pre id="output"></pre>
        </div>
    </div>

    <script>
        document.getElementById('greetForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value || 'World';
            const verbose = document.getElementById('verbose').checked;
            
            try {
                const response = await fetch('/api/greet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, verbose })
                });
                
                const data = await response.json();
                
                document.getElementById('output').textContent = data.messages.join('\n');
                document.getElementById('result').classList.add('show');
            } catch (error) {
                document.getElementById('output').textContent = 'Error: ' + error.message;
                document.getElementById('result').classList.add('show');
            }
        });
    </script>
</body>
</html>`

	t := template.Must(template.New("home").Parse(tmpl))
	t.Execute(w, nil)
}

// apiGreetHandler handles the API endpoint for greeting
func apiGreetHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var config WebConfig

	if r.Method == "POST" {
		if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
	} else {
		// Handle GET requests with query parameters
		config.Name = r.URL.Query().Get("name")
		if config.Name == "" {
			config.Name = "World"
		}

		verboseStr := r.URL.Query().Get("verbose")
		config.Verbose, _ = strconv.ParseBool(verboseStr)
	}

	messages := webGreet(&config)

	response := GreetingResponse{
		Messages: messages,
		Config:   config,
	}

	json.NewEncoder(w).Encode(response)
}

// docsHandler serves the documentation page
func docsHandler(w http.ResponseWriter, r *http.Request) {
	tmpl := `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation - Hello World Web CLI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #333;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .nav {
            text-align: center;
            margin-bottom: 20px;
        }
        .nav a {
            color: #007bff;
            text-decoration: none;
            margin: 0 15px;
        }
        .nav a:hover {
            text-decoration: underline;
        }
        code {
            background: #f1f1f1;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #007bff;
        }
        .endpoint {
            background: #e9f4ff;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .method {
            font-weight: bold;
            color: #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav">
            <a href="/">🏠 Home</a>
            <a href="/docs">📄 Documentation</a>
            <a href="/api/greet?name=World&verbose=true">🕸️ API</a>
        </div>
        
        <h1>📄 Documentation</h1>
        
        <h2>Overview</h2>
        <p>The Hello World Web CLI is a web-based version of the command-line greeting application. It provides both a user-friendly web interface and a REST API for generating customized greetings.</p>
        
        <h2>Features</h2>
        <ul>
            <li>🌐 Web-based interface for easy interaction</li>
            <li>🔧 Customizable name parameter</li>
            <li>📝 Verbose output option</li>
            <li>🚀 REST API for programmatic access</li>
            <li>📱 Responsive design</li>
        </ul>
        
        <h2>Web Interface</h2>
        <p>Access the main interface at <code>/</code> to:</p>
        <ul>
            <li>Enter a custom name to greet</li>
            <li>Toggle verbose output</li>
            <li>See the greeting output in real-time</li>
        </ul>
        
        <h2>API Endpoints</h2>
        
        <div class="endpoint">
            <h3>Generate Greeting</h3>
            <p><span class="method">POST</span> <code>/api/greet</code></p>
            <p><span class="method">GET</span> <code>/api/greet</code></p>
            
            <h4>POST Request Body:</h4>
            <pre>{
  "name": "World",
  "verbose": true
}</pre>
            
            <h4>GET Query Parameters:</h4>
            <ul>
                <li><code>name</code> (string): Name to greet (default: "World")</li>
                <li><code>verbose</code> (boolean): Enable verbose output (default: false)</li>
            </ul>
            
            <h4>Response:</h4>
            <pre>{
  "messages": [
    "Greeting World...",
    "Hello, World!",
    "Done!"
  ],
  "config": {
    "name": "World",
    "verbose": true
  }
}</pre>
        </div>
        
        <h2>Examples</h2>
        
        <h3>cURL Examples</h3>
        <pre># Simple greeting
curl "http://localhost:8080/api/greet?name=Alice"

# Verbose greeting
curl "http://localhost:8080/api/greet?name=Bob&verbose=true"

# POST request
curl -X POST "http://localhost:8080/api/greet" \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","verbose":true}'</pre>
        
        <h3>JavaScript Example</h3>
        <pre>fetch('/api/greet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'David', verbose: true })
})
.then(response => response.json())
.then(data => console.log(data.messages.join('\n')));</pre>
        
        <h2>Running the Server</h2>
        <pre># Start the web server
go run web_server.go main.go

# Or build and run
go build -o hello-web web_server.go main.go
./hello-web</pre>
        
        <p>The server will start on <code>http://localhost:8080</code></p>
    </div>
</body>
</html>`

	t := template.Must(template.New("docs").Parse(tmpl))
	t.Execute(w, nil)
}

func startWebServer() {
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/docs", docsHandler)
	http.HandleFunc("/api/greet", apiGreetHandler)

	port := ":8080"
	fmt.Printf("🌐 Starting Hello World Web CLI server on http://localhost%s\n", port)
	fmt.Println("📄 Documentation available at http://localhost:8080/docs")
	fmt.Println("🕸️ API endpoint at http://localhost:8080/api/greet")

	log.Fatal(http.ListenAndServe(port, nil))
}
