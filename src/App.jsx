import { createSignal } from "solid-js";
import Button from "./components/Button";

export default function App() {
  const [theme, setTheme] = createSignal("dark");
  
  return (
    <>
      <div className="flex flex-row p-2 space-x-2 border-b-[1px] border-gray-200 dark:border-gray-700">
        <div className="flex flex-row whitespace-nowrap mr-auto">
          <Button type="minimal">Open</Button>
          <div class="w-[1px] bg-gray-700 !m-2 !my-1"/>
          <Button type="minimal">New</Button>
          <div class="w-[1px] bg-gray-700 !m-2 !my-1"/>
          <Button type="minimal">Save</Button>
          <Button type="minimal">Save as</Button>
        </div>

        <div className="flex flex-row whitespace-nowrap ml-auto space-x-0.5">
          <Button type="minimal" className="!p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke={theme() === "dark" ? "#FFFFFF": "#000000"} fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </Button>

          <div class="w-[1px] bg-gray-700 !m-2 !my-1"/>

          <Button type="coloured-minimal" colour="green" className="!p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke={theme() === "dark" ? "#FFFFFF": "#000000"} fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Button>
          <Button type="coloured-minimal" colour="yellow" className="!p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke={theme() === "dark" ? "#FFFFFF": "#000000"} fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </Button>
          <Button type="coloured-minimal" colour="red" className="!p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke={theme() === "dark" ? "#FFFFFF": "#000000"} fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </>
  )
}