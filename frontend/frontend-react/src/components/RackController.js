import React, { Component } from 'react'
import RacksView from './RacksView';
import CreateRackForm from './CreateRackForm'
import EditRackForm from './EditRackForm'
import RackFilters from './RackFilters'
import DeleteMultipleRacksForm from './DeleteMultipleRacksForm'
import axios from 'axios'
import CreateMultipleRacksForm from './CreateMultipleRacksForm';
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
      filterQuery: null,
      editID: 0,
      deleteID: 0,
      prevPage: null,
      nextPage: null,
    };
    this.getShowRacks = this.getShowRacks.bind(this);
    this.getFilterQuery = this.getFilterQuery.bind(this);
  }

  getShowRacks = (show) => {
    console.log('showing racks')
    show ? this.setState({
      showRacksView: true,
      showCreateView : false,
      showMassCreateView: false,
      sendMassDeleteView: false,
      showEditView: false,
      showDeleteView: false,
    })
    : this.setState({
      showRacksView : false,
    }) 
  }

  getShowCreate = (show) => {
    show ? this.setState({
      showRacksView: false,
      showCreateView : true,
      showMassCreateView: false,
      sendMassDeleteView: false, 
      showEditView: false,
      showDeleteView: false,
    })
    : this.setState({
      showCreateView : false,
    }) 
  }

  getShowMassCreate = (show) => {
    show ? this.setState({
      showRacksView: false,
      showCreateView : false,
      showMassCreateView: true,
      showEditView: false,
      showDeleteView: false,
    })
    : this.setState({
      showCreateView : false,
    })    
  }

  getShowMassDelete = (show) => {
    show ? this.setState({
      showRacksView: false,
      showCreateView : false,
      showMassCreateView: false,
      showMassDeleteView: true,
      showEditView: false,
      showDeleteView: false,
    })
    : this.setState({
      showCreateView : false,
    })    
  }

  getShowEdit = (show) => {
    show ? this.setState({
      showRacksView: false,
      showCreateView : false,
      showMassCreateView: false,
      showEditView: true,
      showDeleteView: false,
    })
    : this.setState({
      showEditView : false,
    }) 
  }

  getEditID = (id) => {
    this.setState({
      editID: id,
    });
  }

  getShowDelete = (show) => {
    show ? this.setState({
      showTableView: false,
      showCreateView : false,
      showMassCreateView: false,
      showEditView: false,
      showDeleteView: true,
    })
    : this.setState({
      showDeleteView : false,
    }) 
  }

  getFilterQuery = (q) => {
    this.setState({ filterQuery: q });
  }

  getSortQuery = (q) => {
    this.setState({ sortQuery: q })
    console.log(this.state.sortQuery);
  }

  componentDidMount() {
    this.refreshRacks();
    
  }
    
  refreshRacks = () => {
    axios.get('/api/racks/').then(res => {
      this.setState({ 
        racks: res.data.results,
        prevPage: res.data.previous,
        nextPage: res.data.next,
      });

      console.log(this.state.racks);
    })
    .catch(function (error) {
      // TODO: handle error
      console.log(error.response);
    });
  }

  paginateNext = () => {
    console.log("next has been pushed");
    this.state.racks = null;
    axios.get(this.state.nextPage).then(res => {
      this.setState({ 
        racks: res.data.results,
        prevPage: res.data.previous,
        nextPage: res.data.next,
      });

      console.log(this.state.racks);

    })
    .catch(function (error) {
      // TODO: handle error
      console.log(error.response);
    });

    console.log(this.state.racks);
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
      console.log(error.response);
    });
  }

  render() { 
    let content; 

    console.log("render again");
    console.log(this.state);

   // let sorting = <InstanceSort sendSortQuery={ this.getSortQuery } />

    if (this.state.showRacksView){
      content = 
        <RacksView rack={this.state.racks}
                  sendShowCreate={this.getShowCreate}
                  sendShowMassCreate={this.getShowMassCreate}
                  sendShowMassDelete={this.getShowMassDelete}
                  sendShowEdit={this.getShowEdit}
                  sendEditID={this.getEditID}
                  sendShowDelete={this.getShowDelete} />
    }
    else if (this.state.showCreateView){
        content = <CreateRackForm sendShowTable={this.getShowRacks} /> 
    }
    else if (this.state.showMassCreateView){
      content = <CreateMultipleRacksForm sendShowTable={this.getShowRacks} /> 
    }
    else if (this.state.showMassDeleteView){
      content = <DeleteMultipleRacksForm sendShowTable={this.getShowRacks} /> 
    }
    else if (this.state.showEditView){
        content= <EditRackForm editID={this.state.editID} 
                    sendShowTable={ this.getShowRacks } 
                    sendShowCreate={this.getShowCreate}
                    sendShowMassCreate={this.getShowMassCreate}
                    sendShowMassDelete={this.getShowMassDelete}
                    sendShowEdit={this.getShowEdit}
                    sendShowDelete={this.getShowDelete}/> 
    }

    let paginateNavigation = <p><RackFilters sendFilterQuery={ this.getFilterQuery } /></p>;
    if (this.state.prevPage == null && this.state.nextPage != null) {
      paginateNavigation = <div><button onClick={ this.paginateNext }>next page</button></div>;
    } 
    else if (this.state.prevPage != null && this.state.nextPage == null) {
      paginateNavigation = <div><button onClick={ this.paginatePrev }>prev page</button></div>;
    }
    else if (this.state.prevPage != null && this.state.nextPage != null) {
      paginateNavigation = <div><button onClick={ this.paginatePrev }>prev page</button><button onClick={ this.paginateNext }>next page</button></div>;
    }

    // if we're not on the table, then don't show pagination
    if (! this.state.showRacksView) {
      paginateNavigation = <p></p>;
    }
  
      return (
        <div>
          { paginateNavigation }
            {content}
        </div>
      )
    }
  }
//}

export default RackController