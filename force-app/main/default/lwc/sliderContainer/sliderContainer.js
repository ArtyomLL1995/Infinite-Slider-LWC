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

const UNIT = '%'
const HEIGHT_UNIT = 'px'

export default class SliderContainer extends LightningElement {

    // Initial contstants---------------------------

    // If false then you can move slider with the mouse or trackpad
    @api disableMouseMove = false

    // Frame width in UNIT
    @api sliderContainerWidth = 100 

    // Frame height in HEIGHT_UNIT
    @api sliderContainerHeight = 300 

    // Number of visible pictures in frame
    @api amountOfPicturesInSlide = 3 

    // Amount of scrolled pictures per one slide. (amountOfPicturesInSlide + amountOfSlidesPerSlide*2) should not be greater than the whole number of images
    @api amountOfSlidesPerSlide = 2 

    // Scroll speed in ms
    @api speed = 400 

    // Transition function
    @api transitionTimingFunction = 'cubic-bezier(0, 0, 0.58, 1.0)'

    // Initial contstants---------------------------

    // Html elem---------------------------

    wrapper

    // Html elem---------------------------

    allAvailableContent = [
        IMAGE_1,
        IMAGE_2,
        IMAGE_3, 
        IMAGE_4, 
        IMAGE_5,
        IMAGE_6,
        IMAGE_7,
        IMAGE_8,
        IMAGE_9,
        IMAGE_10
    ]

    @track currentlyDisplayedContent = []

    // Animation variables---------------------------

    showSlider = false
    mouseClickedOnTheElement = false
    firstRender = true
    slideSwitcher = true
    
    numberOfInitialDrownSlides
    imgWidth
    indexNext
    indexPrev
    marginLeft
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
            if (this.disableMouseMove) {
                this.wrapper.addEventListener('mousedown', this.handleMouseDown.bind(this))
                this.wrapper.addEventListener('mousemove', this.handleMouseMove.bind(this))
                this.wrapper.addEventListener('mouseup', this.handleMouseUp.bind(this))
            }
        }
        this.finishAnimation()
    }

    defineInitialDisplayedContent() {
        let index = this.indexNext
        for (let i = 0; i < this.numberOfInitialDrownSlides; i++) {
            if (index === this.allAvailableContent.length) index = 0
            this.currentlyDisplayedContent.push({id : i, src : this.allAvailableContent[index]})
            index++
        }
    }

    applyInitialVariables() {
        this.numberOfInitialDrownSlides = this.amountOfPicturesInSlide + (this.amountOfSlidesPerSlide * 2)
        if (UNIT != '%') {
            this.imgWidth = this.sliderContainerWidth / this.amountOfPicturesInSlide
        } else {
            this.imgWidth = 100 / this.amountOfPicturesInSlide
        }
        this.indexNext = this.allAvailableContent.length - this.amountOfSlidesPerSlide
        this.indexPrev = this.amountOfPicturesInSlide + this.amountOfSlidesPerSlide
    }

    changeFirstSlideStyle(left) {
        this.slideSwitcher = false
        const renderedItems = this.template.querySelectorAll('.slide-container')
        renderedItems[0].style.transition = this.speed + 'ms'
        renderedItems[0].style.transitionTimingFunction = this.transitionTimingFunction;
        renderedItems[0].style.marginLeft = left
    }

    slideNext() {
        if (this.slideSwitcher) {
            this.changeFirstSlideStyle('0' + UNIT)
            setTimeout(() => {
                for (let i = 0; i < this.amountOfSlidesPerSlide; i++) {
                    this.indexNext -= 1
                    this.indexPrev -= 1
                    if (this.indexNext < 0) this.indexNext = this.allAvailableContent.length - 1
                    if (this.indexPrev < 0) this.indexPrev = this.allAvailableContent.length - 1
                    this.currentlyDisplayedContent.unshift({id :this.indexNext, src : this.allAvailableContent[this.indexNext]})
                    this.currentlyDisplayedContent.pop()
                }
            }, this.speed)
        }
    }

    slidePrev() {
        if (this.slideSwitcher) {
            this.changeFirstSlideStyle(-this.imgWidth * (2 * this.amountOfSlidesPerSlide) + UNIT)
            setTimeout(() => {
                for (let i = 0; i < this.amountOfSlidesPerSlide; i++) {
                    if (this.indexPrev > this.allAvailableContent.length - 1) this.indexPrev = 0
                    if (this.indexNext > this.allAvailableContent.length - 1) this.indexNext = 0
                    this.currentlyDisplayedContent.push({id :this.indexPrev, src : this.allAvailableContent[this.indexPrev]})
                    this.currentlyDisplayedContent.shift()
                    this.indexPrev += 1
                    this.indexNext += 1
                }
            }, this.speed)
        }
    }

    finishAnimation() {
        const renderedItems = this.template.querySelectorAll('.slide-container')
        for (let i = 0; i < renderedItems.length; i++) {
            renderedItems[i].style.width = this.imgWidth + UNIT
            renderedItems[i].style.height = this.sliderContainerHeight + HEIGHT_UNIT
            renderedItems[i].style.transition = 0 + 's'
            if (i === 0) {
                renderedItems[i].style.marginLeft = -this.imgWidth * this.amountOfSlidesPerSlide + UNIT
            } else {
                renderedItems[i].style.marginLeft = 0 + UNIT
            }
        }
        this.slideSwitcher = true
    }

    handleMouseDown(event) {
        if (this.slideSwitcher) {
            console.log('mouse down')
            event.preventDefault();
            event.stopPropagation();
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
        if (this.slideSwitcher) {
            event.preventDefault();
            event.stopPropagation();
            if (this.mouseClickedOnTheElement) {
                this.currentCoords.x = event.pageX
                this.mouseRelativePosition = parseInt(this.currentCoords.x) - parseInt(this.initialCoords.x)
                const renderedItems = this.template.querySelectorAll('.slide-container')
                renderedItems[0].style.marginLeft = (parseInt(this.marginLeft) + this.mouseRelativePosition) + 'px'
            }
        }
    }

    handleMouseUp(event) {
        if (this.slideSwitcher) {
            event.preventDefault();
            event.stopPropagation();
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
        if (Math.abs(this.mouseRelativePosition) > 10 && Math.abs(this.mouseRelativePosition) > Math.abs(parseInt(this.marginLeft)/2)) {
            callback.call(this)
        } else {
            if (Math.abs(this.mouseRelativePosition) > 10 && this.touchEndTime - this.touchStartTime < 200) {
                callback.call(this)
            } else {
                const renderedItems = this.template.querySelectorAll('.slide-container')
                renderedItems[0].style.transition = this.speed + 'ms'
                renderedItems[0].style.marginLeft = parseInt(this.marginLeft) + 'px'
            }
        }
    }
}