import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import {
  Collapse, Table, TableBody, Button, TableCell, TableContainer, TableRow, Toolbar,
  Typography, Paper, IconButton, Tooltip, TableSortLabel
} from "@material-ui/core";
import PageviewIcon from '@material-ui/icons/Pageview';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import ModelFilters from './ModelFilters';
import '../stylesheets/TableView.css'
import axios, { post } from 'axios'
import { Link } from 'react-router-dom'
import DatacenterContext from './DatacenterContext';

axios.defaults.xsrfHeaderName = "X-CSRFToken";

export class DatacenterTable extends Component {
  constructor() {
    super();

    this.state = {
      dense: false,
    }
  }


    showDeleteForm = (id) => {
        if (window.confirm('Are you sure you want to delete?')) {
          let dst = '/api/datacenters/'.concat(id).concat('/');
          axios.delete(dst)
            .then(function (response) {
              alert('Delete was successful');
              window.location = '/';
            })
            .catch(function (error) {
              alert('Delete was not successful.\n Check datacenter or offline storage site for racks and assets');
            });
        }
      }

  renderTableToolbar = () => {
    return (
      <Toolbar>
        {
          <Typography style={{ flex: '1 1 20%' }} variant="h6" id="modelTableTitle">
            Datacenters
              </Typography>
        }
      </Toolbar>
    );
  };

  renderTableHeader() {
    let headCells = [
      { id: 'name', label: 'Name' },
      { id: 'abbreviation', label: 'Abbreviation' },
    ];

    return headCells.map(headCell => (
      <TableCell
        key={headCell.id}
        align={'center'}
        padding={'default'}

      >
        {headCell.label.toUpperCase()}
      </TableCell>
    ))
  }

  renderTableData() {
    // console.log(this.context);
    if (this.props.datacenters.length == 0) return (
      <TableRow hover tabIndex={-1}>
        <TableCell align="center" colSpan={12}>No entries</TableCell>
      </TableRow>
    )
    return this.props.datacenters.map((datacenter, index) => {
      const { id, abbreviation, name } = datacenter //more destructuring
      return (
        <TableRow
          hover
          tabIndex={-1}
          key={id}
        >
          <TableCell align="center">{name}</TableCell>
          <TableCell align="center">{abbreviation}</TableCell>
          <div>
            {
              (
                this.context.is_admin
                || this.context.username === 'admin'
                || this.context.global_asset_permission
              )
                ? (
                  <TableCell align="right">
                    <Link to={'/datacenters/' + id + '/edit'}>
                      <Tooltip title='Edit'>
                        <IconButton size="sm">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Link>
                  </TableCell>) : <p></p>
            }
            {
              (
                this.context.is_admin
                || this.context.username === 'admin'
                || this.context.global_asset_permission
              )
                ? (
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

  render() {
    return (
      <div>
        <Paper>
          {this.renderTableToolbar()}
          <TableContainer>
            <Table
              size="small"
              aria-labelledby="datacenterTableTitle"
              aria-label="enhanced table"
            >
              <TableRow>{this.renderTableHeader()}</TableRow>

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

// DatacenterTable.propTypes = {
//     datacenter: PropTypes.array.isRequired
// }
DatacenterTable.contextType = DatacenterContext;
export default DatacenterTable;
