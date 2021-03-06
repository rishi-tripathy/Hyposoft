import React, {Component, useState} from 'react'
import RacksView from './RacksView';
import RackFilters from './RackFilters'
import PrintIcon from '@material-ui/icons/Print';
import FilterListIcon from '@material-ui/icons/FilterList';
import axios from 'axios'
// import '../stylesheets/Printing.css'
import '../stylesheets/RackTable.css'
// import '../stylesheets/RacksView.css'
import {UncontrolledCollapse, CardBody, Card} from 'reactstrap';
import {
  Grid, Button, Container, Paper, ButtonGroup, Switch, FormControlLabel, Typography, CircularProgress
} from "@material-ui/core"
import DatacenterContext from './DatacenterContext';


axios.defaults.xsrfHeaderName = "X-CSRFToken";

export class RackController extends Component {

  constructor() {
    super();

    this.state = {
      racks: [],
      showRacksView: true,
      showCreateView: false,
      showMassCreateView: false,
      showMassDeleteView: false,
      showEditView: false,
      showDeleteView: false,
      showDetailedInstanceView: false,
      showCondensedView: false,
      showAllRacks: false,
      detailedInstanceID: 0,
      filterQuery: '',
      editID: 0,
      IDurl: '',
      deleteID: 0,
      prevPage: null,
      nextPage: null,
      rerender: false,
      datacenterID: null,
      allCase: false,
      datacenterListForShowAll: [],
      loading: true,
    };
    this.getShowRacks = this.getShowRacks.bind(this);
    this.getFilterQuery = this.getFilterQuery.bind(this);
    this.getShowDetailedInstance = this.getShowDetailedInstance.bind(this);
    this.getDetailedInstanceUrl = this.getDetailedInstanceUrl.bind(this);
  }

  getRerender = (re) => {
    if (re) {
      this.setState({rerender: true})
    }
  }

  getShowRacks = (show, condensed) => {
    if (show && condensed) {
      this.setState({
        showRacksView: true,
        showCreateView: false,
        showMassCreateView: false,
        sendMassDeleteView: false,
        showDetailedInstanceView: false,
        showCondensedView: true,
        showEditView: false,
        showDeleteView: false,
        showAllRacks: false,
      })
    } else if (show && !condensed) {
      this.setState({
        showRacksView: true,
        showCreateView: false,
        showMassCreateView: false,
        sendMassDeleteView: false,
        showDetailedInstanceView: false,
        showCondensedView: false,
        showEditView: false,
        showDeleteView: false,
        showAllRacks: false
      })
    } else {
      this.setState({
        showRacksView: false,
      })
    }
  }

  getShowCreate = (show) => {
    show ? this.setState({
        showRacksView: false,
        showCreateView: true,
        showMassCreateView: false,
        sendMassDeleteView: false,
        showDetailedInstanceView: false,
        showEditView: false,
        showDeleteView: false,
        showAllRacks: false,
      })
      : this.setState({
        showCreateView: false,
      })
  }

  getDetailedInstanceView = (show) => {
    show ? this.setState({
        showRacksView: false,
        showCreateView: false,
        showMassCreateView: false,
        sendMassDeleteView: false,
        showDetailedInstanceView: true,
        showEditView: false,
        showDeleteView: false,
        showAllRacks: false,
      })
      : this.setState({
        showDetailedInstanceView: false,
      })
  }

  getShowMassCreate = (show) => {
    show ? this.setState({
        showRacksView: false,
        showCreateView: false,
        showMassCreateView: true,
        showDetailedInstanceView: false,
        showEditView: false,
        showDeleteView: false,
        showAllRacks: false,
      })
      : this.setState({
        showMassCreateView: false,
      })
  }

  getShowMassDelete = (show) => {
    show ? this.setState({
        showRacksView: false,
        showCreateView: false,
        showMassCreateView: false,
        showMassDeleteView: true,
        showDetailedInstanceView: false,
        showEditView: false,
        showDeleteView: false,
        showAllRacks: false,
      })
      : this.setState({
        showMassDeleteView: false,
      })
  }

  getShowEdit = (show) => {
    show ? this.setState({
        showRacksView: false,
        showCreateView: false,
        showMassCreateView: false,
        showDetailedInstanceView: false,
        showEditView: true,
        showDeleteView: false,
        showAllRacks: false,
      })
      : this.setState({
        showEditView: false,
      })
  }

  getShowDelete = (show) => {
    show ? this.setState({
        showRacksView: false,
        showCreateView: false,
        showMassCreateView: false,
        showDetailedInstanceView: false,
        showEditView: false,
        showDeleteView: true,
        showAllRacks: false,
      })
      : this.setState({
        showDeleteView: false,
      })
  }

  getShowDetailedInstance = (show, id) => {
    show ? this.setState({
        showRacksView: false,
        showCreateView: false,
        showMassCreateView: false,
        showDetailedInstanceView: true,
        showEditView: false,
        showDeleteView: false,
        showAllRacks: false,
        IDurl: id,
      })
      : this.setState({
        showDetailedInstanceView: false,
      })
  }

  getDetailedInstanceUrl = (url) => {
    this.setState({
      IDurl: url,
    });
  }

  getShowAllRacks = (show) => {
    show ? this.setState({
        showRacksView: true,
        showCreateView: false,
        showMassCreateView: false,
        showDetailedInstanceView: false,
        showEditView: false,
        showDeleteView: false,
        showAllRacks: true,
      })
      : this.setState({
        showAllRacks: false,
      })
  }

  getEditID = (id) => {
    this.setState({
      editID: id,
    });
  }

  getFilterQuery = (q) => {
    this.setState({filterQuery: q});
  }

  getSortQuery = (q) => {
    this.setState({sortQuery: q})
  }

  componentDidMount() {
    this.refreshRacks();
  }

  componentDidUpdate(prevProps, prevState) {
    const delay = 50;

    // Once filter changes, rerender
    if (prevState.filterQuery !== this.state.filterQuery) {
      setTimeout(() => {
        this.refreshRacks();
      }, delay);
    }

    if (prevState.showRacksView !== this.state.showRacksView) {
      setTimeout(() => {
        this.refreshRacks();
      }, delay);
    }

    if (this.context.datacenter_id !== this.state.datacenterID) {
      setTimeout(() => {
        this.refreshRacks();
      }, delay);
    }

    if (prevState.showAllRacks !== this.state.showAllRacks) {
      setTimeout(() => {
        this.refreshRacks();
      }, delay);
    }

    if (prevState.rerender === false && this.state.rerender === true) {
      setTimeout(() => {
        this.refreshRacks();
        this.setState({rerender: false});
      }, delay);
    }
  }

  refreshRacks = () => {
    this.setState({
      datacenterID: this.context.datacenter_id,
    });

    // console.log(this.context)

    // console.log(this.state.datacenterID)
    // console.log(this.context.datacenter_id)
    let allCaseVar;

    if (!this.state.showAllRacks) {

      //all or one datacenter?
      // console.log(this.state.datacenterID)
      let dst;
      // if(this.state.datacenterID===-1 || this.state.datacenterID == null){
      if(this.context.datacenter_id===-1){
        dst = '/api/racks/' + this.state.filterQuery; //gets from all dc's
        // console.log('all case true')
        allCaseVar = true;

      }
      else {
        dst = '/api/racks/' + '?' + 'datacenter=' + this.context.datacenter_id + '&' + this.state.filterQuery;
        // console.log('all case false')

        allCaseVar = false;

      }

      axios.get(dst).then(res => {
        this.setState({
          racks: res.data.results,
          prevPage: res.data.previous,
          nextPage: res.data.next,
          loading: false,
          allCase: allCaseVar,
        });
      })
        .catch(function (error) {
          // TODO: handle error
          this.setState({
            loading: false,
          })
          // console.log(error.response);
          alert('Cannot load. Re-login.\n' + JSON.stringify(error.response.data, null, 2));
        });
    } else {
      this.setState({
        loading: true,
      })
      //show all racks
      let dst;

      // if(this.state.datacenterID===-1 || this.state.datacenterID == null){
      if(this.context.datacenter_id===-1){
        dst = '/api/racks/' + '?show_all=true' + this.state.filterQuery; //gets from all dc's
        // console.log('all case true')
        allCaseVar = true;
      }
      else {
        dst = '/api/racks/' + '?' + 'datacenter=' + this.context.datacenter_id + '&' + 'show_all=true' + '&' + this.state.filterQuery;
        // console.log('all case false')
       allCaseVar = false;
      }

      axios.get(dst).then(res => {
        this.setState({
          racks: res.data,
          prevPage: null,
          nextPage: null,
          loading: false,
          allCase: allCaseVar,
        });
      })
        .catch(function (error) {
          this.setState({
            loading: false,
          })
          console.log(error.response);
        });
      }
  }

  getDatacentersForTableHeaders = () => {
    let datacenterAbs = [];
    let dcOptions = [];
    dcOptions = this.context.datacenterOptions;
    console.log(dcOptions)

      let datacenterIds = [];
      let racksArr = [];
      console.log(this.state.racks)
      // if(this.state.showAllRacks){
      //   console.log(this.state.racks.results)
      //   this.state.racks.results.map((r, index) => {
      //     console.log(r)
      //     datacenterIds.push(r.datacenter.substring(r.datacenter.length-2, r.datacenter.length-1))
      //   })
      // }
      // else {
        this.state.racks.map((r, index) => {
          console.log(r.datacenter)
          var match = r.datacenter.match(/datacenters\/(\d+)/)
          if (match) {
            console.log(match[1])
            datacenterIds.push(match[1])
          }
          //datacenterIds.push(r.datacenter.substring(r.datacenter.length-2, r.datacenter.length-1))
        })
      // }

      console.log(datacenterIds)

      datacenterIds.map((r, index) => {
        console.log(r)
        for(var i = 0 ; i < dcOptions.length; i++){
          // console.log(dcOptions[i].id)
          // console.log(dcOptions[i].abbreviation)
          if(r === dcOptions[i].id.toString()){
            // console.log('match found')
            datacenterAbs.push(dcOptions[i].abbreviation)
          }
        }
      })
      // console.log(datacenterAbs)
      return datacenterAbs;
    }

  paginateNext = () => {
    this.state.racks = null;
    axios.get(this.state.nextPage).then(res => {
      this.setState({
        racks: res.data.results,
        prevPage: res.data.previous,
        nextPage: res.data.next,
      });
    })
      .catch(function (error) {
        // TODO: handle error
        // console.log(error.response);
      });
  }

  paginatePrev = () => {
    axios.get(this.state.prevPage).then(res => {
      this.setState({
        racks: res.data.results,
        prevPage: res.data.previous,
        nextPage: res.data.next,
      });
    })
      .catch(function (error) {
        // TODO: handle error
        // console.log(error.response);
      });
  }

  print() {
    window.print();
  }


  render() {
    let content;
    let list = [];
    // console.log(this.state.racks)
    // console.log(this.context.datacenter_id)
    if(this.context.datacenter_id === -1){
      // console.log('in allcase')
      // console.log(this.getDatacentersForTableHeaders());
      list = this.getDatacentersForTableHeaders();
    }

    if (this.state.showRacksView) {
      content =
        <RacksView rack={this.state.racks}
                   sendRerender={this.getRerender}
                   sendShowCreate={this.getShowCreate}
                   sendShowMassCreate={this.getShowMassCreate}
                   sendShowMassDelete={this.getShowMassDelete}
                   sendViewsToController={this.getShowDetailedInstance}
                   sendDetailedInstanceUrl={this.getDetailedInstanceUrl}
                   sendShowEdit={this.getShowEdit}
                   sendEditID={this.getEditID}
                   sendShowDelete={this.getShowDelete}
                   sendShowAllRacks={this.getShowAllRacks}
                   allCase={this.state.allCase}
                   dcList={list}/>;
  }

    let filters =
 <div id="hideOnPrint">
   <Button variant="outlined" id="toggler" style={{marginBottom: '1rem'}} endIcon={<FilterListIcon />}> Filter </Button>
        <UncontrolledCollapse toggler="#toggler">
          <RackFilters sendFilterQuery={this.getFilterQuery}/>
        </UncontrolledCollapse>
      </div>;
    let printButton =
      <div id="hideOnPrint">
        <Button variant="outlined" onClick={this.print} endIcon={<PrintIcon />}>Print Racks</Button>
      </div>

    let paginateNavigation;

    if (this.state.prevPage == null && this.state.nextPage != null) {
      paginateNavigation =
      <div id="hideOnPrint">
        <Button color="link" disabled>prev page</Button>{'  '}<Button color="link" onClick={this.paginateNext}>next
          page</Button></div>;
    } else if (this.state.prevPage != null && this.state.nextPage == null) {
      paginateNavigation =
      <div id="hideOnPrint">
      <Button color="link" onClick={this.paginatePrev}>prev page</Button>{'  '}<Button color="link" disabled>next
          page</Button></div>;
    } else if (this.state.prevPage != null && this.state.nextPage != null) {
      paginateNavigation =
      <div id="hideOnPrint">
      <Button color="link" onClick={this.paginatePrev}>prev page</Button>{'  '}<Button color="link"
          onClick={this.paginateNext}>next page</Button></div>;
    }

    // if we're not on the table, then don't show pagination
    if (!this.state.showRacksView || this.context.is_offline) {
      paginateNavigation = <p></p>;
      filters = <p></p>;
      printButton = <p></p>;
    }

    let name;

    if(this.state.datacenterID=== null || this.state.datacenterID === -1 ){
      name = 'Racks in All Datacenters'
    }
    else {
      name = 'Racks in Datacenter: ' + this.context.datacenter_ab;
    }

    return (
      <div>
        <Container maxwidth="xl">
        <Grid container className="themed-container" spacing={2}>
          <Grid item justify="flex-start" alignContent='center' xs={12}/>
          <Grid item justify="flex-start" alignContent='center' xs={10}>
                <Typography variant="h3">
                <div id="hideOnPrint">
                  {name}
                </div>
                </Typography>
          </Grid>
          <Grid item justify="flex-start" alignContent='center' xs={3}>
            {filters}{' '}
          </Grid>
          <Grid item justify="flex-start" alignContent='center' xs={3}>
            {printButton}{' '}
          </Grid>
          <Grid item justify="flex-end" alignContent='center' xs={3}>
            {paginateNavigation}{' '}
          </Grid>
          <Grid item justify="flex-start" alignContent='center' xs={12}>
          {this.state.loading ? <center><CircularProgress size={100} /></center> : content }
          </Grid>
        </Grid>
        </Container>
      </div>
    )
  }
}

RackController.contextType = DatacenterContext;

export default RackController
