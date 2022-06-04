import React from "react";
import ReactDOM from 'react-dom/client';

import { appWindow } from '@tauri-apps/api/window'
import { save as saveDialog, open as openDialog } from "@tauri-apps/api/dialog"
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { readText as readClipboard, writeText as writeClipboard } from "@tauri-apps/api/clipboard";

import { Menu, MenuItem, MenuDivider, Divider, Dialog, Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { Tooltip2, ContextMenu2 } from "@blueprintjs/popover2";

import { useDendriform } from "dendriform";

// To do:
// Settings:
//  Theme selector: Light/Dark/Custom?
//  Text wrapping: Bool
//  Tabs (e.g spaces vs tab), if spaces how many etc
//  Autosave
//    
// Userfeed back (e.g: Failed to save, try again etc)
//
// Encrypting Contents Functionality 
// 
// Etc

export default function App() {
  const [currentFilePath, setCurrentFilePath] = React.useState("");
  const [textEdited, setTextEdited] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(true);
  const toolbarRef = React.useRef();
  const fileNameRef = React.useRef();
  const statisticsDisplayRef = React.useRef();
  const textEditorRef = React.useRef();
  const textEditorContent = useDendriform("", {history: 50});

  // Intercept default CTRL-Z and CTRL-Y (Undo/Redo)
  textEditorRef.current.onkeydown = (event) => { 
    if (event.key === "z" && event.ctrlKey) {
      disableDefaultEvent();
      undo();
    } else if (event.key === "y" && event.ctrlKey) {
      disableDefaultEvent();
      redo();
    }
  }

  const disableDefaultEvent = (event) => {
    event.preventDefault(); 
    event.stopPropagation();
  };

  const undo = () => {
    textEditorContent.undo(); 
    textEditorRef.current.value = textEditorContent.value;
  }

  const redo = () => {
    textEditorContent.redo(); 
    textEditorRef.current.value = textEditorContent.value;
  }

  const calculateWordsAndCharacters = () => {
    var words = textEditorRef.current.value.trim().replace("\n", " ").split(/(\s+)/).filter((word) => word.trim().length > 0).length;
    var characters = textEditorRef.current.value.replace("\n", "").replace(" ", "").length
    statisticsDisplayRef.current.innerText = `${words} Words, ${characters} Characters`
  }

  // Get file name from path using a regular expression
  // eslint-disable-next-line
  const getFileNameFromPath = (filePath) => filePath.replace(/^.*(\\|\/|\:)/, "");

  // Generate a random hexadecimal string
  const generateRandomString = () => Math.random().toString(16).substring(2, 14);

  // Renders a dialog that returns a promise. A success is the save button being pressed, a failure is the delete button being pressed
  const runDiscardDialog = () => {
    return new Promise((success, failure) => {
      try {
        const random = "discard-dialog-" + generateRandomString();

        // Create a div with a random id that will be used to hold the dialog
        var div = document.createElement("div")
        div.id = random;
        document.querySelector("body").appendChild(div);

        // Dialog component
        const InternalDialog = (props) => {
          const [open, setOpen] = React.useState(true);
          return (
            <Dialog usePortal={false} isOpen={open} onClose={() => setOpen(false)} onClosed={() => document.getElementById(random).remove()}>
              <div className={Classes.DIALOG_BODY}>
                <p>
                  What would you like to do with this file? You can discard it, save it or continue editing it.
                </p>
              </div>
              <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                  <Button small text="Continue Editing" onClick={() => {setOpen(false); props.success("continue")}}/>
                  <Button small intent="danger" text="Discard" onClick={() => {setOpen(false); props.success("discard")}}/>
                  <Button small intent="primary" text="Save" onClick={() => {setOpen(false); props.success("save")}}/>
                </div>
              </div>
            </Dialog>
          )
        }

        // Render the dialog in the div that was created
        ReactDOM.createRoot(document.getElementById(random)).render(
          <InternalDialog success={success} failure={failure}/>
        );
      } catch {
        failure();
      }
    })
  }

  const saveFileAs = () => {
    return saveDialog().then((filePath) => {
      writeFile({contents: textEditorRef.current.value, path: filePath});
      fileNameRef.current.innerText = getFileNameFromPath(filePath);
      setCurrentFilePath(filePath);
      setTextEdited(false)
    })
  }

  const saveFile = () => {
    // If the current filePath is known then save the file
    if (currentFilePath !== "") {
      return new Promise((success, failure) => {
        try {
          writeFile({contents: textEditorRef.current.value, path: currentFilePath});
          setTextEdited(false);
          success();
        } catch {
          failure();
        }
      })
    // If the current filePath is not known then ask where to save the file
    } else {
      return saveFileAs();
    }
  }

  const clear = () => {
    textEditorRef.current.value = "";
    setCurrentFilePath("");
    fileNameRef.current.innerText = "";
    setTextEdited(false);
    calculateWordsAndCharacters();
  }

  const newFile = () => {
    // If text has not been edited, run clear the textarea and stats display
    if (textEdited === false) {
      clear();
    // If the text has been edited and the text isnt an empty string, then run `runDiscardDialog` and await the response
    } else {
      runDiscardDialog().then(
        (response) => {
          switch(response) {
            case "save": {
              const file = saveFile();
              file.then(clear);
              break;
            };
            case "discard": clear(); break;
            default: break;
          }
        },
      )
    }
  }

  const open = () => {
    clear(); // Clear all
    openDialog().then((filePath) => {
      readTextFile(filePath).then((text) => {
        textEditorRef.current.value = text;
        setCurrentFilePath(filePath);
        fileNameRef.current.innerText = getFileNameFromPath(filePath);
        calculateWordsAndCharacters(); // Update words and characters (It should be 0, however its best to run the function)
      })
    })
  }

  const openFile = () => {
    // If text has not been edited, run the `open` system dialog
    if (textEdited === false) {
      open();
    // If the text has been edited and the text isnt an empty string, then run `runDiscardDialog` and await the response
    } else {
      runDiscardDialog().then(
        (response) => {
          switch(response) {
            case "save": {
              const file = saveFile();
              file.then(open);
              break;
            };
            case "discard": open(); break;
            default: break;
          }
        },
      )
    }
  }

  const closeApplication = () => {
    // If text has not been edited, close application
    if (textEdited === false) {
      appWindow.close();
    // If the text has been edited and the text isnt an empty string, then run `runDiscardDialog` and await the response
    } else {
      runDiscardDialog().then(
        (response) => {
          switch(response) {
            case "save": {
              const file = saveFile();
              file.then(appWindow.close);
              break;
            };
            case "discard": appWindow.close(); break; 
            default: break;
          }
        }
      )
    }
  }

  const cutSelection = () => {
    var selectedText = window.getSelection().toString();
    if (selectedText !== "") {
      writeClipboard(selectedText).then(() => {
        textEditorRef.current.setRangeText("", textEditorRef.current.selectionStart, textEditorRef.current.selectionEnd, 'select')
        textEditorContent.set(textEditorRef.current.value);
      })
    }
  }

  const copySelection = () => {
    var selectedText = window.getSelection().toString();
    if (selectedText !== "") {
      writeClipboard(selectedText);
    }
  }

  const pasteSelection = () => {
    readClipboard().then((text) => {
      textEditorRef.current.setRangeText(text, textEditorRef.current.selectionStart, textEditorRef.current.selectionEnd, 'select')
      textEditorContent.set(textEditorRef.current.value);
    })
  }

  return (
    <>
      <div data-tauri-drag-region className="titlebar" onContextMenu={disableDefaultEvent}>
        <div className="titlebar:left">
          <ButtonGroup minimal small>
            <Button small text="Open" className="titlebar:button" onClick={openFile}/>
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
            <Tooltip2 hoverOpenDelay={350} content="Show Menu">
              <Button small icon="chevron-down" onClick={() => setMenuOpen(!menuOpen)}/>
            </Tooltip2>

            <Tooltip2 hoverOpenDelay={350} content="Settings">
              <Button small icon="cog"/>
            </Tooltip2>
          </ButtonGroup>

          <Divider/>

          <ButtonGroup small minimal>
            <Button small icon="minus" onClick={() => appWindow.minimize()}/>
            <Button small icon="small-square" onClick={() => appWindow.toggleMaximize()}/>
            <Button small icon="cross" onClick={closeApplication}/>
          </ButtonGroup>
        </div>
      </div>
    
      {menuOpen ?
        <div ref={toolbarRef} className="titlebar:toolbar" onWheel={(event) => toolbarRef.current.scrollLeft += event.deltaY * 3} onContextMenu={disableDefaultEvent}>     
          <span className="titlebar:text:semibold">Utilities: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Cut" onClick={cutSelection}/>
            <Button className="titlebar:text" small text="Copy" onClick={copySelection}/>
            <Button className="titlebar:text" small text="Paste" onClick={pasteSelection}/>
            <Button className="titlebar:text" small text="Undo" onClick={undo}/>
            <Button className="titlebar:text" small text="Redo" onClick={redo}/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:text:semibold">Security: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Encrypt file"/>
            <Button className="titlebar:text" small text="Decrypt file"/>
            <Button className="titlebar:text" small text="Calculate SHA256"/>
            <Button className="titlebar:text" small text="Calculate SHA512"/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:text:semibold">Templates: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Create Template"/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:text:semibold">Theme: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Dark" onClick={() => document.querySelector("body").classList.add("bp4-dark")}/>
            <Button className="titlebar:text" small text="Light" onClick={() => document.querySelector("body").classList.remove("bp4-dark")}/>
          </ButtonGroup>
        </div>
      :null}

      <div className="titlebar:display" onContextMenu={disableDefaultEvent}>
        <span className="titlebar:text titlebar:display:left" hidden={!textEdited}>~</span>
        <span ref={fileNameRef} className="titlebar:text titlebar:display:left"></span>
        <span ref={statisticsDisplayRef} className="titlebar:text titlebar:display:right">0 Words,  0 Characters</span>
      </div>

      <ContextMenu2
        content={
          <Menu>
            <MenuItem text="Cut" labelElement="Ctrl+X" onClick={cutSelection}/>
            <MenuItem text="Copy" labelElement="Ctrl+C" onClick={copySelection}/>
            <MenuItem text="Paste" labelElement="Ctrl+V" onClick={pasteSelection}/>

            <MenuDivider/>

            <MenuItem text="Undo" labelElement="Ctrl+Z" onClick={undo}/>
            <MenuItem text="Redo" labelElement="Ctrl+Y" onClick={redo}/>

            <MenuDivider/>

            <MenuItem text="Open" labelElement="Ctrl+O" onClick={openFile}/>
            <MenuItem text="New" labelElement="Ctrl+N" onClick={newFile}/>
            <MenuItem text="Save" labelElement="Ctrl+S" onClick={saveFile}/>
            <MenuItem text="Save as" labelElement="Ctrl+Shift+S" onClick={saveFileAs}/>

            <MenuDivider/>

            <MenuItem text="Window Controls">
              <MenuItem icon="minus" text="Minimize" onClick={appWindow.minimize}/>
              <MenuItem icon="small-square" text="Maximize" onClick={appWindow.toggleMaximize}/>
              <MenuItem icon="cross" intent="danger" text="Close" onClick={closeApplication}/>
            </MenuItem>
          </Menu>
        }
        className="content"
      >
        <textarea ref={textEditorRef} spellCheck={false} onChange={(event) => {calculateWordsAndCharacters(); setTextEdited(true); textEditorContent.set(event.target.value)}} className="texteditor texteditor:nowrap"/>
      </ContextMenu2>
    </>
  );
}