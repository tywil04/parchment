import React from "react";

import { appWindow } from '@tauri-apps/api/window'
import { save as saveDialog, open as openDialog } from "@tauri-apps/api/dialog"
import { readTextFile, writeFile } from "@tauri-apps/api/fs";

import { Menu, MenuItem, Divider, MenuDivider, Dialog, Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { ContextMenu2, Tooltip2 } from "@blueprintjs/popover2";

export default function App() {
  const [savePromptOpen, setSavePromptOpen] = React.useState(false);

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

  const saveAs = () => {
    saveDialog().then((filePath) => {
      writeFile({contents: textEditorRef.current.value, path: filePath});
      fileNameRef.current.innerText = filePath.trim();
    })
  }

  const save = () => {
    if (fileNameRef.current.innerText.trim() != "Untitled") {
      try {
        writeFile({contents: textEditorRef.current.value, path: fileNameRef.current.innerText.trim()});
      } catch {
        saveAs();
      }
    } else {
      saveAs();
    }
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
              <Button small text="New" className="titlebar:button"/>
            </ButtonGroup>

            <Divider/>

            <ButtonGroup minimal small>
              <Button small text="Save" className="titlebar:button" onClick={save}/>
              <Button small text="Save as" className="titlebar:button" onClick={saveAs}/>
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
          <span ref={fileNameRef} className="titlebar:text titlebar:lower:left">Untitled</span>
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


      <Dialog onClose={() => setSavePromptOpen(false)}>
        <div className={Classes.DIALOG_BODY}>
          <p>
            <strong>
              Save
            </strong>
          </p>
          <p>
            What would you like to do with this file? You can delete it, save it or continue editing it.
          </p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button small intent="danger" text="Delete"/>
            <Button small intent="primary" text="Save"/>
            <Button small text="Cancel"/>
          </div>
        </div>
      </Dialog>
    </>
  );
}