import React, { Component } from 'react'
import '../stylesheets/TableView.css'
import axios from 'axios'
import InstanceFilters from './InstanceFilters';


export class InstanceTable extends Component {

  constructor() {
    super();
    //this.passUP = this.showDetailedInstance.bind(this);
  }

  showDetailedInstance = (id) => {
    this.props.sendShowDetailedInstance(true);
    this.props.sendInstanceID(id);
  }

  showCreateForm = () => {
		this.props.sendShowCreate(true);
  }

  showEditForm = (id) => {
    this.props.sendShowEdit(true);
    this.props.sendEditID(id);
  }
 
  showDeleteForm = (id) => {
    if (window.confirm('Are you sure you want to delete?')) {
      let dst = '/api/instances/'.concat(id).concat('/');
      axios.delete(dst)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        // TODO: handle error
        console.log(error.response);
      });
    }
  }

  renderTableHeader() {
    let header = ['id', 'model vendor', 'model number', 'hostname', 'rack', 'rack_u', 'owner_username'];
    return header.map((key, index) => {
        return <th key={index}>{key.toUpperCase()}</th>
    })
  }

  renderTableData() {
    return this.props.instances.map((instance) => {
        const { id, model, hostname, rack, owner, rack_u } = instance //destructuring
        
        return (
          <tr key={id}>
            <td>{id}</td>
            <td>{model ? model.vendor : null}</td>
            <td>{model ? model.model_number : null}</td>
            <td>{hostname}</td>
            <td>{rack ? rack.rack_number : null}</td>
            <td>{rack_u}</td>
            <td>{owner ? owner.username : null}</td>
            <td><button onClick={ () => this.showDetailedInstance(id) }>More details</button></td>
            <td><button onClick={ () => this.showEditForm(id) }>Edit</button></td>
            <td><button onClick={ () => this.showDeleteForm(id) }>Delete</button></td>
          </tr>
        )
    })
  }

  render() {
    return (
        <div>
          <div>
            <button onClick={ this.showCreateForm }>Add Instance</button>
          </div>

          <table id="entries">
              <tbody>
                <tr>{this.renderTableHeader()}</tr>
                { this.renderTableData() }
              </tbody>
          </table>
        </div>
    )
  }
}

export default InstanceTable