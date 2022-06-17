import { createSignal } from "solid-js";
import Button from "./components/Button";
import Tabs from "./components/Tabs";

export default function App() {
  const [selectedSettingsTab, setSelectedSettingsTab] = createSignal("display")
  const [theme, setTheme] = createSignal("dark");

  const settingsSelectedStyle = "w-fit ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-t border border-gray-200 dark:border-gray-700 border-b-0 z-10";
  const settingsUnselectedStyle = "w-fit px-2 py-1 m-[1px] ml-[5px] cursor-pointer";
  const headerTextColour = "!text-gray-700 dark:!text-gray-300 select-none";

  return (
    <>
      <div data-tauri-drag-region className="flex flex-row p-2 space-x-2 cursor-move border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50 relative">
        <div className="flex flex-row whitespace-nowrap mr-auto">
          <Button type="minimal" className={`${headerTextColour} font-semibold`}>Open</Button>
          <div class="w-[1px] bg-gray-700 !m-2 !my-1"/>
          <Button type="minimal" className={`${headerTextColour} font-semibold`}>New</Button>
          <div class="w-[1px] bg-gray-700 !m-2 !my-1"/>
          <Button type="minimal" className={`${headerTextColour} font-semibold`}>Save</Button>
          <Button type="minimal" className={`${headerTextColour} font-semibold`}>Save as</Button>
        </div>

        <div className="flex flex-row whitespace-nowrap ml-auto space-x-0.5">
          <Button type="coloured-minimal" colour="green" className="!p-1">
            <svg className={`h-4 w-4 ${headerTextColour}`} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Button>
          <Button type="coloured-minimal" colour="yellow" className="!p-1">
            <svg className={`h-4 w-4 ${headerTextColour}`} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </Button>
          <Button type="coloured-minimal" colour="red" className="!p-1">
            <svg className={`h-4 w-4 ${headerTextColour}`} viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>

      <div data-tauri-drag-region className={`flex flex-col text-sm bg-gray-100/50 dark:bg-gray-800/50 relative ${headerTextColour}`}>
        <div data-tauri-drag-region className="flex flex-row px-1 w-[100%]">
          <div className="flex !flex-row mr-auto">
            <span className={selectedSettingsTab() === "display" ? settingsSelectedStyle: settingsUnselectedStyle} onClick={() => setSelectedSettingsTab("display")}>Display</span>
            <span className={selectedSettingsTab() === "security" ? settingsSelectedStyle: settingsUnselectedStyle} onClick={() => setSelectedSettingsTab("security")}>Security</span>
            <span className={selectedSettingsTab() === "theme" ? settingsSelectedStyle: settingsUnselectedStyle} onClick={() => setSelectedSettingsTab("theme")}>Theme</span>
          </div>
          <div className="flex flex-row ml-auto">
            <span className="w-fit px-2 py-1 m-[1px] italic">0 Words, 0 Characters</span>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 -mt-[1px] border-y border-gray-200 dark:border-gray-700 px-2 py-1">
          Test
        </div>
      </div>

      <div className="flex flex-col h-full">
        <textarea  className="outline-none bg-transparent resize-none text-sm text-black dark:text-white p-3 w-[100%] flex flex-col flex-grow"/>
      </div>
    </>
  )
}