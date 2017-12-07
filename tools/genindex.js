#!/usr/bin/env node
'use strict'

const __doc__ = `
Usage:
  genindex.js --config=<path>
`

const fs = require('fs')
const pathModule = require('path')
const process = require('process')

const docopt = require('docopt')
const toml = require('toml')
const marked = require('marked')

const PAT_HEADMATTER = /^\+\+\+\n([^]+)\n\+\+\+/
const SNIPPET_LENGTH = 220

// Temporarily hardcode featured tutorial URLs
const FEATURED_URLS = [
  "/install-mongodb-on-windows",
  "/install-mongodb-on-os-x",
  "/install-mongodb-on-ubuntu",
  "/connect-to-mongodb-python",
  "/connect-to-mongodb-shell",
  "/deploy-replica-set",
  "/deploy-shard-cluster",
  "/manage-users-and-roles",
  "/enable-authentication",
  "/configure-ldap-sasl-openldap"
]

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function makeRenderer() {
    const renderer = new marked.Renderer()
    let lastLevel = 0

    renderer.heading = function(text, level, raw) {
        let prefix = ''
        if (level <= lastLevel) {
            prefix = '\n</section>'.repeat(lastLevel - level + 1)
        }
        lastLevel = level

        return prefix + '\n<section>\n<h'
            + level
            + ' id="'
            + this.options.headerPrefix
            + raw.toLowerCase().replace(/[^\w]+/g, '-')
            + '">'
            + text
            + '</h'
            + level
            + '>\n'
    }

    renderer.code = function(code, lang) {
        if (!lang) {
            return '<div class="highlight"><pre><code>' + escape(code) + '\n</code></pre></div>'
        }

        return `{{< highlight ${escape(lang, true)} >}}`
            + code
            + '\n{{< /highlight >}}\n'
    }

    renderer.flush = function() {
        return '\n</section>'.repeat(lastLevel)
    }

    return renderer
}

// Creates a renderer to render HTML without headings for snippets and
// make the removed headings available (for the searchDoc)
function makeHeadingRemover() {
  const renderer = new marked.Renderer()
  let headings = []

  renderer.heading = function(text, level) {
    headings.push({'text': text, 'level': level})
    return ''
  }

  renderer.headings = headings
  return renderer
}

function getHeadingLink(heading) {
  return '<a class="toc__link" href="#' + heading.text.replace(/\s|\.+/g, '-').replace(/:/g, '').toLowerCase() + '">'
          + heading.text + '</a>'
}

function generateTOC(headings) {

  // TODO generate ToC on react for cleaner implementation later
  // Initial ToC HTML
  let toc='<aside class="main__sidebar main__sidebar--single">'
          + '<div class="main__sidebar__header">Table of Contents:</div>'
          + '<ul class="toc">'

  // Used to keep track of heading levels
  let previousLevel = 0
  let currentLevel = 0
  let lastLevelIsNested = false;

  // Remove h1 and any headers deeper than h5
  headings = headings.filter(h => !(h.level == 1 || h.level > 5))

  headings.map((heading, i) => {
    if (i == headings.length - 1 && heading.level == 3) {
      lastLevelIsNested = true
    }

    currentLevel = heading.level

    // First element add the list item
    if (previousLevel == 0) {
      toc += '<li class="toc__item">' + getHeadingLink(heading)
      previousLevel = currentLevel

    // If same level, close previous li and open a new one
    } else if (currentLevel == previousLevel) {
      toc += '</li><li class="toc__item">' + getHeadingLink(heading)

    // If deeper level, open up a new list and add list item
    } else if (currentLevel > previousLevel) {
      // Add 'toc__link--nested' class to the link, so that we know there is stuff inside of it
      let arr = toc.split('toc__link')
      const lastLink = arr[arr.length - 1]
      const newLastLink = " toc__link--nested" + lastLink
      arr[arr.length - 1] = newLastLink
      toc = arr.join('toc__link')

      toc += '<ul class="toc__nestedlist" style="display: none;"><li class="toc__item">' + getHeadingLink(heading)
      previousLevel = currentLevel

    // If higher level in tree
    } else if (currentLevel < previousLevel) {
      // Calculate the number of levels to terminate (li and list)
      let depth = previousLevel - currentLevel
      for(let i = 0; i < depth; i++) {
        toc += '</li></ul>'
      }
      // Add item to the appropriate level
      toc += '</li><li class="toc__item">' + getHeadingLink(heading)
      previousLevel = currentLevel
    }
  })

  if (lastLevelIsNested) {
    toc += '</li></ul>'
  }

  // Post generated html
  toc += '</li></ul></aside>'
  return toc
}

function* walk(root) {
    const openList = [root]
    const closedList = new Set()
    while (openList.length) {
        const currentRoot = openList.pop()
        closedList.add(currentRoot)

        for (const filename of fs.readdirSync(currentRoot)) {
            const path = currentRoot + '/' + filename
            const stat = fs.statSync(path)
            if (stat.isFile()) {
                yield path
            } else if (stat.isDirectory() && !closedList.has(path)) {
                openList.push(path)
            }
        }
    }
}

function processFile(path) {
    const rawdata = fs.readFileSync(path, { encoding: 'utf-8' })
    const match = rawdata.match(PAT_HEADMATTER)
    if (!match) {
        throw new Error('Couldn\'t find headmatter')
    }

    const rawHeadmatter = match[1]
    const headmatter = toml.parse(rawHeadmatter)
    if (!headmatter.slug) {
      headmatter.slug = '/' + pathModule.parse(path).name
    }

    const renderer = makeRenderer()
    const html = marked(rawdata.slice(match[0].length), { renderer: renderer }) + renderer.flush()

    const headingRemover = makeHeadingRemover()
    const htmlNoHeadings = marked(rawdata.slice(match[0].length), { renderer: headingRemover })
    // Remove HTML tags, quotation mark entities, and single quote entities
    const paragraphText = htmlNoHeadings.replace(/<(?:.|\n)*?>/gm, '')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, '\'')

    const nav = generateTOC(headingRemover.headings)

    return {
        html: nav + '<div class="main__content main__content--single single">' + html + "</div>",
        headmatterSource: match[0],
        headmatter: {
            url: headmatter.slug,
            title: headmatter.title,
            snippet: paragraphText.substring(0, SNIPPET_LENGTH) + '...',
            options: headmatter.tags,
        }
    }
}

function sortFeatured(tutorials) {
  let featured = []
  let notFeatured = []

  let index = -1

  tutorials.map(tutorial => {
    index = FEATURED_URLS.indexOf(tutorial.url)
    if (index > -1) {
      featured[index] = tutorial
    } else {
      notFeatured.push(tutorial)
    }
  })

  return featured.concat(notFeatured)
}

function main() {
    const args = docopt.docopt(__doc__)
    const tutorials = []
    const config = toml.parse(fs.readFileSync(args['--config']))
    const tagManifest = config.tags || []
    const tagIndexes = new Map()
    const tagMap = new Map(tagManifest.map((tag, index) => {
        tagIndexes.set(tag.id, index)
        return [tag.id, tag]
    }))
    let error = false

    const sourceContentDir = config.sourceContentDir.replace(/\/$/, '')
    const outputContentDir = config.contentDir.replace(/\/$/, '')

    try {
        fs.mkdirSync(outputContentDir)
    } catch (error) {}

    for (const path of walk(sourceContentDir)) {
        if (pathModule.extname(path) !== '.md') {
            continue
        }

        let doc
        try {
            doc = processFile(path)
        } catch(err) {
            console.error(`Error processing ${path}: ${err}`)
            error = true
            continue
        }

        doc.headmatter.options.forEach(function(option) {
          if (!tagMap.has(option)) {
            console.error(`Unknown tag "${option}" in ${path}`)
            error = true
          }
        })

        // Add facet and title information
        doc.headmatter.options = doc.headmatter.options.map(option => tagMap.get(option))

        // Ensure that tags have a consistent order defined by the config file
        doc.headmatter.options.sort((a, b) => {
            return tagIndexes.get(a.id) - tagIndexes.get(b.id)
        })

        tutorials.push(doc.headmatter)
        const outputPath = path.replace(sourceContentDir, outputContentDir).replace(/\.[a-z]+$/, '.html')
        fs.writeFileSync(outputPath, doc.headmatterSource + '\n' + doc.html)
    }

    if (error) {
        process.exit(1)
    }

    let tags = []

    for (const tag of Object.keys(tagManifest)) {
      let tagWithId = tagManifest[tag]
      tagWithId.id = tag
      tags.push(tagWithId)
    }

    try {
        fs.mkdirSync('public')
    } catch (error) {}

    let sortedTutorials = sortFeatured(tutorials)

    fs.writeFileSync('public/tags.json', JSON.stringify({
        tags: tags,
        tutorials: sortedTutorials
    }))
}

main()
