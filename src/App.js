import React from "react";
import { appWindow } from '@tauri-apps/api/window'
import { Tabs, Tab, Menu, MenuItem, Divider, MenuDivider, Dialog, Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { ContextMenu2, Tooltip2 } from "@blueprintjs/popover2";

export default function App() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  window.onContextMenu = (event) => {
    event.preventDefault(); 
    event.stopPropagation();
  };

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
              <Button small text="Open"/>
              <Button small text="New"/>
              <Button small text="Save"/>
            </ButtonGroup>
          </div>

          <div className="titlebar:right">
            <ButtonGroup minimal small>
              <Button small text="Preview"/>
              <Button small text="Edit" active/>
            </ButtonGroup>

            <Divider/>

            <ButtonGroup minimal small>
              <Tooltip2 hoverOpenDelay={350} content="Text Search">
                <Button small icon="search-text"/>
              </Tooltip2>

              <Tooltip2 hoverOpenDelay={350} content="Encrypt Contents">
                <Button small icon="lock"/>
              </Tooltip2>

              <Tooltip2 hoverOpenDelay={350} content="Toggle Theme">
                <Button small icon="moon" onClick={() => document.querySelector("body").classList.toggle("bp4-dark")}/>
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

        <textarea className="minimalTextarea"></textarea>
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