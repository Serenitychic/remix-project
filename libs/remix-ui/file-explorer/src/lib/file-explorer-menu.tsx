import React, { useState, useEffect } from 'react' //eslint-disable-line
import { FileExplorerMenuProps } from './types'

export const FileExplorerMenu = (props: FileExplorerMenuProps) => {
  const [state, setState] = useState({
    menuItems: [
      {
        action: 'createNewFile',
        title: 'Create New File',
        icon: 'far fa-file'
      },
      {
        action: 'createNewFolder',
        title: 'Create New Folder',
        icon: 'far fa-folder'
      },
      {
        action: 'publishToGist',
        title: 'Publish all [browser] explorer files to a github gist',
        icon: 'fab fa-github'
      },
      {
        action: 'uploadFile',
        title: 'Load a local file into Remix\'s browser folder',
        icon: 'fa fa-upload'
      },
      {
        action: 'updateGist',
        title: 'Update the current [gist] explorer',
        icon: 'fab fa-github'
      }
    ].filter(item => props.menuItems && props.menuItems.find((name) => { return name === item.action })),
    actions: {}
  })

  useEffect(() => {
    const actions = {
      updateGist: () => {}
    }

    setState(prevState => {
      return { ...prevState, actions }
    })
  }, [])

  return (
    <>
      <span className='remixui_label' title={props.title} data-path={props.title} style={{ fontWeight: 'bold' }}>{ props.title }</span>
      <span className="remixui_menu">{
        state.menuItems.map(({ action, title, icon }, index) => {
          if (action === 'uploadFile') {
            return (
              <label
                id={action}
                data-id={'fileExplorerUploadFile' + action }
                className={icon + ' mb-0 remixui_newFile'}
                title={title}
                key={index}
              >
                <input id="fileUpload" data-id="fileExplorerFileUpload" type="file" onChange={(e) => {
                  e.stopPropagation()
                  props.uploadFile(e.target)
                }}
                multiple />
              </label>
            )
          } else {
            return (
              <span
                id={action}
                data-id={'fileExplorerNewFile' + action}
                onClick={(e) => {
                  e.stopPropagation()
                  if (action === 'createNewFile') {
                    props.createNewFile()
                  } else if (action === 'createNewFolder') {
                    props.createNewFolder()
                  } else if (action === 'publishToGist') {
                    props.publishToGist()
                  } else {
                    state.actions[action]()
                  }
                }}
                className={'newFile ' + icon + ' remixui_newFile'}
                title={title}
                key={index}
              >
              </span>
            )
          }
        })}
      </span>
    </>
  )
}

export default FileExplorerMenu
