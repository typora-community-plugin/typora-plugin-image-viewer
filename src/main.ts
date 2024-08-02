import './style.scss'
import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'
import { HtmlPostProcessor, Plugin } from '@typora-community-plugin/core'


export default class ImageViewer extends Plugin {

  viewer: Viewer

  isShowByButton = false

  onload() {
    this.register(
      this.app.workspace.on('file:open', () => {
        this.viewer?.destroy()
        this.viewer = new Viewer(document.querySelector('#write')!, {
          show: (event) => {
            if (!this.isShowByButton) {
              // Disable show viewer by clicking on the image
              event.preventDefault()
              event.stopPropagation()
            }
          },
        })
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
    return '#write .md-img-loaded'
  }

  button = {
    text: '<span class="fa fa-search-plus"></span>',
    onclick: (event: MouseEvent) => {
      this.plugin.isShowByButton = true
      this.plugin.viewer?.show(true)
      this.plugin.isShowByButton = false
    }
  }

  process(el: HTMLElement) {
    this.renderButton(el, this.button)
  }
}
