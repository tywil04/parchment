import React from "react";
import ReactDOM from 'react-dom/client';

import { appWindow } from '@tauri-apps/api/window'
import { save as saveDialog, open as openDialog } from "@tauri-apps/api/dialog"
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { readText as readClipboard, writeText as writeClipboard } from "@tauri-apps/api/clipboard";

import { Menu, MenuItem, Divider, MenuDivider, Dialog, Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { ContextMenu2, Tooltip2 } from "@blueprintjs/popover2";

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

  // Disable default context menu so a custom one can be used via BlueprintJS/popover2's ContextMenu2
  window.onContextMenu = (event) => {
    event.preventDefault(); 
    event.stopPropagation();
  };

  const calculateWordsAndCharacters = () => {
    var words = textEditorRef.current.innerText.trim().replace("\n", " ").split(/(\s+)/).filter((word) => word.trim().length > 0).length;
    var characters = textEditorRef.current.innerText.replace("\n", "").replace(" ", "").length
    statisticsDisplayRef.current.innerText = `${words} Words, ${characters} Characters`
  }

  // Get file name from path using a regular expression
  // eslint-disable-next-line
  const getFileNameFromPath = (filePath) => filePath.replace(/^.*(\\|\/|\:)/, "");

  // Generate a random hexadecimal string
  const generateRandomString = () => Math.random().toString(16).substring(2, 14);

  const toggleTheme = () => document.querySelector("body").classList.toggle("bp4-dark");

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
            <Dialog usePortal={false} title="Discard Contents" isOpen={open} onClose={() => setOpen(false)} onClosed={() => document.getElementById(random).remove()}>
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
      writeFile({contents: textEditorRef.current.innerText, path: filePath});
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
          writeFile({contents: textEditorRef.current.innerText, path: currentFilePath});
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
    textEditorRef.current.innerText = "";
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
    } else if (textEditorRef.current.innerText !== "") {
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
        textEditorRef.current.innerText = text;
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
    } else if (textEditorRef.current.innerText !== "") {
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
    } else if (textEditorRef.current.innerText !== "") {
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

  const onTextEditorChange = () => {
    calculateWordsAndCharacters(); 
    setTextEdited(true);
  }

  const copySelection = () => {
    var selectedText = window.getSelection().toString();
    if (selectedText !== "") {
      writeClipboard(selectedText);
    }
  }

  const pasteBeforeSelection = () => {
    readClipboard().then((text) => {
      insert(text, "")
    })
  }

  const cutSelection = () => {
    var selectedText = window.getSelection().toString();
    if (selectedText !== "") {
      writeClipboard(selectedText).then(() => {
        window.getSelection().deleteFromDocument();
      })
    }
  }

  const insert = (leftTag, rightTag=leftTag) => {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
      var range = selection.getRangeAt(0);
      var startNode = range.startContainer, startOffset = range.startOffset;

      var startTextNode = document.createTextNode(leftTag);
      var endTextNode = document.createTextNode(rightTag);

      var boundaryRange = range.cloneRange();
      boundaryRange.collapse(false);
      boundaryRange.insertNode(endTextNode);
      boundaryRange.setStart(startNode, startOffset);
      boundaryRange.collapse(true);
      boundaryRange.insertNode(startTextNode);

      range.setStartAfter(startTextNode);
      range.setEndBefore(endTextNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  return (
    <>
      <ContextMenu2
        content={
          <Menu>
            <MenuItem icon="minus" text="Minimize" onClick={() => appWindow.minimize()}/>
            <MenuItem icon="plus" text="Maximize" onClick={() => appWindow.toggleMaximize()}/>
            <MenuItem icon="cross" text="Close" intent="danger" onClick={closeApplication}/>
          </Menu>
        }>

        <div data-tauri-drag-region className="titlebar">
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
                <Button small icon="chevron-down" active={menuOpen} onClick={() => setMenuOpen(!menuOpen)}/>
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
        <div ref={toolbarRef} className="titlebar:toolbar" onWheel={(event) => toolbarRef.current.scrollLeft += event.deltaY * 3}>     
          <span className="titlebar:text:semibold">Utilities: </span>
    
          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Cut" onClick={cutSelection}/>
            <Button className="titlebar:text" small text="Copy" onClick={copySelection}/>
            <Button className="titlebar:text" small text="Paste" onClick={pasteBeforeSelection}/>
            <Button className="titlebar:text" small text="Find"/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:text:semibold">Theme: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Dark" onClick={() => document.querySelector("body").classList.add("bp4-dark")}/>
            <Button className="titlebar:text" small text="Light" onClick={() => document.querySelector("body").classList.remove("bp4-dark")}/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:text:semibold">Encryption: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Encrypt"/>
            <Button className="titlebar:text" small text="Decrypt"/>
            <Button className="titlebar:text" small text="Configure"/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:text:semibold">Hashes: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Sha256"/>
            <Button className="titlebar:text" small text="Sha512"/>
          </ButtonGroup>
        </div>
        :null}

        <div className="titlebar:display">
          <span className="titlebar:text titlebar:display:left" hidden={!textEdited}>~</span>
          <span ref={fileNameRef} className="titlebar:text titlebar:display:left"></span>
          <span ref={statisticsDisplayRef} className="titlebar:text titlebar:display:right">0 Words,  0 Characters</span>
        </div>
      </ContextMenu2>


      <ContextMenu2
        className="content"
        content={
          <Menu>
            <MenuItem text="Open" onClick={openFile}/>
            <MenuItem text="New" onClick={newFile}/>
            <MenuItem text="Save" onClick={saveFile}/>
            <MenuItem text="Save as" onClick={saveFileAs}/>

            <MenuDivider/>

            <MenuItem icon="cut" text="Cut" onClick={cutSelection}/>
            <MenuItem icon="duplicate" text="Copy" onClick={copySelection}/>
            <MenuItem icon="clipboard" text="Paste" onClick={pasteBeforeSelection}/>

            <MenuDivider/>

            <MenuItem text="Window Controls">
              <MenuItem icon="minus" text="Minimize" onClick={() => appWindow.minimize()}/>
              <MenuItem icon="plus" text="Maximize" onClick={() => appWindow.toggleMaximize()}/>
              <MenuItem icon="cross" text="Close" intent="danger" onClick={closeApplication}/>
            </MenuItem>
          </Menu>
        }>

        <div ref={textEditorRef} spellCheck={false} onInput={onTextEditorChange} className="texteditor texteditor:nowrap" contentEditable/>
      </ContextMenu2>      
    </>
  );
}