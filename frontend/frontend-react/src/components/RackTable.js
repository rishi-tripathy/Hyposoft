import React, {Component} from 'react'
import '../stylesheets/RackTable.css'
// import '../stylesheets/RacksView.css'
// import '../stylesheets/Printing.css'
import RackRow from './RackRow'
import axios from 'axios'

axios.defaults.xsrfHeaderName = "X-CSRFToken";

export class RackTable extends Component {

  getRackNum() {
    //need to get data.results
    let rackNum = "";
    for (var key of Object.keys(this.props.rack)) {
      if (key === 'rack_number') {
        rackNum = this.props.rack[key];
        return rackNum;
      }
    }
  }

  fixRows() {
    let temp_rows = [];
    // console.log(this.props.rack);
    temp_rows = this.props.rack;

    for (var i of Object.keys(temp_rows)) {
      if (i.substring(0, 1) == "u" && i != "url") {
        temp_rows[i.substring(1, 3)] = temp_rows[i]; //replace key
        delete temp_rows[i];
      }
    }
    return temp_rows;
  }

  getRows() {
    return this.props.rack;
  }

  sending = (show, id) => {
    this.props.sending(show, id);
  }

  renderRows() {
    //these store information per rack, for empty ones, everything is added as null except for rackUs
    let rackUs = [];
    let rackInstances = []; //has URLs or null
    let modelInfo = []; //has model uri or null
    let displayColors = [];
    let hostnameInfo = []; //has hostname String or null
    let idList = [];
    let lastNotNull = '1';
    //michael below
    let modelMountTypes = []
    

    let condensed = this.props.condensedState;
    let rows = [];
    rows = this.fixRows();

    let previousRackU;
    let nextRackU;
    let currentRackU;

    for (var i of Object.keys(rows)) {
      if (i === "id" || i === "pdu_l" || i === "pdu_r" || i === "rack_number" || i === "url" || i === "datacenter") {
        //do nothing
      } else if ( !condensed) {
        rackUs.push(i);

        if (rows[i] !== null) {
          console.log(currentRackU);
          idList.push(rows[i].id);
          currentRackU = rows[i];
          rackInstances.push(currentRackU.url); //push rackInstance
          displayColors.push(currentRackU.model.display_color);

          //only want to display things if FIRST (which is last backwards)...
          previousRackU = rows[i - 1];
          nextRackU = rows[i + 1];

          if (previousRackU == null || previousRackU.id !== currentRackU.id) {
            //the previous one is null and this is the first U of the thing //
            modelInfo.push(currentRackU.model.vendor + " " + currentRackU.model.model_number);
            modelMountTypes.push(currentRackU.model.mount_type)
            hostnameInfo.push(currentRackU.hostname);
          } else {
            modelInfo.push(null);
            modelMountTypes.push(null);
            hostnameInfo.push(null);
          }
        } else {
          rackInstances.push(rows[i]);
          modelInfo.push(rows[i]);
          modelMountTypes.push(rows[i]);
          displayColors.push(rows[i]);
          idList.push(rows[i]);
          hostnameInfo.push(rows[i]); //push rackInstance -- null in this case lol, no need to break it apart
        }
      }

      //CONDENSED
      else if (i !== "rack_number" && i !== "url" && condensed) {

        //stupid integer parsing

        let currentInt = parseInt(i, 10);
        let nextInt = currentInt + 1;
        let previousInt = currentInt - 1;


        previousRackU = rows[previousInt.toString()];
        nextRackU = rows[nextInt.toString()];
        currentRackU = rows[i];

        //NOT NULL
        if (currentRackU !== null) {
          console.log(currentRackU);
          lastNotNull = i;
          //not null, render like normal
          //push row number
          rackUs.push(i);
          rackInstances.push(currentRackU.url); //push rackInstance
          displayColors.push(currentRackU.model.display_color);

          //only want to display things if FIRST (which is last backwards)...
          if (previousRackU == null || previousRackU.id !== currentRackU.id) {
            //the previous one is null or a diff instance and this is the first U of the thing //
            modelInfo.push(currentRackU.model.vendor + " " + currentRackU.model.model_number);
            modelMountTypes.push(currentRackU.model.mount_type)
            hostnameInfo.push(currentRackU.hostname);
          } else {
            //part of the rack, but not the last one where we need text
            modelInfo.push(null);
            modelMountTypes.push(null);
            hostnameInfo.push(null);
          }
        }
        //currentracku is NULL
        else {
          if (i === '42' || i === '1') {
            //display first and last always
            rackUs.push(i);
            rackInstances.push(rows[i]);
            modelInfo.push(rows[i]);
            modelMountTypes.push(rows[i])
            displayColors.push(rows[i]);
            hostnameInfo.push(rows[i]);
          } else if (previousRackU !== null && nextRackU !== null) {
            //display as null
            rackUs.push(i);
            rackInstances.push(null);
            hostnameInfo.push(null);
            displayColors.push(null);
            modelInfo.push(null);
            modelMountTypes.push(null)
          } else if (i === '41' && (lastNotNull === '1' || lastNotNull !== '40')) {
            //entire rack is empty, needs dots
            rackUs.push(i);
            rackInstances.push(null);
            hostnameInfo.push(null);
            displayColors.push(null);
            modelInfo.push('...');
            modelMountTypes.push(null);
          } else if (previousRackU == null && nextRackU == null) {
            //skip
          } else if (nextRackU !== null && previousRackU == null) {
            rackUs.push(i);
            rackInstances.push(null);
            hostnameInfo.push(null);
            displayColors.push(null);
            modelInfo.push('...');
            modelMountTypes.push(null);
          }
        }
      }
    }

    return rackUs.reverse().map((row, index) => {
      return (
        <RackRow
          index={rackUs.length - index}
          condensedView={condensed}
          row={row}
          instanceUrl={rackInstances[rackUs.length - index - 1]}
          model={modelInfo[rackUs.length - index - 1]}
          displayColor={displayColors[rackUs.length - index - 1]}
          hostname={hostnameInfo[rackUs.length - index - 1]}
          sendFromRow={this.sending}
          id={idList[rackUs.length - index - 1]}
          modelMountType={modelMountTypes[rackUs.length - index - 1]}
          />
          
      )
    })
  }

  render() {

    let rackNumber = this.getRackNum();
    if(this.props.allCase){
      console.log(this.props.dc)
      rackNumber = rackNumber.concat(' ('+ this.props.dc+')');
    }

    return (
      <table id="entries1">
        <tbody>
        <th></th>
        <th>{rackNumber}</th>
        <th></th>
        {this.renderRows()}
        </tbody>
      </table>
    )
  }
}

export default RackTable