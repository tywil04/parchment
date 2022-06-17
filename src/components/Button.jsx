const baseStyles = "rounded px-2 py-0.5 text-sm ring-1 duration-[50ms] hover:shadow select-none"
const styles = {
  "regular": "bg-gray-100 text-black ring-gray-200 hover:shadow-gray-200 active:bg-gray-200 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:shadow-gray-700 dark:active:bg-gray-700",
  "blue": "bg-blue-500 text-white ring-blue-600 hover:shadow-blue-600 active:bg-blue-600 dark:bg-blue-700 dark:ring-blue-600 dark:hover:shadow-blue-600 dark:active:bg-blue-600",
  "red": "bg-red-500 text-white ring-red-600 hover:shadow-red-600 active:bg-red-600 dark:bg-red-700 dark:ring-red-600 dark:hover:shadow-red-600 dark:active:bg-red-600",
  "green": "bg-green-500 text-white ring-green-600 hover:shadow-green-600 active:bg-green-600 dark:bg-green-700 dark:ring-green-600 dark:hover:shadow-green-600 dark:active:bg-green-600",
  "yellow": "bg-yellow-500 text-white ring-yellow-600 hover:shadow-yellow-600 active:bg-yellow-600 dark:bg-yellow-700 dark:ring-yellow-600 dark:hover:shadow-yellow-600 dark:active:bg-yellow-600",
  "minimal": "bg-transparent text-black ring-0 hover:ring-1 hover:ring-gray-200 active:bg-gray-200 dark:text-white dark:hover:ring-gray-700 dark:active:bg-gray-700",
}

export default function Button(props) {
  const buttonType = Object.keys(styles).indexOf(props.type) !== -1 ? props.type: "regular";
  const classes = props.className || "";
  return <button {...props} className={`${baseStyles} ${styles[buttonType]} ${classes}`}/>
}