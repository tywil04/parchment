import React from "react";
import ReactDOM from 'react-dom/client';

import { appWindow } from '@tauri-apps/api/window'
import { save as saveDialog, open as openDialog } from "@tauri-apps/api/dialog"
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { type } from "@tauri-apps/api/os";

import { Divider, Dialog, Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";

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

var platformName = "";
type().then(data => platformName = data)

export default function App() {
  const [currentFilePath, setCurrentFilePath] = React.useState("");
  const [textEdited, setTextEdited] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(true);
  const toolbarRef = React.useRef();
  const fileNameRef = React.useRef();
  const statisticsDisplayRef = React.useRef();
  const textEditorRef = React.useRef();


  const disableDefaultEvent = (event) => {
    event.preventDefault(); 
    event.stopPropagation();
  };

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

  console.log(platformName)

  return (
    <>
      <div data-tauri-drag-region className="titlebar" onContextMenu={disableDefaultEvent}>
        {platformName === "Darwin"?
          <>
            <div className="titlebar:left">
              <ButtonGroup small minimal>
                <Button small icon="cross" onClick={closeApplication}/>
                <Button small icon="small-square" onClick={() => appWindow.toggleMaximize()}/>
                <Button small icon="minus" onClick={() => appWindow.minimize()}/> 
              </ButtonGroup>

              <Divider/>

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
            </div>
          </>
        :
          <>
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
          </>
        }
      </div>
    
      {menuOpen ?
        <div ref={toolbarRef} className="titlebar:toolbar" onWheel={(event) => toolbarRef.current.scrollLeft += event.deltaY * 3} onContextMenu={disableDefaultEvent}>     
          <span className="titlebar:text:semibold">Utilities: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Toggle Text Wrapping" onClick={() => textEditorRef.current.classList.toggle("texteditor:nowrap")}/>
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

      <div className="content">
        <textarea ref={textEditorRef} spellCheck={false} onChange={(event) => {calculateWordsAndCharacters(); setTextEdited(true)}} className="texteditor"/>
      </div>
    </>
  );
}