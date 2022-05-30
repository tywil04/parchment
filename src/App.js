import React from "react";
import { appWindow } from '@tauri-apps/api/window'
import { Tabs, Tab, Menu, MenuItem, Divider, MenuDivider, Dialog, Button, ButtonGroup, Classes } from "@blueprintjs/core";
import { ContextMenu2, Tooltip2 } from "@blueprintjs/popover2";

export default function App() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [numberOfGeneratedTabs, setNumberOfGeneratedTabs] = React.useState(0);
  const [selectedTab, setSelectedTab] = React.useState(`untitled-0`);
  const [tabs, setTabs] = React.useState([]);
  const [lastTabContextMenu, setLastTabContextMenu] = React.useState();

  window.onContextMenu = (event) => {
    event.preventDefault(); 
    event.stopPropagation();
  };

  const newTab = () => {
    setNumberOfGeneratedTabs(numberOfGeneratedTabs + 1);
    console.log(numberOfGeneratedTabs)
    setTabs(tabs.concat([{title: "Untitled", id: `untitled-${numberOfGeneratedTabs}`}]))
  }

  const removeTab = (id) => {
    var tabsCopy = tabs;
    tabs.forEach((tab) => {
      console.log(tab.id)
      if (tab.id === id) {
        tabsCopy.pop(tab)
      }
    })
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
              <Button small text="Open" onClick={() => setDialogOpen(true)}/>
              <Button small text="New" onClick={newTab}/>
              <Button small text="Save" onClick={() => setDialogOpen(true)}/>
            </ButtonGroup>
          </div>

          <div className="titlebar:right">
            <ButtonGroup minimal small>
            <Button small text="Preview" onClick={() => document.querySelector("body").classList.toggle("bp4-dark")}/>
              <Button small text="Edit" active onClick={() => document.querySelector("body").classList.toggle("bp4-dark")}/>
            </ButtonGroup>

            <Divider/>

            <ButtonGroup minimal small>
              <Tooltip2 hoverOpenDelay={350} content="Text Search">
                <Button small icon="search-text" onClick={() => setDialogOpen(true)}/>
              </Tooltip2>

              <Tooltip2 hoverOpenDelay={350} content="Encrypt Contents">
                <Button small icon="lock" onClick={() => setDialogOpen(true)}/>
              </Tooltip2>

              <Tooltip2 hoverOpenDelay={350} content="Settings">
                <Button small icon="cog" onClick={() => setDialogOpen(true)}/>
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
        content={
          <Menu>
            <MenuItem text="Close 'Untitled'" intent="danger" onClick={() => removeTab(lastTabContextMenu)}/>
          </Menu>
        }>

        <Tabs animate={false} selectedTabId={selectedTab} className="tab:bar" onChange={setSelectedTab}>
          {tabs.map((tab) => 
            <Tab className="tab" id={tab.id} data-tab-id={tab.id} onContextMenu={(event) => setLastTabContextMenu(event.target.getAttribute("data-tab-id"))}>
              {tab.title}
            </Tab>
          )}
        </Tabs>
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
              Data integration is the seminal problem of the digital age. For over ten years, we’ve helped the
              world’s premier organizations rise to the challenge.
            </strong>
          </p>
          <p>
            Palantir Foundry radically reimagines the way enterprises interact with data by amplifying and extending
            the power of data integration. With Foundry, anyone can source, fuse, and transform data into any shape
            they desire. Business analysts become data engineers — and leaders in their organization’s data
            revolution.
          </p>
          <p>
            Foundry’s back end includes a suite of best-in-class data integration capabilities: data provenance,
            git-style versioning semantics, granular access controls, branching, transformation authoring, and more.
            But these powers are not limited to the back-end IT shop.
          </p>
          <p>
            In Foundry, tables, applications, reports, presentations, and spreadsheets operate as data integrations
            in their own right. Access controls, transformation logic, and data quality flow from original data
            source to intermediate analysis to presentation in real time. Every end product created in Foundry
            becomes a new data source that other users can build upon. And the enterprise data foundation goes where
            the business drives it.
          </p>
          <p>Start the revolution. Unleash the power of data integration with Palantir Foundry.</p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button small text="Close" onClick={() => setDialogOpen(false)}/>
            <Button small intent={"primary"} text="Confirm"/>
          </div>
        </div>
      </Dialog>
    </>
  );
}