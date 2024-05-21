import { LightningElement, api } from 'lwc';

export default class ProductCardContainer extends LightningElement {
    @api productName
    @api productCode
}