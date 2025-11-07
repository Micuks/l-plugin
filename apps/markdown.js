import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import MarkdownIt from 'markdown-it'
import katex from 'katex'
import TexMath from 'markdown-it-texmath'

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const md = new MarkdownIt({
  html: true
}).use(TexMath, {
  engine: katex,
  // 支持 \( ... \) / \[ ... \] 以及 $...$ / $$...$$
  delimiters: ['brackets', 'dollars', 'beg_end'],
  katexOptions: {
    macros: { '\\RR': '\\mathbb{R}' },
    throwOnError: false,
    strict: false
  }
})

export class markdown extends plugin {
  constructor () {
    super({
      name: 'markdown 转换',
      dsc: '渲染 markdown 文本',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^#?markdown\\s',
          fnc: 'render'
        }
      ]
    })
  }

  async render () {
    const text = this.e.msg.split(/(?<=^\S+)\s/).pop()
    // 规范化部分未被 texmath 识别的显示公式分隔符：将独立成行的 \[ ... \] 转成 $$ ... $$
    const normalized = text.replace(/(^|\n)[ \t]*\\\[([\s\S]*?)\\\][ \t]*(?=\n|$)/g, (m, p1, content) => {
      const inner = content.replace(/^\s+|\s+$/g, '')
      return `${p1}$$\n${inner}\n$$`
    })
    const markdownHtml = md.render(normalized)
    let data = {
      markdownHtml,
      tplFile: `${__dirname}/markdown.html`
    }
    let img = await puppeteer.screenshot('markdown', data)
    await this.reply(img)
  }
}
