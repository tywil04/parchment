# Parchment
Parchment is a minimal minimal text editor written using web technologies for Windows, Linux and MacOS.

Special thanks to the following libraries and assets:
- [SolidJS](https://www.solidjs.com/) - for a very performant and lightweight javascript framework
- [TailwindCSS](https://tailwindcss.com/) to allow for simple styling of the application
- [Tauri](https://tauri.app/) - a rust wrapper that allows you to create fast and secure desktop applications using web technologies
- Uses this [Notepad](https://www.flaticon.com/free-icon/notebook_346081?related_id=346081&origin=search) icon from Flaticon (free to use for personal and commercial purposes) for the taskbar icon.
- [Tabler Icons](https://tablericons.com/) for the few icons used within this application.

This app should work on Windows, MacOS and Linux however it only has been tested on Windows. 

# Usage
Head to the releases page to download pre-built executables. If you want you can build it, please follow the building section below.

# Building
Before you build, you need to have the following installed and configured:
```
rust
cargo (rust)
tauri
nodejs
yarn (npm package manager that I use)
```

Once everything needed is installed, building this app is very simple:
```
git clone https://github.com/tywil04/parchment.git
cd parchment
yarn
yarn tauri build
```

Once the build has been completed, you will find the executables in src-tauri/target/release/bundle

# Screenshots
![Windows 11 Dark Mode](/screenshots/windows11-dark.png)
![Windows 11 Light Mode](/screenshots/windows11-light.png)
