import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import {
  Collapse, Table, TableBody, Button, TableCell, TableContainer, TableRow, Toolbar, Grid,
  Typography, Paper, IconButton, Tooltip, TableSortLabel, Checkbox
} from "@material-ui/core";
import PageviewIcon from '@material-ui/icons/Pageview';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import InstanceFilters from './InstanceFilters';
import '../stylesheets/TableView.css'
import axios, { post } from 'axios'
import { Link } from 'react-router-dom'
import DatacenterContext from './DatacenterContext';


axios.defaults.xsrfHeaderName = "X-CSRFToken";

export class InstanceTableMUI extends Component {

  constructor() {
    super();

    this.state = {
      filtersOpen: false,
      dense: false,
      sortBy: 'model',
      sortType: 'asc',
      // sorting: {
      //   'vendor': 'none',
      //   'model_number': 'none',
      //   'height': 'none',
      //   'display_color': 'none',
      //   'ethernet_ports': 'none',
      //   'power_ports': 'none',
      //   'cpu': 'none',
      //   'memory': 'none',
      //   'storage': 'none'
      // },
      sortingStates: ['asc', 'desc'],

      // for checkboxes
      selected: [], // list of IDs
      allAssetIDs: [],


    }
  }

  loadAllAssetIDs = () => {
    let dst = '/api/assets/all_ids/';
    axios.get(dst).then(res => {
      this.setState({
        allAssetIDs: res.data.ids
      });
    })
      .catch(function (error) {
        // TODO: handle error
        alert('Cannot load assets. Re-login.\n' + JSON.stringify(error.response, null, 2));
      });
  }

  componentDidMount() {
    this.loadAllAssetIDs();
  }

  showDeleteForm = (id) => {
    if (window.confirm('Are you sure you want to delete?')) {
      let dst = '/api/assets/'.concat(id).concat('/');
      axios.delete(dst)
        .then(function (response) {
          alert('Delete was successful');
        })
        .catch(function (error) {
          alert('Delete was not successful.\n' + JSON.stringify(error.response.data, null, 2));
        });
    }
    this.showRerender();
  }

  handleOpenFilters = () => {
    this.setState(prevState => ({
      filtersOpen: !prevState.filtersOpen
    }));
  }

  showRerender = () => {
    this.props.sendRerender(true);
  }

  handleHeaderClickSort = (id) => {
    let sortByCopy = id
    this.setState({
      sortBy: sortByCopy
    })
    let sortTypeCopy = this.state.sortingStates[(this.state.sortingStates.indexOf(this.state.sortType) + 1) % 2];
    this.setState({
      sortType: sortTypeCopy
    })

    // Make Query
    let modifier = (sortTypeCopy === 'desc') ? '-' : ''
    let q = 'ordering=' + modifier + sortByCopy;
    // for (let i = 0; i < arr.length; i++) {
    //   q = q + arr[i].value + ',';
    // }
    // // take off the last &
    // q = q.slice(0, -1);
    this.props.sendSortQuery(q);
  };

  handleMakeAssetTags = () => {
    let arrayToSend = Object.assign([], this.state.selected)
    console.log(arrayToSend)
    let dst = '/api/assets/generate_barcodes/';
    axios.post(dst, arrayToSend).then(res => {
      //alert('Created tags successfully');
    })
      .catch(function (error) {
        alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
      });
  }

  renderTableToolbar = () => {
    return (
      <Toolbar>
        {
          this.state.selected.length === 0 ? (
            <Typography variant="h6" id="instanceTableTitle">
              Assets
            </Typography>
          ) : (
              <div>
                <Grid container spacing={2}>
                  <Grid item xs={2}>
                    <Typography variant="subtitle1" >
                      {this.state.selected.length}
                    </Typography>
                  </Grid>

                  <Grid item xs={8}>
                    <Typography variant="subtitle1" >
                      selected
                  </Typography>
                  </Grid>

                  <Grid item xs={2}>
                    <Tooltip title='Make Asset Tags'>
                      <IconButton size="sm" onClick={() => this.handleMakeAssetTags()}>
                        <LocalOfferIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </div>
            )
        }
        <Collapse in={this.state.filtersOpen}>
          <Paper>
            {
              <InstanceFilters sendFilterQuery={this.props.filter_query} />
            }
          </Paper>
        </Collapse>
        <Tooltip title="Filter list">
          <Button endIcon={<FilterListIcon />} onClick={() => this.handleOpenFilters()} aria-label="filter instance list">
            Filter
          </Button>
        </Tooltip>
      </Toolbar>
    );
  };

  renderTableHeader() {
    //These now come from sorting fields
    let headCells = [
      { id: 'rack__rack_number', label: 'Rack' },
      { id: 'rack_u', label: 'Rack U' },
      { id: 'model__vendor', label: 'Vendor' },
      { id: 'model__model_number', label: 'Model Number' },
      { id: 'hostname', label: 'Hostname' },
      { id: 'datacenter', label: 'Datacenter' },
      { id: 'owner', label: 'Owner' },
      // { id: 'np', label: 'Network Ports' },
      // { id: 'pp', label: 'Power Ports' },
      { id: 'asset_number', label: 'Asset no.' },
    ];
    return headCells.map(headCell => (
      <TableCell
        key={headCell.id}
        align={'center'}
        padding={'default'}

      >
        <TableSortLabel
          active={this.state.sortBy === headCell.id}
          hideSortIcon={!(this.state.sortBy === headCell.id)}
          direction={this.state.sortBy === headCell.id ? this.state.sortType : false}
          onClick={() => this.handleHeaderClickSort(headCell.id)}
        >
          {headCell.label.toUpperCase()}
        </TableSortLabel>
      </TableCell>
    ))
  }

  renderTableData() {
    if (this.props.assets.length == 0) return (
      <TableRow hover tabIndex={-1}>
        <TableCell align="center" colSpan={12}>No entries</TableCell>
      </TableRow>
    )
    return this.props.assets.map((asset) => {
      //console.log(asset)
      const { id, model, hostname, rack, owner, rack_u, datacenter, network_ports, power_ports, asset_number } = asset //destructuring
      //console.log(network_ports)

      return (
        <TableRow
          hover
          tabIndex={-1}
          key={id}
        >
          <TableCell padding="checkbox">
            <Checkbox
              checked={this.state.selected.includes(id)}
              onChange={(e) => this.onSelectCheckboxClick(id, e)}
              inputProps={{ 'aria-labelledby': id }}
            />
          </TableCell>
          <TableCell align="center">{rack ? rack.rack_number : null}</TableCell>
          <TableCell align="center">{rack_u}</TableCell>
          <TableCell align="center">{model ? model.vendor : null}</TableCell>
          <TableCell align="center">{model ? model.model_number : null}</TableCell>
          <TableCell align="center">{hostname}</TableCell>
          <TableCell align="center">{datacenter ? datacenter.abbreviation : null}</TableCell>
          <TableCell align="center">{owner ? owner.username : null}</TableCell>
          {/* <TableCell align="center">{network_ports ? network_ports.length : null}</TableCell>
          <TableCell align="center">{power_ports ? power_ports.length : null}</TableCell> */}
          <TableCell align="center">{asset_number}</TableCell>
          <div>
            <TableCell align="right">
              <Link to={'/assets/' + id}>
                <Tooltip title='View Details'>
                  <IconButton size="sm">
                    <PageviewIcon />
                  </IconButton>
                </Tooltip>
              </Link>
            </TableCell>
            {this.context.is_admin ? (
              <TableCell align="right">
                <Link to={'/assets/' + id + '/edit'}>
                  <Tooltip title='Edit'>
                    <IconButton size="sm">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Link>
              </TableCell>) : <p></p>
            }
            {this.context.is_admin ? (
              < TableCell align="right">
                < Tooltip title='Delete'>
                  <IconButton size="sm" onClick={() => this.showDeleteForm(id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            ) : <p></p>
            }
          </div>
        </TableRow>
      )
    })
  }

  onSelectAllCheckboxClick = () => {
    console.log('select all')

    if (this.state.selected.length === this.state.allAssetIDs.length) {
      this.setState({ selected: [] })
    }
    else {
      console.log(this.state.allAssetIDs)
      let allIDs = Object.assign([], this.state.allAssetIDs)
      this.setState({ selected: allIDs })
    }
    console.log(this.state.selected)
  }

  onSelectCheckboxClick = (id) => {
    console.log(this.state.selected)
    console.log('clicked on ' + id)

    let selectedArrayCopy = Object.assign([], this.state.selected)
    const idx = selectedArrayCopy.indexOf(id)
    if (idx > -1) {
      selectedArrayCopy.splice(idx, 1) //remove one element at index 
    }
    else {
      selectedArrayCopy.push(id)
    }

    this.setState({
      selected: selectedArrayCopy
    })
  }


  render() {
    return (
      <div>
        <Paper>
          {this.renderTableToolbar()}
          <TableContainer>
            <Table
              size="small"
              aria-labelledby="instanceTableTitle"
              aria-label="instanceTable"
            >
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    //indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={this.state.selected.length === this.state.allAssetIDs.length}
                    onChange={this.onSelectAllCheckboxClick}
                    inputProps={{ 'aria-label': 'select all desserts' }}
                  />
                </TableCell>
                {this.renderTableHeader()}
              </TableRow>

              <TableBody>
                {this.renderTableData()}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    );
  }
}

InstanceTableMUI.contextType = DatacenterContext;

export default InstanceTableMUI;
