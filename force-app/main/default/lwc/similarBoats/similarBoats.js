/**
 * Created by Bogdan_Krasun on 08.09.2021.
 */

import {LightningElement, api, wire} from 'lwc';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
import {NavigationMixin} from "lightning/navigation";

// imports
// import getSimilarBoats
export default class SimilarBoats extends NavigationMixin(LightningElement) {
    // Private
    currentBoat;
    relatedBoats;
    boatId;
    error;

    // public
    @api
    get recordId() {
        // returns the boatId
        this.boatId;
    }

    set recordId(value) {
        // sets the boatId value
        // sets the boatId attribute
        this.setAttribute('boatId', value);
        this.boatId = value;
    }

    // public
    @api
    similarBy;

    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats, {boatId: '$boatId', similarBy: '$similarBy'})
    similarBoats({error, data}) {
        if (data) {
            this.error = undefined;
            this.relatedBoats = data;
        } else if (error) {
            this.error = error;
            this.boatId = undefined;
            console.log('similarBoats - ERROR')
        }
    }

    get getTitle() {
        return 'Similar boats by ' + this.similarBy;
    }

    get noBoats() {
        return !(this.relatedBoats && this.relatedBoats.length > 0);
    }

    // Navigate to record page
    openBoatDetailPage(event) {
        const boatId    = event.detail.boatId;
        // Generate a URL to a User record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: boatId ,
                objectApiName: 'Boat__c',
                actionName: 'view',
            },
        });
    }
}
