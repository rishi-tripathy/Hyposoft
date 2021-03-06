import React, { Component } from 'react'
import axios from 'axios'
import {
  Button, Container, TextField,
  Grid, Input, FormControl, Typography,
  Tooltip, Paper, List,
  ListItem, ListItemText, Divider, Table, TableBody, TableCell, TableContainer, TableRow, Toolbar,
} from "@material-ui/core";
import ToggleButton from '@material-ui/lab/ToggleButton';
import CheckIcon from '@material-ui/icons/Check'
import { Autocomplete } from "@material-ui/lab";
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Link, Redirect } from "react-router-dom";
import NetworkPortConnectionDialog from './NetworkPortConnectionDialog';
import PowerPortConnectionDialog from './PowerPortConnectionDialog';
import DatacenterContext from './DatacenterContext';
import { jsonToHumanText } from './Helpers'

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
        ovr_color: null,
        ovr_storage: null,
        ovr_memory: null,
        ovr_cpu: null,
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

      locationOptions: [],
      selectedLocationOption: null,

      currentMountType: '',

      slotNumberOptions: [],
      selectedSlotNumberOption: null,
      is_offline: false,


      selectedDisplayColor: null,
      selectedCPU: null,
      selectedMemory: null,
      selectedStorage: null,

      memoryChecked: false,
      displayColorChecked: false,
      storageChecked: false,
      cpuChecked: false,

      revert: false,
    }
  }

  loadCurrentModelMountType = () => {
    const dst = '/api/models/' + this.state.selectedModelOption.id + '/';
    axios.get(dst).then(res => {
      this.setState({ currentMountType: res.data.mount_type });
    })
      .catch(function (error) {
        alert('Could not load model. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
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
        if (!a[i]) {
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
    const delay = 80;
    this.loadInstance();
    //console.log(this.state.instance)
    setTimeout(() => {
      this.loadModels();
      //this.loadDatacenters();
      //this.loadRacks();
      this.loadOwners();
      this.loadInstance();
      // this.loadRevert();
    }, delay);
  }

  // loadRevert = () => {
  //   if(this.state.asset.ovr_color || this.state.ovr_cpu || this.state.ovr_memory || this.state.ovr_storage){
  //     this.setState({
  //       revert: true,
  //     })
  //   }
  // }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedModelOption !== this.state.selectedModelOption) {
      if (this.state.selectedModelOption) {
        this.loadNetworkPortInfoForCurrentlySelectedModel();
        this.loadNumberOfPowerPortsForModel();
        this.loadCurrentModelMountType();
        setTimeout(() => {
          this.loadChangeableModelFields();
        }, 50);
      }
      else {
        this.setState({ networkPortNamesForCurrentAsset: [], numberOfNetworkPortsForCurrentAsset: null });
      }
    }

    if (prevState.selectedDatacenterOption !== this.state.selectedDatacenterOption) {
      if (this.state.selectedDatacenterOption) {
        console.log(this.state.selectedDatacenterOption)
        if (this.state.selectedDatacenterOption.is_offline) {
          this.setState({
            is_offline: true,
          })
          this.loadLocations();
        }
        else {
          this.setState({
            is_offline: false,
          })
          this.loadRacks();
          this.loadLocations();
        }
      }
      else {
        this.setState({ rackOptions: [], selectedRackOption: null });
        this.setState({ locationOptions: [], selectedLocationOption: null });
      }
    }

    if (this.state.selectedRackOption !== prevState.selectedRackOption) {
      if (this.state.selectedRackOption) {
        this.loadLeftAndRightPDUNames();
        this.loadFreePDUsAndSetDefaultConfigurations();
        //this.loadPowerPortIDs();
      }
    }

    if (prevState.numberOfNetworkPortsForCurrentAsset !== this.state.numberOfNetworkPortsForCurrentAsset) {
      this.loadMACAddresses();
      this.loadConnectedNPs();
    }

    if (this.state.selectedLocationOption !== prevState.selectedLocationOption) {
      if (this.state.selectedLocationOption) {
        if (this.state.selectedLocationOption.id) {
          this.loadSlotNumbers();
        }
      }
    }
  }

  loadChangeableModelFields = () => {
    let modelURL = this.state.selectedModelOption.value
    console.log(modelURL)
    axios.get(modelURL).then(res => {
      // console.log(res.data)
      let instanceCopy = JSON.parse(JSON.stringify(this.state.asset));
      if (!this.state.asset.ovr_color) {
        instanceCopy.ovr_color = res.data.display_color;
      }
      this.setState({
        asset: instanceCopy,
        selectedDisplayColor: res.data.display_color,
        selectedCPU: res.data.cpu,
        selectedMemory: res.data.memory,
        selectedStorage: res.data.storage,
      });
    })
      .catch(function (error) {
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }


  loadInstance = () => {

    console.log(this.props)

    if (this.props.location.state != null && this.props.location.state.isBlade) {
      //blade
      let dst = '/api/blades/'.concat(this.props.match.params.id).concat('/');
      console.log(dst)
      axios.get(dst).then(res => {
        let instanceCopy = JSON.parse(JSON.stringify(this.state.asset));
        instanceCopy.model = res.data.model;
        instanceCopy.hostname = res.data.hostname;
        instanceCopy.datacenter = res.data.datacenter;
        instanceCopy.location = res.data.location;
        instanceCopy.slot_number = res.data.slot_number;
        instanceCopy.asset_number = res.data.asset_number;
        instanceCopy.ovr_color = res.data.ovr_color;
        instanceCopy.ovr_storage = res.data.ovr_storage;
        instanceCopy.ovr_cpu = res.data.ovr_cpu;
        instanceCopy.ovr_memory = res.data.ovr_memory;

        let color = false;
        let cpu = false;
        let mem = false;
        let str = false;

        if (instanceCopy.ovr_color !== this.state.selectedDisplayColor) {
          color = true;
        }
        if (instanceCopy.ovr_cpu) {
          cpu = true;
        }
        if (instanceCopy.ovr_memory) {
          mem = true;
        }
        if (instanceCopy.ovr_storage) {
          str = true;
        }

        this.setState({
          asset: instanceCopy,
          selectedDatacenterOption: res.data.datacenter ? res.data.datacenter : res.data.location.datacenter,
          displayColorChecked: color,
          cpuChecked: cpu,
          memoryChecked: mem,
          storageChecked: str,
        })
      })
        .catch(function (error) {
          // TODO: handle error
          alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
        });
    }
    //TODO: add blade offline 
    else if (this.context.is_offline) {
      let dst = '/api/all_assets/'.concat(this.props.match.params.id).concat('/');
      console.log(dst)

      axios.get(dst).then(res => {
        let instanceCopy = JSON.parse(JSON.stringify(this.state.asset));
        console.log(res.data)
        instanceCopy.model = res.data.asset.model;
        instanceCopy.hostname = res.data.asset.hostname;
        instanceCopy.datacenter = res.data.asset.datacenter;
        instanceCopy.owner = res.data.asset.owner;
        instanceCopy.comment = res.data.asset.comment;
        instanceCopy.asset_number = res.data.asset.asset_number;
        instanceCopy.ovr_color = res.data.asset.ovr_color;
        instanceCopy.ovr_storage = res.data.asset.ovr_storage;
        instanceCopy.ovr_cpu = res.data.asset.ovr_cpu;
        instanceCopy.ovr_memory = res.data.asset.ovr_memory;

        let color = false;
        let cpu = false;
        let mem = false;
        let str = false;

        if (instanceCopy.ovr_color) {
          color = true;
        }
        if (instanceCopy.ovr_cpu) {
          cpu = true;
        }
        if (instanceCopy.ovr_memory) {
          mem = true;
        }
        if (instanceCopy.ovr_storage) {
          str = true;
        }

        this.setState({
          asset: instanceCopy,
          selectedDatacenterOption: res.data.asset.datacenter,
          displayColorChecked: color,
          cpuChecked: cpu,
          memoryChecked: mem,
          storageChecked: str,
        })
      })
        .catch(function (error) {
          // TODO: handle error
          alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
        });
    }
    else {
      let dst = '/api/all_assets/'.concat(this.props.match.params.id).concat('/');
      console.log(dst)
      axios.get(dst).then(res => {
        let instanceCopy = JSON.parse(JSON.stringify(this.state.asset));
        console.log(res.data.asset)
        instanceCopy.model = res.data.asset.model;
        instanceCopy.hostname = res.data.asset.hostname;
        instanceCopy.datacenter = res.data.asset.datacenter;
        instanceCopy.rack = res.data.asset.rack;
        instanceCopy.rack_u = res.data.asset.rack_u;
        instanceCopy.owner = res.data.asset.owner;
        instanceCopy.comment = res.data.asset.comment;
        instanceCopy.asset_number = res.data.asset.asset_number;
        // instanceCopy.network_ports = res.data.asset.network_ports;
        // instanceCopy.power_ports = res.data.asset.power_ports;
        instanceCopy.ovr_color = res.data.asset.ovr_color;
        instanceCopy.ovr_storage = res.data.asset.ovr_storage;
        instanceCopy.ovr_cpu = res.data.asset.ovr_cpu;
        instanceCopy.ovr_memory = res.data.asset.ovr_memory;


        let color = false;
        let cpu = false;
        let mem = false;
        let str = false;

        if (instanceCopy.ovr_color) {
          color = true;
        }
        if (instanceCopy.ovr_cpu) {
          cpu = true;
        }
        if (instanceCopy.ovr_memory) {
          mem = true;
        }
        if (instanceCopy.ovr_storage) {
          str = true;
        }

        this.setState({
          asset: instanceCopy,
          selectedDatacenterOption: res.data.asset.datacenter,
          displayColorChecked: color,
          cpuChecked: cpu,
          memoryChecked: mem,
          storageChecked: str,
        })
      })
        .catch(function (error) {
          // TODO: handle error
          alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
        });
    }
  }

  loadMACAddresses = () => {
    let tmpMAC = []
    let NPs = this.state.asset.network_ports
    for (let i = 0; i < this.state.numberOfNetworkPortsForCurrentAsset; i++) {
      if (NPs && NPs[i]) {
        tmpMAC.push(NPs[i].mac)
      }
    }
    this.setState({
      macAddresses: tmpMAC,
    })
  }

  loadConnectedNPs = () => {
    let NPs = this.state.asset.network_ports
    let tmpNPConnects = []
    for (let i = 0; i < this.state.numberOfNetworkPortsForCurrentAsset; i++) {
      if (NPs && NPs[i]) {
        if (NPs[i].connection) {
          tmpNPConnects[i] = {}
          tmpNPConnects[i].connectedPortID = NPs[i].connection.id;
          tmpNPConnects[i].connectedPortName = NPs[i].connection.name;
          tmpNPConnects[i].connectedAssetHostname = NPs[i].connection.asset.hostname;
        }
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

  loadLocations = () => {
    // locations are all chassis assets in a given DC
    console.log(this.state.selectedDatacenterOption)
    const dst = '/api/datacenters/' + this.state.selectedDatacenterOption.id + '/chassis/';
    console.log(dst)
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        myOptions.push({ value: res.data[i].id, label: res.data[i].hostname + ' ' + res.data[i].asset_number, id: res.data[i].id });
      }
      this.setState({
        locationOptions: myOptions,
        selectedLocationOption: {
          value: this.state.asset.location ? this.state.asset.location.id : null,
          label: this.state.asset.location ? this.state.asset.location.hostname + ' ' + this.state.asset.location.asset_number : null,
          id: this.state.asset.location ? this.state.asset.location.id : null,
        }
      });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Could not load racks. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  // loadDatacenters = () => {
  //   const dst = '/api/datacenters/?show_all=true';
  //   axios.get(dst).then(res => {
  //     let myOptions = [];
  //     for (let i = 0; i < res.data.length; i++) {
  //       //TODO: change value to URL
  //       myOptions.push({ value: res.data[i].url, label: res.data[i].abbreviation, id: res.data[i].id });
  //     }
  //     this.setState({
  //       datacenterOptions: myOptions,
  //       selectedDatacenterOption: {
  //         value: this.state.asset.datacenter ? this.state.asset.datacenter.url : null,
  //         label: this.state.asset.datacenter ? this.state.asset.datacenter.abbreviation : null,
  //         id: this.state.asset.datacenter ? this.state.asset.datacenter.id : null,
  //       }
  //     });
  //   })
  //     .catch(function (error) {
  //       // TODO: handle error
  //       alert('Could not load owners. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
  //     });
  // }

  loadSlotNumbers = () => {
    // load array of free slot numbers
    console.log(this.state.selectedLocationOption)
    const dst = '/api/assets/' + this.state.selectedLocationOption.id + '/chassis_slots/';
    console.log(dst)
    axios.get(dst).then(res => {
      let myOptions = [];
      for (let i = 0; i < res.data.length; i++) {
        myOptions.push({ value: res.data[i], label: res.data[i].toString(), });
      }
      this.setState({ slotNumberOptions: myOptions });
      this.setState({
        selectedSlotNumberOption: {
          value: this.state.asset.slot_number ? this.state.asset.slot_number : null,
          label: this.state.asset.slot_number ? this.state.asset.slot_number.toString() : null,
        }
      })
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Could not load racks. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  handleChangeModel = (event, selectedModelOption) => {
    this.setState({ selectedModelOption });
    console.log(this.state.asset)
  };

  handleChangeRack = (event, selectedRackOption) => {
    this.setState({ selectedRackOption });
  };

  handleChangeLocation = (event, selectedLocationOption) => {
    this.setState({ selectedLocationOption });
  };

  handleChangeOwner = (event, selectedOwnerOption) => {
    this.setState({ selectedOwnerOption });
  };

  handleChangeDatacenter = (event, selectedDatacenterOption) => {
    this.setState({ selectedDatacenterOption });
    console.log(selectedDatacenterOption)
  }

  handleChangeSlotNumber = (event, selectedSlotNumberOption) => {
    this.setState({ selectedSlotNumberOption });
  };

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

    let stateCopy = Object.assign({}, this.state.asset);

    stateCopy.model = this.state.selectedModelOption ? this.state.selectedModelOption.value : null;
    stateCopy.rack = this.state.selectedRackOption ? this.state.selectedRackOption.value : null;
    stateCopy.owner = this.state.selectedOwnerOption ? this.state.selectedOwnerOption.value : null;
    stateCopy.network_ports = networkPortsBuilder
    stateCopy.power_ports = tmpPP


    stateCopy.datacenter = this.state.selectedDatacenterOption ? this.state.selectedDatacenterOption.url : null;
    console.log(this.state.currentMountType)
    if (this.state.is_offline) {
      if (this.state.currentMountType === 'blade') {
        stateCopy.datacenter = this.state.selectedDatacenterOption.id;
      }
    }
    else {
      if (this.state.currentMountType === 'blade') {
        stateCopy.datacenter = this.state.selectedDatacenterOption.id;
      }
    }


    let stateToSend = this.removeEmpty(stateCopy);
    if (this.state.is_offline) {
      stateToSend.rack = null;
      stateToSend.rack_u = null;
    }

    if (this.state.revert) {
      stateToSend.ovr_color = null;
      stateToSend.ovr_memory = null;
      stateToSend.ovr_cpu = null;
      stateToSend.ovr_storage = null;
    }
    //logic for color)
    else {
      //not revert, some changes
      if (this.state.selectedDisplayColor === this.state.asset.ovr_color || !this.displayColorChecked) {
        stateToSend.ovr_color = null;
      }
    }

    console.log(JSON.stringify(stateToSend, null, 2))
    var self = this;

    if (this.props.location.state != null && this.props.location.state.isBlade) {
      //PUT: blade
      delete stateToSend.rack
      delete stateToSend.rack_u
      stateToSend.model = this.state.selectedModelOption ? this.state.selectedModelOption.id : null;
      stateToSend.location = this.state.selectedLocationOption ? this.state.selectedLocationOption.id : null;
      stateToSend.slot_number = this.state.selectedSlotNumberOption ? this.state.selectedSlotNumberOption.value : null;
      stateToSend.ovr_color = this.state.displayColorChecked && this.state.selectedDisplayColor !== this.state.asset.ovr_color ? this.state.asset.ovr_color : null;
      stateToSend.ovr_storage = this.state.storageChecked && this.state.asset.ovr_storage !== this.state.selectedStorage ? this.state.asset.ovr_storage : null;
      stateToSend.ovr_cpu = this.state.cpuChecked && this.state.asset.ovr_cpu !== this.state.selectedCPU ? this.state.asset.ovr_cpu : null;
      stateToSend.ovr_memory = this.state.memoryChecked && this.state.asset.ovr_memory !== this.state.selectedMemory ? this.state.asset.ovr_memory : null;

      let dst = '/api/blades/'.concat(this.props.match.params.id).concat('/');
      axios.put(dst, stateToSend)
        .then(function (response) {
          alert('Edit was successful');
          // window.location = '/assets'
          self.setState({
            redirect: true,
          });
        })
        .catch(function (error) {
          alert('Edit was not successful.\n' + jsonToHumanText(error.response.data));
        });
    }
    else {
      //PUT: asset
      stateToSend.ovr_color = this.state.displayColorChecked && this.state.selectedDisplayColor !== this.state.asset.ovr_color ? this.state.asset.ovr_color : null;
      stateToSend.ovr_storage = this.state.storageChecked && this.state.asset.ovr_storage !== this.state.selectedStorage ? this.state.asset.ovr_storage : null;
      stateToSend.ovr_cpu = this.state.cpuChecked && this.state.asset.ovr_cpu !== this.state.selectedCPU ? this.state.asset.ovr_cpu : null;
      stateToSend.ovr_memory = this.state.memoryChecked && this.state.asset.ovr_memory !== this.state.selectedMemory ? this.state.asset.ovr_memory : null;

      let dst = '/api/assets/'.concat(this.props.match.params.id).concat('/');
      axios.put(dst, stateToSend)
        .then(function (response) {
          alert('Edit was successful');
          // window.location = '/assets'
          self.setState({
            redirect: true,
          });
        })
        .catch(function (error) {
          alert('Edit was not successful.\n' + jsonToHumanText(error.response.data));
        });
    }
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
              dcID={this.state.selectedDatacenterOption ? this.state.selectedDatacenterOption.id : null}
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

  renderTableHeader() {
    let headCells = [
      { id: 'display_color', label: 'Color' },
      { id: 'cpu', label: 'CPU' },
      { id: 'memory', label: 'Memory' },
      { id: 'storage', label: 'Storage' },
    ];
    return headCells.map(headCell => (
      <TableCell
        align={'center'}
        padding={'default'}

      >
        {headCell.label.toUpperCase()}

      </TableCell>
    ))
  }

  renderCheckRow() {
    let model = this.state.selectedModelOption;

    if (model == null || this.state.revert) {
    }
    else {
      return (
        <TableRow
          hover
          tabIndex={-1}
        >
          <TableCell align="center">
            <ToggleButton
              value="check"
              selected={this.state.displayColorChecked}
              onChange={() => {
                this.setDisplayColorChecked();
              }}
            >
              <CheckIcon />
            </ToggleButton>
          </TableCell>
          <TableCell align="center">
            <ToggleButton
              value="check"
              selected={this.state.cpuChecked}
              onChange={() => {
                this.setCpuChecked();
              }}
            >
              <CheckIcon />
            </ToggleButton>
          </TableCell>
          <TableCell align="center">
            <ToggleButton
              value="check"
              selected={this.state.memoryChecked}
              onChange={() => {
                this.setMemoryChecked();
              }}
            >
              <CheckIcon />
            </ToggleButton>
          </TableCell>
          <TableCell align='center'>
            <ToggleButton
              value="check"
              selected={this.state.storageChecked}
              onChange={() => {
                this.setStorageSelected();
              }}
            >
              <CheckIcon />
            </ToggleButton>
          </TableCell>
        </TableRow>
      )
    }
  }

  setStorageSelected = () => {
    this.setState(prevState => ({
      storageChecked: !prevState.storageChecked
    }));
  }

  setDisplayColorChecked = () => {
    this.setState(prevState => ({
      displayColorChecked: !prevState.displayColorChecked
    }));
  }

  setMemoryChecked = () => {
    this.setState(prevState => ({
      memoryChecked: !prevState.memoryChecked
    }));
  }

  setCpuChecked = () => {
    this.setState(prevState => ({
      cpuChecked: !prevState.cpuChecked
    }));
  }

  handleRevert = () => {
    let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
    instanceCopy.ovr_storage = null;
    instanceCopy.ovr_cpu = null;
    instanceCopy.ovr_memory = null;
    instanceCopy.ovr_displayColor = null;
    this.setState(prevState => ({
      revert: !prevState.revert,
      asset: instanceCopy,
      displayColorChecked: false,
      cpuChecked: false,
      memoryChecked: false,
      storageChecked: false,
    }));
  }

  renderTableData() {
    let model = this.state.selectedModelOption;

    let colorOverride = this.state.asset.ovr_color;
    let cpuOverride = this.state.asset.ovr_cpu;
    let storageOverride = this.state.asset.ovr_storage;
    let memoryOverride = this.state.asset.ovr_memory;

    if (!colorOverride) {
      colorOverride = this.state.selectedDisplayColor;
    }
    if (!cpuOverride) {
      cpuOverride = this.state.selectedCPU;
    }
    if (!memoryOverride) {
      memoryOverride = this.state.selectedMemory;
    }
    if (!storageOverride) {
      storageOverride = this.state.selectedStorage;
    }

    if (model == null) return (
      <TableRow hover tabIndex={-1}>
        <TableCell align="center" colSpan={12}>Select a Model</TableCell>
      </TableRow>
    )
    else if (this.state.revert) return (
      <TableRow hover tabIndex={-1}>
        <TableCell align="center" colSpan={12}>No differing fields from the model.</TableCell>
      </TableRow>
    )
    // console.log(model)
    return (
      <TableRow
        hover
        tabIndex={-1}
      >
        <TableCell align="right">
          {this.state.displayColorChecked ?
            <FormControl fullWidth>
              <Input type="color" name="Display Color" startAdornment="Display Color"
                value={'#' + this.state.asset.ovr_color}
                onChange={e => {
                  let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
                  instanceCopy.ovr_color = e.target.value.replace('#', '');
                  this.setState({
                    asset: instanceCopy
                  })
                }} />{' '}
            </FormControl>
            :
            <div style={{
              width: 12,
              height: 10,
              backgroundColor: '#' + colorOverride,
              left: 2,
              top: 2,
            }}></div>}
        </TableCell>
        <TableCell align="center">
          {this.state.cpuChecked ?
            <TextField label='CPU' type="text" defaultValue={cpuOverride} helperText="Describe the CPU" fullWidth onChange={e => {
              let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
              instanceCopy.ovr_cpu = e.target.value
              this.setState({
                asset: instanceCopy
              })
            }} />
            : cpuOverride}
        </TableCell>
        <TableCell align="center">
          {this.state.memoryChecked ?
            <TextField label='Memory' type="number" defaultValue={memoryOverride} helperText="RAM available in GB" fullWidth onChange={e => {
              let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
              instanceCopy.ovr_memory = e.target.value
              this.setState({
                asset: instanceCopy
              })
            }} />
            :
            memoryOverride}
        </TableCell>
        <TableCell align="center">
          {this.state.storageChecked ?
            <TextField label='Storage' defaultValue={storageOverride} type="text" helperText="Describe the storage" fullWidth onChange={e => {
              let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
              instanceCopy.ovr_storage = e.target.value
              this.setState({
                asset: instanceCopy
              })
            }} />
            : storageOverride}</TableCell>
      </TableRow>
    )
  }

  renderTableToolbar = () => {

    let message = 'Change Model Fields';
    if (this.state.revert) {
      message = 'Change Model Fields';
    }
    else {
      if (this.state.displayColorChecked || this.state.storageChecked || this.state.memoryChecked || this.state.cpuChecked) {
        message = 'Revert to Original Model';
      }
    }
    return (

      <Toolbar>
        {
          <Container maxwidth="xl">
            <Grid container className='themed-container' spacing={2}>
              <Grid item alignContent='center' xs={6}>
                <Typography style={{ flex: '1 1 20%' }} variant="h6" id="modelFieldsTableTitle">
                  Edit Model Fields for this Asset
            </Typography>
              </Grid>

              <Grid item alignContent='right' xs={6}>
                <Button variant="outlined" color="primary" size="small" alignContent='flex-end'
                  onClick={this.handleRevert}>
                  {message}
                </Button>
              </Grid>
            </Grid>
          </Container>
        }
      </Toolbar>
    );
  };

  render() {
    console.log(this.state)

    let options2 = this.context.datacenterOptions;
    console.log(options2)
    options2 = options2.slice(1);
    let options = options2.map((option) => {
      let firstLetter = option.is_offline;
      console.log(firstLetter);
      return {
        firstLetter: /true/.test(firstLetter) ? "Offline Sites" : "Datacenters",
        ...option
      };
    })

    let rack_select =
      <Autocomplete
        autoComplete
        autoHighlight
        autoSelect
        id="instance-create-rack-select"
        options={this.state.rackOptions}
        getOptionLabel={option => option.label}
        onChange={this.handleChangeRack}
        value={this.state.selectedRackOption}
        disabled={this.state.selectedDatacenterOption === null || this.state.currentMountType === 'blade'}
        renderInput={params => (
          <TextField {...params} label="Rack" fullWidth />
        )}
      />;

    let rack_u_select =
      < TextField label="Rack U"
        fullWidth
        type="number"
        disabled={this.state.currentMountType === 'blade'}
        value={this.state.asset.rack_u}
        InputLabelProps={{ shrink: true }}
        onChange={e => {
          let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
          instanceCopy.rack_u = e.target.value
          this.setState({
            asset: instanceCopy
          })
        }} />;

    console.log(this.state)

    return (
      <div>
        {this.state.redirect && <Redirect to={{ pathname: '/assets' }} />}
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
                    disabled={true}
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
                    options={options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
                    groupBy={option => option.firstLetter}
                    getOptionLabel={option => option.abbreviation}
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
                    disabled={true}
                    onChange={e => {
                      let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
                      instanceCopy.asset_number = e.target.value
                      this.setState({
                        asset: instanceCopy
                      })
                    }} />
                </Grid>



                <Grid item xs={6}>
                  {this.state.is_offline ? <p></p> : rack_select}
                </Grid>
                <Grid item xs={6}>
                  {this.state.is_offline ? <p></p> : rack_u_select}
                </Grid>

                <Grid item xs={6}>
                  <Autocomplete
                    autoComplete
                    autoHighlight
                    autoSelect
                    id="instance-create-location-select"
                    options={this.state.locationOptions}
                    getOptionLabel={option => option.label}
                    onChange={this.handleChangeLocation}
                    value={this.state.selectedLocationOption}
                    disabled={this.state.selectedDatacenterOption === null || this.state.currentMountType != 'blade'}
                    renderInput={params => (
                      <TextField {...params} label="Location" fullWidth />
                    )}
                  />
                </Grid>

                <Grid item xs={6}>
                  {/* < TextField label="Chassis Slot"
                    fullWidth
                    type="number"
                    disabled={this.state.currentMountType != 'blade'}
                    value={this.state.asset.slot_number}
                    InputLabelProps={{ shrink: true }}
                    onChange={e => {
                      let instanceCopy = JSON.parse(JSON.stringify(this.state.asset))
                      instanceCopy.slot_number = e.target.value
                      this.setState({
                        asset: instanceCopy
                      })
                    }} /> */}
                  <Autocomplete
                    autoComplete
                    autoHighlight
                    autoSelect
                    id="instance-create-slot-select"
                    options={this.state.slotNumberOptions}
                    getOptionLabel={option => option.label}
                    onChange={this.handleChangeSlotNumber}
                    value={this.state.selectedSlotNumberOption}
                    disabled={this.state.selectedDatacenterOption === null || this.state.selectedLocationOption == null || this.state.currentMountType != 'blade'}
                    renderInput={params => (
                      <TextField {...params} label="Chassis slot number" fullWidth />
                    )}
                  />
                </Grid>

                <Grid item xs={6}>
                  {this.state.is_offline ? <p></p> :
                    <Paper>
                      <Typography variant="h6" gutterBottom>
                        Network Ports
                        </Typography>
                      <List style={{ maxHeight: 200, overflow: 'auto' }}>
                        {this.openNetworkPortConfigAndMAC()}
                      </List>
                    </Paper>}

                </Grid>

                <Grid item xs={6}>
                  {this.state.is_offline ? <p></p> :
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
                    </Paper>}
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

                <Grid item xs={8}>
                  <Paper>
                    {this.renderTableToolbar()}
                    <TableContainer>
                      <Table
                        size="small"
                        aria-labelledby="modelTableTitle"
                        aria-label="enhanced table"
                      >
                        <TableRow>{this.renderTableHeader()}</TableRow>

                        <TableBody textAlign='center' >
                          {this.renderCheckRow()}
                          {this.renderTableData()}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={8}></Grid>
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

EditInstanceForm.contextType = DatacenterContext;

export default EditInstanceForm
