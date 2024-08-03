import './style.scss'
import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'
import { HtmlPostProcessor, Plugin } from '@typora-community-plugin/core'


export default class ImageViewer extends Plugin {

  viewer: Viewer

  isShowByButton = false

  onload() {
    this.viewer = new Viewer(document.querySelector('#write')!, {
      show: (event) => {
        if (!this.isShowByButton) {
          // Disable show viewer by clicking on the image
          event.preventDefault()
          event.stopPropagation()
        }
      },
    })

    this.register(
      this.app.workspace.on('file:open', () => {
        this.viewer.update()
      }))

    this.register(
      this.app.workspace.activeEditor.on('edit', () => {
        this.viewer.update()
      }))

    this.registerMarkdownPostProcessor(new ImageViewerButton(this))
  }

  onunload() {
    this.viewer?.destroy()
  }
}

class ImageViewerButton extends HtmlPostProcessor {

  constructor(private plugin: ImageViewer) {
    super()
  }

  get selector() {
    return '#write .md-image'
  }

  button = {
    text: '<span class="fa fa-search-plus"></span>',
    onclick: (event: MouseEvent) => {

      const img = (<HTMLElement>event.target)
        .closest('.md-image')!
        .querySelector('img')

      const idx = (<any>this.plugin.viewer)?.images
        .findIndex((image: HTMLImageElement) => image === img)

      this.plugin.isShowByButton = true
      this.plugin.viewer?.view(idx)
      this.plugin.isShowByButton = false
    }
  }

  process(el: HTMLElement) {
    this.renderButton(el, this.button)
  }
}
