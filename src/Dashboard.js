import React, { Component } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress, IconButton,
  DialogTitle, DialogContent, TableBody, Table, AppBar, Toolbar, Typography,
  TableContainer, TableHead, TableRow, TableCell, Box, Grid
} from '@material-ui/core';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
import { withRouter } from './utils';
import axios from 'axios';
import styles from './testerInfo.css';
import moment from 'moment';
import Sidebar from './Sidebar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

function formatDate(date) {
  const dateObj = new Date(date);
  const formattedDate = moment(dateObj).format('DD-MM-YYYY');
  return formattedDate;
}

//import { plugin } from 'mongoose';

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return '#7c9885';
    case 'In Progress':
      return '#eaac8b';
    case 'Pending':
      return '#e56b6f';
    case 'Released':
      return '#b5b682';
    case 'Exp Next Itr':
      return '#a69cac';
    case 'Subs Itr rel':
      return '#6be5e1';
    case 'Stopped':
      return '#e56b6f'
    case 'Withdrawn':
      return '#e56b6f'
    default:
      return 'transparent';
  }
};
class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openProductModal: false,
      openProductEditModal: false,
      id: '',
      name: '',
      customer: '',
      newCol1: '',
      newCol2: '',
      accType: '',
      orderType: '',
      platform: '',
      reqDate: '',
      submissionDate: '',
      startDate: '',
      endDate: '',
      rolloverDate: '',
      rolloverDays: '',
      rolloverDaysH: '',
      waitingDays: '',
      waitingDaysH: '',
      testingDays: '',
      testingDaysH: '',
      config: '',
      status: '',
      testedBy: '',
      rel: '',
      reportNo: '',
      releaseDate: '',
      reviewedBy: '',
      codeCompare: '',
      newFW: '',
      tBugs: '',
      submissionReason: '',
      page: 1,
      search: '',
      customerSearch: '',
      products: [],
      pages: 0,
      loading: false,
      rowOpen: -1,
      expanded: {}
    };
  }

  handleRowClick = (e, product) => {
    const index = this.state.products.indexOf(product);
    const expanded = { ...this.state.expanded };
    if (expanded[index]) {
      expanded[index] = false;
    } else {
      Object.keys(expanded).forEach(key => {
        expanded[key] = false;
      });
      expanded[index] = true;
    }
    this.setState({ expanded });
  };

  handleProductEditClose = () => {
    this.setState({ openProductEditModal: false });
  };


  componentDidMount = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getProduct();
      });
    }
  }

  getProduct = () => {
    this.setState({ loading: true });
    let data = '?';
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}&searchFields=customer,name,platform,config,testedBy`;
    }

    axios.get(`http://localhost:2000/get-product${data}`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ loading: false, products: res.data.products, pages: res.data.pages });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, products: [], pages: 0 }, () => { });
    });
  } 
  

  deleteProduct = (id) => {
    axios.post('http://localhost:2000/delete-product', {
      id: id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'token': this.state.token
      }
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.setState({ page: 1 }, () => {
        this.pageChange(null, 1);
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  pageChange = (e, page) => {
    this.setState({ page: page }, () => {
      this.getProduct();
    });
  }

  logOut = () => {
    localStorage.setItem('token', null);
    this.props.navigate("/");
  }



  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => { });
    if (e.target.name == 'search') {
      this.setState({ page: 1 }, () => {
        this.getProduct();
      });
    }
  };
  
 
  addProduct = () => {
    const product = {
      name: this.state.name,
      customer: this.state.customer,
      accType: this.state.accType,
      orderType: this.state.orderType,
      newCol1: this.state.newCol1,
      newCol2: this.state.newCol2,
      platform: this.state.platform,
      reqDate: this.state.reqDate,
      submissionDate: this.state.submissionDate,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      rolloverDate: this.state.rolloverDate,
      rolloverDays: this.state.rolloverDays,
      rolloverDaysH: this.state.rolloverDaysH,
      waitingDays: this.state.waitingDays,
      waitingDaysH: this.state.waitingDaysH,
      testingDays: this.state.testingDays,
      testingDaysH: this.state.testingDaysH,
      config: this.state.config,
      status: this.state.status,
      testedBy: this.state.testedBy,
      rel: this.state.rel,
      reportNo: this.state.reportNo,
      releaseDate: this.state.releaseDate,
      reviewedBy: this.state.reviewedBy,
      codeCompare: this.state.codeCompare,
      newFW: this.state.newFW,
      tBugs: this.state.tBugs,
      submissionReason: this.state.submissionReason
    };

    axios.post('http://localhost:2000/add-product', product, {
      headers: {
        'content-type': 'application/json',
        'token': this.state.token
      }
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.handleProductClose();
      this.setState({ name: '', customer: '', accType: '', orderType: '', newCol1: '', newCol2: '', platform: '',reqDate: '', submissionDate: '', startDate: '', endDate: '', rolloverDate: '', rolloverDays: '', rolloverDaysH: '', waitingDays: '', waitingDaysH: '', testingDays: '', testingDaysH: '',  config: '', status: '', testedBy: '', rel: '', reportNo: '',releaseDate: '', reviewedBy: '',codeCompare: '', newFW: '', tBugs: '', submissionReason: '', page: 1 }, () => {
        this.getProduct();
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handleProductClose();
    }).catch((err) => {
      console.error("Error adding product:", err);
      swal({
        text: "Something went wrong! Please try again later.",
        icon: "error",
        type: "error"
      });
      this.handleProductClose();
    });

  }

  updateProduct = () => {
    const product = {
      id: this.state.id,
      name: this.state.name,
      customer: this.state.customer,
      accType: this.state.accType,
      orderType: this.state.orderType,
      newCol1: this.state.newCol1,
      newCol2: this.state.newCol2,
      platform: this.state.platform,
      reqDate: this.state.reqDate,
      submissionDate: this.state.submissionDate,
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      rolloverDate: this.state.rolloverDate,
      rolloverDays: this.state.rolloverDays,
      rolloverDaysH: this.state.rolloverDaysH,
      waitingDays: this.state.waitingDays,
      waitingDaysH: this.state.waitingDaysH,
      testingDays: this.state.testingDays,
      testingDaysH: this.state.testingDaysH,
      config: this.state.config,
      status: this.state.status,
      testedBy: this.state.testedBy,
      rel: this.state.rel,
      reportNo: this.state.reportNo,
      releaseDate: this.state.releaseDate,
      reviewedBy: this.state.reviewedBy,
      codeCompare: this.state.codeCompare,
      newFW: this.state.newFW,
      tBugs: this.state.tBugs,
      submissionReason: this.state.submissionReason
      
    };

    axios.post('http://localhost:2000/update-product', product, {
      headers: {
        'content-type': 'application/json',
        'token': this.state.token
      }
    }).then((res) => {
      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.handleProductEditClose();
      this.setState({ name: '', customer: '', accType: '', orderType: '',newCol1: '', newCol2: '', platform: '',reqDate: '', submissionDate: '', startDate: '', endDate: '', rolloverDate: '', rolloverDays: '', rolloverDaysH: '', waitingDays: '', waitingDaysH: '', testingDays: '', testingDaysH: '',  config: '', status: '', testedBy: '', rel: '', reportNo: '', releaseDate: '', reviewedBy: '',codeCompare: '', newFW: '', tBugs: '', submissionReason: '', page: 1 }, () => {
        this.getProduct();
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handleProductEditClose();
    });

  }

  
  handleProductOpen = () => {
    this.setState({
      openProductModal: true,
      id: '',
      name: '',
      customer: '',
      accType: '',
      orderType: '',
      newCol1: '',
      newCol2: '',
      platform: '',
      reqDate: '',
      submissionDate: '',
      startDate: '',
      endDate: '',
      rolloverDate: '',
      rolloverDays: '',
      rolloverDaysH: '',
      waitingDays: '',
      waitingDaysH: '',
      testingDays: '',
      testingDaysH: '',
      config: '',
      status: '',
      testedBy: '',
      rel: '',
      reportNo: '',
      releaseDate: '',
      reviewedBy: '',
      codeCompare: '',
      newFW: '',
      tBugs: '',
      submissionReason: ''
    });
  };
  
  handleProductClose = () => {
    this.setState({ openProductModal: false });
  };
  
  handleProductEditOpen = (data) => {
    this.setState({
      openProductEditModal: true,
      id: data._id,
      name: data.name,
      customer: data.customer,
      accType: data.accType,
      orderType: data.orderType,
      newCol1: data.newCol1,
      newCol2: data.newCol2,
      platform: data.platform,
      reqDate: data.reqDate,
      submissionDate: data.submissionDate,
      startDate: data.startDate,
      endDate: data.endDate,
      rolloverDate: data.rolloverDate,
      rolloverDays: data.rolloverDays,
      rolloverDaysH: data.rolloverDaysH,
      waitingDays: data.waitingDays,
      waitingDaysH: data.waitingDaysH,
      testingDays: data.testingDays,
      testingDaysH: data.testingDaysH,
      config: data.config,
      status: data.status,
      testedBy: data.testedBy,
      rel: data.rel,
      reportNo: data.reportNo,
      releaseDate: data.releaseDate,
      reviewedBy: data.reviewedBy,
      codeCompare: data.codeCompare,
      newFW: data.newFW,
      tBugs: data.tBugs,
      submissionReason: data.submissionReason
    });
  };

  handleProductEditClose = () => {
    this.setState({ openProductEditModal: false });
  };


  render() {
    const { role } = this.props;
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <AppBar position="static" style={{ backgroundColor: '#2b2b2b' }}>
  <Toolbar>
  <IconButton edge="start" color="inherit" aria-label="back" onClick={() => window.history.back()}>
    <ArrowBackIcon />
  </IconButton>
    <Typography variant="h6" className="title">
      Superuser Dashboard
    </Typography>
    <Box flexGrow={1} />
    <Button
      className="button_style"
      variant="contained"
      size="small"
      onClick={this.logOut}
    >
      Log Out
    </Button>
  </Toolbar>
</AppBar>

{/* {role === 'superuser' && (
<Sidebar/>
)} */}
      

        {/* Edit Product */}
        <Dialog
          open={this.state.openProductEditModal}
          onClose={this.handleProductEditClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          maxWidth="xl"
          PaperProps={{
            style: {
              maxWidth: '2500px' // Adjust the width as needed
            }
          }}
        >
          <DialogTitle id="alert-dialog-title">Edit Product</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              label= "Product Name:"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Customer:"
              type="text"
              autoComplete="off"
              name="customer"
              value={this.state.customer}
              onChange={this.onChange}
              
              
              // required
            /><br />
            
            <TextField
              id="standard-basic"
              label= "Account Type:"
              type="text"
              autoComplete="off"
              name="accType"
              value={this.state.accType}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Order Type:"
              type="text"
              autoComplete="off"
              name="orderType"
              value={this.state.orderType}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Utility:"
              type="text"
              autoComplete="off"
              name="newCol1"
              value={this.state.newCol1}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Comms:"
              type="text"
              autoComplete="off"
              name="newCol2"
              value={this.state.newCol2}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Platform:"
              type="text"
              autoComplete="off"
              name="platform"
              value={this.state.platform}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Configuration:"
              type="text"
              autoComplete="off"
              name="config"
              value={this.state.config}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Status:"
              type="text"
              autoComplete="off"
              name="status"
              value={this.state.status}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Tested By:"
              type="text"
              autoComplete="off"
              name="testedBy"
              value={this.state.testedBy}
              onChange={this.onChange}
              
              // required
            /><br />
            
            <TextField
              id="standard-basic"
              label= "Request Date:"
              type="date"
              autoComplete="off"
              name="reqDate"
              value={this.state.reqDate}
              onChange={this.onChange}
            
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Submission Date:"
              type="date"
              autoComplete="off"
              name="submissionDate"
              value={this.state.submissionDate}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Start Date:"
              type="date"
              autoComplete="off"
              name="startDate"
              value={this.state.startDate}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "End Date:"
              type="date"
              autoComplete="off"
              name="endDate"
              value={this.state.endDate}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Rollover Date:"
              type="date"
              autoComplete="off"
              name="rolloverDate"
              value={this.state.rolloverDate}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              // placeholder="rolloverDate"
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Rollover Days:"
              type="Number"
              autoComplete="off"
              name="rolloverDays"
              value={this.state.rolloverDays}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Rollover Days(H):"
              type="Number"
              autoComplete="off"
              name="rolloverDaysH"
              value={this.state.rolloverDaysH}
              onChange={this.onChange}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Waiting Days:"
              type="Number"
              autoComplete="off"
              name="waitingDays"
              value={this.state.waitingDays}
              onChange={this.onChange}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Waiting Days(H):"
              type="Number"
              autoComplete="off"
              name="waitingDaysH"
              value={this.state.waitingDaysH}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Testing Days:"
              type="Number"
              autoComplete="off"
              name="testingDays"
              value={this.state.testingDays}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Testing Days(H):"
              type="Number"
              autoComplete="off"
              name="testingDaysH"
              value={this.state.testingDaysH}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Release Number:"
              type="number"
              autoComplete="off"
              name="rel"
              value={this.state.rel}
              onChange={this.onChange}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Report Number:"
              type="text"
              autoComplete="off"
              name="reportNo"
              value={this.state.reportNo}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Release Date:"
              type="date"
              autoComplete="off"
              name="releaseDate"
              defaultValue={this.state.releaseDate} 
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Reiewed By:"
              type="text"
              autoComplete="off"
              name="reviewedBy"
              value={this.state.reviewedBy}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Code Compare:"
              type="text"
              autoComplete="off"
              name="codeCompare"
              value={this.state.codeCompare}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "New Firmware:"
              type="text"
              autoComplete="off"
              name="newFW"
              value={this.state.newFW}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Total Bugs:"
              type="number"
              autoComplete="off"
              name="tBugs"
              value={this.state.tBugs}
              onChange={this.onChange}
             
              // required
            /><br />
            <br />
            <TextField
              id="standard-basic"
              label= "Reason for Submission:"
              type="text"
              autoComplete="off"
              name="submissionReason"
              value={this.state.submissionReason}
              onChange={this.onChange}
             
              // required
            /><br /><br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductEditClose} color="primary">
              Cancel
            </Button>
            <Button              
              // disabled={this.state.name == '' || this.state.customer == '' || this.state.accType == '' || this.state.orderType == '' || this.state.newCol1 == '' || this.state.newCol2 == '' || this.state.platform == '' || this.state.reqDate == '' || this.state.submissionDate == '' || this.state.startDate == '' || this.state.endDate == '' || this.state.rolloverDate == '' || this.state.rolloverDays == '' || this.state.rolloverDaysH  == '' || this.state.waitingDays  == '' || this.state.waitingDaysH  == '' || this.state.testingDays  == '' || this.state.testingDaysH == '' || this.state.config == '' || this.state.status == '' || this.state.testedBy == '' || this.state.rel == '' || this.state.reportNo == '' || this.state.releaseDate == '' || this.state.reviewedBy == '' || this.state.codeCompare == '' || this.state.newFW == '' || this.state.tBugs == '' || this.state.submissionReason == ''}
              onClick={(e) => this.updateProduct()} color="primary" autoFocus>
              Edit Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Product */}
        <Dialog
          open={this.state.openProductModal}
          onClose={this.handleProductClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Product</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              label= "Product Name:"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Customer:"
              type="text"
              autoComplete="off"
              name="customer"
              value={this.state.customer}
              onChange={this.onChange}
              
              // required
            /><br />
            
            <TextField
              id="standard-basic"
              label= "Account Type:"
              type="text"
              autoComplete="off"
              name="accType"
              value={this.state.accType}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Order Type:"
              type="text"
              autoComplete="off"
              name="orderType"
              value={this.state.orderType}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Utility:"
              type="text"
              autoComplete="off"
              name="newCol1"
              value={this.state.newCol1}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Comms:"
              type="text"
              autoComplete="off"
              name="newCol2"
              value={this.state.newCol2}
              onChange={this.onChange}
              
              // required
            /><br />

            <TextField
              id="standard-basic"
              label= "Platform:"
              type="text"
              autoComplete="off"
              name="platform"
              value={this.state.platform}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Configuration:"
              type="text"
              autoComplete="off"
              name="config"
              value={this.state.config}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Status:"
              type="text"
              autoComplete="off"
              name="status"
              value={this.state.status}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Tested By:"
              type="text"
              autoComplete="off"
              name="testedBy"
              value={this.state.testedBy}
              onChange={this.onChange}
              
              // required
            /><br />
            
            <TextField
              id="standard-basic"
              label= "Request Date:"
              type="date"
              autoComplete="off"
              name="reqDate"
              value={this.state.reqDate}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Submission Date:"
              type="date"
              autoComplete="off"
              name="submissionDate"
              value={this.state.submissionDate}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Start Date:"
              type="date"
              autoComplete="off"
              name="startDate"
              value={this.state.startDate}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "End Date:"
              type="date"
              autoComplete="off"
              name="endDate"
              value={this.state.endDate}
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Rollover Date:"
              type="date"
              autoComplete="off"
              name="rolloverDate"
              //value={this.state.rolloverDate}
              defaultValue={this.state.rolloverDate} 
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Rollover Days:"
              type="Number"
              autoComplete="off"
              name="rolloverDays"
              value={this.state.rolloverDays}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Rollover Days(H):"
              type="Number"
              autoComplete="off"
              name="rolloverDaysH"
              value={this.state.rolloverDaysH}
              onChange={this.onChange}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Waiting Days:"
              type="Number"
              autoComplete="off"
              name="waitingDays"
              value={this.state.waitingDays}
              onChange={this.onChange}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Waiting Days(H):"
              type="Number"
              autoComplete="off"
              name="waitingDaysH"
              value={this.state.waitingDaysH}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Testing Days:"
              type="Number"
              autoComplete="off"
              name="testingDays"
              value={this.state.testingDays}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Testing Days(H):"
              type="Number"
              autoComplete="off"
              name="testingDaysH"
              value={this.state.testingDaysH}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Release Number:"
              type="number"
              autoComplete="off"
              name="rel"
              value={this.state.rel}
              onChange={this.onChange}
             
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Report Number:"
              type="text"
              autoComplete="off"
              name="reportNo"
              value={this.state.reportNo}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Release Date:"
              type="date"
              autoComplete="off"
              name="releaseDate"              
              defaultValue={this.state.releaseDate} 
              onChange={this.onChange}
              InputLabelProps={{
                shrink: true,  // This is necessary to keep the label visible even when there is a date value
            }}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Reiewed By:"
              type="text"
              autoComplete="off"
              name="reviewedBy"
              value={this.state.reviewedBy}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Code Compare:"
              type="text"
              autoComplete="off"
              name="codeCompare"
              value={this.state.codeCompare}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "New Firmware:"
              type="text"
              autoComplete="off"
              name="newFW"
              value={this.state.newFW}
              onChange={this.onChange}
              
              // required
            /><br />
            <TextField
              id="standard-basic"
              label= "Total Bugs:"
              type="number"
              autoComplete="off"
              name="tBugs"
              value={this.state.tBugs}
              onChange={this.onChange}
             
              // required
            /><br />
            <br />
            <TextField
              id="standard-basic"
              label= "submissionReason:"
              type="text"
              autoComplete="off"
              name="submissionReason"
              value={this.state.submissionReason}
              onChange={this.onChange}
             
              // required
            /><br /><br />
          </DialogContent>      


          <DialogActions>
            <Button onClick={this.handleProductClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.customer == '' || this.state.accType == '' || this.state.orderType == '' || this.state.newCol1 == '' || this.state.newCol2 == '' || this.state.platform == '' || this.state.reqDate == '' || this.state.submissionDate == '' || this.state.startDate == '' || this.state.endDate == '' || this.state.rolloverDate == '' || this.state.rolloverDays  == '' || this.state.rolloverDaysH  == '' || this.state.waitingDays  == '' || this.state.waitingDaysH  == '' || this.state.testingDays  == '' || this.state.testingDaysH == '' || this.state.config == '' || this.state.status == '' || this.state.testedBy == '' || this.state.rel == '' || this.state.reportNo == '' || this.state.releaseDate == '' || this.state.reviewedBy == '' || this.state.codeCompare == '' || this.state.newFW == '' || this.state.submissionReason == '' || this.state.tBugs == '' }
              onClick={(e) => this.addProduct()} color="primary" autoFocus>
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        <div>
          <br/>
        </div>

        <Grid container spacing={2} alignItems= "flex-start">
          <Grid item xs={12} alignItems= "flex-start">
            <TextField
              id="standard-basic"
              className="no-printme"
              type="search"
              autoComplete="off"
              name="search"
              value={this.state.search}
              onChange={this.onChange}
              placeholder="Search by meter ver/ customer/ platform/ config/ testedBy"
              style={{ width: '25%' }}
              required
            />            
          </Grid>
          
          

          <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-start">
          <div className="no-printme">
            <Button
              className="button_style"
              variant="contained"
              color="primary"
              size="small"
              onClick={this.handleProductOpen}
              style={{ backgroundColor: '#2b2b2b' }}
            >
              + Add Product
            </Button>
          </div>
      <Typography variant="body2" className="spacer">
        &nbsp;
      </Typography>
    </Box>
  </Grid>
</Grid>

        {/* Product Table */}
        <br />
        <TableContainer>
          <Table striped>
            <TableHead>
              <TableRow>   
                <TableCell><span></span></TableCell>             
                <TableCell style={{ fontWeight: 'bold' }}>Meter Version</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Account Type</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Order Type</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Utility</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Comms</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Platform</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Configuration</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Tested By</TableCell>
                <TableCell style={{ fontWeight: 'bold', width: "100%"}}>Request Date</TableCell>
                <TableCell style={{ fontWeight: 'bold', width: "100%" }}>Submission Date</TableCell>
                <TableCell style={{ fontWeight: 'bold', width: "20%" }}>Start Date</TableCell>
                <TableCell style={{ fontWeight: 'bold', width: "20%" }}>End Date</TableCell>
                <TableCell style={{ fontWeight: 'bold', width: "20%" }}>Rollover Date</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Rollover Days(H)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Rollover Days</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Waiting Days(H)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Waiting Days</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Testing Days(H)</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Testing Days</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Release Number</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Report Number</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Release Date</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Reviewed By</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Code Compare</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>New Firmware</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Total Bugs</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Submission Reason</TableCell>
                {/* {username === 'admin' && ( */}
                <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
                {/* )} */}
              </TableRow>
            </TableHead>

            <TableBody>
              {this.state.products.map((product, index) => (
                
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>
                    {/* <IconButton onClick={(e) => this.handleRowClick(e,product)}>
                      <KeyboardArrowDown />
                    </IconButton> */}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.customer}</TableCell>
                    <TableCell>{product.accType}</TableCell>
                    <TableCell>{product.orderType}</TableCell>
                    <TableCell>{product.newCol1}</TableCell>
                    <TableCell>{product.newCol2}</TableCell>
                    <TableCell>{product.platform}</TableCell>
                    <TableCell>{product.config}</TableCell>
                    <TableCell>
                      <span style={{
                        display: 'inline-block',
                        padding: '5px',
                        borderRadius: '5px',
                        backgroundColor: product.status === 'Completed' ? '#7c9885' :
                          product.status === 'In Progress' ? '#eaac8b' :
                          product.status === 'Pending' ? '#bd8f97' : 
                          product.status === 'Exp Next Itr' ? '#a69cac' : 
                          product.status === 'In Progress' ? '#eaac8b' :
                          product.status === 'Subs Itr rel' ? '#778899' :
                          product.status === 'Released' ? '#72938c' : 
                          product.status === 'Stopped' ? '#bd8f97' :
                          product.status === 'Withdrawn' ? '#e56b6f':'transparent',
                        color: 'white', // Set text color to white for better readability
                      }}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell>{product.testedBy}</TableCell>
                    <TableCell>{formatDate(product.reqDate)}</TableCell>
                    <TableCell>{formatDate(product.submissionDate)}</TableCell>
                    <TableCell>{formatDate(product.startDate)}</TableCell>
                    <TableCell>{formatDate(product.endDate)}</TableCell>
                    <TableCell>{formatDate(product.rolloverDate)}</TableCell>
                    <TableCell>{product.rolloverDays}</TableCell>
                    <TableCell>{product.rolloverDaysH}</TableCell>
                    <TableCell>{product.waitingDays}</TableCell>
                    <TableCell>{product.waitingDaysH}</TableCell>
                    <TableCell>{product.testingDays}</TableCell>
                    <TableCell>{product.testingDaysH}</TableCell>
                    <TableCell>{product.rel}</TableCell>
                    <TableCell>{product.reportNo}</TableCell>
                    <TableCell>{formatDate(product.releaseDate)}</TableCell>
                    <TableCell>{product.reviewedBy}</TableCell>
                    <TableCell>{product.codeCompare}</TableCell>
                    <TableCell>{product.newFW}</TableCell>
                    <TableCell>{product.tBugs}</TableCell>
                    <TableCell>{product.submissionReason}</TableCell>
                    
                    {/* {username === 'admin' && ( */}
                      <TableCell>
                      <div style={{display: 'flex', justifyContent: 'space-between'}} >
                        <Button
                          className="button_style"
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => this.handleProductEditOpen(product)}
                          style={{ marginRight: '5px',backgroundColor: '#355070'}}
                        >
                          Edit
                        </Button>
                        <Button
                          className="button_style"
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => this.deleteProduct(product._id)}
                          style={{ backgroundColor: '#b56576'}}
                        >
                          Delete
                        </Button>
                      </div>
                      </TableCell>
                    {/* )} */}
                    
                  </TableRow>
                  {this.state.expanded[index] && (
                    <div style={{fontFamily: 'sans-serif', textAlign: "left", fontSize: "14px"}}>
                    <div><span><b>Name:</b></span>&nbsp;<span>{product.name}</span></div>
                    <div><span><b>Customer:</b></span>&nbsp;<span>{product.customer}</span></div>
                    <div><span><b>AccType:</b></span>&nbsp;<span>{product.accType}</span></div>
                    <div><span><b>OrderType:</b></span>&nbsp;<span>{product.orderType}</span></div>
                    <div><span><b>AccType:</b></span>&nbsp;<span>{product.accType}</span></div>
                    <div><span><b>Utility:</b></span>&nbsp;<span>{product.newCol1}</span></div>
                    <div><span><b>Comms:</b></span>&nbsp;<span>{product.newCol2}</span></div>
                    <div><span><b>Platform:</b></span>&nbsp;<span>{product.platform}</span></div>
                    <div><span><b>Config:</b></span>&nbsp;<span>{product.config}</span></div>
                    <div><span><b>Status:</b></span><span><span className={styles.status} style={{backgroundColor: getStatusColor(product.status),}}>{product.status}</span></span></div>
                    <div><span><b>Tested By:</b></span>&nbsp;<span>{product.testedBy}</span></div>
                    <div><span><b>Req Date:</b></span>&nbsp;<span>{formatDate(product.reqDate)}</span></div>
                    <div><span><b>Sub Date:</b></span>&nbsp;<span>{formatDate(product.submissionDate)}</span></div>
                    <div><span><b>Start Date:</b></span>&nbsp;<span>{formatDate(product.startDate)}</span></div>
                    <div><span><b>End Date:</b></span>&nbsp;<span>{formatDate(product.endDate)}</span></div>
                    <div><span><b>Rollover Date:</b></span>&nbsp;<span>{formatDate(product.rolloverDate)}</span></div>
                    <div><span><b>Rollover Days:</b></span>&nbsp;<span>{product.rolloverDays}</span></div>
                    <div><span><b>Rollover DaysH:</b></span>&nbsp;<span>{product.rolloverDaysH}</span></div>
                    <div><span><b>Waiting Days:</b></span>&nbsp;<span>{product.waitingDays}</span></div>
                    <div><span><b>Waiting DaysH:</b></span>&nbsp;<span>{product.waitingDaysH}</span></div>
                    <div><span><b>Testing Days:</b></span>&nbsp;<span>{product.testingDays}</span></div>
                    <div><span><b>Testing DaysH:</b></span>&nbsp;<span>{product.testingDaysH}</span></div>
                    <div><span><b>Release:</b></span>&nbsp;<span>{product.rel}</span></div>
                    <div><span><b>Report No.:</b></span>&nbsp;<span>{product.reportNo}</span></div>
                    <div><span><b>Release Date:</b></span>&nbsp;<span>{product.releaseDate}</span></div>
                    <div><span><b>Reviewed By:</b></span>&nbsp;<span>{product.reviewedBy}</span></div>
                    <div><span><b>Code Compare:</b></span>&nbsp;<span>{product.codeCompare}</span></div>
                    <div><span><b>New Firmware:</b></span>&nbsp;<span>{product.newFW}</span></div>
                    <div><span><b>Total Bugs:</b></span>&nbsp;<span>{product.tBugs}</span></div>
                    <div><span><b>Reason for Submission:</b></span>&nbsp;<span>{product.submissionReason}</span></div>
                  </div>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          count={this.state.pages}
          page={this.state.page}
          onChange={this.pageChange}
          color="#2b2b2b"
        />
      </div>
    );
  }
}
export default withRouter(Dashboard);

