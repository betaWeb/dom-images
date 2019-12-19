const DOMImages = require('../src/DOMImages')
const { readFileSync } = require('fs')

describe('DOMImages with HTML string', () => {

    beforeAll(() => {
        this.domContent = readFileSync(__dirname + '/dom-fixture.html', { encoding: 'utf-8' })
    })

    beforeEach(() => {
        this.DOMImages = new DOMImages(this.domContent)
    })

    it('Should have an HTML string', () => {
        expect(this.DOMImages.rootElementContent).toEqual(this.domContent)
    })

    it('Should have an HTML string with 3 images', () => {
        expect(this.DOMImages.getDocumentImages().length).toEqual(5)
    })

    it('Should have an HTML string contains a specific image', () => {
        const needle = "/assets/gallery/landscape.jpeg"
        const images = this.DOMImages.getDocumentImages()

        expect(images).toContain(needle)
    })

    afterEach(() => this.DOMImages = null)

})

describe('DOMImages with CSS string', () => {

    beforeAll(() => {
        this.cssContent = readFileSync(__dirname + '/css-fixture.css', { encoding: 'utf-8' })
    })

    beforeEach(() => {
        this.DOMImages = new DOMImages(this.cssContent)
    })

    it('Should have a CSS string', () => {
        expect(this.DOMImages.rootElementContent).toEqual(this.cssContent)
    })

    it('Should have an HTML string with 2 images', () => {
        console.log(this.DOMImages.getDocumentImages())
        expect(this.DOMImages.getDocumentImages().length).toEqual(2)
    })

})
