import { LightningElement } from 'lwc';

export default class Carousel extends LightningElement {
    infiniteSlider = false
    enableMouseMove = false
    widthUnit = '%'
    heightUnit = 'px'
    sliderContainerWidth = 90
    sliderContainerHeight = 350
    amountOfSlidesInFrame = 5
    amountOfSlidesPerSlide = 5
    speed = 400
    transitionTimingFunction = 'cubic-bezier(0, 0, 0.58, 1.0)'
}   