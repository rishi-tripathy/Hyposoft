import React, { Component } from 'react'
import axios from 'axios'
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export class CreateUserForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      email: '',
      first_name: '',
      last_name:'',
      password: ''
    }
  }

  handleUsernameChange = (event) => {
    this.setState({
      username: event.target.value
    });
  }

  handleFirstNameChange = (event) => {
    this.setState({
      first_name: event.target.value
    });
  }

  handleLastNameChange = (event) => {
    this.setState({
      last_name: event.target.value
    });
  }

  handleEmailChange = (event) => {
    this.setState({
      email: event.target.value
    });
  }

  handlePasswordChange = (event) => {
    this.setState({
      password: event.target.value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    console.log(this.state);

    axios.post('/api/users/', this.state)
    .then(function (response) {
      alert('Created successfully');
    })
    .catch(function (error) {
      alert('Creation was not successful.\n' + JSON.stringify(error.response.data));
    });

    this.props.sendShowTable(true);
  }

  render() {
    return (
      <form onSubmit={ this.handleSubmit }>
        <div>
          <label>Username</label>
          <input type='text' value={ this.state.username } onChange={ this.handleUsernameChange } />
        </div>
        <div>
          <label>First name</label>
          <input type='text' value={ this.state.first_name } onChange={ this.handleFirstNameChange } />
        </div>
        <div>
          <label>Last name</label>
          <input type='text' value={ this.state.last_name } onChange={ this.handleLastNameChange } />
        </div>
        <div>
          <label>Email</label>
          <input type='text' value={ this.state.email } onChange={ this.handleEmailChange } />
        </div>
        <div>
          <label>Password</label>
          <input type='password' value={ this.state.password } onChange={ this.handlePasswordChange } />
        </div>
        <button type="submit">Create</button>
      </form>
    )
  }
}

export default CreateUserForm
