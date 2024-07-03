//


import React, { useState, useEffect, Fragment } from 'react';
import {
  Button, TextField, LinearProgress, IconButton, TableBody, Table, AppBar, Toolbar, Typography,
  TableContainer, TableHead, TableRow, TableCell, Box, Grid
} from '@material-ui/core';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';


const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenWidth;
};

const MAX_COLUMNS = 15;
const MIN_WIDTH = 75;

const useColumns = (products) => {
  const screenWidth = useScreenWidth();
  const numColumns = Math.min(Math.floor((screenWidth - 25) / MIN_WIDTH), MAX_COLUMNS);
  const visibleColumns = products.length > 0 ? Object.keys(products[0]).slice(0, numColumns) : [];

  return { numColumns, visibleColumns };
};

function formatDate(date) {
  const dateObj = new Date(date);
  const formattedDate = moment(dateObj).format('DD-MM-YYYY');
  return formattedDate;
}

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'Completed':
      return '#7c9885';
    case 'In Progress':
      return '#eaac8b';
    case 'Pending':
      return '#bd8f97';
    case 'Exp Next Itr':
      return '#a69cac';
    case 'In Progress':
      return '#eaac8b';
    case 'Subs Itr rel':
      return '#778899';
    case 'Released':
      return '#72938c';
    case 'Stopped':
      return '#bd8f97';
    case 'Withdrawn':
      return '#bd8f97';
    default:
      return 'transparent';
  }
};

const columnHeaders = [
  "Meter Version", "Customer", "Account Type", "Order Type", "Utility", "Comms",
  "Platform", "Configuration", "Status", "Tested By", "Request Date", "Submission Date",
  "Start Date", "End Date", "Rollover Date", "Rollover Days(H)", "Rollover Days",
  "Waiting Days(H)", "Waiting Days", "Testing Days(H)", "Testing Days", "Release Number",
  "Report Number","Release Date", "Reviewed By", "Code Compare", "New Firmware", "Total Bugs", "Reason for Submission"
];

const columnMap = {
  name: "Meter Version",
  customer: "Customer",
  accType: "Account Type",
  orderType: "Order Type",
  newCol1: "Utility",
  newCol2: "Comms",
  platform: "Platform",
  config: "Configuration",
  status: "Status",
  testedBy: "Tested By",
  reqDate: "Request Date",
  submissionDate: "Submission Date",
  startDate: "Start Date",
  endDate: "End Date",
  rolloverDate: "Rollover Date",
  rolloverDaysH: "Rollover Days(H)",
  rolloverDays: "Rollover Days",
  waitingDaysH: "Waiting Days(H)",
  waitingDays: "Waiting Days",
  testingDaysH: "Testing Days(H)",
  testingDays: "Testing Days",
  rel: "Release Number",
  reportNo: "Report Number",
  releaseDate: "Release Date",
  reviewedBy: "Reviewed By",
  codeCompare: "Code Compare",
  newFW: "New Firmware",
  tBugs: "Total Bugs",
  submissionReason: "Reason for Submission"
};

const Tester = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const { numColumns, visibleColumns } = useColumns(products);

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token) {
      navigate("/login");
    } else {
      setToken(token);
      getProduct(token, page, search);
    }
  }, [navigate, page, search]);

  const handleRowClick = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getProduct = (token, page, search) => {
    setLoading(true);
    let data = `?page=${page}`;
    if (search) {
      data = `${data}&search=${search}&searchFields=customer,name,platform,config,testedBy`;
    }

    axios.get(`http://localhost:2000/get-product${data}`, {
      headers: { token }
    }).then((res) => {
      setLoading(false);
      setProducts(res.data.products);
      setPages(res.data.pages);
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      setLoading(false);
      setProducts([]);
      setPages(0);
    });
  };

  const pageChange = (e, page) => {
    setPage(page);
  };

  const logOut = () => {
    localStorage.setItem('token', null);
    navigate("/");
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  const renderChildRow = (product, index) => {
    const hiddenColumns = Object.keys(product).slice(numColumns);
    return hiddenColumns.map((column, idx) => (
      <TableRow key={`child-${index}-${idx}`}>
        <TableCell colSpan={visibleColumns.length}>
          <strong>{columnMap[column]}:</strong> {product[column]}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div>
      {loading && <LinearProgress size={40} />}
      <AppBar position="static" style={{ backgroundColor: '#2b2b2b' }}>
        <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="back" onClick={() => window.history.back()}>
    <ArrowBackIcon /> 
  </IconButton>
          <Typography variant="h6" className="title">
            Team Dashboard
          </Typography>
          <Box flexGrow={1} />
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={logOut}
          >
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
      <div>
        <br />
        <br />
      </div>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} alignItems="flex-start">
          <TextField
            id="standard-basic"
            className="no-printme"
            type="search"
            autoComplete="off"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by meter ver/ customer/ platform/ config/ testedBy"
            style={{ width: '25%' }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-start">
            <Typography variant="body2" className="spacer">
              &nbsp;
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <TableContainer>
        <Table striped>
          <TableHead>
            <TableRow>
              <TableCell><span></span></TableCell>
              {columnHeaders.map((header, index) => (
                <TableCell key={index} style={{ fontWeight: 'bold' }}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {products && products.map((product, index) => (
              <Fragment key={index}>
                <TableRow>
                  <TableCell>
                  <IconButton ></IconButton>
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
                          product.status === 'Withdrawn' ? '#bd8f97':'transparent',
                        color: 'white',
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
                  <TableCell>{product.rolloverDaysH}</TableCell>
                  <TableCell>{product.rolloverDays}</TableCell>
                  <TableCell>{product.waitingDaysH}</TableCell>
                  <TableCell>{product.waitingDays}</TableCell>
                  <TableCell>{product.testingDaysH}</TableCell>
                  <TableCell>{product.testingDays}</TableCell>
                  <TableCell>{product.rel}</TableCell>
                  <TableCell>{product.reportNo}</TableCell>
                  <TableCell>{formatDate(product.releaseDate)}</TableCell>
                  <TableCell>{product.reviewedBy}</TableCell>
                  <TableCell>{product.codeCompare}</TableCell>
                  <TableCell>{product.newFW}</TableCell>
                  <TableCell>{product.tBugs}</TableCell>
                  <TableCell>{product.submissionReason}</TableCell>
                </TableRow>
                {expanded[index] && renderChildRow(product, index)}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={pages}
        page={page}
        onChange={pageChange}
        color="#2b2b2b"
      />
    </div>
  );
};

export default Tester;

