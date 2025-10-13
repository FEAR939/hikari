# hikari

<div align="center">

[![Latest Release](https://img.shields.io/github/v/release/FEAR939/hikari?style=flat-square)](https://github.com/FEAR939/hikari/releases/latest)
[![License](https://img.shields.io/github/license/FEAR939/hikari?style=flat-square)](LICENSE)
[![Issues](https://img.shields.io/github/issues/FEAR939/hikari?style=flat-square)](https://github.com/FEAR939/hikari/issues)

</div>

## 📋 Table of Contents

- [Installation](#-installation)
- [Build from Source](#-build-from-source)
- [Extensions](#-extensions)
- [Auto-Updates](#-auto-updates)

## 📦 Installation

Download the latest version from the [Releases page](https://github.com/FEAR939/hikari/releases/latest).

### 🔄 Auto-Updates

Hikari includes a built-in auto-update feature that:
- ✅ Automatically checks for new versions
- 📬 Notifies you when updates are available
- ⬇️ Downloads updates in the background
- 🔔 Sends an OS notification when ready to install

To complete the update:
1. Restart the application
2. Grant installer permissions when prompted
3. You're done! 🎉

## 🛠️ Build from Source

> [!TIP]
> Follow these steps to build Hikari locally for development or testing.

### Prerequisites
- [Bun](https://bun.sh) installed on your system

### Steps

1. **Clone the repository**

   For the stable version:
   ```bash
   git clone https://github.com/FEAR939/hikari.git
   ```

   For the development version (latest changes):
   ```bash
   git clone https://github.com/FEAR939/hikari.git -b frontend-dev
   ```

2. **Navigate to the project directory**
   ```bash
   cd hikari
   ```

3. **Install dependencies**
   ```bash
   bun install
   ```

4. **Build the project**
   ```bash
   bun vite build
   ```

5. **Run the application**
   ```bash
   bun electron .
   ```

## 🧩 Extensions

By default, Hikari supports **local media files only**. To expand functionality and add support for streaming services or other sources, use the **built-in extension manager**.

### Installing Extensions
1. Open Hikari
2. Navigate to the Extension-Manager in Settings
3. Install available extensions on Github

---

<div align="center">

Made with ❤️ by the Hikari team

[Report Bug](https://github.com/FEAR939/hikari/issues) · [Request Feature](https://github.com/FEAR939/hikari/issues)

</div>
