public with sharing class CarouselController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts() {
        return [
            SELECT 
            Id,
            Name,
            ProductCode
            FROM Product2
            WITH USER_MODE
            LIMIT 16
        ];
    }
}