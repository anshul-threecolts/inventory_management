import React, { useEffect, useRef, useState } from "react";
import "./bookings.scss";
import {
  Container,
  Row,
  Form,
  Card,
  Button,
  Table,
  Tabs,
  Tab,
  Nav,
  Col,
} from "react-bootstrap";
import Loginbg from "../../assets/images/rupess.svg";
import { Link } from "react-router-dom";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import AccessDenied from "../../components/AccessDenied/AccessDenied";
import WebService from "../../Services/WebService";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
} from "../../components/Grid/Grid";
import EBDatePicker from "../../components/Common/EBDatePicker/EBDatePicker";
import { toast } from "react-toastify";
import { Label } from "../../components/Common/Label/Label";
import { useForm, Controller } from "react-hook-form";
import VendorSelect from "../../components/VendorSelect/VendorSelect";

const headers: GridHeader[] = [
  {
    title: "Station Name",
    class: "text-center",
  },
  {
    title: "State",
    class: "text-center",
  },
  {
    title: "District",
    class: "text-center",
  },
  {
    title: "City",
    class: "text-center",
  },
  {
    title: "Booked By",
    class: "text-center",
  },
  {
    title: "Booking Date",
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
];

const cancelledHeaders: GridHeader[] = [
  {
    title: "Station Name",
    class: "text-center",
  },
  {
    title: "State",
    class: "text-center",
  },
  {
    title: "District",
    class: "text-center",
  },
  {
    title: "City",
    class: "text-center",
  },
  {
    title: "Booking Date",
    class: "text-center",
  },
  {
    title: "Time Slot",
    class: "text-center",
  },
  {
    title: "Reason For Cancelation",
    class: "text-center",
  },
  {
    title: "Status",
    class: "text-center",
  },
];

const Bookings = () => {
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
  const rowCompute = useRef<GridRow[]>([]);
  const [activeTab, setActiveTab] = useState<string>("first");
  const [rows, setRows] = useState<GridRow[]>([]);
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [editData, setEditData] = useState<any>();
  const selectedDistrict = useRef<any>("");
  const selectedCity = useRef<any>("");
  const selectedState = useRef<any>("");
  const {
    handleSubmit,
    formState: { errors, isValid },
    control,
    watch,
    getValues,
    register,
    reset,
  } = useForm<any>({});
  const watchAllFields = watch();
  const [stateNames, setStateNames] = useState<any>();
  const [cityNames, setCityNames] = useState<any[]>();
  const [districtNames, setDistrictNames] = useState<any[]>();

  useEffect(() => {
    if (
      userInfoData.user_info.isVendor === 0 &&
      !userInfoData.user_info.vendorId
    ) {
      setIsAccess(true);
    }
    getStateNames();
    getBookingList(1);
  }, [userInfoData.user_info.isVendor, activeTab, startDate, endDate]);

  const getBookingList = (page: number, keyword?: string) => {
    pageCount.current = page;
    setShowLoader(true);
    var requestBody: any = {};
    if (startDate) {
      requestBody["start_date"] = startDate;
    }
    if (endDate) {
      requestBody["end_date"] = endDate;
    }
    if (keyword) {
      requestBody["keyword"] = keyword;
    }
    if (page) {
      requestBody["page"] = page;
    }
    if (selectedState?.current) {
      requestBody["state"] = selectedState.current;
    }
    if (selectedDistrict?.current) {
      requestBody["district"] = selectedDistrict.current;
    }
    if (selectedCity?.current) {
      requestBody["city"] = selectedCity.current;
    }
    WebService.getAPI({
      action: `bookings?tab=${activeTab ? activeTab : ""}`,
      body: requestBody,
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
            value: res.data[i].charge_station_name
              ? res.data[i].charge_station_name
              : "N/A",
          });
          columns.push({
            value: res.data[i].state_name ? res.data[i].state_name : "N/A",
          });
          columns.push({
            value: res.data[i].district_name
              ? res.data[i].district_name
              : "N/A",
          });
          columns.push({
            value: res.data[i].city_name ? res.data[i].city_name : "N/A",
          });
          if (activeTab != "third") {
            columns.push({
              value: res.data[i].booked_by ? res.data[i].booked_by : "N/A",
            });
          }
          columns.push({
            value: res.data[i].bookingDate
              ? new Date(res.data[i].bookingDate).toLocaleString()
              : "N/A",
          });
          columns.push({
            value:
              res.data[i].startTime && res.data[i].endTime
                ? res.data[i].startTime + "-" + res.data[i].endTime
                : "N/A",
          });
          if (activeTab != "third") {
            columns.push({
              value: res.data[i].amount ? res.data[i].amount : "N/A",
            });
          }
          if (activeTab == "third") {
            columns.push({
              value: res.data[i].cancelationReason
                ? res.data[i].cancelationReason
                : "N/A",
            });
          }
          columns.push({
            value: res.data[i].status ? res.data[i].status : "N/A",
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

  const addBooking = (data: any) => {
    data.total_points = 2;
    if (data.owned_by == "Bharat Energy") {
      data.vendor = "";
    }
    if (data.id) {
      WebService.putAPI({
        action: "update-booking/" + data.id,
        body: data,
        id: "add_station",
      })
        .then((res: any) => {
          reset({});
          setShow(false);
          getBookingList(1);
          toast.success("Station Updated Successfully");
        })
        .catch((e) => {
          toast.error("Station Updatation Failed try again.");
        });
    } else {
      WebService.postAPI({
        action: "add-booking",
        body: data,
        id: "add_station",
      })
        .then((res: any) => {
          reset({});
          setShow(false);
          getBookingList(1);
          toast.success("Station Created Successfully");
        })
        .catch(() => {
          toast.error("Station Creation Failed try again.");
        });
    }
  };

  const getStateNames = () => {
    WebService.getAPI({
      action: `states`,
      body: {},
    })
      .then((res: any) => {
        let temp: any[] = [];
        for (let i in res.data) {
          temp.push({
            ...res.data[i],
            value: res.data[i].state_name,
            id: res.data[i].state_id,
          });
        }
        setStateNames(temp);
      })
      .catch(() => {});
  };

  const getDistrictNames = (id: any) => {
    WebService.getAPI({
      action: `districts/` + id,
      body: {},
    })
      .then((res: any) => {
        let temp: any[] = [];
        for (let i in res.data) {
          temp.push({
            ...res.data[i],
            value: res.data[i].district_name,
            id: res.data[i].district_id,
          });
        }
        setDistrictNames(temp);
      })
      .catch(() => {});
  };

  const getCityNames = (id: any) => {
    WebService.getAPI({
      action: `cities/` + id,
      body: {},
    })
      .then((res: any) => {
        let temp: any[] = [];
        for (let i in res.data) {
          temp.push({
            ...res.data[i],
            value: res.data[i].city_name,
            id: res.data[i].city_id,
          });
        }
        setCityNames(temp);
      })
      .catch(() => {});
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("event.target.value-->", event.target.value);
    getDistrictNames(event.target.value);
  };

  const handleDistrictChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    console.log("event.target.value-->", event.target.value);
    getCityNames(event.target.value);
  };

  return (
    <>
      {isAccess ? (
        <>
          <div className="container">
            <div className="justify-content-between d-flex mb-2 ">
              <span className="d-flex align-items-center">
                <h5 className="mb-0">Manage Booking</h5>
              </span>
            </div>
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <div className="justify-content-between d-flex">
                <Nav variant="underline">
                  <Nav.Item onClick={() => setActiveTab("first")}>
                    <Nav.Link eventKey="first">Upcoming</Nav.Link>
                  </Nav.Item>
                  <Nav.Item onClick={() => setActiveTab("second")}>
                    <Nav.Link eventKey="second">Completed</Nav.Link>
                  </Nav.Item>
                  <Nav.Item onClick={() => setActiveTab("third")}>
                    <Nav.Link eventKey="third">Cancelled</Nav.Link>
                  </Nav.Item>
                </Nav>
                <div>
                  <span>
                    <>
                      <Row className="mb-3 text-end">
                        <Col lg={5}>
                          <EBDatePicker
                            placeholderText="From Date"
                            selected={startDate}
                            onChange={(date: any) => setStartDate(date)}
                            maxData={new Date(endDate)}
                          />
                        </Col>
                        <Col lg={5}>
                          <EBDatePicker
                            placeholderText="To Date"
                            selected={endDate}
                            onChange={(date: any) => setEndDate(date)}
                            minData={new Date(startDate)}
                          />
                        </Col>
                        <Col lg={2}>
                          <Button variant="success" onClick={handleShow}>
                            Add
                          </Button>
                        </Col>
                      </Row>
                    </>
                  </span>
                </div>
              </div>
              <div className="col-lg-12 d-flex mb-4">
                <div className="col-lg-3">
                  <label>Select State</label>
                  <div className="time-pickers position-relative w-100-mob w-100">
                    <VendorSelect
                      selected={selectedState?.current}
                      isSearchable={true}
                      options={stateNames ?? []}
                      onChange={(e: any) => {
                        selectedState.current = e.id;
                        getDistrictNames(e.id);
                        getBookingList(1);
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-3 ms-3">
                  {selectedState?.current && (
                    <>
                      <label>Select District</label>
                      <div className="time-pickers position-relative w-100-mob w-100">
                        <VendorSelect
                          selected={selectedDistrict?.current}
                          isSearchable={true}
                          options={districtNames ?? []}
                          onChange={(e: any) => {
                            selectedDistrict.current = e.id;
                            getCityNames(e.id);
                            getBookingList(1);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="col-lg-3 ms-3">
                  {selectedDistrict?.current && (
                    <>
                      <label>Select City</label>
                      <div className="time-pickers position-relative w-100-mob w-100">
                        <VendorSelect
                          isSearchable={true}
                          options={cityNames ?? []}
                          selected={selectedCity.current}
                          onChange={(e: any) => {
                            selectedCity.current = e.id;
                            getBookingList(1);
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <Tab.Content className="mt-3">
                <Tab.Pane eventKey="first">
                  <div className="table-card">
                    <Grid
                      searchPlaceholder="Search By Station/Booked By"
                      rows={rows}
                      showSearch={true}
                      headers={headers}
                      ShowLoader={ShowLoader}
                      count={totalCount}
                      onPageChange={getBookingList}
                      errorMessage={"No Booking Found"}
                    />
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                  <div className="table-card">
                    <Grid
                      searchPlaceholder="Search By Station/Booked By"
                      rows={rows}
                      showSearch={true}
                      headers={headers}
                      ShowLoader={ShowLoader}
                      count={totalCount}
                      onPageChange={getBookingList}
                      errorMessage={"No Booking Found"}
                    />
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="third">
                  <div className="table-card">
                    <Grid
                      searchPlaceholder="Search By Station/Booked By"
                      rows={rows}
                      showSearch={true}
                      headers={cancelledHeaders}
                      ShowLoader={ShowLoader}
                      count={totalCount}
                      onPageChange={getBookingList}
                      errorMessage={"No Booking Found"}
                    />
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </>
      ) : (
        <>
          {isAccess &&
            userInfoData.user_info(<AccessDenied isShowMessage={true} />)}
        </>
      )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? "Edit" : "Add"} Station</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="mb-3" onSubmit={handleSubmit(addBooking)}>
            <label className="mt-2">Booked By</label>
            <span className="text-danger">*</span>
            <div className="input-group mb-1 mt-2">
              <input
                type="text"
                className="form-control ps-3 p-2"
                placeholder="Booked By"
                {...register("booked_by", { required: true })}
              />
            </div>
            {errors.booked_by && (
              <div className="login-error">
                <Label title={"Booked By required"} modeError={true} />
              </div>
            )}

            <label className="mt-2">Booking Date</label>
            <span className="text-danger">*</span>
            <div className="input-gśroup mb-1 mt-2">
              <input
                type="text"
                className="form-control ps-3 p-2"
                placeholder="Booked By"
                {...register("bookingDate", { required: true })}
              />
            </div>
            {errors.bookingDate && (
              <div className="login-error">
                <Label title={"Booking Date required"} modeError={true} />
              </div>
            )}

            <label className="mt-2">Start Time</label>
            <span className="text-danger">*</span>
            <div className="input-group mb-1 mt-2">
              <input
                type="text"
                className="form-control ps-3 p-2"
                placeholder="Start Time"
                {...register("startTime", { required: true })}
              />
            </div>
            {errors.startTime && (
              <div className="login-error">
                <Label title={"Start Time required"} modeError={true} />
              </div>
            )}

            <label className="mt-2">End Time</label>
            <span className="text-danger">*</span>
            <div className="input-group mb-1 mt-2">
              <input
                type="text"
                className="form-control ps-3 p-2"
                placeholder="End Time"
                {...register("endTime", { required: true })}
              />
            </div>
            {errors.endTime && (
              <div className="login-error">
                <Label title={"End time required"} modeError={true} />
              </div>
            )}

            <label className="mt-2">Unit</label>
            <span className="text-danger">*</span>
            <div className="input-group mb-1 mt-2">
              <input
                type="text"
                className="form-control ps-3 p-2"
                placeholder="Unit"
                {...register("unit", { required: true })}
              />
            </div>
            {errors.unit && (
              <div className="login-error">
                <Label title={"Unit required"} modeError={true} />
              </div>
            )}

            <label className="mt-2">Point</label>
            <span className="text-danger">*</span>
            <div className="input-group mb-1 mt-2">
              <input
                type="text"
                className="form-control ps-3 p-2"
                placeholder="Enter Point"
                {...register("point", { required: true })}
              />
            </div>
            {errors.point && (
              <div className="login-error">
                <Label title={"Point required"} modeError={true} />
              </div>
            )}

            <label className="mt-2">Charge station</label>
            <span className="text-danger">*</span>
            <div className="input-group mb-1 mt-2">
              <input
                type="text"
                className="form-control ps-3 p-2"
                placeholder="Charge station"
                {...register("charge_station_id", { required: true })}
              />
            </div>
            {errors.charge_station_id && (
              <div className="login-error">
                <Label title={"Charge station required"} modeError={true} />
              </div>
            )}

            <Col lg={12} className="mt-2">
              <Controller
                control={control}
                name="status"
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Form.Group className="mb-2">
                    <Form.Label>Select Status </Form.Label>
                    <span className="text-danger">*</span>
                    <Form.Select
                      value={watchAllFields.status}
                      onChange={(e: any) => {
                        field.onChange(e.target.value);
                      }}
                    >
                      <option hidden value="">
                        Select Status
                      </option>
                      <option value="Recieved">Recieved</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                    {errors.status && (
                      <div className="login-error mb-3">
                        <Label title={"Status required"} modeError={true} />
                      </div>
                    )}
                  </Form.Group>
                )}
              />
            </Col>

            <Col lg={12} className="mt-2">
              <Controller
                control={control}
                name="state"
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Form.Group className="mb-2">
                    <Form.Label>Select State </Form.Label>
                    <span className="text-danger">*</span>
                    <Form.Select
                      value={watchAllFields.state}
                      onChange={(e: any) => {
                        field.onChange(e.target.value);
                        handleStateChange(e);
                      }}
                    >
                      <option hidden value="">
                        Select State
                      </option>
                      {stateNames &&
                        stateNames.length > 0 &&
                        stateNames.map((item: any) => {
                          return (
                            <option key={item.state_id} value={item.state_id}>
                              {item.state_name}
                            </option>
                          );
                        })}
                    </Form.Select>
                    {errors.state && (
                      <div className="login-error mb-3">
                        <Label title={"State required"} modeError={true} />
                      </div>
                    )}
                  </Form.Group>
                )}
              />
            </Col>

            <Col lg={12} className="mt-2">
              <Controller
                control={control}
                name="district"
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Form.Group className="mb-2">
                    <Form.Label>Select District </Form.Label>
                    <span className="text-danger">*</span>
                    <Form.Select
                      value={watchAllFields.district}
                      onChange={(e: any) => {
                        field.onChange(e.target.value);
                        handleDistrictChange(e);
                      }}
                    >
                      <option hidden value="">
                        Select District
                      </option>
                      {districtNames &&
                        districtNames.length > 0 &&
                        districtNames.map((item: any) => {
                          return (
                            <option
                              key={item.district_id}
                              value={item.district_id}
                            >
                              {item.district_name}
                            </option>
                          );
                        })}
                    </Form.Select>
                    {errors.district && (
                      <div className="login-error mb-3">
                        <Label title={"District required"} modeError={true} />
                      </div>
                    )}
                  </Form.Group>
                )}
              />
            </Col>

            <Col lg={12} className="mt-2">
              <Controller
                control={control}
                name="city"
                rules={{
                  required: true,
                }}
                render={({ field }) => (
                  <Form.Group className="mb-2">
                    <Form.Label>Select City </Form.Label>
                    <span className="text-danger">*</span>
                    <Form.Select
                      value={watchAllFields.city}
                      onChange={(e: any) => {
                        field.onChange(e.target.value);
                      }}
                    >
                      <option hidden value="">
                        Select City
                      </option>
                      {cityNames &&
                        cityNames.length > 0 &&
                        cityNames.map((item: any) => {
                          return (
                            <option key={item.city_id} value={item.city_id}>
                              {item.city_name}
                            </option>
                          );
                        })}
                    </Form.Select>
                    {errors.city && (
                      <div className="login-error mb-3">
                        <Label title={"City required"} modeError={true} />
                      </div>
                    )}
                  </Form.Group>
                )}
              />
            </Col>

            <Button
              id="add_station"
              className="btn-brand-1 w-100 mt-4"
              type="submit"
            >
              Save
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </>
  );
};

export default Bookings;
