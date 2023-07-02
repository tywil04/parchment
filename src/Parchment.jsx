import { createSignal } from "solid-js";

import { appWindow } from "@tauri-apps/api/window";
import { save as saveDialog, open as openDialog, ask as askDialog, message } from "@tauri-apps/api/dialog"
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { open as openInDefault } from '@tauri-apps/api/shell';
import { type } from "@tauri-apps/api/os";
import { getVersion } from "@tauri-apps/api/app"

let platformName = "";
let version = "";
type().then(data => platformName = data);
getVersion().then(data => version = data);

if (window.matchMedia('(prefers-color-scheme: dark)').matches === true) {
  document.querySelector("html").classList.add("dark");
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener("change", event => {
  if (event.matches) {
    document.querySelector("html").classList.add("dark");
  } else {
    document.querySelector("html").classList.remove("dark");
  }
})

export default function Parchment() {
  const [selectedSettingsTab, setSelectedSettingsTab] = createSignal("display");
  const [startingState, setStartingState] = createSignal("");
  const [textEdited, setTextEdited] = createSignal(false);
  const [currentFilePath, setCurrentFilePath] = createSignal("");
  const [textWrapEnabled, setTextWrapEnabled] = createSignal(false);

  const regularButton = "disabled:pointer-events-none disabled:opacity-50 rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none w-fit h-fit bg-gray-100 text-black ring-gray-200 hover:shadow-gray-200 active:bg-gray-200 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:shadow-gray-700 dark:active:bg-gray-700";
  const minimalButton = "disabled:pointer-events-none disabled:opacity-50 rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none w-fit h-fit bg-transparent text-black ring-transparent hover:ring-gray-200 hover:bg-gray-100 active:bg-gray-200 active:ring-gray-200 dark:text-white dark:hover:ring-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:active:ring-gray-700";
  const colouredButton = colour => `disabled:pointer-events-none disabled:opacity-50 rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none w-fit h-fit bg-${colour}-500 text-white ring-${colour}-600 hover:shadow-${colour}-600 active:bg-${colour}-600 dark:bg-${colour}-700 dark:ring-${colour}-600 dark:hover:shadow-${colour}-600 dark:active:bg-${colour}-600`;
  const colouredMinimalButton = colour => `disabled:pointer-events-none disabled:opacity-50 rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none w-fit h-fit bg-transparent text-black ring-transparent hover:shadow-none hover:ring-${colour}-600 hover:bg-${colour}-500 active:bg-${colour}-600 active:ring-${colour}-600 dark:text-white dark:hover:ring-${colour}-600 dark:hover:bg-${colour}-700 dark:active:ring-${colour}-600 dark:active:bg-${colour}-600`

  const settingsSelectedStyle = "w-fit ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-t border border-gray-200 dark:border-gray-700 border-b-0 z-10";
  const settingsUnselectedStyle = "w-fit px-2 py-1 m-[1px] ml-[5px] cursor-pointer font-thin";

  const headerTextColour = "!text-gray-700 dark:!text-gray-300 select-none truncate";

  let textEditor;
  let statsDisplay;
  let fileNameDisplay;

  function calculateStats() {
    var words = textEditor.value.trim().replace("\n", " ").split(/(\s+)/).filter((word) => word.trim().length > 0).length;
    var characters = textEditor.value.replace("\n", "").replace(" ", "").length;
    statsDisplay.innerText = `${words} Words, ${characters} Characters`;

    setTextEdited(!(textEditor.value === startingState()));

    console.log(textEdited())
  }
  
  const getFileNameFromPath = (filePath) => filePath.replace(/^.*(\\|\/|\:)/, "");

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
          setTextEdited(false);
          setStartingState(textEditor.value);
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
            setStartingState(textEditor.value);
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
    setStartingState("")
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
        setStartingState(text);
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
    <div class="flex flex-col flex-grow h-full border border-gray-200 dark:border-gray-700">
      <div data-tauri-drag-region className="flex flex-row p-2 space-x-2 border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50 w-[100%] fixed">
        <div className="flex flex-row whitespace-nowrap mr-auto">
          
          <button className={`${minimalButton} ${headerTextColour} font-semibold hover:!text-gray-200`} onClick={openFile}>Open</button>

          <div class="w-[1px] bg-gray-200 dark:bg-gray-700 !m-2 !my-1"/>

          <button className={`${minimalButton} ${headerTextColour} font-semibold hover:!text-gray-200`} onClick={newFile}>New</button>

          <div class="w-[1px] bg-gray-200 dark:bg-gray-700 !m-2 !my-1"/>

          <button className={`${minimalButton} ${headerTextColour} font-semibold hover:!text-gray-200`} onClick={saveFile}>Save</button>
          <button className={`${minimalButton} ${headerTextColour} font-semibold hover:!text-gray-200`} onClick={saveFileAs}>Save as</button>
        </div>

        <div className="flex flex-row whitespace-nowrap ml-auto space-x-0.5">
          <button className={`!p-1 ${colouredMinimalButton("green")}`} onClick={() => appWindow.minimize()}>
            <svg className={`h-4 w-4 ${headerTextColour}`} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className={`!p-1.5 ${colouredMinimalButton("yellow")}`} onClick={() => appWindow.toggleMaximize()}>
            <svg className={`h-3 w-3 ${headerTextColour}`} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
            <span className={selectedSettingsTab() === "theme" ? settingsSelectedStyle: settingsUnselectedStyle} onClick={() => setSelectedSettingsTab("theme")}>Theme</span>
            <span className={selectedSettingsTab() === "about" ? settingsSelectedStyle: settingsUnselectedStyle} onClick={() => setSelectedSettingsTab("about")}>About</span>
          </div>
          <div className="flex flex-row ml-auto">
            <span ref={fileNameDisplay} className="w-fit px-1.5 py-1 m-[1px] truncate">
              {textEdited() ?
                <i>
                  Untitled
                </i>  
              :
                <>
                  Untitled
                </>
              }
            </span>
            
            <div class="w-[1px] bg-gray-200 dark:bg-gray-700 !m-1 !my-2"/>

            <span ref={statsDisplay} className="w-fit px-1.5 py-1 m-[1px] truncate font-thin">0 Words, 0 Chars</span>
          </div>
        </div>
        <div className="flex flex-row whitespace-nowrap overflow-auto bg-gray-100 dark:bg-gray-800 -mt-[1px] border-y border-gray-200 dark:border-gray-700 px-2 py-2">
          {selectedSettingsTab() === "display" ?
            <>
              <button className={`${minimalButton} ${headerTextColour}`} onClick={() => setTextWrapEnabled(!textWrapEnabled())}>{textWrapEnabled() ? "Disable": "Enable"} Text Wrap</button>
          
              <div class="w-[1px] bg-gray-200 dark:bg-gray-700 !m-1.5 !my-1"/>

              <button className={`${minimalButton} ${headerTextColour}`} onClick={() => textEditor.classList.add("font-sans")}>Sans</button>
              <button className={`${minimalButton} ${headerTextColour} font-serif`} onClick={() => textEditor.classList.add("font-serif")}>Serif</button>
              <button className={`${minimalButton} ${headerTextColour} font-mono`} onClick={() => textEditor.classList.add("font-mono")}>Mono</button>
            </>
          :selectedSettingsTab() === "theme" ?
            <>
              <button className={`${minimalButton} ${headerTextColour}`} onClick={() => document.querySelector("html").classList.add("dark")}>Dark Mode</button>
              <button className={`${minimalButton} ${headerTextColour}`} onClick={() => document.querySelector("html").classList.remove("dark")}>Light Mode</button>
            </>
          :selectedSettingsTab() === "about" ?
            <>
              <button className={`${colouredButton("blue")} mr-auto`} onClick={() => openInDefault("https://github.com/tywil04/tauri-notepad")}>Go To GitHub</button>

              <span className={`${headerTextColour} ml-auto px-2 py-0.5`}>Platform: {platformName}, Version: {version}</span>
            </>
          :null}
        </div>
      </div>

      <div className="mt-[112px] w-[100%] h-[100%] text-black dark:text-white text-sm overflow-auto relative">
        <textarea spellCheck={false} onInput={() => { calculateStats(); setTextEdited(true) }} wrap={textWrapEnabled() ? "on": "off"} ref={textEditor} class="p-3 w-full h-full outline-none resize-none bg-transparent -mb-[5px] cursor-auto"/>
      </div>
    </div>
  )
}
