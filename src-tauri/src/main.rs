#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[cfg(any(target_os = "windows", target_os = "macos"))]
use window_shadows::set_shadow;

use tauri::Manager;

fn main() {
  #[cfg(target_os = "windows")]
  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      set_shadow(&window, true).expect("Unsupported platform!");
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

  #[cfg(not(target_os = "windows"))]
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}