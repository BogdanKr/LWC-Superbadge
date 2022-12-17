/**
 * Created by Bogdan_Krasun on 29.08.2021.
 */

import {LightningElement, api} from 'lwc';

// imports

const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';
export default class BoatTile extends LightningElement {
    @api boat;
    @api selectedBoatId;
    changeStyle = false;

    // Getter for dynamically setting the background image for the picture
    get backgroundStyle() {
        return 'background-image:url(' + this.boat.Picture__c + ')';
    }

    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    get tileClass() {
        return this.changeStyle ? TILE_WRAPPER_SELECTED_CLASS : TILE_WRAPPER_UNSELECTED_CLASS;
    }

    // Fires event with the Id of the boat that has been selected.
    selectBoat() {
        this.changeStyle = true;
        // this.selectedBoatId = this.boat.Id;
        const clickedBoat = new CustomEvent('boatselect', {
           detail: { boatId: this.boat.Id}
        });
        this.dispatchEvent(clickedBoat);
    }
}
