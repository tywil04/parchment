# Tauri Notepad

### Warning: Its only in a minimal working state

A minimal text editor 

This project uses the following:
- SolidJS for a very performant and lightweight application
- TailwindCSS to style
- Tauri a Rust wrapper to create desktop applications using web technologies
- Uses this [Notepad](https://www.flaticon.com/free-icon/notebook_346081?related_id=346081&origin=search) icon from Flaticon (free to use for personal and commercial purposes) for the taskbar icon.
- A few [Tabler Icons](https://tablericons.com/) e.g for window control

This app currently doesn't follow Tauri's best practices. All of the business logic is implemented in the same place as the UI logic, this is bad design is classified as insecure. I will be changing this soon.

This app works on MacOS, Windows and Linux. All versions look and function the same. The only difference is that MacOS has the window controls on the left.

# Usage
Head to the releases page to download pre-build executables. 

If you would like to build this project from scratch you will need to do the following:
```
git clone https://github.com/tywil04/tauri-notepad.git
cd tauri-notepad
yarn
yarn tauri build
```

# Screenshots
![Windows 11 Dark Mode (With Text Wrapping)](/screenshots/win11-dark-wrapped.png)

# To Do
- [ ] Migrate Business Logic From JavaScript to Rust
- [x] Migrate from React to SolidJS
- [x] Migrate from BlueprintJS to TailwindCSS
- [ ] Security Settings
- [ ] Hotkeys
- [x] Clean up CSS
- [x] Test Windows
- [x] Test MacOS
- [x] Test Linux
- [x] Provide User With Feedback

# Ideas
- More Configuration
