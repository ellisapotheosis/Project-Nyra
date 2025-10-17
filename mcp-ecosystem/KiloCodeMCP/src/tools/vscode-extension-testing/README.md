# VSCode Extension Testing Tools

This directory contains MCP tools for testing VSCode extensions by launching them in development mode with specific test prompts.

## Tools

### launch_dev_extension

Launches a VSCode extension in development mode with a test prompt.

**Parameters:**
- `extensionPath` (string): Path to the extension development directory
- `prompt` (string): The prompt to execute in the extension
- `launchDir` (string): Directory to open Visual Studio Code in and write the prompt to

**Note:**
- This tool blocks until the extension test completes or is explicitly stopped by a call to `stop_dev_extension`

**Example:**
```json
{
  "tool": "launch_dev_extension",
  "arguments": {
    "extensionPath": "/path/to/my-extension/src",
    "prompt": "Create a new TypeScript file with a hello world function",
    "launchDir": "/path/to/test-directory"
  }
}
```

### stop_dev_extension

Stops the currently running VSCode extension test and unblocks the waiting `launch_dev_extension` call.

**Parameters:**
- `sessionId` (string, optional): ID of the session to stop. If not provided, stops the most recently launched extension test.

**Example:**
```json
{
  "tool": "stop_dev_extension",
  "arguments": {
    "sessionId": "test-a1b2c3d4"
  }
}
```

Or to stop the most recent session:
```json
{
  "tool": "stop_dev_extension",
  "arguments": {}
}
```

## How It Works

1. When `launch_dev_extension` is called:
   - A unique session ID is generated
   - A `.kilocode/launchPrompt.md` file is written to the launch directory with the prompt and session ID
   - VSCode is launched with the extension in development mode using the `--wait` flag
   - The `--wait` flag ensures the process stays alive until the window is closed
   - The extension can read the `.kilocode/launchPrompt.md` file and execute the prompt
   - The tool call blocks and waits for the extension to complete
   - Session information is stored persistently to allow access from different processes

2. When the extension completes its work:
   - It (or another client) calls `stop_dev_extension`
   - The VSCode process is terminated
   - The `.kilocode/launchPrompt.md` file is preserved for debugging purposes
   - Results are returned to both the `stop_dev_extension` caller and the waiting `launch_dev_extension` caller

3. Cross-process session management:
   - Session information is stored in a file in the system's temporary directory
   - This allows sessions to be managed across different processes
   - You can launch an extension in one process and stop it from another

## Implementation Details

- `extensionManager.ts`: Singleton class that manages the lifecycle of extension test processes
- `sessionStorage.ts`: Handles persistent storage of session information across processes
- `types.ts`: Type definitions for the tools
- `launchDevExtension.ts`: Implementation of the launch tool
- `stopDevExtension.ts`: Implementation of the stop tool

## Process Management

The tools use several techniques to ensure reliable process management:

1. **Using the `--wait` flag**: When launching VS Code, we use the `--wait` flag which keeps the process alive until the window is closed. This ensures that the process we get from `spawn()` is the actual VS Code window process, not just a short-lived CLI wrapper.

2. **Two-step termination**: When stopping a process, we first try SIGTERM for graceful shutdown, then fall back to SIGKILL if the process doesn't terminate within a timeout period.

3. **Cross-process termination**: Sessions store the PID of the VS Code process, allowing any process to terminate the VS Code window, even if it wasn't the one that launched it.

## Security Considerations

- All file paths are validated to prevent directory traversal
- Process management includes proper cleanup to prevent resource leaks
- Prompt content is sanitized before writing to disk
- Session data is stored securely in the system's temporary directory

## Testing Cross-Process Functionality

A test script is provided to demonstrate the cross-process functionality:

```bash
# Launch an extension in one process
node examples/test-vscode-extension-persistence.js launch /path/to/extension/src "Your test prompt" /path/to/test-directory

# Stop the extension from another process using the session ID
node examples/test-vscode-extension-persistence.js stop test-a1b2c3d4
```

This allows you to verify that sessions can be managed across different processes.