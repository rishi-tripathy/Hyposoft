import React, { Component } from 'react'
import ReactDOMServer from 'react-dom'
// import '../stylesheets/RacksView.css'
import '../stylesheets/RackTable.css'
// import '../stylesheets/Printing.css'
import RackTable from './RackTable'
import axios from 'axios'
import {
  Grid, Button, Container, Paper, ButtonGroup, Switch, FormControlLabel, Typography, IconButton, Tooltip
} from "@material-ui/core"
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { Link } from 'react-router-dom'
import DatacenterContext from './DatacenterContext'
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export class RacksView extends Component {

  constructor() {
    super();
    this.state = {
      rack: [],
      condensedView: false,
      showAllView: false,
      count: 1,
    }
    this.showCreateForm = this.showCreateForm.bind(this);
    this.showMassCreateForm = this.showMassCreateForm.bind(this);
    this.showMassDeleteForm = this.showMassDeleteForm.bind(this);
    this.showEditForm = this.showEditForm.bind(this);
    this.showAllRacks = this.showAllRacks.bind(this);
  }

  showCreateForm = () => {
    this.props.sendShowCreate(true);
  }

  showMassCreateForm = () => {
    this.props.sendShowMassCreate(true);
  }

  showMassDeleteForm = () => {
    this.props.sendShowMassDelete(true);
  }

  showEditForm = (id) => {
    this.props.sendShowEdit(true);
    this.props.sendEditID(id);
  }

  showDeleteForm = (id) => {
    if (window.confirm('Are you sure you want to delete?')) {
      let dst = '/api/racks/'.concat(id).concat('/');
      axios.delete(dst)
        .then(function (response) {
          alert('Delete was successful');
        })
        .catch(function (error) {
          alert('Delete was not successful.\n' + JSON.stringify(error.response.data));
        });
      this.showRerender();
    }
  }

  showRerender = () => {
    this.props.sendRerender(true);
  }

  handleCondensation = () => {
    this.setState({ condensedView: true });
  }

  handleCondensationOff = () => {
    this.setState({ condensedView: false });
  }

  showAllRacks = () => {
    this.props.sendShowAllRacks(true);
  }

  showLessRacks = () => {
    this.props.sendShowAllRacks(false);
  }


  sendFromRow = (show, id) => {
    this.props.sendViewsToController(show, id);
  }

  toggleShowingAll = () => {
    if (this.state.count === 1) {
      this.setState({
        count: 2,
      });
      this.showAllRacks();
    }
    else {
      this.setState(prevState => ({
        showingAll: !prevState.showingAll
      }));
      this.state.showingAll ? (
        this.showAllRacks()
      ) : (this.showLessRacks())
    }
  }

  toggleCondensed = () => {
    this.setState(prevState => ({
      condensedView: !prevState.condensedView
    }));
  }

  componentDidMount() {
    // console.log('mounting')
    // console.log(this.props.allCase)
    // if(this.props.allCase){
    //   // if(this.state.datacenterListForShowAll.length === 0){
    //     this.getDatacentersForTableHeaders();
    //   // }
    // }
    // else {
    //   this.setState({
    //     datacenterIds: [],
    //   })
    // }
  }

  // componentDidUpdate (prevProps, prevState) {
  //   if(this.state.rack !== prevState.rack){
  //     if(this.props.allCase){
  //       // if(this.state.datacenterListForShowAll.length === 0){
  //         this.getDatacentersForTableHeaders();
  //       // }
  //     }
  //     else {
  //       this.setState({
  //         datacenterIds: [],
  //       })
  //     }
  //   }
  // }

  render() {

    // console.log(this.props.rack)

    let is_admin = false;

    if (this.context.is_admin) {
      is_admin = true;
    }

    let add =
      (
        this.context.is_admin
        || this.context.username === 'admin'
        || this.context.global_asset_permission
        || this.context.asset_permission.length != 0
      )
        ? (
          <Link to={'/racks/create'}>
            <Button color="primary" variant="contained" endIcon={<AddCircleIcon />}>
              Add Rack(s)
        </Button>
          </Link>
        ) : <p></p>;

    let deleteMultiple = (
      this.context.is_admin
      || this.context.username === 'admin'
      || this.context.global_asset_permission
      || this.context.asset_permission.length != 0
    ) ? (
        <Link to={'/racks/delete'}>
          <Button color='primary' variant="contained" endIcon={<DeleteIcon />}>
            Delete Rack Range
        </Button>
        </Link>
      ) : <p></p>;

    let showAll = <FormControlLabel labelPlacement="left"
      control={
        <Switch value={this.state.showingAll} onChange={() => this.toggleShowingAll()} />
      }
      label={
        <Typography variant="subtitle1"> Show All</Typography>
      }
    />

    let condensed = <FormControlLabel labelPlacement="left"
      control={
        <Switch value={this.state.condensedView} onChange={() => this.toggleCondensed()} />
      }
      label={
        <Typography variant="subtitle1"> Condensed</Typography>
      }
    />

    let empty = '';


    console.log(this.props.rack)

    if (this.props.rack == null || this.props.rack.length === 0) {
      empty = <h1>No racks to display.</h1>;
      showAll = <p></p>;
      condensed = <p></p>;
      deleteMultiple = <p></p>;
    }


    return (
      <Container maxwidth="xl">
        {this.context.is_offline ? <h1>Assets are not displayed in racks in offline storage sites.</h1> :
          <Grid container className="themed-container" spacing={2}>
            <Grid item justify="flex-start" alignContent='center' xs={12} />
            <Grid item justify="flex-start" alignContent='flex-start' xs={2}>
              <div id="hideOnPrint">
                {add}
              </div>
            </Grid>
            <Grid item justify="center" alignContent="center" xs={3}>
              <div id="hideOnPrint">
                {deleteMultiple}
              </div>
            </Grid>
            <Grid item justify="center" alignContent="center" xs={3}>
              <div id="hideOnPrint">
                {condensed}
              </div>
            </Grid>
            <Grid item justify="flex-end" alignContent="flex-end" xs={3}>
              <div id="hideOnPrint">

                {showAll}
              </div>
            </Grid>
            <Grid item xs={12}>
              {empty}
              {this.props.rack.map((item, index) =>
                <div id="rackContainer">
                  <div id='hideOnPrint'>
                    {is_admin ? (
                      <ButtonGroup alignContent='center'>
                        <Link to={'/racks/' + item.id + '/edit'}>
                          < Tooltip title='Edit'>
                            <IconButton aria-label="edit">
                              <EditIcon />
                            </IconButton>
                          </ Tooltip>
                        </Link>
                        < Tooltip title='Delete'>
                          <IconButton color='secondary' onClick={() => this.showDeleteForm(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ButtonGroup>
                    )
                      :
                      (<p></p>)}
                  </div>
                  <Grid item justify="flex-start" alignContent='center' xs={12} p={2}>
                    <RackTable
                      sending={this.sendFromRow}
                      sendUrl={this.sendUrlInView}
                      rack={item}
                      condensedState={this.state.condensedView}
                      allCase={this.props.allCase}
                      dc={this.props.dcList[index]} />
                  </Grid>
                </div>
              )}
            </Grid>
          </Grid>}
      </Container>
    )
  }
}

RacksView.contextType = DatacenterContext;

export default RacksView
