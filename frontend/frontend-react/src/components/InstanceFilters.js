import React, { Component } from 'react'
import axios from 'axios'
import { Button, TextField, Grid, Input, Container, FormControl } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import DatacenterContext from './DatacenterContext';

axios.defaults.xsrfHeaderName = "X-CSRFToken";

export class InstanceFilters extends Component {

  constructor() {
    super();
    this.state = {
      modelOptions: [],
      selectedModelOption: null,

      // rackOptions: [],
      // selectedRackOption: null,

      ownerOptions: [],
      selectedOwnerOption: null,

      datacenterOptions: [],
      selectedDatacenterOption: null,

      identifiers: {
        datacenterID: '',
        modelID: '',
        modelNumber: '',
        modelVendor: '',
        hostname: '',
        rackID: '',
        rack_u: '',
        ownerID: '',
        rackStart: '',
        rackEnd: '',
        location: '',
        slot_number: '',
      },
      query: null,

      chassisOptions: [],
      selectedChassisOption: null,
    }
  }

  removeEmpty = (obj) => {
    Object.keys(obj).forEach((k) => (!obj[k] && obj[k] !== undefined) && delete obj[k]);
    return obj;
  };

  mountModelNames = () => {
    // MODEL NAMES
    let dst = '/api/assets/model_names/';
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        myOptions.push({ value: res.data[i].id, label: res.data[i].vendor + ' ' + res.data[i].model_number });
      }
      //console.log(res.data)
      this.setState({ modelOptions: myOptions });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  mountDatacenters = () => {
    // MODEL NAMES
    let dst = '/api/datacenters/?show_all=true';
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        myOptions.push({ value: res.data[i].id, label: res.data[i].abbreviation });
      }
      //console.log(res.data)
      this.setState({ datacenterOptions: myOptions });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  // mountRacks = () => {
  //   // RACK
  //   let dst = '/api/racks/?show_all=true';
  //   axios.get(dst).then(res => {
  //     let myOptions = [];
  //     for (let i = 0; i < res.data.length; i++) {
  //       myOptions.push({value: res.data[i].id, label: res.data[i].rack_number});
  //     }
  //     //console.log(res.data)
  //     this.setState({rackOptions: myOptions});
  //   })
  //     .catch(function (error) {
  //       // TODO: handle error
  //       alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
  //     });
  // }

  mountOwners = () => {
    // OWNER
    let dst = '/api/users/?show_all=true';
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        myOptions.push({ value: res.data[i].id, label: res.data[i].username });
      }
      //console.log(res.data)
      this.setState({ ownerOptions: myOptions });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  mountChassis = () => {
    // get all chassis
    const dst = '/api/datacenters/all_chassis/';
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        myOptions.push({ value: res.data[i].id, label: res.data[i].hostname + ' ' + res.data[i].asset_number });
      }
      //console.log(res.data)
      this.setState({ chassisOptions: myOptions });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });

  }

  componentDidMount() {
    this.mountModelNames();
    //this.mountRacks();
    this.mountDatacenters();
    this.mountOwners();
    this.mountChassis();
  }

  handleChangeModel = (event, selectedModelOption, reason) => {
    let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers));
    identifiersCopy.modelID = (selectedModelOption ? selectedModelOption.value : '')
    this.setState({
      selectedModelOption,
      identifiers: identifiersCopy,
    })
  };

  handleChangeDatacenter = (event, selectedDatacenterOption, reason) => {
    let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers));
    identifiersCopy.datacenterID = (selectedDatacenterOption ? selectedDatacenterOption.value : '')
    this.setState({
      selectedDatacenterOption,
      identifiers: identifiersCopy,
    })
  };

  // handleChangeRack = (event, selectedRackOption) => {
  //   let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
  //   identifiersCopy.rackID = (selectedRackOption ? selectedRackOption.value : '')
  //   this.setState({
  //     selectedRackOption,
  //     identifiers: identifiersCopy,
  //   })
  // };

  handleChangeOwner = (event, selectedOwnerOption) => {
    let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
    identifiersCopy.ownerID = (selectedOwnerOption ? selectedOwnerOption.value : '')
    this.setState({
      selectedOwnerOption,
      identifiers: identifiersCopy,
    })
  };

  handleChangeChassis = (event, selectedChassisOption) => {
    let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
    identifiersCopy.location = (selectedChassisOption ? selectedChassisOption.value : '')
    this.setState({
      selectedChassisOption,
      identifiers: identifiersCopy,
    })
  };



  createQuery = () => {
    const { datacenterID, modelID, modelNumber, modelVendor, hostname, rackID, rack_u, slot_number, location, ownerID, rackStart, rackEnd } = this.state.identifiers;
    let q;
    if(!this.context.is_offline){
      q = '' +
      'datacenter=' + datacenterID + '&' +
      'model=' + modelID + '&' +
      'model_number=' + modelNumber + '&' +
      'vendor=' + modelVendor + '&' +
      'hostname=' + hostname + '&' +
      'rack=' + rackID + '&' +
      'rack_u=' + rack_u + '&' +
      'location=' + location + '&' +
      'slot_number=' + slot_number + '&' +
      'owner=' + ownerID + '&' +
      'rack_num_start=' + rackStart + '&' +
      'rack_num_end=' + rackEnd;
    }
    else{
      q = '' +
      'datacenter=' + datacenterID + '&' +
      'model=' + modelID + '&' +
      'model_number=' + modelNumber + '&' +
      'vendor=' + modelVendor + '&' +
      'hostname=' + hostname + '&' +
      'owner=' + ownerID;
    }
     
    this.setState({ query: q });
    return q;
  }

  handleClear = (e) => {
    let identifiersEmpty = {
      identifiers: {
        datacenterID: '',
        modelID: '',
        modelNumber: '',
        modelVendor: '',
        hostname: '',
        rackID: '',
        rack_u: '',
        ownerID: '',
        rackStart: '',
        rackEnd: '',
      },
    }
    this.setState({
      selectedModelOption: null,
      //selectedRackOption: null,
      selectedOwnerOption: null,
      selectedDatacenterOption: null,
      selectedChassisOption: null,
      identifiers: identifiersEmpty,
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();

    let stateCopy = Object.assign({}, this.state.identifiers);
    let stateToSend = this.removeEmpty(stateCopy);

    console.log(stateToSend)
    console.log(this.createQuery())

    this.props.sendFilterQuery(this.createQuery());
  }

  render() {

    let rack_range_start = 
    <Grid item xs={3}>
      <TextField label='Rack Range Start' type="text" fullWidth
        onChange={e => {
          let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
          identifiersCopy.rackStart = e.target.value
          this.setState({
            identifiers: identifiersCopy
          })
        }} />
    </Grid>;

    let rack_range_end = 
    <Grid item xs={3}>
      <TextField label='Rack Range End' type="text" fullWidth
        onChange={e => {
          let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
          identifiersCopy.rackEnd = e.target.value
          this.setState({
            identifiers: identifiersCopy
          })
        }} />
    </Grid>;

    let rack_u =
      <Grid item xs={3}>
      <TextField label='Rack U' type="number" fullWidth
        onChange={e => {
          let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
          identifiersCopy.rack_u = e.target.value
          this.setState({
            identifiers: identifiersCopy
          })
        }} />
    </Grid>;

    return (
      <div style={{ padding: 10 }}>
        <Container maxWidth="xl">
          <form onSubmit={this.handleSubmit}>
            <h4>Filters</h4>
            <Grid container spacing={1}>
              <Grid item xs={3}>
                <Autocomplete
                  autoComplete
                  autoHighlight
                  id="instance-create-model-select"
                  options={this.state.modelOptions}
                  getOptionLabel={option => option.label}
                  onChange={this.handleChangeModel}
                  value={this.state.selectedModelOption}
                  renderInput={params => (
                    <TextField {...params} label="Model" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField label='Model Vendor' type="text" fullWidth
                  onChange={e => {
                    let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
                    identifiersCopy.modelVendor = e.target.value
                    this.setState({
                      identifiers: identifiersCopy
                    })
                  }} />
              </Grid>
              <Grid item xs={3}>
                <TextField label='Model Number' type="text" fullWidth
                  onChange={e => {
                    let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
                    identifiersCopy.modelNumber = e.target.value
                    this.setState({
                      identifiers: identifiersCopy
                    })
                  }} />
              </Grid>
              <Grid item xs={3}>
                <TextField label='Hostname' type="text" fullWidth
                  onChange={e => {
                    let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
                    identifiersCopy.hostname = e.target.value
                    this.setState({
                      identifiers: identifiersCopy
                    })
                  }} />
              </Grid>

              <Grid item xs={3}>
                <TextField label='Rack Range Start' type="text" fullWidth
                  onChange={e => {
                    let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
                    identifiersCopy.rackStart = e.target.value
                    this.setState({
                      identifiers: identifiersCopy
                    })
                  }} />
              </Grid>
              {/*<Grid item xs={3}>*/}
              {/*  <Autocomplete*/}
              {/*    autoComplete*/}
              {/*    autoHighlight*/}
              {/*    id="instance-create-rack-select"*/}
              {/*    options={this.state.rackOptions}*/}
              {/*    getOptionLabel={option => option.label}*/}
              {/*    onChange={ this.handleChangeRack }*/}
              {/*    value={this.state.selectedRackOption}*/}
              {/*    renderInput={params => (*/}
              {/*      <TextField {...params} label="Rack" fullWidth/>*/}
              {/*    )}*/}
              {/*  />*/}
              {/*</Grid>*/}

            { !this.context.is_offline ? (rack_range_start ) : <p></p>}
            { !this.context.is_offline ? ( rack_range_end ) : <p></p> }
            { !this.context.is_offline ? ( rack_u ) : <p></p> }
              
              <Grid item xs={3}>
                <Autocomplete
                  id="instance-owner-select"
                  autoComplete
                  autoHighlight
                  options={this.state.ownerOptions}
                  getOptionLabel={option => option.label}
                  onChange={this.handleChangeOwner}
                  value={this.state.selectedOwnerOption}
                  renderInput={params => (
                    <TextField {...params} label="Owner" fullWidth />
                  )}
                />
              </Grid>

              {/* new shit */}
              <Grid item xs={3}>
                <Autocomplete
                  id="instance-location-select"
                  autoComplete
                  autoHighlight
                  //disabled={true}
                  options={this.state.chassisOptions}
                  getOptionLabel={option => option.label}
                  onChange={this.handleChangeChassis}
                  value={this.state.selectedChassisOption}
                  renderInput={params => (
                    <TextField {...params} label="Location" fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={3}>
                <TextField label='Slot Number' type="number" fullWidth
                  onChange={e => {
                    let identifiersCopy = JSON.parse(JSON.stringify(this.state.identifiers))
                    identifiersCopy.slot_number = e.target.value
                    this.setState({
                      identifiers: identifiersCopy
                    })
                  }} />
              </Grid>
              {/* ^^ fix */}


              <Grid item xs={2}>
                <Button variant="contained" type="submit" color="primary" onClick={() => this.handleSubmit}>Apply
                  Filters</Button>
              </Grid>
              {/*<Grid item xs={2}>*/}
              {/*  <Button variant="outlined" type="submit" color="primary" onClick={ () => this.handleClear }>Clear Filters</Button>*/}
              {/*</Grid>*/}
            </Grid>
          </form>
        </Container>
      </div>

    )
  }
}

InstanceFilters.contextType = DatacenterContext;

export default InstanceFilters
