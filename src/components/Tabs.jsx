import { createSignal } from "solid-js";

export default function Tabs(props) {
  const tabs = props.data || [{value: "", label: ""}];
  const [selectedTab, setSelectedTab] = createSignal(tabs[0])
  const selected = "w-fit ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-t border border-gray-200 dark:border-gray-700 border-b-0 z-10";
  const unselected = "w-fit px-2 py-1 m-[1px] ml-[5px] cursor-pointer";

  function selectionChangeHandler(newSelection) {
    setSelectedTab(newSelection);
    try {
      props.selectionChange(newSelection.value);
    } catch {}
  }

  return (
    <div className="flex flex-col text-xs text-black dark:text-white bg-gray-100/50 dark:bg-gray-800/50">
      <div className="flex flex-row w-fit pl-1.5">
        {tabs.map(object => <span className={object.value === selectedTab().value ? selected: unselected} onClick={() => selectionChangeHandler(object)}>{object.label}</span>)}
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 -mt-[1px] border-y border-gray-200 dark:border-gray-700 px-2 py-1">
        Test
      </div>
    </div>
  )
}