#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

// windows (they support the shadows plugin)
#[cfg(target_os = "windows")]
fn main() {
  use window_shadows::set_shadow;
  use tauri::Manager;

  tauri::Builder::default()
    .setup(|app| {
      let window = app.get_window("main").unwrap();
      set_shadow(&window, true).expect("Unsupported platform!");
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// Any platform that is not windows
#[cfg(not(target_os = "windows"))]
fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}