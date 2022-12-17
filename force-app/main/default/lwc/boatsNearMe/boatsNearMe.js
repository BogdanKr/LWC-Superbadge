/**
 * Created by Bogdan_Krasun on 30.08.2021.
 */

import {LightningElement, wire, api} from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import {getRecord} from "lightning/uiRecordApi";
import {ShowToastEvent} from "lightning/platformShowToastEvent";

// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
    @api boatTypeId;
    mapMarkers = [];
    isLoading = true;
    isRendered = false;
    latitude;
    longitude;

    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarkers
    //latitude: ‘$latitude’, longitude: ‘$longitude’, boatTypeId: ‘$boatTypeId’
    @wire(getBoatsByLocation, {latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId'})
    wiredBoatsJSON({error, data}) {
        // Error handling
        if (data) {
            this.createMapMarkers(data)
        } else if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
        }
        this.isLoading = false;
    }

    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() {
        if (this.isRendered === false) {
            this.getLocationFromBrowser();
        }
        this.isRendered = true;
    }

    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() {
        console.log('getLocationFromBrowser invoked')

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            },
            (e) => {
            }, {
                enableHighAccuracy: true
            }
        );
    }

    // Creates the map markers
    createMapMarkers(boatData) {
        console.log('createMapMarkers invoked')
        this.mapMarkers = boatData.map(rowBoat => {
            return {
                location: {
                    Latitude: rowBoat.Geolocation__Latitude__s,
                    Longitude: rowBoat.Geolocation__Longitude__s
                },
                title: rowBoat.Name,
            };
        });
        this.mapMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER
        });
        this.isLoading = false;
    }

    handleClick() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {

                // Get the Latitude and Longitude from Geolocation API
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;

                // Add Latitude and Longitude to the markers list.
                this.mapMarkers = [{
                    location: {
                        Latitude: latitude,
                        Longitude: longitude
                    },
                    title: 'You are here'
                }];
            });
        }
    }
}
