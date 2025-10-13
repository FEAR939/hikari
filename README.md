# hikari

[Installation](#installation)
[Extensions](#extensions)

<h2><sub><img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png" alt="Package" width="25" height="25" /></sub> Installation</h2>

Take a look at the Releases page for the latest version or click [here](https://github.com/FEAR939/hikari/releases/latest).

### Updates

Hikari has an autoupdate feature implemented. It will automatically check for updates and notify you when a new version is available. It will also automatically download the update and send you a OS notification when the new version can be installed. Simply restart the application, grant the installer the necessary permissions, and that's it.

> [!TIP]
> In order to build from source, follow the steps below!

### Build from source

1. Clone the repository:
    - Stable:
      ```bash
      git clone https://github.com/FEAR939/hikari.git
      ```
    - Development (latest changes):
      ```bash
      git clone https://github.com/FEAR939/hikari.git -b frontend-dev
      ```
2. Change directory to the cloned repository:
    ```bash
    cd hikari
    ```
3. Install dependencies:
    ```bash
    bun install
    ```
4. Build the project:
    ```bash
    bun vite build
    ```
5. Run the project:
    ```bash
    bun electron .
    ```
### Extensions

By default, Hikari only supports local media files. To install other extensions, you can use the built-in extension manager.
