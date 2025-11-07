import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import MarkdownIt from 'markdown-it'
import katex from 'katex'
import TexMath from 'markdown-it-texmath'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 与 apps/markdown.js 保持一致的 markdown-it 配置
const md = new MarkdownIt({ html: true }).use(TexMath, {
  engine: katex,
  delimiters: ['brackets', 'dollars', 'beg_end'],
  katexOptions: {
    macros: { '\\RR': '\\mathbb{R}' },
    throwOnError: false,
    strict: false
  }
})

function normalizeDisplayBracketBlocks(text) {
  return text.replace(/(^|\n)[ \t]*\\\[([\s\S]*?)\\\][ \t]*(?=\n|$)/g, (m, p1, content) => {
    const inner = content.replace(/^\s+|\s+$/g, '')
    return `${p1}$$\n${inner}\n$$`
  })
}

/**
 * 将 Markdown 渲染为图片的 segment
 * @param {string} text 原始 Markdown 文本
 * @param {{saveId?: string}} [opts]
 * @returns {Promise<import('oicq').segment.image|false>}
 */
export async function renderMarkdownImage(text, opts = {}) {
  const normalized = normalizeDisplayBracketBlocks(text)
  const markdownHtml = md.render(normalized)
  const tplFile = resolve(__dirname, '../../apps/markdown.html')
  const data = { markdownHtml, tplFile, saveId: opts.saveId || 'md' }
  const img = await puppeteer.screenshot('markdown', data)
  return img
}

export default renderMarkdownImage

