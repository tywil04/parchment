import React from "react";

import { getVersion } from "@tauri-apps/api/app"
import { appWindow } from '@tauri-apps/api/window'
import { save as saveDialog, open as openDialog, ask as askDialog, message } from "@tauri-apps/api/dialog"
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { type } from "@tauri-apps/api/os";

import { Divider, Button, ButtonGroup, Icon, Toaster, Position } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";

var platformName = "";
var version = "";

type().then(data => platformName = data);
getVersion().then(data => version = data);

if (window.matchMedia('(prefers-color-scheme: dark)').matches === true) {
  document.querySelector("body").classList.add("bp4-dark");
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener("change", event => {
  if (event.matches) {
    document.querySelector("body").classList.add("bp4-dark");
  } else {
    document.querySelector("body").classList.remove("bp4-dark");
  }
})

const toast = Toaster.create({ position: Position.BOTTOM_RIGHT });

export default function App() {
  const [currentFilePath, setCurrentFilePath] = React.useState("");
  const [textEdited, setTextEdited] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(true);
  const [textWrap, setTextWrap] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(0);
  const [currentTheme, setCurrentTheme] = React.useState(document.querySelector("body").classList.contains("bp4-dark") ? "dark": "light")
  const toolbarRef = React.useRef();
  const fileNameRef = React.useRef();
  const statisticsDisplayRef = React.useRef();
  const textEditorRef = React.useRef();
  const versionDisplayRef = React.useRef();

  const onResize = ({ event, payload }) => {
    console.log(payload.width)
    if (payload.width < toolbarRef.current.scrollWidth + 2) {
      toolbarRef.current.classList.add("titlebar:toolbar:scroll")
    } else {
      toolbarRef.current.classList.remove("titlebar:toolbar:scroll")
    }
  }
  appWindow.listen('tauri://resize', onResize)

  React.useEffect(() => {
    onResize({event: "", payload: {width: "580"}});
    versionDisplayRef.current.innerText = `Version ${version}`
  })

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

  const notImplemented = () => {
    message("This application is still in development and this feature is not implemented yet. This button is a placeholder.");
  }

  const discardQuery = (good, badToastMessage) => {
    askDialog("Would you like to discard your work?").then((yes) => {
      if (yes) {
        good();
      } else {
        toast.show({ message: badToastMessage });
      }
    })
  }

  const saveFileAs = () => {
    return saveDialog().then((filePath) => {
      writeFile({contents: textEditorRef.current.value, path: filePath}).then(
        () => {
          fileNameRef.current.innerText = getFileNameFromPath(filePath);
          setCurrentFilePath(filePath);
          setTextEdited(false)
        },
        () => toast.show({ message: "Error while saving, please try again." }))
    }, () => toast.show({ message: "Error while saving, please try again." }))
  }

  const saveFile = () => {
    if (currentFilePath !== "") {
      return new Promise((success, failure) => {
        writeFile({contents: textEditorRef.current.value, path: currentFilePath}).then(
          () => {
            setTextEdited(false);
            success();
          },
          () => {
            failure();
            toast.show({ message: "Error while saving, please try again." });
          }
        );
      })
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
    if (textEdited === false) {
      clear();
    } else {
      discardQuery(clear, "To create a new file please save or discard your work.");
    }
  }

  const open = () => {
    clear(); // Clear all
    return openDialog().then((filePath) => {
      readTextFile(filePath).then((text) => {
        textEditorRef.current.value = text;
        setCurrentFilePath(filePath);
        fileNameRef.current.innerText = getFileNameFromPath(filePath);
        calculateWordsAndCharacters(); // Update words and characters (It should be 0, however its best to run the function)
      }, () => toast.show({ message: "Error while opening file, please try again." }))
    }, () => toast.show({ message: "Error while opening file, please try again." }))
  }

  const openFile = () => {
    if (textEdited === false) {
      open();
    } else {
      discardQuery(open, "To open a new file please save or discard your work.");
    }
  }

  const closeApplication = () => {
    if (textEdited === false) {
      appWindow.close();
    } else {
      discardQuery(() => appWindow.close(), "To close please save or discard your work.");
    }
  }

  const changeFont = (family) => {
    switch (family) {
      case "serif": {
        textEditorRef.current.classList.add("serif");
        textEditorRef.current.classList.remove("sans-serif");
        textEditorRef.current.classList.remove("monospace");
        break;
      }
      case "monospace": {
        textEditorRef.current.classList.remove("serif");
        textEditorRef.current.classList.remove("sans-serif");
        textEditorRef.current.classList.add("monospace");
        break;
      }
      default: {
        textEditorRef.current.classList.remove("serif");
        textEditorRef.current.classList.add("sans-serif");
        textEditorRef.current.classList.remove("monospace");
        break;
      }
    }
  }

  const changeFontSize = (change) => {
    if (fontSize + change <= 5 && fontSize + change >= -5) {
      setFontSize(fontSize + change);
    }
  }

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === "dark" ? "light": "dark");
    document.querySelector("body").classList.toggle("bp4-dark");
  }

  const WindowControl = (props) => {
    return (
      <ButtonGroup small minimal>
        {props.reverse === true ?
          <>
          <Button small icon="cross" onClick={closeApplication}/>
          <Button small icon="small-square" onClick={() => appWindow.toggleMaximize()}/>
          <Button small icon="minus" onClick={() => appWindow.minimize()}/>
          </>
        :
          <>
          <Button small icon="minus" onClick={() => appWindow.minimize()}/>
          <Button small icon="small-square" onClick={() => appWindow.toggleMaximize()}/>
          <Button small icon="cross" onClick={closeApplication}/>
          </>
        }
      </ButtonGroup>
    )
  }

  const FileControl = () => {
    return (
      <>
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
      </>
    )
  }

  const MenuVisibilityToggle = () => {
    return (
      <ButtonGroup minimal small>
        <Tooltip2 hoverOpenDelay={350} content="Toggle Menu">
          <Button small icon={<Icon icon="chevron-down" className="titlebar:icon"/>} onClick={() => setMenuOpen(!menuOpen)}/>
        </Tooltip2>
      </ButtonGroup>
    )
  }

  return (
    <>
      <div data-tauri-drag-region className="titlebar" onContextMenu={disableDefaultEvent}>
        {platformName === "Darwin"?
          <>
            <div className="titlebar:left">
              <WindowControl reverse={true}/>
              <Divider/>
              <FileControl/>
            </div>

            <div className="titlebar:right">
              <MenuVisibilityToggle/>
            </div>
          </>
        :
          <>
            <div className="titlebar:left">
              <FileControl/>
            </div>

            <div className="titlebar:right">
              <MenuVisibilityToggle/>
              <Divider/>
              <WindowControl/>
            </div>
          </>
        }
      </div>
    
      {menuOpen ?
        <div ref={toolbarRef} className="titlebar:toolbar" onWheel={(event) => toolbarRef.current.scrollLeft += event.deltaY * 3} onContextMenu={disableDefaultEvent}>     
          <span className="titlebar:toolbar:text">Text Wrap: </span>
          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text={textWrap ? "Disable": "Enable"} onClick={() => setTextWrap(!textWrap)}/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:toolbar:text">Font Size: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small icon={<Icon icon="plus" className="titlebar:icon"/>} onClick={() => changeFontSize(1)}/>
            <Button className="titlebar:text" small icon={<Icon icon="minus" className="titlebar:icon"/>} onClick={() => changeFontSize(-1)}/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:toolbar:text">Font Type: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text="Sans-Serif" onClick={() => changeFont("sans-serif")}/>
            <Button className="titlebar:text" small text="Serif" onClick={() => changeFont("serif")}/>
            <Button className="titlebar:text" small text="Monospace" onClick={() => changeFont("monospace")}/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:toolbar:text">Security: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small icon={<Icon icon="lock" className="titlebar:icon"/>} onClick={notImplemented}/>
            <Button className="titlebar:text" small icon={<Icon icon="unlock" className="titlebar:icon"/>} onClick={notImplemented}/>
            <Button className="titlebar:text" small text="Calculate SHA256" onClick={notImplemented}/>
            <Button className="titlebar:text" small text="Calculate SHA512" onClick={notImplemented}/>
          </ButtonGroup>

          <Divider/>
          <span className="titlebar:toolbar:text">Theme: </span>

          <ButtonGroup minimal small>
            <Button className="titlebar:text" small text={currentTheme === "dark" ? "To Light Mode": "To Dark Mode"} onClick={toggleTheme}/>
          </ButtonGroup>
        </div>
      :null}

      <div className="titlebar:display" onContextMenu={disableDefaultEvent}>
        <div className="titlebar:display:left">
          <span className="titlebar:text" hidden={!textEdited}>~</span>
          <span ref={fileNameRef} className="titlebar:text"></span>
        </div>

        <div className="titlebar:display:right">
          <span ref={statisticsDisplayRef} className="titlebar:text">0 Words,  0 Characters</span>
          <Divider className="titlebar:display:divider"/>
          <span ref={versionDisplayRef} className="titlebar:text">Version Unknown</span>
        </div>
      </div>

      <div className="content">
        <textarea wrap={textWrap ? "on": "off"} ref={textEditorRef} spellCheck={false} onChange={(event) => {calculateWordsAndCharacters(); setTextEdited(true)}} className={`texteditor texteditor:fontsize:${fontSize}`}/>
      </div>
    </>
  );
}