import { LightningElement, track, api } from 'lwc';

import IMAGE_1 from '@salesforce/resourceUrl/image1';
import IMAGE_2 from '@salesforce/resourceUrl/image2';
import IMAGE_3 from '@salesforce/resourceUrl/image3';
import IMAGE_4 from '@salesforce/resourceUrl/image4';
import IMAGE_5 from '@salesforce/resourceUrl/image5';
import IMAGE_6 from '@salesforce/resourceUrl/image6';
import IMAGE_7 from '@salesforce/resourceUrl/image7';
import IMAGE_8 from '@salesforce/resourceUrl/image8';
import IMAGE_9 from '@salesforce/resourceUrl/image9';
import IMAGE_10 from '@salesforce/resourceUrl/image10';

// Slider width unit. Supports '%', 'px', 'rem', 'em', 'vw' (other units not tested)
const UNIT = '%' 

// Slider height unit. Supports 'px', 'rem', 'em', 'vh' (other units not tested)
const HEIGHT_UNIT = 'px'

export default class SliderContainer extends LightningElement {

    // Store here all data about slides (img.src or other info)
    @api allAvailableContent = [ IMAGE_1, IMAGE_2, IMAGE_3, IMAGE_4, IMAGE_5, IMAGE_6, IMAGE_7, IMAGE_8, IMAGE_9, IMAGE_10 ]

    // Here we store currently displayed slides that we take from this.allAvailableContent
    @track currentlyDisplayedContent = []



    // Initial constants---------------------------

        // If true then slider is infinite
        infiniteSlider = true

        // If true then you can move slider with the mouse or trackpad
        enableMouseMove = true

        // Slider width in UNIT
        @api sliderContainerWidth = 100

        // Slider height in HEIGHT_UNIT
        @api sliderContainerHeight = 300

        // Number of visible slides in frame
        @api amountOfSlidesInFrame = 4

        // Amount of scrolled slides per one slide. 
        // (amountOfSlidesInFrame + amountOfSlidesPerSlide*2) must not be greater than allAvailableContent.length
        // amountOfSlidesPerSlide must not be greater than amountOfSlidesInFrame
        @api amountOfSlidesPerSlide = 2

        // Scroll speed in ms
        @api speed = 400 

        // Transition function
        @api transitionTimingFunction = 'cubic-bezier(0, 0, 0.58, 1.0)'

    // Initial constants---------------------------



    // Html elem---------------------------

        wrapper

    // Html elem---------------------------

    

    // Animation variables---------------------------

        mouseClickedOnTheElement = false
        firstRender = true
        slideSwitcher = true
        numberOfInitialDrownSlides
        imgWidth
        indexNext
        indexPrev
        marginLeft
        marginLeftOffset = 0
        touchStartTime
        touchEndTime
        mouseRelativePosition = 0
        
        initialCoords = {
            x : 0
        }

        currentCoords = {
            x : 0
        }

    // Animation variables---------------------------

    connectedCallback() {
        this.applyInitialVariables()
        this.defineInitialDisplayedContent()
    }

    renderedCallback() {
        if (this.firstRender) {
            this.firstRender = false
            this.wrapper = this.template.querySelector('.wrapper')
            this.wrapper.style.width = this.sliderContainerWidth + UNIT
            if (this.enableMouseMove) {
                this.wrapper.addEventListener('mousedown', this.handleMouseDown.bind(this))
                this.wrapper.addEventListener('mousemove', this.handleMouseMove.bind(this))
                this.wrapper.addEventListener('mouseup', this.handleMouseUp.bind(this))
            }
        }
        this.finishAnimation()
    }

    defineInitialDisplayedContent() {
        let index = this.infiniteSlider ? this.indexNext : 0
        for (let i = 0; i < this.numberOfInitialDrownSlides; i++) {
            if (index === this.allAvailableContent.length) {
                index = 0
            } 
            this.currentlyDisplayedContent.push({src : this.allAvailableContent[index]})
            index++
        }
    }

    applyInitialVariables() {
        this.numberOfInitialDrownSlides = this.amountOfSlidesInFrame + (this.amountOfSlidesPerSlide * 2)
        if (UNIT != '%') {
            this.imgWidth = this.sliderContainerWidth / this.amountOfSlidesInFrame
        } else {
            this.imgWidth = 100 / this.amountOfSlidesInFrame
        }
        this.indexNext = this.allAvailableContent.length - this.amountOfSlidesPerSlide
        this.indexPrev = this.amountOfSlidesInFrame + this.amountOfSlidesPerSlide
    }

    // Since all slide elems inside slider are inline-block we need to change just margin of the first one
    changeFirstSlideStyle(left) {
        this.slideSwitcher = false
        const renderedItems = this.template.querySelectorAll('.slide-container')
        renderedItems[0].style.transition = this.speed + 'ms'
        renderedItems[0].style.transitionTimingFunction = this.transitionTimingFunction;
        renderedItems[0].style.marginLeft = left
    }

    slideNext() {
        if (this.slideSwitcher) {
            if (this.infiniteSlider) {
                this.changeFirstSlideStyle('0' + UNIT)
                setTimeout(() => {
                    for (let i = 0; i < this.amountOfSlidesPerSlide; i++) {
                        this.indexNext -= 1
                        this.indexPrev -= 1
                        if (this.indexNext < 0) this.indexNext = this.allAvailableContent.length - 1
                        if (this.indexPrev < 0) this.indexPrev = this.allAvailableContent.length - 1
                        this.currentlyDisplayedContent.unshift({src : this.allAvailableContent[this.indexNext]})
                        this.currentlyDisplayedContent.pop()
                    }
                }, this.speed)
            } else {
                if (Math.floor(this.marginLeftOffset) < 0) {
                    this.changeFirstSlideStyle((this.marginLeftOffset + (this.imgWidth * this.amountOfSlidesPerSlide)) + UNIT)
                    this.marginLeftOffset += this.imgWidth * this.amountOfSlidesPerSlide
                } else if (Math.floor(this.marginLeftOffset) === 0) {
                    this.changeFirstSlideStyle(0 + UNIT)
                }
                setTimeout(() => {
                    this.slideSwitcher = true
                }, this.speed)
            }
        }
    }

    slidePrev() {
        if (this.slideSwitcher) {
            if (this.infiniteSlider) {
                this.changeFirstSlideStyle(-this.imgWidth * (this.amountOfSlidesPerSlide * 2) + UNIT)
                setTimeout(() => {
                    for (let i = 0; i < this.amountOfSlidesPerSlide; i++) {
                        if (this.indexPrev > this.allAvailableContent.length - 1) this.indexPrev = 0
                        if (this.indexNext > this.allAvailableContent.length - 1) this.indexNext = 0
                        this.currentlyDisplayedContent.push({src : this.allAvailableContent[this.indexPrev]})
                        this.currentlyDisplayedContent.shift()
                        this.indexPrev += 1
                        this.indexNext += 1
                    }
                }, this.speed)
            } else {
                if (Math.floor(this.marginLeftOffset) <= 0 && 
                    Math.abs(this.marginLeftOffset) < 
                    Math.abs(this.imgWidth * this.allAvailableContent.length) - 
                    Math.abs(this.imgWidth * this.amountOfSlidesInFrame)) {
                    
                    this.changeFirstSlideStyle(this.marginLeftOffset - (this.imgWidth * this.amountOfSlidesPerSlide) + UNIT)

                    setTimeout(() => {
                        this.marginLeftOffset -= this.imgWidth * this.amountOfSlidesPerSlide
                        const newSlides = []
                        for (let i = this.currentlyDisplayedContent.length; 
                            i < this.currentlyDisplayedContent.length + this.amountOfSlidesPerSlide; i++) {

                            if (this.allAvailableContent[i]) {
                                newSlides.push({src : this.allAvailableContent[i]})
                            }
                        }
                        this.currentlyDisplayedContent = [...this.currentlyDisplayedContent, ...newSlides]
                        this.slideSwitcher = true
                    }, this.speed)

                } else {
                    this.changeFirstSlideStyle(this.marginLeftOffset + UNIT)
                    setTimeout(() => {
                        this.slideSwitcher = true
                    }, this.speed)
                }
            }
        }
    }

    finishAnimation() {
        const renderedItems = this.template.querySelectorAll('.slide-container')
        for (let i = 0; i < renderedItems.length; i++) {
            renderedItems[i].style.width = this.imgWidth + UNIT
            renderedItems[i].style.height = this.sliderContainerHeight + HEIGHT_UNIT
            renderedItems[i].style.transition = 0 + 's'
            if (this.infiniteSlider) {
                if (i === 0) {
                    renderedItems[i].style.marginLeft = -this.imgWidth * this.amountOfSlidesPerSlide + UNIT
                } else {
                    renderedItems[i].style.marginLeft = 0 + UNIT
                }
            }
        }
        this.slideSwitcher = true
    }

    handleMouseDown(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.slideSwitcher) {
            this.touchStartTime = Date.parse(new Date)
            const renderedItems = this.template.querySelectorAll('.slide-container')
            renderedItems[0].style.transition = 0 + 'ms'
            this.initialCoords.x = event.pageX
            const style = renderedItems[0].currentStyle || window.getComputedStyle(renderedItems[0]);
            this.marginLeft = style.marginLeft
            this.mouseClickedOnTheElement = true
        }
    }

    handleMouseMove(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.slideSwitcher && this.mouseClickedOnTheElement) {
            this.currentCoords.x = event.pageX
            this.mouseRelativePosition = parseInt(this.currentCoords.x) - parseInt(this.initialCoords.x)
            const renderedItems = this.template.querySelectorAll('.slide-container')
            renderedItems[0].style.marginLeft = (parseInt(this.marginLeft) + this.mouseRelativePosition) + 'px'
        }
    }

    handleMouseUp(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.slideSwitcher) {
            this.touchEndTime = Date.parse(new Date)
            if (this.mouseClickedOnTheElement) {
                if (this.mouseRelativePosition > 0) {
                    this.handleSlide(this.slideNext)
                } else {
                    this.handleSlide(this.slidePrev)
                }
                this.mouseRelativePosition = 0
                this.mouseClickedOnTheElement = false
            } 
        }
    }

    handleSlide(callback) {
        if (Math.abs(this.mouseRelativePosition) > 10 && 
            (Math.abs(this.mouseRelativePosition) > Math.abs(parseInt(this.marginLeft)/2) ||
            this.touchEndTime - this.touchStartTime < 200)
            ) {

            callback.call(this)
        } else {
            const renderedItems = this.template.querySelectorAll('.slide-container')
            renderedItems[0].style.transition = this.speed + 'ms'
            renderedItems[0].style.marginLeft = parseInt(this.marginLeft) + 'px'
        }
    }

}