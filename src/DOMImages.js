/**
 * @property {HTMLElement|String} root_element
 * @property {Object} options
 * @property {Boolean} options.skip_dns_name
 */
class DOMImages {

    /**
     * @returns {String}
     * @throws {Error}
     * @public
     */
    get rootElementContent() {
        if (this.root_element && this.root_element.constructor === String)
            return this.root_element
        else if (this.root_element.innerHTML !== undefined)
            return this.root_element.innerHTML
        throw new Error('[Err] DOMImages.rootElementContent - root_element must be an HTML string or a valid HTML Element')
    }

    /**
     * @returns {Boolean}
     * @public
     */
    static get isBrowserContext() {
        try {
            return window !== undefined && window.document !== undefined
        } catch (e) {
            return false
        }
    }

    /**
     * @returns {Object}
     * @public
     */
    static get DEFAULT_OPTIONS() {
        return {
            skip_dns_name: true
        }
    }

    /**
     * 
     * @param {HTMLElement|String|null} [root_element=null] 
     * @param {Object} [options={}] 
     * @param {Boolean} [options.skip_dns_name=true]
     */
    constructor(root_element = null, options = {}) {
        this.root_element = root_element
        this.options = {
            ...DOMImages.DEFAULT_OPTIONS,
            ...options
        }

        if (DOMImages.isBrowserContext && !this.root_element)
            this.root_element = document.body
    }

    /**
     * @returns {Promise}
     * @public
     */
    loadAll() {
        return this.loadImages(
            this.getDocumentImages()
        )
    }

    /**
     * @param {Array} urls
     * @returns {Promise}
     * @public
     */
    loadImages(urls) {
        const promises = urls.map(url => {
            return new Promise((resolve, reject) => {
                try {
                    const img = new Image
                    img.onload = function () {
                        resolve()
                    }
                    img.src = url
                } catch (e) {
                    reject(e)
                }
            })
        })

        return Promise.all(promises)
    }

    /**
     * @returns {Array}
     * @public
     */
    getDocumentImages() {
        let stylesheetsImages = []
        try {
            stylesheetsImages = this.getImagesFromStylesheets()
        } catch (e) {
        }

        let images = [
            ...this.getImagesFromHTML(),
            ...stylesheetsImages
        ]

        return this._unescape([...new Set(images)])
    }

    /**
     * @returns {Array}
     * @throws {Error}
     * @public
     */
    getImagesFromStylesheets() {
        if (!DOMImages.isBrowserContext)
            throw new Error('[Err] DOMImages.getImagesFromStylesheets - Stylesheets can be processed only on a web browser context')

        let sheets = document.styleSheets
        let images = []

        for (let sheetIdx = 0, sheetsLen = sheets.length; sheetIdx < sheetsLen; ++sheetIdx) {
            images = [
                ...images,
                ...this.getImagesFromStylesheet(sheets[sheetIdx])
            ]
        }

        return images
    }

    /**
     * 
     * @param {StyleSheet|CSSStyleSheet} sheet
     * @returns {Array}
     * @public
     */
    getImagesFromStylesheet(sheet) {
        let images = [], rules, rule, match

        rules = sheet.rules ? sheet.rules : sheet.cssRules

        for (let ruleIdx = 0, rulesLen = rules.length; ruleIdx < rulesLen; ++ruleIdx) {
            rule = rules[ruleIdx]

            if (rule.selectorText && rule.style.cssText) {
                if (rule.style.cssText.match(/background/)) {
                    match = /url\(([^)]*)\)/.exec(rule.style.cssText)

                    if (match)
                        images.push(eval(match[1]))
                }
            }
        }

        return images
    }

    /**
     * @returns {Array}
     * @public
     */
    getImagesFromHTML() {
        return [
            ...this.getImagesFromHTMLInlineStyles(),
            ...this.getImagesFromHTMLImgTag()
        ]
    }

    /**
     * @returns {Array}
     * @public
     */
    getImagesFromHTMLImgTag() {
        if (DOMImages.isBrowserContext)
            return Array.from(document.querySelectorAll('img') || []).map(img => img.getAttribute('src'))

        const re = /<img.*?src\=\"(.*?)\".*?\/?>/gmi
        return this._matchRegexp(re)
    }

    /**
     * @returns {Array}
     * @public
     */
    getImagesFromHTMLInlineStyles() {
        let backgroundImages = (this.rootElementContent.match(/background-image.+?\((.+?)\)/gi) || []).map(e => {
            return ((e.match(/background-image.+?\((.+?)\)/i) || [])[1] || '').replace(/&quot;|"/g, '')
        })

        const re = /background.+?url\(([^)]*)\)/gmi
        let urls = this._matchRegexp(re)

        return [
            ...backgroundImages,
            ...urls
        ]
    }

    /**
     * @param {RegExp} regexp 
     * @returns {Array}
     * @private
     */
    _matchRegexp(regexp) {
        let m
        let urls = []

        while ((m = regexp.exec(this.rootElementContent)) !== null) {
            if (m.index === regexp.lastIndex)
                regexp.lastIndex++

            if (m && m.length)
                urls.push(m[1])
        }

        return urls
    }

    /**
     * @param {Array} images
     * @returns {Array}
     * @private
     */
    _unescape(images) {
        return images.map(image => image.replace(/\'|\"/gm, ""))
    }

}

if (DOMImages.isBrowserContext) {
    if (!('DOMImages' in window))
        window['DOMImages'] = DOMImages
} else module.exports = DOMImages
