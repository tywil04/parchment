# Tauri Notepad
A minimal text editor written using web technologies for Windows, Linux and MacOS

Thanks to the following:
- SolidJS for a very performant and lightweight application
- TailwindCSS to allow for simple styling of the application
- Tauri - a rust wrapper that allows you to create fast and secure desktop applications using web technologies
- Uses this [Notepad](https://www.flaticon.com/free-icon/notebook_346081?related_id=346081&origin=search) icon from Flaticon (free to use for personal and commercial purposes) for the taskbar icon.
- A few [Tabler Icons](https://tablericons.com/) for the window control buttons

This app should work on Windows, MacOS and Linux however it only has been tested on Windows. 

# Usage
Head to the releases page to download pre-build executables. 

If you would like to build this project from scratch take a look at the building section.

# Building
*Please note: Tauri currently does not support cross-platform building. You can only build for the specific os and architecture your machine is.

Building this app is very simple:
```
git clone https://github.com/tywil04/tauri-notepad.git
cd tauri-notepad
yarn
yarn tauri build
```

Once the build has been completed, you will find the executables in src-tauri/target/release/bundle

# Screenshots
![Windows 11 Dark Mode](/screenshots/windows11-dark.png)
![Windows 11 Light Mode](/screenshots/windows11-light.png)