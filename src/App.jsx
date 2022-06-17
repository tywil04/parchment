import Button from "./components/Button";

export default function App() {
  return (
    <div>
      <div class="dark bg-gray-900 w-[100%] h-[fit-content] text-black dark:text-white p-10 space-x-3">
        <Button>Regular</Button>
        <Button type="blue">Blue</Button>
        <Button type="red">Red</Button>
        <Button type="green">Green</Button>
        <Button type="yellow">Yellow</Button>
        <Button type="minimal">Minimal</Button>
      </div>
      <div class="bg-gray-50 w-[100%] h-[fit-content] text-black dark:text-white p-10 space-x-3">
        <Button>Regular</Button>
        <Button type="blue">Blue</Button>
        <Button type="red">Red</Button>
        <Button type="green">Green</Button>
        <Button type="yellow">Yellow</Button>
        <Button type="minimal">Minimal</Button>
      </div>
    </div>
  )
}