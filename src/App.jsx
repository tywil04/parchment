import { createSignal } from "solid-js";

import { appWindow } from "@tauri-apps/api/window";
import { save as saveDialog, open as openDialog, ask as askDialog, message } from "@tauri-apps/api/dialog"
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { type } from "@tauri-apps/api/os";

export default function App() {
  const [selectedSettingsTab, setSelectedSettingsTab] = createSignal("display")
  const [theme, setTheme] = createSignal("dark");
  const [textEdited, setTextEdited] = createSignal(false);
  const [currentFilePath, setCurrentFilePath] = createSignal("");
  const [textWrapEnabled, setTextWrapEnabled] = createSignal(false);

  const regularButton = "rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none w-fit h-fit bg-gray-100 text-black ring-gray-200 hover:shadow-gray-200 active:bg-gray-200 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:shadow-gray-700 dark:active:bg-gray-700";
  const minimalButton = "rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none w-fit h-fit bg-transparent text-black ring-transparent hover:ring-gray-200 hover:bg-gray-100 active:bg-gray-200 active:ring-gray-200 dark:text-white dark:hover:ring-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:active:ring-gray-700";
  const colouredButton = colour => `rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none w-fit h-fit bg-${colour}-500 text-white ring-${colour}-600 hover:shadow-${colour}-600 active:bg-${colour}-600 dark:bg-${colour}-700 dark:ring-${colour}-600 dark:hover:shadow-${colour}-600 dark:active:bg-${colour}-600`;
  const colouredMinimalButton = colour => `rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none w-fit h-fit bg-transparent text-black ring-transparent hover:shadow-none hover:ring-${colour}-600 hover:bg-${colour}-500 active:bg-${colour}-600 dark:text-white dark:hover:ring-${colour}-600 dark:hover:bg-${colour}-700 dark:active:bg-${colour}-600`

  const settingsSelectedStyle = "w-fit ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-t border border-gray-200 dark:border-gray-700 border-b-0 z-10";
  const settingsUnselectedStyle = "w-fit px-2 py-1 m-[1px] ml-[5px] cursor-pointer font-thin";

  const headerTextColour = "!text-gray-700 dark:!text-gray-300 select-none";

  let textEditor;
  let statsDisplay;
  let fileNameDisplay;

  function calculateStats() {
    var words = textEditor.value.trim().replace("\n", " ").split(/(\s+)/).filter((word) => word.trim().length > 0).length;
    var characters = textEditor.value.replace("\n", "").replace(" ", "").length;
    statsDisplay.innerText = `${words} Words, ${characters} Characters`;
  }
  
  const getFileNameFromPath = (filePath) => filePath.replace(/^.*(\\|\/|\:)/, "");

  const notImplemented = () => {
    message("This application is still in development and this feature is not implemented yet. This button is a placeholder.");
  }

  const discardQuery = (good, badToastMessage) => {
    askDialog("Would you like to discard your work?").then((yes) => {
      if (yes) {
        good();
      } else {
        message(badToastMessage);
      }
    })
  }

  const saveFileAs = () => {
    return saveDialog().then((filePath) => {
      writeFile({contents: textEditor.value, path: filePath}).then(
        () => {
          fileNameDisplay.innerText = getFileNameFromPath(filePath);
          setCurrentFilePath(filePath);
          setTextEdited(false)
        },
        () => message("Error while saving, please try again."));
    }, 
    () => message("Error while saving, please try again."));
  }

  const saveFile = () => {
    if (currentFilePath() !== "") {
      return new Promise((success, failure) => {
        writeFile({contents: textEditor.value, path: currentFilePath()}).then(
          () => {
            setTextEdited(false);
            success();
          },
          () => {
            failure();
            message("Error while saving, please try again.")
          }
        );
      })
    } else {
      return saveFileAs();
    }
  }

  const clear = () => {
    textEditor.value = "";
    setCurrentFilePath("");
    fileNameDisplay.innerText = "";
    setTextEdited(false);
    calculateStats();
  }

  const newFile = () => {
    if (textEdited() === false) {
      clear();
    } else {
      discardQuery(clear, "To create a new file please save or discard your work.");
    }
  }

  const open = () => {
    clear(); // Clear all
    return openDialog().then((filePath) => {
      readTextFile(filePath).then((text) => {
        textEditor.value = text;
        setCurrentFilePath(filePath);
        fileNameDisplay.innerText = getFileNameFromPath(filePath);
        calculateStats(); // Update words and characters (It should be 0, however its best to run the function)
      }, () => message("Error while opening file, please try again."));
    }, 
    () => message("Error while opening file, please try again."));
  }

  const openFile = () => {
    if (textEdited() === false) {
      open();
    } else {
      discardQuery(open, "To open a new file please save or discard your work.");
    }
  }

  const closeApplication = () => {
    if (textEdited() === false) {
      appWindow.close();
    } else {
      discardQuery(() => appWindow.close(), "To close please save or discard your work.");
    }
  }

  return (
    <div class="flex flex-col flex-grow h-full">
      <div data-tauri-drag-region className="flex flex-row p-2 space-x-2 border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50 w-[100%] fixed">
        <div className="flex flex-row whitespace-nowrap mr-auto">
          <button className={`${minimalButton} ${headerTextColour} font-semibold`} onClick={openFile}>Open</button>
          <div class="w-[1px] bg-gray-700 !m-2 !my-1"/>
          <button className={`${minimalButton} ${headerTextColour} font-semibold`} onClick={newFile}>New</button>
          <div class="w-[1px] bg-gray-700 !m-2 !my-1"/>
          <button className={`${minimalButton} ${headerTextColour} font-semibold`} onClick={saveFile}>Save</button>
          <button className={`${minimalButton} ${headerTextColour} font-semibold`} onClick={saveFileAs}>Save as</button>
        </div>

        <div className="flex flex-row whitespace-nowrap ml-auto space-x-0.5">
          <button className={`!p-1 ${colouredMinimalButton("green")}`} onClick={() => appWindow.minimize()}>
            <svg className={`h-4 w-4 ${headerTextColour}`} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className={`!p-1 ${colouredMinimalButton("yellow")}`} onClick={() => appWindow.toggleMaximize()}>
            <svg className={`h-4 w-4 ${headerTextColour}`} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
          <button className={`!p-1 ${colouredMinimalButton("red")}`} onClick={closeApplication}>
            <svg className={`h-4 w-4 ${headerTextColour}`} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div data-tauri-drag-region className={`flex flex-col text-sm bg-gray-100/50 dark:bg-gray-800/50 fixed mt-[40px] w-[100%] ${headerTextColour}`}>
        <div data-tauri-drag-region className="flex flex-row px-1 w-[100%]">
          <div className="flex !flex-row mr-auto">
            <span className={selectedSettingsTab() === "display" ? settingsSelectedStyle: settingsUnselectedStyle} onClick={() => setSelectedSettingsTab("display")}>Display</span>
            <span className={selectedSettingsTab() === "security" ? settingsSelectedStyle: settingsUnselectedStyle} onClick={() => setSelectedSettingsTab("security")}>Security</span>
            <span className={selectedSettingsTab() === "theme" ? settingsSelectedStyle: settingsUnselectedStyle} onClick={() => setSelectedSettingsTab("theme")}>Theme</span>
          </div>
          <div className="flex flex-row ml-auto">
            <span ref={fileNameDisplay} className={`w-fit px-1.5 py-1 m-[1px] truncate ${textEdited() ? "italic": ""}`}>Untitled</span>
            <div class="w-[1px] bg-gray-700 !m-1 !my-2"/>
            <span ref={statsDisplay} className="w-fit px-1.5 py-1 m-[1px] truncate font-thin">0 Words, 0 Chars</span>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 -mt-[1px] border-y border-gray-200 dark:border-gray-700 px-2 py-2">
          <button className={`${minimalButton} ${headerTextColour}`} onClick={() => setTextWrapEnabled(!textWrapEnabled())}>{textWrapEnabled() ? "Disable": "Enable"} Text Wrap</button>
        </div>
      </div>

      <div className="mt-[112px] w-[100%] h-[100%] text-black dark:text-white text-sm overflow-auto relative">
        <textarea spellCheck={false} onInput={() => { calculateStats(); setTextEdited(true) }} wrap={textWrapEnabled() ? "on": "off"} ref={textEditor} class="p-3 w-full h-full outline-none resize-none bg-transparent -mb-[5px] cursor-auto"/>
      </div>
    </div>
  )
}