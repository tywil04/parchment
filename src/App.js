import React from "react";
import ReactDOM from 'react-dom/client';

import { appWindow } from '@tauri-apps/api/window'
import { save as saveDialog, open as openDialog } from "@tauri-apps/api/dialog"
import { readTextFile, writeFile } from "@tauri-apps/api/fs";

import { Menu, MenuItem, Divider, MenuDivider, Dialog, Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { ContextMenu2, Tooltip2 } from "@blueprintjs/popover2";

// To do:
// Settings:
//  Theme selector: Light/Dark/Custom?
//  Text wrapping: Bool
// 
// Open Functionality
// New Functionality
// Encrypting Contents Functionality 
// 
// Etc

export default function App() {
  const [currentFilePath, setCurrentFilePath] = React.useState("");
  const fileNameRef = React.useRef();
  const statisticsDisplayRef = React.useRef();
  const textEditorRef = React.useRef();

  // Disable default context menu so a custom one can be used via BlueprintJS/popover2's ContextMenu2
  window.onContextMenu = (event) => {
    event.preventDefault(); 
    event.stopPropagation();
  };

  // Handles the logic behind the stats display
  const calculateWordsAndCharacters = (event) => {
    var words = event.target.value.trim().replace("\n", " ").split(/(\s+)/).filter((word) => word.trim().length > 0).length;
    var characters = event.target.value.replace("\n", "").replace(" ", "").length
    statisticsDisplayRef.current.innerText = `${words} Words, ${characters} Characters`
  }

  // Get file name from path using a regular expression
  const getFileNameFromPath = (filePath) => filePath.replace(/^.*(\\|\/|\:)/, "");

  const generateRandomString = () => Math.random().toString(16).substr(2, 14);

  // Renders a dialog that returns a promise. A success is the save button being pressed, a failure is the delete button being pressed
  const runDiscardDialog = () => {
    return new Promise((success, failure) => {
      const random = "discard-dialog-" + generateRandomString();

      // Create a div with a random id that will be used to hold the dialog
      var div = document.createElement("div")
      div.id = random;
      document.querySelector("body").appendChild(div);

      // Dialog component
      const InternalDialog = (props) => {
        const [open, setOpen] = React.useState(true);
        return (
          <Dialog usePortal={false} title="Discard Contents" isOpen={open} onClose={() => setOpen(false)} onClosed={() => document.getElementById(random).remove()}>
            <div className={Classes.DIALOG_BODY}>
              <p>
                What would you like to do with this file? You can discard it, save it or continue editing it.
              </p>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button small text="Continue Editing" onClick={() => setOpen(false)}/>
                <Button small intent="danger" text="Discard" onClick={() => {setOpen(false); props.failure()}}/>
                <Button small intent="primary" text="Save" onClick={() => {setOpen(false); props.success()}}/>
              </div>
            </div>
          </Dialog>
        )
      }

      // Render the dialog in the div that was created
      ReactDOM.createRoot(document.getElementById(random)).render(
        <InternalDialog success={success} failure={failure}/>
      );
    })
  }

  const saveFileAs = () => {
    return saveDialog().then((filePath) => {
      writeFile({contents: textEditorRef.current.value, path: filePath});
      fileNameRef.current.innerText = getFileNameFromPath(filePath);
      setCurrentFilePath(filePath);
    })
  }

  const saveFile = () => {
    if (currentFilePath !== "") {
      try {
        writeFile({contents: textEditorRef.current.value, path: currentFilePath});
      } catch {
        return saveFileAs();
      }
    } else {
      return saveFileAs();
    }
  }

  const clearFile = () => {
    textEditorRef.current.value = "";
    setCurrentFilePath("");
    fileNameRef.current.innerText = "untitled";
  }

  const newFile = () => {
    if (textEditorRef.current.value !== "") {
      const discardDialog = runDiscardDialog();
      discardDialog.then(
        () => {
          const file = saveFile();
          file.then(clearFile)
        } ,
        clearFile,
      )
    }
  }

  const openFile = () => {

  }

  // const openFile = () => {
  //   openDialog().then((filePath) => {
  //     readTextFile(filePath).then((text) => 
  //       textEditorRef.current.value = text
  //     )
  //     fileNameRef.current.innerText = filePath;
  //   })
  // }

  // const newFile = () => {
  //   console.log(textEditorRef.current.value.trim())
  //   if (textEditorRef.current.value.trim() === "") {
  //     fileNameRef.current.innerText = "Untitled"
  //     textEditorRef.current.value = "";
  //   } else {
  //     saveFile(textEditorRef.current.value)
  //     fileNameRef.current.innerText = "Untitled"
  //     textEditorRef.current.value = "";
  //   }
  // }

  return (
    <>
      <ContextMenu2
        content={
          <Menu>
            <MenuItem icon="minus" text="Minimize" onClick={() => appWindow.minimize()}/>
            <MenuItem icon="plus" text="Maximize" onClick={() => appWindow.toggleMaximize()}/>
            <MenuItem icon="cross" text="Close" intent="danger" onClick={() => appWindow.close()}/>
          </Menu>
        }>

        <div data-tauri-drag-region className="titlebar">
          <div className="titlebar:left">
            <ButtonGroup minimal small>
              <Button small text="Open" className="titlebar:button"/>
            </ButtonGroup>

            <Divider/>

            <ButtonGroup minimal small>
              <Button small text="New" className="titlebar:button" onClick={newFile}/>
            </ButtonGroup>

            <Divider/>

            <ButtonGroup minimal small>
              <Button small text="Save" className="titlebar:button" onClick={saveFile}/>
              <Button small text="Save as" className="titlebar:button" onClick={saveFileAs}/>
            </ButtonGroup>
          </div>

          <div className="titlebar:right">
            <ButtonGroup minimal small>
              <Tooltip2 hoverOpenDelay={350} content="Text Search">
                <Button small icon="search-text"/>
              </Tooltip2>

              <Tooltip2 hoverOpenDelay={350} content="Encrypt Contents">
                <Button small icon="lock"/>
              </Tooltip2>

              <Tooltip2 hoverOpenDelay={350} content="Settings">
                <Button small icon="cog"/>
              </Tooltip2>
            </ButtonGroup>

            <Divider/>

            <ButtonGroup small minimal>
              <Button small icon="minus" onClick={() => appWindow.minimize()}/>
              <Button small icon="small-square" onClick={() => appWindow.toggleMaximize()}/>
              <Button small icon="cross" onClick={() => appWindow.close()}/>
            </ButtonGroup>
          </div>
        </div>
        
        <div className="titlebar:lower">
          <span ref={fileNameRef} className="titlebar:text titlebar:lower:left">untitled</span>
          <span ref={statisticsDisplayRef} className="titlebar:text titlebar:lower:right">0 Words,  0 Characters</span>
        </div>
      </ContextMenu2>


      <ContextMenu2
        className="content"
        content={
          <Menu>
            <MenuItem icon="moon" text="Toggle Theme" onClick={() => document.querySelector("body").classList.toggle("bp4-dark")}/>
            <MenuDivider/>
            <MenuItem text="Window Controls">
              <MenuItem icon="minus" text="Minimize" onClick={() => appWindow.minimize()}/>
              <MenuItem icon="plus" text="Maximize" onClick={() => appWindow.toggleMaximize()}/>
              <MenuItem icon="cross" text="Close" intent="danger" onClick={() => appWindow.close()}/>
            </MenuItem>
          </Menu>
        }>

        <textarea ref={textEditorRef} wrap="soft" spellCheck={false} onChange={calculateWordsAndCharacters} className="texteditor texteditor:nowrap"></textarea>
      </ContextMenu2>      
    </>
  );
}