# Tauri Notepad

### Warning: Its only in a minimal working state

A minimal text editor 

This project uses the following:
- React for a responsive user interface (create-react-app was used to setup React)
- BlueprintJS a fantastic component library for React
- Tauri a Rust wrapper to create desktop applications using JS/HTML/CSS
- Uses this [Notepad](https://www.flaticon.com/free-icon/notebook_346081?related_id=346081&origin=search) icon from Flaticon (free to use for personal and commercial purposes) for the taskbar icon.

This app currently doesn't follow Tauri's best practices. All of the business logic is implemented in the same place as the UI logic, this is bad design and possibly insecure. I will be changing this soon.

#### Windows 11 Dark Mode 
![Windows 11 Dark Mode (With Text Wrapping)](/screenshots/win11-dark-wrapped.png)

![Windows 11 Dark Mode](/screenshots/win11-dark.png)

#### Windows 11 Light Mode
![Windows 11 Light Mode (With Text Wrapping)](/screenshots/win11-light-wrapped.png)

![Windows 11 Light Mode](/screenshots/win11-light.png)
