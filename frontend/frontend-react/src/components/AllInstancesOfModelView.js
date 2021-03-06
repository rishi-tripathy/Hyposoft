import React, {Component} from 'react'
import axios from 'axios'
// import { Button, Table } from '@material-ui/core'
import { Link } from 'react-router-dom'
import {
  Collapse, Table, TableBody, Button, TableCell, TableContainer, TableRow, Toolbar,
  Typography, Paper, IconButton, Tooltip
} from "@material-ui/core";
import PageviewIcon from '@material-ui/icons/Pageview';

 
axios.defaults.xsrfHeaderName = "X-CSRFToken";


export class AllInstancesOfModelView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      assets: [{}]
    }
  }

  showDetailedInstance = (id) => {
    this.props.sendShowDetailedInstance(true);
    this.props.sendInstanceID(id);
  }

  loadInstances = () => {
    if (this.props.modelID) {
      let dst = '/api/models/'.concat(this.props.modelID).concat('/assets/');
      console.log(dst)
      axios.get(dst).then(res => {
        this.setState({
          assets: res.data.results
        });
      })
        .catch(function (error) {
          // TODO: handle error
          alert('Cannot load instances. Re-login..\n' + JSON.stringify(error.response.data, null, 2));
        });
    }
  }

  componentDidMount() {
    this.loadInstances();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.modelID !== this.props.modelID) {
      this.loadInstances();
    }
  }

  renderTableHeader() {
    let headCells = [
      { id: 'rack', numeric: false, disablePadding: false, label: 'Rack' },
      { id: 'rack_u', numeric: true, disablePadding: false, label: 'Rack (U)' },
      { id: 'hostname', numeric: false, disablePadding: false, label: 'Hostname' },
    ];
    return headCells.map(headCell => (
      <TableCell
        key={headCell.id}
        align={'center'}
        padding={'default'}
      // sortDirection={orderBy === headCell.id ? order : false}
      >
        {headCell.label.toUpperCase()}
      </TableCell>
    ))
  }

  renderTableData() {
    if (this.state.assets.length === 0) return (
      <TableRow hover tabIndex={-1} >
        <TableCell align="center" colSpan={3} >No entries</TableCell>
      </TableRow>
    )
    return this.state.assets.map((instance) => {
      const {id, model, hostname, rack, owner, rack_u} = instance //destructuring
      return (
        <TableRow
          hover
          tabIndex={-1}
          key={id}
        >
          <TableCell align="center">{rack ? rack.rack_number : null}</TableCell>
          <TableCell align="center">{rack_u}</TableCell>
          <TableCell align="center">{hostname}</TableCell>
          <TableCell align="right">
            <Link to={'/assets/' + id}>
              <Tooltip title='View Details'>
                <IconButton size="sm" >
                  <PageviewIcon />
                </IconButton>
              </Tooltip>
            </Link>
          </TableCell>   
        </TableRow>
      )
    })
  }

  render() {
    return (
      <div>
        <Paper>
          <TableContainer>
            <Table
              aria-labelledby="modelTableTitle"
              aria-label="enhanced table"
            >
              <TableRow>{this.renderTableHeader()}</TableRow>

              <TableBody>
                {this.renderTableData()}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        {/* <h3>Instances of this Model</h3> */}
      </div>
    )
  }
}

export default AllInstancesOfModelView
