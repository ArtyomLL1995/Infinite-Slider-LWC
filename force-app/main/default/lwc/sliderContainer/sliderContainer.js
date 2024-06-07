import { LightningElement, track, api } from 'lwc';

import getProducts from '@salesforce/apex/CarouselController.getProducts'

export default class SliderContainer extends LightningElement {

    // Store here all data about slides (img.src or other info)
    allAvailableContent = []

    // Here we store currently displayed slides that we take from this.allAvailableContent
    @track currentlyDisplayedContent = []

    // Initial constants---------------------------

        // Slider width unit. Supports '%', 'px', 'rem', 'em', 'vw' (other units not tested)
        @api widthUnit

        // Slider height unit. Supports 'px', 'rem', 'em', 'vh' (other units not tested)
        @api heightUnit

        // If true then slider is looped
        @api infiniteSlider

        // If true then you can move slider with the mouse
        @api enableMouseMove

        // Slider width in this.widthUnit
        @api sliderContainerWidth

        // Slider height in this.heightUnit
        @api sliderContainerHeight

        // Number of visible slides in frame
        @api amountOfSlidesInFrame

        // Amount of scrolled slides per one slide. 
        @api amountOfSlidesPerSlide

        // Scroll speed in ms
        @api speed

        // Transition function
        @api transitionTimingFunction

    // Initial constants---------------------------

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

    async connectedCallback() {
        this.allAvailableContent = await getProducts()
        this.applyInitialVariables()
        this.defineInitialDisplayedContent()
    }

    renderedCallback() {
        if (this.firstRender) {
            this.firstRender = false
            const wrapper = this.template.querySelector('.wrapper')
            wrapper.style.width = this.sliderContainerWidth + this.widthUnit
            if (this.enableMouseMove) {
                wrapper.addEventListener('mousedown', this.handleMouseDown.bind(this))
                wrapper.addEventListener('mousemove', this.handleMouseMove.bind(this))
                wrapper.addEventListener('mouseup', this.handleMouseUp.bind(this))
            }
        } else {
            this.finishAnimation()
        }
    }

    defineInitialDisplayedContent() {
        let index = this.indexNext
        this.currentlyDisplayedContent = []
        if (this.allAvailableContent.length > this.amountOfSlidesInFrame) {
            for (let i = 0; i < this.numberOfInitialDrownSlides; i++) {
                if (this.infiniteSlider) {
                    if (index === this.allAvailableContent.length) index = 0
                    this.currentlyDisplayedContent.push(this.createDisplayObj(index))
                    index++
                } else {
                    if (this.allAvailableContent[i]) {
                        this.currentlyDisplayedContent.push(this.createDisplayObj(i))
                    }
                }
            }
        } else {
            for (let i = 0; i < this.allAvailableContent.length; i++) {
                this.currentlyDisplayedContent.push(this.createDisplayObj(i))
            }
        }
    }

    createDisplayObj(index) {
        return {
            Key: Date.now() * Math.random(), 
            Name : this.allAvailableContent[index].Name,
            Code: this.allAvailableContent[index].ProductCode
        }
    }

    applyInitialVariables() {
        this.numberOfInitialDrownSlides = this.amountOfSlidesInFrame + (this.amountOfSlidesPerSlide * 2)
        if (this.widthUnit != '%') {
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
        if (this.slideSwitcher && this.allAvailableContent.length > this.amountOfSlidesInFrame) {
            if (this.infiniteSlider) {
                this.changeFirstSlideStyle(0 + this.widthUnit)
                setTimeout(() => {
                    for (let i = 0; i < this.amountOfSlidesPerSlide; i++) {
                        this.indexNext -= 1
                        this.indexPrev -= 1
                        if (this.indexNext < 0) this.indexNext = this.allAvailableContent.length - 1
                        if (this.indexPrev < 0) this.indexPrev = this.allAvailableContent.length - 1
                        this.currentlyDisplayedContent.unshift(this.createDisplayObj(this.indexNext))
                        this.currentlyDisplayedContent.pop()
                    }
                }, this.speed)
            } else {
                if (Math.floor(this.marginLeftOffset) < 0) {
                    this.changeFirstSlideStyle((this.marginLeftOffset + (this.imgWidth * this.amountOfSlidesPerSlide)) + this.widthUnit)
                    this.marginLeftOffset += this.imgWidth * this.amountOfSlidesPerSlide
                } else if (Math.floor(this.marginLeftOffset) === 0) {
                    this.changeFirstSlideStyle(0 + this.widthUnit)
                }
                setTimeout(() => {
                    this.slideSwitcher = true
                }, this.speed)
            }
        }
    }

    slidePrev() {
        if (this.slideSwitcher && this.allAvailableContent.length > this.amountOfSlidesInFrame) {
            if (this.infiniteSlider) {
                this.changeFirstSlideStyle(-this.imgWidth * (this.amountOfSlidesPerSlide * 2) + this.widthUnit)
                setTimeout(() => {
                    for (let i = 0; i < this.amountOfSlidesPerSlide; i++) {
                        if (this.indexPrev > this.allAvailableContent.length-1) this.indexPrev = 0
                        if (this.indexNext > this.allAvailableContent.length-1) this.indexNext = 0
                        this.currentlyDisplayedContent.push(this.createDisplayObj(this.indexPrev))
                        this.currentlyDisplayedContent.shift()
                        this.indexPrev += 1
                        this.indexNext += 1
                    }
                }, this.speed)
            } else {
                if (
                    Math.abs(this.marginLeftOffset) < 
                    Math.abs(this.imgWidth * this.allAvailableContent.length) - 
                    Math.abs(this.imgWidth * this.amountOfSlidesInFrame)) {
                    
                    this.changeFirstSlideStyle(this.marginLeftOffset - (this.imgWidth * this.amountOfSlidesPerSlide) + this.widthUnit)

                    setTimeout(() => {
                        this.marginLeftOffset -= this.imgWidth * this.amountOfSlidesPerSlide
                        const newSlides = []
                        for (let i = this.currentlyDisplayedContent.length; 
                            i < this.currentlyDisplayedContent.length + this.amountOfSlidesPerSlide; i++) {

                            if (this.allAvailableContent[i]) {
                                newSlides.push(this.createDisplayObj(i))
                            }
                        }
                        this.currentlyDisplayedContent = [...this.currentlyDisplayedContent, ...newSlides]
                        this.slideSwitcher = true
                    }, this.speed)
                } else {
                    this.changeFirstSlideStyle(this.marginLeftOffset + this.widthUnit)
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
            renderedItems[i].style.width = this.imgWidth + this.widthUnit
            renderedItems[i].style.height = this.sliderContainerHeight + this.heightUnit
            renderedItems[i].style.transition = 0 + 's'
            if (this.infiniteSlider) {
                if (i === 0) {
                    if (this.allAvailableContent.length > this.amountOfSlidesInFrame) {
                        renderedItems[i].style.marginLeft = -this.imgWidth * this.amountOfSlidesPerSlide + this.widthUnit
                    } else {
                        renderedItems[i].style.marginLeft = 0 + this.widthUnit
                    }
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
            this.initialCoords.x = event.changedTouches ? event.changedTouches[0].pageX : event.pageX
            const style = renderedItems[0].currentStyle || window.getComputedStyle(renderedItems[0]);
            this.marginLeft = style.marginLeft
            this.mouseClickedOnTheElement = true
        }
    }

    handleMouseMove(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.slideSwitcher && this.mouseClickedOnTheElement) {
            this.currentCoords.x = event.changedTouches ? event.changedTouches[0].pageX : event.pageX
            this.mouseRelativePosition = parseInt(this.currentCoords.x) - parseInt(this.initialCoords.x)
            const renderedItems = this.template.querySelectorAll('.slide-container')
            renderedItems[0].style.marginLeft = (parseInt(this.marginLeft) + this.mouseRelativePosition) + 'px'
        }
    }

    handleMouseUp(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.slideSwitcher && this.mouseClickedOnTheElement) {
            this.touchEndTime = Date.parse(new Date)
            if (this.mouseRelativePosition > 0) {
                this.handleSlide(this.slideNext)
            } else {
                this.handleSlide(this.slidePrev)
            }
            this.mouseRelativePosition = 0
            this.mouseClickedOnTheElement = false 
        }
    }

    handleSlide(callback) {
        if (Math.abs(this.mouseRelativePosition) > 10 && 
            (Math.abs(this.mouseRelativePosition) > Math.abs(parseInt(this.marginLeft)/2) || this.touchEndTime - this.touchStartTime < 200) && 
            this.allAvailableContent.length > this.amountOfSlidesInFrame
        ) 
        {
            callback.call(this)
        } else {
            const renderedItems = this.template.querySelectorAll('.slide-container')
            renderedItems[0].style.transition = this.speed + 'ms'
            renderedItems[0].style.marginLeft = parseInt(this.marginLeft) + 'px'
        }
    }

}