import React, { useEffect, useRef, useState } from "react";
import "./charging.details.scss";
import { Container, Row, Form, Card, Button, Col, Table, Modal, Tab } from "react-bootstrap";
import WebService from "../../Services/WebService";
import NoDataAvailable from "../../components/No-Data/NoData";
import loader from "../../assets/images/loader.gif";
import Paginations from "../../components/pagination/Paginations";
import { RootState } from "../../config/Store";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import Logo from '../../assets/images/star.svg'
import AccessDenied from "../../components/AccessDenied/AccessDenied";
import Grid, { GridColumn, GridHeader, GridRow } from "../../components/Grid/Grid";

interface propData {
  activeTab: string;
  rolePermission: any;
  click: any;
}

const headers: GridHeader[] = [
  {
    title: "Station Name",
    class: "text-center",
  },
  {
    title: "Point",
    class: "text-center",
  },
  {
    title: "City",
    class: "text-center",
  },
  {
    title: "Time Slot",
    class: "text-center",
  },
  {
    title: "Amount",
    class: "text-center",
  },
  {
    title: "Status",
    class: "text-center",
  },
  {
    title: "Unit Charged",
    class: "text-center",
  },
  {
    title: "Time Taken",
    class: "text-center",
  },
];

const Chargingetails = (props: propData) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [isAccess, setIsAccess] = useState<boolean>(false);
  const userInfoData: any = useSelector<RootState, any>(
    (state: any) => state.userInfoData
  );
  const pageCount = useRef<number>(0);
  const [ShowLoader, setShowLoader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<GridRow[]>([]);
  const rowCompute = useRef<GridRow[]>([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chargeStationId = queryParams.get('station_id');

  useEffect(() => {
    getList(1);
  }, []);

  const getList = (
    page: number,
    keyword?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    pageCount.current = page;
    setShowLoader(true);
    WebService.getAPI({
      action: `past-bookings/${chargeStationId}?keyword=${keyword ? keyword : ""}&date_from=${startDate ? startDate : ""
        }&date_to=${endDate ? endDate : ""}`,
      body: { page: page },
    })
      .then((res: any) => {
        setShowLoader(false);
        let rows: GridRow[] = [];
        if (page == 1) {
          setTotalCount(res.pagination.totalRecords);
        }
        for (var i in res.data) {
          let columns: GridColumn[] = [];
          columns.push({
            value: res.data[i].charge_station_name	 ? res.data[i].charge_station_name	 : "N/A",
          });
          columns.push({
            value: res.data[i].point	 ? res.data[i].point	 : "N/A",
          });
          columns.push({
            value: res.data[i].city	 ? res.data[i].city	 : "N/A",
          });
          columns.push({
            value: res.data[i].startTime	&& res.data[i].endTime	? res.data[i].startTime+"-"+res.data[i].endTime	  : "N/A",
          });
          columns.push({
            value: res.data[i].amount	 ? res.data[i].amount	 : "N/A",
          });
          columns.push({
            value: res.data[i].status	 ? res.data[i].status	 : "N/A",
          });
          columns.push({
            value: res.data[i].unit	 ? res.data[i].unit	 : "N/A",
          });
          columns.push({
            value: res.data[i].timeDiff		 ? res.data[i].timeDiff : "N/A",
          });
          rowCompute.current.push({ data: columns });
          rows.push({ data: columns });
        }
        rowCompute.current = rows;
        setRows(rowCompute.current);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };


  return (
    <>
      <>
        <div className="container">
          <Row className=" g-3">
            <Grid
              searchPlaceholder="Search By Name/Email/City"
              rows={rows}
              showDateFilter={false}
              showSearch={false}
              headers={headers}
              ShowLoader={ShowLoader}
              count={totalCount}
              onPageChange={getList}
              errorMessage={"No Booking Found"}
            />
          </Row>
        </div>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add Station</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <div className="mb-2">
                  <Form.Label>Station Name</Form.Label>
                  <Form.Control type="email" placeholder="Enter station name" /></div>
                <div className="mb-2">
                  <Form.Label>City</Form.Label>
                  <Form.Control type="email" placeholder="Enter city name" /></div>
                <div className="mb-2">
                  <Form.Label>Status</Form.Label>
                  <Form.Select aria-label="Default select example">
                    <option>Select status</option>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                  </Form.Select></div>
                <div className="mb-3">
                  <Form.Label>Vendor Name</Form.Label>
                  <Form.Control type="email" placeholder="Enter vendor name" /></div>
                <Form.Label>Owned By</Form.Label>
                <Form>
                  {['radio'].map((type) => (
                    <div key={`inline-${type}`} className="mb-3">
                      <Form.Check inline id={`check-api-${type}`}>
                        <Form.Check.Input isValid type="radio" />
                        <Form.Check.Label>Vendor</Form.Check.Label>
                      </Form.Check>

                      <Form.Check inline id={`check-api-${type}`}>
                        <Form.Check.Input isValid type="radio" />
                        <Form.Check.Label>Bharat Energy</Form.Check.Label>
                      </Form.Check>
                    </div>
                  ))}
                </Form>
              </Form.Group>


            </Form>
          </Modal.Body>
          <Modal.Footer>

            <Button variant="success" onClick={handleClose} className="w-100">
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    </>
  );
}

export default Chargingetails;
