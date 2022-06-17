export default function Button(props) {
  const colour = props.colour || "blue";
  const classes = props.className || "";

  const baseStyles = "rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none w-fit h-fit";
  const styles = {
    "regular": "bg-gray-100 text-black ring-gray-200 hover:shadow-gray-200 active:bg-gray-200 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:shadow-gray-700 dark:active:bg-gray-700",
    "minimal": "bg-transparent text-black ring-transparent hover:ring-gray-200 hover:bg-gray-100 active:bg-gray-200 active:ring-gray-200 dark:text-white dark:hover:ring-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:active:ring-gray-700",
    "coloured": `bg-${colour}-500 text-white ring-${colour}-600 hover:shadow-${colour}-600 active:bg-${colour}-600 dark:bg-${colour}-700 dark:ring-${colour}-600 dark:hover:shadow-${colour}-600 dark:active:bg-${colour}-600`,
    "coloured-minimal": `bg-transparent text-black ring-transparent hover:shadow-none hover:ring-${colour}-600 hover:bg-${colour}-500 active:bg-${colour}-600 dark:text-white dark:hover:ring-${colour}-600 dark:hover:bg-${colour}-700 dark:active:bg-${colour}-600`,
  }

  const buttonType = Object.keys(styles).indexOf(props.type) !== -1 ? props.type: "regular";
  return <button {...props} className={`${baseStyles} ${styles[buttonType]} ${classes}`}/>;
}
// "regular": `bg-gray-100 text-black ring-gray-200 hover:shadow-gray-200 active:bg-gray-200 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:shadow-gray-700 dark:active:bg-gray-700`,
// "coloured": `bg-${colour}-500 text-white ring-${colour}-600 hover:shadow-${colour}-600 active:bg-${colour}-600 dark:bg-${colour}-700 dark:ring-${colour}-600 dark:hover:shadow-${colour}-600 dark:active:bg-${colour}-600`,
// "minimal": `bg-transparent text-black ring-0 hover:ring-1 hover:ring-gray-200 active:bg-gray-200 dark:text-white dark:hover:ring-gray-700 dark:active:bg-gray-700`,
// "coloured-minimal": `bg-transparent text-black ring-0 hover:ring-1 hover:ring-gray-200 active:bg-${colour}-600 dark:text-white dark:hover:ring-gray-700 dark:active:bg-${colour}-600`,