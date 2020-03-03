import React, { Component } from 'react'
import axios from 'axios'
import {
  Button, Container, TextField,
  Grid, Input, FormControl, Typography,
  Tooltip, Paper, List,
  ListItem, ListItemText, Divider
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Link, Redirect } from "react-router-dom";
import NetworkPortConnectionDialog from './NetworkPortConnectionDialog';
import PowerPortConnectionDialog from './PowerPortConnectionDialog';

axios.defaults.xsrfHeaderName = "X-CSRFToken";

export class EditInstanceForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      asset: {
        model: null,
        hostname: null,
        datacenter: null,
        rack: null,
        rack_u: null,
        owner: null,
        comment: null,
        asset_number: null,
        network_ports: [],
        power_ports: [],
      },
      modelOptions: [],
      selectedModelOption: null,

      datacenterOptions: [],
      selectedDatacenterOption: null,

      rackOptions: [],
      selectedRackOption: null,

      ownerOptions: [],
      selectedOwnerOption: null,

      //NP stuff
      numberOfNetworkPortsForCurrentAsset: null,
      networkPortNamesForCurrentAsset: [],
      macAddresses: [],
      networkPortConnectionIDs: [],

      connectedNPs: [],

      //PP stuff
      numberOfPowerPorts: null,
      leftFreePDUSlots: [],
      rightFreePDUSlots: [],
      defaultPPConfigurations: [],
      leftPPName: null,
      rightPPName: null,
      ppConnections: [],

      redirect: false,
      //ppIDs: [],
    }
  }

  // loadPowerPortIDs = () => {
  //   let PPs = this.state.asset.power_ports
  //   let tmpIDs = []
  //   for (let i = 0; i < this.state.numberOfPowerPorts; i++) {
  //     tmpIDs[i] = PPs[i].id;
  //   }
  //   console.log(tmpIDs)
  //   this.setState({
  //     ppIDs: tmpIDs
  //   })
  // }

  getPowerPortConnectionInfo = (ppArray) => {
    let a = ppArray;

    // add id to each PP for PUT
    for (let i = 0; i < a.length; i++) {
      console.log(a[i])
      if (Object.entries(a[i]).length > 0 && a[i].constructor === Object) {
        if (! a[i]) {
          let obj = {}
          obj.id = this.state.asset.power_ports[i].id
          a.push(obj)
        }
        else {
          a[i].id = this.state.asset.power_ports[i].id
        }
      }
      console.log(a[i])
    }

    this.setState({ ppConnections: a });
  }

  loadNumberOfPowerPortsForModel = () => {
    const dst = '/api/models/' + this.state.selectedModelOption.id + '/';
    axios.get(dst).then(res => {
      this.setState({ numberOfPowerPorts: res.data.power_ports });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Could not load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  loadLeftAndRightPDUNames = () => {
    const dst = '/api/racks/' + this.state.selectedRackOption.id + '/';
    console.log(dst)
    axios.get(dst).then(res => {
      this.setState({ leftPPName: res.data.pdu_l.name });
      this.setState({ rightPPName: res.data.pdu_r.name });
    })
      .catch(function (error) {
        // TODO: handle error
        console.log(error.response)
        //alert('Could not load model names. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  loadFreePDUsAndSetDefaultConfigurations = () => {
    const dst = '/api/racks/' + this.state.selectedRackOption.id + '/get_open_pdu_slots/';
    console.log(dst)
    axios.get(dst).then(res => {
      this.setState({ leftFreePDUSlots: res.data.pdu_slots.left });
      this.setState({ rightFreePDUSlots: res.data.pdu_slots.right });
    })
      .catch(function (error) {
        // TODO: handle error
        console.log(error.response)
        //alert('Could not load model names. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });

    // console.log(this.state.leftFreePDUSlots)
    // console.log(this.state.rightFreePDUSlots)
  }

  removeEmpty = (obj) => {
    Object.keys(obj).forEach((k) => (!obj[k] && obj[k] !== undefined) && delete obj[k]);
    return obj;
  };

  removeEmptyRecursive = (obj) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && this.removeEmptyRecursive(obj[k]) ||
      (!obj[k] && obj[k] !== undefined) && delete obj[k]
    );
    return obj;
  };

  loadNetworkPortInfoForCurrentlySelectedModel = () => {
    let modelURL = this.state.selectedModelOption.value
    axios.get(modelURL).then(res => {
      this.setState({
        numberOfNetworkPortsForCurrentAsset: res.data.network_ports_num,
        networkPortNamesForCurrentAsset: res.data.network_ports,
      });
    })
      .catch(function (error) {
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  getNetworkPortConnectionID = (index, npID) => {
    let a = this.state.networkPortConnectionIDs.slice(); //creates the clone of the state
    a[index] = npID;
    this.setState({ networkPortConnectionIDs: a });
  }

  componentDidMount() {
    const delay = 50;
    this.loadInstance();
    //console.log(this.state.instance)
    setTimeout(() => {
      this.loadModels();
      this.loadDatacenters();
      //this.loadRacks();
      this.loadOwners();
      this.loadInstance();
    }, delay);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedModelOption !== this.state.selectedModelOption) {
      if (this.state.selectedModelOption.value) {
        this.loadNetworkPortInfoForCurrentlySelectedModel();
        this.loadNumberOfPowerPortsForModel();
      }
      else {
        this.setState({ networkPortNamesForCurrentAsset: [], numberOfNetworkPortsForCurrentAsset: null });
      }
    }

    if (prevState.selectedDatacenterOption !== this.state.selectedDatacenterOption) {
      if (this.state.selectedDatacenterOption.value) {
        this.loadRacks();
      }
      else {
        this.setState({ rackOptions: [], selectedRackOption: null });
      }
    }

    if (this.state.selectedRackOption !== prevState.selectedRackOption) {
      if (this.state.selectedRackOption.id) {
        this.loadLeftAndRightPDUNames();
        this.loadFreePDUsAndSetDefaultConfigurations();
        //this.loadPowerPortIDs();
      }
    }

    if (prevState.numberOfNetworkPortsForCurrentAsset !== this.state.numberOfNetworkPortsForCurrentAsset) {
      this.loadMACAddresses();
      this.loadConnectedNPs();
    }
  }

  loadInstance = () => {
    let dst = '/api/assets/'.concat(this.props.match.params.id).concat('/');
    axios.get(dst).then(res => {
      let instanceCopy = JSON.parse(JSON.stringify(this.state.asset));
      instanceCopy.model = res.data.model;
      instanceCopy.hostname = res.data.hostname;
      instanceCopy.datacenter = res.data.datacenter;
      instanceCopy.rack = res.data.rack;
      instanceCopy.rack_u = res.data.rack_u;
      instanceCopy.owner = res.data.owner;
      instanceCopy.comment = res.data.comment;
      instanceCopy.asset_number = res.data.asset_number;
      instanceCopy.network_ports = res.data.network_ports;
      instanceCopy.power_ports = res.data.power_ports;
      this.setState({
        asset: instanceCopy,
      })
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  loadMACAddresses = () => {
    let tmpMAC = []
    let NPs = this.state.asset.network_ports
    for (let i = 0; i < this.state.numberOfNetworkPortsForCurrentAsset; i++) {
      tmpMAC.push(NPs[i].mac)
    }
    this.setState({
      macAddresses: tmpMAC,
    })
  }

  loadConnectedNPs = () => {
    let NPs = this.state.asset.network_ports
    let tmpNPConnects = []
    for (let i = 0; i < this.state.numberOfNetworkPortsForCurrentAsset; i++) {
      if (NPs[i].connection) {
        tmpNPConnects[i] = {}
        tmpNPConnects[i].connectedPortID = NPs[i].connection.id;
        tmpNPConnects[i].connectedPortName = NPs[i].connection.name;
        tmpNPConnects[i].connectedAssetHostname = NPs[i].connection.asset.hostname;
      }
      else {
        tmpNPConnects[i] = {}
        tmpNPConnects[i].connectedPortID = null
        tmpNPConnects[i].connectedPortName = null
        tmpNPConnects[i].connectedAssetHostname = null
      }
    }
    console.log(tmpNPConnects)
    this.setState({
      connectedNPs: tmpNPConnects
    })
  }

  loadModels = () => {
    // MODEL
    let dst = '/api/assets/model_names/';
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        myOptions.push({ value: res.data[i].url, label: res.data[i].vendor + ' ' + res.data[i].model_number, id: res.data[i].id });
      }
      this.setState({
        modelOptions: myOptions,
        selectedModelOption: {
          value: this.state.asset.model.url,
          label: this.state.asset.model.vendor + ' ' + this.state.asset.model.model_number,
          id: this.state.asset.model.id,
        }
      });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  loadRacks = () => {
    // RACK
    console.log(this.state.selectedDatacenterOption)
    const dst = '/api/datacenters/' + this.state.selectedDatacenterOption.id + '/racks/?show_all=true';
    console.log(dst)
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        myOptions.push({ value: res.data[i].url, label: res.data[i].rack_number, id: res.data[i].id });
      }
      this.setState({
        rackOptions: myOptions,
        selectedRackOption: { value: this.state.asset.rack.url, label: this.state.asset.rack.rack_number, id: this.state.asset.rack.id },
      });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  loadOwners = () => {
    // OWNER
    let dst = '/api/users/?show_all=true';
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        myOptions.push({ value: res.data[i].url, label: res.data[i].username });
      }
      this.setState({
        ownerOptions: myOptions,
        selectedOwnerOption: {
          value: this.state.asset.owner ? this.state.asset.owner.url : null,
          label: this.state.asset.owner ? this.state.asset.owner.username : null
        },
      });
    })
      .catch(function (error) {
        // TODO: handle error
        //alert('Cannot load. Re-login.\n' + JSON.stringify(error.response, null, 2));
      });
  }

  loadDatacenters = () => {
    const dst = '/api/datacenters/?show_all=true';
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        //TODO: change value to URL
        myOptions.push({ value: res.data[i].url, label: res.data[i].abbreviation, id: res.data[i].id });
      }
      this.setState({
        datacenterOptions: myOptions,
        selectedDatacenterOption: {
          value: this.state.asset.datacenter ? this.state.asset.datacenter.url : null,
          label: this.state.asset.datacenter ? this.state.asset.datacenter.abbreviation : null,
          id: this.state.asset.datacenter ? this.state.asset.datacenter.id : null,
        }
      });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Could not load owners. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  handleChangeModel = (event, selectedModelOption) => {
    this.setState({ selectedModelOption });
    console.log(this.state.asset)
  };

  handleChangeRack = (event, selectedRackOption) => {
    this.setState({ selectedRackOption });
  };

  handleChangeOwner = (event, selectedOwnerOption) => {
    this.setState({ selectedOwnerOption });
  };

  handleChangeDatacenter = (event, selectedDatacenterOption) => {
    this.setState({ selectedDatacenterOption });
    console.log(selectedDatacenterOption)
  }

  handleSubmit = (e) => {
    e.preventDefault();

    let networkPortsBuilder = [];
    for (let i = 0; i < this.state.numberOfNetworkPortsForCurrentAsset; i++) {
      let obj = {}
      let connectionObj = {}

      connectionObj.network_port_id = this.state.networkPortConnectionIDs[i];
      obj.mac = this.state.macAddresses[i];
      obj.name = this.state.networkPortNamesForCurrentAsset[i];

      if (Object.entries(connectionObj).length > 0 && connectionObj.constructor === Object) {
        obj.connection = connectionObj;
      }

      console.log(obj)
      networkPortsBuilder.push(this.removeEmptyRecursive(obj))
    }

    let tmpPP = []
    for (let i = 0; i < this.state.ppConnections.length; i++) {
      let currentObj = this.removeEmptyRecursive(this.state.ppConnections[i]);
      //console.log(this.state.ppIDs)
      //currentObj.id = this.state.ppIDs[i]
      //console.log(currentObj)
      if (Object.entries(currentObj).length > 0 && currentObj.constructor === Object) {
        tmpPP.push(currentObj)
      }
    }

    let dst = '/api/assets/'.concat(this.props.match.params.id).concat('/');
    let stateCopy = Object.assign({}, this.state.asset);

    stateCopy.model = this.state.selectedModelOption ? this.state.selectedModelOption.value : null;
    stateCopy.rack = this.state.selectedRackOption ? this.state.selectedRackOption.value : null;
    stateCopy.owner = this.state.selectedOwnerOption ? this.state.selectedOwnerOption.value : null;
    stateCopy.datacenter = this.state.selectedDatacenterOption ? this.state.selectedDatacenterOption.value : null;
    stateCopy.network_ports = networkPortsBuilder
    stateCopy.power_ports = tmpPP

    let stateToSend = this.removeEmpty(stateCopy);
    console.log(JSON.stringify(stateToSend, null, 2))
    var self = this;

    axios.put(dst, stateToSend)
      .then(function (response) {
        alert('Edit was successful');
        // window.location = '/assets'
        self.setState({
          redirect: true,
        });
      })
      .catch(function (error) {
        alert('Edit was not successful.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  openNetworkPortConfigAndMAC = () => {
    let fieldList = [];
    for (let i = 0; i < this.state.numberOfNetworkPortsForCurrentAsset; i++) {
      const num = i + 1;
      //const fieldLabel = 'Network Port ' + num;
      fieldList.push(
        <ListItem>
          <Grid item alignContent='center' xs={8}>
            <ListItemText primary={this.state.networkPortNamesForCurrentAsset[i]} />
            <TextField label='MAC Address'
              fullwidth
              type="text"
              // set its value
              InputLabelProps={{ shrink: true }}
              value={this.state.macAddresses[i]}
              onChange={e => {
                let a = this.state.macAddresses.slice(); //creates the clone of the state
                a[i] = e.target.value;
                this.setState({ macAddresses: a });
              }} />
          </Grid>

          <Grid item alignContent='center' xs={4}>
            <NetworkPortConnectionDialog
              indexOfThisNPConfig={i}
              connectedPortID={this.state.connectedNPs[i] ? this.state.connectedNPs[i].connectedPortID : null}
              connectedPortName={this.state.connectedNPs[i] ? this.state.connectedNPs[i].connectedPortName : null}
              connectedAssetHostname={this.state.connectedNPs[i] ? this.state.connectedNPs[i].connectedAssetHostname : null}
              sendNetworkPortConnectionID={this.getNetworkPortConnectionID} />
          </Grid>
        </ListItem>
      )
      fieldList.push(
        <Divider />
      )
    }
    return fieldList;
  }

  render() {
    return (
      <div>
        {this.state.redirect && <Redirect to={{pathname: '/assets'}} />}
        <Container maxwidth="xl">
          <Grid container className='themed-container' spacing={2}>
            <Grid item alignContent='center' xs={12} />
            <form onSubmit={this.handleSubmit}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="h3" gutterBottom>
                    Edit Asset
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    autoComplete
                    autoHighlight
                    autoSelect
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
                <Grid item xs={6}>
                  <TextField label='Hostname' type="text" fullWidth
                    value={this.state.asset.hostname}
                    InputLabelProps={{ shrink: true }}
                    onChange={e => {
                      let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
                      instanceCopy.hostname = e.target.value
                      this.setState({
                        asset: instanceCopy
                      })
                    }} />
                </Grid>

                <Grid item xs={6}>
                  <Autocomplete
                    autoComplete
                    autoHighlight
                    autoSelect
                    id="datacenter-select"
                    options={this.state.datacenterOptions}
                    getOptionLabel={option => option.label}
                    onChange={this.handleChangeDatacenter}
                    value={this.state.selectedDatacenterOption}
                    renderInput={params => (
                      <TextField {...params} label="Datacenter" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField label='Asset Number' type="text" fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={this.state.asset.asset_number}
                    onChange={e => {
                      let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
                      instanceCopy.asset_number = e.target.value
                      this.setState({
                        asset: instanceCopy
                      })
                    }} />
                </Grid>



                <Grid item xs={6}>
                  <Autocomplete
                    autoComplete
                    autoHighlight
                    autoSelect
                    id="instance-create-rack-select"
                    options={this.state.rackOptions}
                    getOptionLabel={option => option.label}
                    onChange={this.handleChangeRack}
                    value={this.state.selectedRackOption}
                    disabled={this.state.selectedDatacenterOption === null}
                    renderInput={params => (
                      <TextField {...params} label="Rack" fullWidth />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  < TextField label="Rack U"
                    fullWidth
                    type="number"
                    value={this.state.asset.rack_u}
                    InputLabelProps={{ shrink: true }}
                    onChange={e => {
                      let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
                      instanceCopy.rack_u = e.target.value
                      this.setState({
                        asset: instanceCopy
                      })
                    }} />
                </Grid>

                <Grid item xs={6}>
                  <Paper>
                    <Typography variant="h6" gutterBottom>
                      Network Ports
                    </Typography>
                    <List style={{ maxHeight: 200, overflow: 'auto' }}>
                      {this.openNetworkPortConfigAndMAC()}
                    </List>
                  </Paper>

                </Grid>

                <Grid item xs={6}>
                  <Paper>
                    <Typography variant="h6" gutterBottom>
                      Power Ports
                    </Typography>
                    <PowerPortConnectionDialog
                      sendPowerPortConnectionInfo={this.getPowerPortConnectionInfo}
                      numberOfPowerPorts={this.state.numberOfPowerPorts}
                      rackID={this.state.selectedRackOption ? this.state.selectedRackOption.id : null}
                      leftPPName={this.state.leftPPName}
                      rightPPName={this.state.rightPPName}
                      leftFree={this.state.leftFreePDUSlots}
                      rightFree={this.state.rightFreePDUSlots}
                      isDisabled={this.state.selectedRackOption === null || this.state.selectedModelOption === null}
                      currentPowerPortConfiguration={this.state.asset ? this.state.asset.power_ports : null}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={6}>
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
                <Grid item xs={6}>
                  <TextField label="Comment"
                    fullWidth
                    multiline
                    rows="4"
                    type="text"
                    value={this.state.asset.comment}
                    onChange={e => {
                      let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
                      instanceCopy.comment = e.target.value
                      this.setState({
                        asset: instanceCopy
                      })
                    }} />
                </Grid>
                <Grid item xs={2}>
                  <Tooltip title='Submit'>
                    <Button variant="contained" type="submit" color="primary" endIcon={<AddCircleIcon />}
                      onClick={() => this.handleSubmit}>Update
                    </Button>
                  </Tooltip>
                </Grid>
                <Grid item xs={2}>
                  <Link to={'/assets'}>
                    <Tooltip title='Cancel'>
                      <Button variant="outlined" type="submit" color="primary" endIcon={<CancelIcon />}>Cancel</Button>
                    </Tooltip>
                  </Link>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Container>
      </div>
    )
  }
}

export default EditInstanceForm
