import subprocess

def run_commands():
    # Run the http server command
    subprocess.Popen(["python", "-m", "http.server", "8000"])

    # Run the ollama serve command
    subprocess.Popen(["ollama", "serve"])

if __name__ == "__main__":
    run_commands()
