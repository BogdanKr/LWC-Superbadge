/**
 * Created by Bogdan_Krasun on 28.08.2021.
 */

import {LightningElement, api, wire} from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';

import { updateRecord } from 'lightning/uiRecordApi';
import {getRecordNotifyChange} from 'lightning/uiRecordApi';


// ...
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = [
        {label: 'Name', fieldName: 'Name', editable: true},
        {label: 'Length', fieldName: 'Length__c', editable: true},
        {label: 'Price', fieldName: 'Price__c', editable: true},
        {label: 'Description', fieldName: 'Description__c', editable: true},
    ];
    boatTypeId = '';
    boats;
    isLoading = false;
    draftValues = [];

    // wired message context
    @wire(MessageContext)
    messageContext;

    // wired getBoats method
    @wire(getBoats, {boatTypeId: '$boatTypeId'})
    wiredBoats(result) {
        if (result) {
            this.boats = result;
        }
        this.notifyLoading(false);
    }

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api searchBoats(boatTypeId) {
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = boatTypeId;
    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
   async refresh() {
        this.notifyLoading(true);
        refreshApex(this.boats).then(() => {
            // Clear all draft values in the datatable
            this.draftValues = [];
        });
    }

    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) {
        this.selectedBoatId = event.detail.boatId;
        console.log('selectedBoatId = ' + this.selectedBoatId);
        this.sendMessageService(this.selectedBoatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) {
        // explicitly pass boatId to the parameter recordId
        const payload = {recordId: boatId};
        publish(this.messageContext, BOATMC, payload);
    }

    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    async handleSave(event) {
        this.notifyLoading(true);
        const recordInputs = event.detail.draftValues.slice().map(draft=>{
            const fields = Object.assign({}, draft);
            return {fields};
        });

        console.log(recordInputs);
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );
            this.draftValues = [];
            return this.refresh();
        }).catch(error => {
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
            this.notifyLoading(false);
        }).finally(() => {
            this.draftValues = [];
        });
    }

    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) {
        if (isLoading) {
            const loadEvent = new CustomEvent('loading');
            this.dispatchEvent(loadEvent);
        } else {
            const loadEvent = new CustomEvent('doneloading');
            this.dispatchEvent(loadEvent);
        }
    }
}

