import subprocess
import signal
import sys

def run_commands():
    processes = []
    
    try:
        # Run the http server command
        processes.append(subprocess.Popen(["python", "-m", "http.server", "8000"]))

        # Run the ollama serve command
        processes.append(subprocess.Popen(["ollama", "serve"]))
        
        # Wait for the subprocesses to complete
        for process in processes:
            process.wait()
    except KeyboardInterrupt:
        print("KeyboardInterrupt received, terminating subprocesses...")
        for process in processes:
            process.terminate()
        for process in processes:
            process.wait()  # Ensure all processes have terminated
        sys.exit(0)

if __name__ == "__main__":
    run_commands()
