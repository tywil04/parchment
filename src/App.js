import React from "react";
import { appWindow } from '@tauri-apps/api/window'
import { Menu, MenuItem, Divider, MenuDivider, Dialog, Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { ContextMenu2, Tooltip2 } from "@blueprintjs/popover2";

export default function App() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Disable default context menu so a custom one can be used via BlueprintJS/popover2's ContextMenu2
  window.onContextMenu = (event) => {
    event.preventDefault(); 
    event.stopPropagation();
  };

  const statisticsDisplayRef = React.useRef(); // The reference for the element displaying word and character stats

  // Handles the logic behind the stats display
  const onCurrentTextChanged = (event) => {
    var words = event.target.value.trim().replace("\n", " ").split(/(\s+)/).filter((word) => word.trim().length > 0).length;
    var characters = event.target.value.replace("\n", "").replace(" ", "").length
    statisticsDisplayRef.current.innerText = `${words} Words, ${characters} Characters`
  }

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
              <Button small text="New" className="titlebar:button"/>
              <Button small text="Save" className="titlebar:button"/>
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
          <span className="titlebar:text titlebar:lower:left">Untitled 1</span>
          <span ref={statisticsDisplayRef} className="titlebar:text titlebar:lower:right">0 Words,  0 Characters</span>
        </div>
      </ContextMenu2>


      <ContextMenu2
        className="content"
        content={
          <Menu>
            <MenuItem icon="modal" text="Dialog Test" onClick={() => setDialogOpen(true)}/>
            <MenuItem icon="moon" text="Toggle Theme" onClick={() => document.querySelector("body").classList.toggle("bp4-dark")}/>
            <MenuDivider/>
            <MenuItem text="Window Controls">
              <MenuItem icon="minus" text="Minimize" onClick={() => appWindow.minimize()}/>
              <MenuItem icon="plus" text="Maximize" onClick={() => appWindow.toggleMaximize()}/>
              <MenuItem icon="cross" text="Close" intent="danger" onClick={() => appWindow.close()}/>
            </MenuItem>
          </Menu>
        }>

        <textarea spellCheck={false} onInput={onCurrentTextChanged}></textarea>
      </ContextMenu2>      


      <Dialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)}>
        <div className={Classes.DIALOG_BODY}>
          <p>
            <strong>
              Dialog Testing
            </strong>
          </p>
          <p>
            This is a working demo of a dialog. This will be used to prompt the user for information. Such as a password to Encrypt/Decrypt content
          </p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button small text="Close" onClick={() => setDialogOpen(false)}/>
            <Button small intent={"primary"} text="Confirm" onClick={() => setDialogOpen(false)}/>
          </div>
        </div>
      </Dialog>
    </>
  );
}