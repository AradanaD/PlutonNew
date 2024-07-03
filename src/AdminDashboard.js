import React, { Component } from 'react';
import { TableBody, Table, TableContainer, TableHead, TableRow, TableCell, AppBar, Toolbar, Typography, Box, LinearProgress, Button, Grid, Paper } from '@material-ui/core';
import swal from 'sweetalert';
import axios from 'axios';
import { withRouter } from './utils'; // Import withRouter
import Chart from 'chart.js/auto';
import './AdminDashboard.css';  // Import the CSS file
import { NavLink } from 'react-router-dom'; // Import NavLink
import Sidebar from './Sidebar';
import moment from 'moment';
function formatDate(date) {
  const dateObj = new Date(date);
  const formattedDate = moment(dateObj).format('DD-MM-YYYY');
  return formattedDate;
}

class AdminDashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      products: [],
      loading: false,
      filter: 'All',
      charts: {
        barChart: null,
        pieChart: null,
        lineChart: null,
        donutChart: null,
      }
    };
    this.chartRefs = {
      barChart: React.createRef(),
      pieChart: React.createRef(),
      lineChart: React.createRef(),
      donutChart: React.createRef()
    };
    //this.logOut = this.logOut.bind(this);
  }
  
  getDateCounts = () => {
    const dateCounts = {};
    this.state.products.forEach((product) => {
      const date = new Date(product.submissionDate).toLocaleDateString();
      if (dateCounts[date]) {
        dateCounts[date] += 1;
      } else {
        dateCounts[date] = 1;
      }
    });
    return dateCounts;
  }

  getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#7c9885';
      case 'In Progress':
        return '#eaac8b';
      case 'Pending':
        return '#e56b6f';
      case 'Released':
        return '#72938c';
      case 'Exp Next Itr':
        return '#a69cac';
      case 'Subs Itr rel':
        return '#778899';
      case 'Stopped':
        return '#bd8f97'
      case 'Withdrawn':
        return '#e56b6f'
      default:
        return 'transparent';
    }
  };

  componentDidMount() {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getProduct();
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.products !== this.state.products) {
      this.updateCharts();
    }
  }

  getProduct = () => {
    this.setState({ loading: true });
    axios.get(`http://localhost:2000/graph-product`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      const filteredProducts = this.filterProducts(res.data.products);
      this.setState({ loading: false, products: filteredProducts });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, products: [] });
    });
  }

  logOut = () => {
    localStorage.setItem('token', null);
    //this.props.history.push("/"); // Use history for navigation
    this.props.navigate("/");
  }

  filterProducts = (products) => {
    const { filter } = this.state;
    if (filter === 'Order') {
      return products.filter(product => product.orderType === 'DLMS Order');
    } else if (filter === 'Tender') {
      return products.filter(product => product.orderType === 'DLMS Tender');
    }
    return products;
  }

  handleFilterChange = (filter) => {
    this.setState({ filter }, this.getProduct);
  }

  getStatusCounts = () => {
    const statusCounts = { complete: 0, inProgress: 0, pending: 0, released: 0, expnextitr: 0, subsitrrel: 0, stopped: 0, withdrawn: 0 };
    this.state.products.forEach((product) => {
      switch (product.status) {
        case 'Completed':
          statusCounts.complete += 1;
          break;
        case 'In Progress':
          statusCounts.inProgress += 1;
          break;
        case 'Pending':
          statusCounts.pending += 1;
          break;
        case 'Released':
          statusCounts.released += 1;
          break;
        case 'Exp Next Itr':
          statusCounts.expnextitr += 1;
          break;
        case 'Subs Itr rel':
          statusCounts.subsitrrel += 1;
          break;
        case 'Stopped':
          statusCounts.stopped += 1;
          break;
        case 'Withdrawn':
          statusCounts.withdrawn += 1;
          break;
        default:
          break;
      }
    });
    return statusCounts;
  }

  getAccTypeCounts = () => {
    const accTypeCounts = { 'TVM': 0, 'ENM': 0, 'SMART': 0 };
    this.state.products.forEach((product) => {
      const accType = product.accType.toUpperCase(); // Assuming 'accType' is the new field name
      if (accType.includes('TVM')) {
        accTypeCounts['TVM'] += 1;
      } else if (accType.includes('ENM')) {
        accTypeCounts['ENM'] += 1;
      } else if (accType.includes('SMART')) {
        accTypeCounts['SMART'] += 1;
      }
    });
    return accTypeCounts;
  }

  getTesterCounts = () => {
    const testerCounts = {};
    this.state.products.forEach((product) => {
      const testers = product.testedBy.split('/').filter(tester => tester !== '0'); // Exclude '0' from testers
      testers.forEach((tester) => {
        if (testerCounts[tester]) {
          testerCounts[tester] += 1;
        } else {
          testerCounts[tester] = 1;
        }
      });
    });
    return testerCounts;
  }

  updateCharts = () => {
    this.updateBarChart();
    this.updatePieChart();
    this.updateLineChart();
    this.updateDonutChart();
  }

  updateBarChart = () => {
    const statusCounts = this.getStatusCounts();
    const data = {
      labels: ['Completed', 'In Progress', 'Pending', 'Released', 'Exp Next Itr', 'Subs Itr rel', 'Stopped', 'Withdrawn'],
      datasets: [{
        label: 'Status Count',
        backgroundColor: ["#ccff00","#ffff66","#ff9966","#66ff66","#ce6edf","#16d0cb","#ff355e","#fd5b78"],
        data: [statusCounts.complete, statusCounts.inProgress, statusCounts.pending, statusCounts.released, statusCounts.expnextitr, statusCounts.subsitrrel, statusCounts.stopped, statusCounts.withdrawn]
      }]
    };

    this.createOrUpdateChart('bar', data, 'barChart');
  }

  updatePieChart = () => {
    const accTypeCounts = this.getAccTypeCounts(); // New function to get accType counts
    const data = {
      labels: Object.keys(accTypeCounts),
      datasets: [{
        label: 'Products by AccType',
        backgroundColor: ["#ffff66","#ff9966","#50bfe6"], // Define your colors here
        data: Object.values(accTypeCounts)
      }]
    };

    this.createOrUpdateChart('pie', data, 'pieChart');
  }

  updateLineChart = () => {
    const dateCounts = this.getDateCounts();
    const monthAverages = {}; // Object to store average testing days for each month

    // Calculate sum of testing days and occurrences of each month
    Object.keys(dateCounts).forEach((date) => {
      const submissionDate = new Date(date);
      const month = submissionDate.getMonth() + 1; // Get month from submissionDate
      const testingDays = dateCounts[date]; // Get testing days for the current month

      if (!monthAverages[month]) {
        monthAverages[month] = { sum: 0, count: 0 };
      }

      monthAverages[month].sum += testingDays; // Add testing days to sum
      monthAverages[month].count++; // Increment occurrence count
    });

    // Calculate average testing days for each month
    const monthLabels = []; // Labels for x-axis (months)
    const monthData = []; // Data for y-axis (average testing days)
    Object.keys(monthAverages).forEach((month) => {
      const monthName = this.getMonthName(month); // Convert month number to name
      const average = monthAverages[month].sum / monthAverages[month].count;
      monthLabels.push(monthName);
      monthData.push(average.toFixed(2)); // Round to 2 decimal places
    });

    // Create line chart data
    const data = {
      labels: monthLabels,
      datasets: [{
        label: 'Average Testing Days',
        backgroundColor: "#ce6edf",
        borderColor: "#ce6edf",
        fill: false,
        data: monthData
      }]
    };

    this.createOrUpdateChart('line', data, 'lineChart');
  }

  // Helper function to convert month number to name
  getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(monthNumber) - 1]; // Subtract 1 as array is zero-based
  }

  updateDonutChart = () => {
    const testerCounts = this.getTesterCounts(); // New function to get tester counts
    const colors = [
      "#ff355e","#fd5b78","#ff6037", "#ff9933","#ff9966","#ffcc33","#ffff66", "#ccff00", "#66ff66","#aaf0d1","#16d0cb","#50bfe6","#ce6edf","#ff00cc"];
    const data = {
      labels: Object.keys(testerCounts),
      datasets: [{
        label: 'Products by Tester',
        backgroundColor: colors.slice(0, Object.keys(testerCounts).length),
        data: Object.values(testerCounts)
      }]
    };

    this.createOrUpdateChart('doughnut', data, 'donutChart');
  }

  createOrUpdateChart = (type, data, chartName) => {
    const ctx = this.chartRefs[chartName].current.getContext('2d');
    const existingChart = this.state.charts[chartName];

    if (existingChart) {
      existingChart.destroy();
    }

   
    const newChart = new Chart(ctx, {
      type: type,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });

    this.setState(prevState => ({
      charts: {
        ...prevState.charts,
        [chartName]: newChart
      }
    }));
  }

  render() {
    const { products } = this.state;
    return (
      <div className="dashboard-container">
        <div className='top-bar'>
        {this.state.loading && <LinearProgress size={40} />}
        <AppBar position="static" style={{ backgroundColor: '#2b2b2b' }}>
          
          <Toolbar>
            <Typography variant="h6" className="title">
              Admin Dashboard
            </Typography>
            <Box flexGrow={1} />
            <NavLink to="/UserManagement" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="small" style={{ backgroundColor: '#d3d3d3', color: 'black' }}>Users</Button>&nbsp;
            </NavLink>
            &nbsp;<Button variant="contained" size="small" onClick={this.logOut} style={{ backgroundColor: '#d3d3d3', color: 'black' }}>Logout</Button>&nbsp;
            <NavLink to="/profile" style={{ textDecoration: 'none' }}></NavLink>
          </Toolbar>
          
        </AppBar>
        </div>

        <Sidebar/>
        <div className="content">
        <div className="filter-buttons" style={{ marginBottom: '10px' }}>
  <Button variant="contained" color={this.state.filter === 'All' ? 'primary' : 'default'} onClick={() => this.handleFilterChange('All')}>All</Button>&nbsp;
  &nbsp;<Button variant="contained" color={this.state.filter === 'Order' ? 'primary' : 'default'} onClick={() => this.handleFilterChange('Order')}>Order</Button>&nbsp;
  &nbsp;<Button variant="contained" color={this.state.filter === 'Tender' ? 'primary' : 'default'} onClick={() => this.handleFilterChange('Tender')}>Tender</Button>
</div>
          <Typography variant="h6" className="charts-heading">Visual Analysis</Typography><br />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper className="chart-card">
                <Typography variant="subtitle1" className="chart-title">Status</Typography>
                <canvas ref={this.chartRefs.barChart} className="chart-canvas" />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper className="chart-card">
                <Typography variant="subtitle1" className="chart-title">Account Type</Typography>
                <canvas ref={this.chartRefs.pieChart} className="chart-canvas" />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper className="chart-card">
                <Typography variant="subtitle1" className="chart-title">  Tester Stats </Typography>
                <canvas ref={this.chartRefs.donutChart} className="chart-canvas" />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper className="chart-card">
                <Typography variant="subtitle1" className="chart-title">Average Testing Days</Typography>
                <canvas ref={this.chartRefs.lineChart} className="chart-canvas" />
              </Paper>
            </Grid>
          </Grid>
          <Paper className="table-card">
            <Typography variant="h6" className="table-heading">Table of Records</Typography>
            <br />
            <TableContainer>
              <Table striped>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Platform</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Meter Version</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Tester</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Submission Date</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Start Date</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Released Date</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>End Date</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>Type of Order</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.slice(0, 5).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.customer}</TableCell>
                      <TableCell>{product.platform}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.testedBy}</TableCell>
                      <TableCell>
                        <Button style={{ backgroundColor: this.getStatusColor(product.status), color: 'white' }}>{product.status}</Button>
                      </TableCell>
                      <TableCell>{formatDate(product.submissionDate)}</TableCell>
                      <TableCell>{formatDate(product.startDate)}</TableCell>
                      <TableCell>{formatDate(product.releaseDate)}</TableCell>
                      <TableCell>{formatDate(product.endDate)}</TableCell>
                      <TableCell>{product.orderType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </div>
      </div>
    );
  }
}

export default withRouter(AdminDashboard); // Wrap component with withRouter



