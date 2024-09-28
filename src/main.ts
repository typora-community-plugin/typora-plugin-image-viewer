import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'
import { editor } from 'typora'
import { HtmlPostProcessor, Plugin } from '@typora-community-plugin/core'


export default class ImageViewer extends Plugin {

  viewer: Viewer

  isShowByButton = false

  onload() {
    this.viewer = new Viewer(editor.writingArea, {
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
      this.app.features.markdownEditor.on('edit', () => {
        this.viewer.update()
      }))

    // handle: ![...](...)
    // handle: <img>
    this.register(
      this.app.features.markdownEditor.postProcessor.register(
        new ImageViewerButton(this)))

    // handle: <img> wrapped in html block. like <figure><img></figure>
    this.registerDomEvent(editor.writingArea, 'click', event => {
      const target = event.target as HTMLElement
      if (target.tagName === 'IMG' && target.closest('.md-htmlblock')) {
        event.preventDefault()
        event.stopPropagation()
        this.showImage(target as HTMLImageElement)
      }
    })
  }

  onunload() {
    this.viewer?.destroy()
  }

  showImage(img: HTMLImageElement) {
    const idx = (<any>this.viewer)?.images
      .findIndex((image: HTMLImageElement) => image === img)

    this.isShowByButton = true
    this.viewer?.view(idx)
    this.isShowByButton = false
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

      const img = (event.target as HTMLElement)
        .closest('.md-image')!
        .querySelector('img')!

      this.plugin.showImage(img)
    }
  }

  process(el: HTMLElement) {
    this.renderButton(el, this.button)
  }
}
