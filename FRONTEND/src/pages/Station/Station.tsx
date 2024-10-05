import React, { Dispatch, useEffect, useRef, useState } from "react";
import "./station.scss";
import {
  Container,
  Row,
  Form,
  Card,
  Button,
  Table,
  Col,
} from "react-bootstrap";
import Loginbg from "../../assets/images/rupess.svg";
import { Link } from "react-router-dom";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import WebService from "../../Services/WebService";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { Label } from "../../components/Common/Label/Label";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
} from "../../components/Grid/Grid";
import DeleteModal from "../../components/Common/DeleteModal/DeleteModal";
import { USER_INFO } from "../../action/CommonAction";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import AccessDenied from "../../components/AccessDenied/AccessDenied";
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
    title: "Status",
    class: "text-center",
  },
  {
    title: "Vendor Name",
    class: "text-center",
  },
  {
    title: "Owned By",
    class: "text-center",
  },
  {
    title: "Internal Technician",
    class: "text-center",
  },
  {
    title: "SPOC",
    class: "text-center",
  },
  {
    title: "SPOC Phone Number",
    class: "text-center",
  },
];

const Station = () => {
  useEffect(() => {}, []);
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    reset({});
  };
  const handleShow = () => {
    reset({});
    setShow(true);
  };
  const pageCount = useRef<number>(0);
  const [ShowLoader, setShowLoader] = useState(false);
  const SetFilterDate = useRef<any>();
  const [totalCount, setTotalCount] = useState(0);
  const rowCompute = useRef<GridRow[]>([]);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [editData, setEditData] = useState<any>();
  const [showDeleteModal, setDeleteModal] = useState<boolean>(false);
  const [points, setPoints] = useState(1);
  const [vendorNames, setVendorNames] = useState<any>();
  const [isAccess, setIsAccess] = useState<boolean>(false);
  const [stateNames, setStateNames] = useState<any>();
  const [cityNames, setCityNames] = useState<any[]>();
  const [districtNames, setDistrictNames] = useState<any[]>();
  const selectedDistrict = useRef<any>("");
  const selectedCity = useRef<any>("");
  const selectedState = useRef<any>("");

  const userInfoData: any = useSelector<RootState, any>(
    (state: any) => state.userInfoData
  );

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

  useEffect(() => {
    if (
      userInfoData.user_info.isVendor === 0 &&
      !userInfoData.user_info.vendorId
    ) {
      setIsAccess(true);
    }
    const actionColumnExists = headers.some(
      (header) => header.title === "Action"
    );
    if (userInfoData?.user_info?.permission) {
      if (
        userInfoData?.user_info?.permission === "VIEW_EDIT" ||
        userInfoData?.user_info?.permission === "ALL"
      ) {
        if (!actionColumnExists) {
          headers.push({ title: "Action", class: "text-center" });
        }
      }
    }
    getStationList(1);
    getVendornames();
    getStateNames();
  }, [userInfoData.user_info.isVendor]);

  const getVendornames = () => {
    WebService.getAPI({ action: `active-vendors`, body: {} })
      .then((res: any) => {
        var temp = [];
        for (var i in res.data) {
          temp.push({
            vendorId: res.data[i].vendorId,
            vendorName: res.data[i].vendorName,
          });
        }
        setVendorNames(temp);
      })
      .catch((e) => {});
  };

  const getStationList = (
    page: number,
    keyword?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    pageCount.current = page;
    setShowLoader(true);
    var requestBody: any = {};
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
      action: `charge-stations?keyword=${keyword ? keyword : ""}`,
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
            value: res.data[i].charge_station_id
              ? res.data[i].charge_station_id
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

          columns.push({
            value: res.data[i].status ? res.data[i].status : "N/A",
          });
          columns.push({
            value: res.data[i].vendorName ? res.data[i].vendorName : "N/A",
          });
          columns.push({
            value: res.data[i].owned_by ? res.data[i].owned_by : "N/A",
          });
          columns.push({ value: "-" });
          columns.push({ value: "-" });
          columns.push({ value: "-" });
          if (
            userInfoData?.user_info?.permission === "VIEW_EDIT" ||
            userInfoData?.user_info?.permission === "ALL"
          ) {
            columns.push({ value: actionList(res.data[i]), type: "COMPONENT" });
          }
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

  const onConfirmDelete = (val: any) => {
    setEditData(val);
    setDeleteModal(true);
  };

  const onEdit = (val: any) => {    
    setEditData(val);
    setPoints(val.total_points);
    reset(val);
    getDistrictNames(val.state);
    getCityNames(val.district);
    setShow(true);
  };

  const actionList = (value: any) => {
    return (
      <div className="action-btns">
        <div>
          {userInfoData?.user_info?.permission === "ALL" ||
          userInfoData?.user_info?.permission === "VIEW_EDIT" ? (
            <button
              type="button"
              onClick={() => onEdit(value)}
              className="btn btn-edit editicon"
              data-toggle="tooltip"
              data-placement="top"
              title="Edit"
            >
              <span>
                <Link to="#">
                  <MdModeEditOutline className="editicon" />
                </Link>
              </span>
            </button>
          ) : null}
        </div>
        <div>
          {userInfoData?.user_info?.permission === "ALL" ? (
            <button
              className="btn btn-delete"
              onClick={() => onConfirmDelete(value)}
              data-toggle="tooltip"
              data-placement="top"
              title="Delete"
            >
              <span>
                <Link to="#">
                  <FaTrashAlt className="trashicon" />
                </Link>
              </span>
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const addStation = (data: any) => {
    data.total_points = 2;
    if (data.owned_by == "Bharat Energy") {
      data.vendor = "";
    }
    if (data.id) {
      WebService.putAPI({
        action: "update-charge-station/" + data.id,
        body: data,
        id: "add_station",
      })
        .then((res: any) => {
          reset({});
          setShow(false);
          getStationList(1);
          toast.success("Station Updated Successfully");
        })
        .catch((e) => {
          toast.error("Station Updatation Failed try again.");
        });
    } else {
      WebService.postAPI({
        action: "add-charge-station",
        body: data,
        id: "add_station",
      })
        .then((res: any) => {
          reset({});
          setShow(false);
          getStationList(1);
          toast.success("Station Created Successfully");
        })
        .catch(() => {
          toast.error("Station Creation Failed try again.");
        });
    }
  };

  const onDelete = () => {
    setDeleteModal(false);
    setShowLoader(true);
    WebService.deleteAPI({
      action: `delete-charge-station/${editData?.id}`,
      body: null,
    })
      .then((res: any) => {
        setShowLoader(false);
        toast.success(res.message);
        setEditData("");
        getStationList(1);
      })
      .catch((e) => {
        setShowLoader(false);
        setEditData("");
      });
  };

  const handleIncrement = () => {
    setPoints((prevPoints) => prevPoints + 1);
  };

  const handleDecrement = () => {
    if (points == 1) {
      alert("Atleast 1 points required");
    }
    setPoints((prevPoints) => (prevPoints > 1 ? prevPoints - 1 : 1));
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
            <div className="justify-content-between d-flex mb-3 ">
              <span className="d-flex align-items-center">
                <h5 className="mb-0">Station</h5>
              </span>
              <div>
                {userInfoData?.user_info?.permission === "VIEW_EDIT" ||
                userInfoData?.user_info?.permission === "ALL" ? (
                  <span className="col-2 text-end ml-2">
                    <Button variant="success" onClick={handleShow}>
                      + Add
                    </Button>
                  </span>
                ) : null}
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
                      getStationList(1);
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
                          getStationList(1);
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
                          getStationList(1);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <DeleteModal
              isShow={showDeleteModal}
              close={() => {
                setDeleteModal(false);
                setEditData("");
              }}
              onDelete={() => {
                onDelete();
              }}
            />
            <div className="table-card">
              <Grid
                searchPlaceholder="Search By Station/Vendor"
                rows={rows}
                showSearch={true}
                headers={headers}
                ShowLoader={ShowLoader}
                count={totalCount}
                onPageChange={getStationList}
                errorMessage={"No Station Found"}
              />
            </div>
          </div>

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{editData ? "Edit" : "Add"} Station</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form className="mb-3" onSubmit={handleSubmit(addStation)}>
                <label className="mt-2">Station name</label>
                <span className="text-danger">*</span>
                <div className="input-group mb-1 mt-2">
                  <input
                    type="text"
                    className="form-control ps-3 p-2"
                    placeholder="Station Name"
                    {...register("charge_station_id", { required: true })}
                  />
                </div>
                {errors.charge_station_id && (
                  <div className="login-error">
                    <Label title={"Station name required"} modeError={true} />
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
                          <option value="Active">Active</option>
                          <option value="Partially Active">
                            Partially Active
                          </option>
                          <option value="Out Of Service">Out Of Service</option>
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
                                <option
                                  key={item.state_id}
                                  value={item.state_id}
                                >
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
                            <Label
                              title={"District required"}
                              modeError={true}
                            />
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

                <label className="mt-2">Address</label>
                <span className="text-danger">*</span>
                <div className="input-group mb-1 mt-2">
                  <input
                    type="text"
                    className="form-control ps-3 p-2"
                    placeholder="Address"
                    {...register("address", { required: true })}
                  />
                </div>
                {errors.address && (
                  <div className="login-error">
                    <Label title={"Address name required"} modeError={true} />
                  </div>
                )}

                <Col lg={12} className="d-flex gap-3 mt-4">
                  <Form.Label>Owned By:</Form.Label>
                  <Form.Check
                    type="radio"
                    id="Vendor"
                    label="Vendor"
                    className="text-nowrap"
                    value={"Vendor"}
                    {...register("owned_by", { required: true })}
                  />
                  <Form.Check
                    type="radio"
                    id="Bharat Energy"
                    label="Bharat Energy"
                    className="text-nowrap"
                    value={"Bharat Energy"}
                    {...register("owned_by", { required: true })}
                  />
                </Col>
                {errors.owned_by && (
                  <div className="login-error">
                    <Label title={"Owned by name required"} modeError={true} />
                  </div>
                )}

                {watchAllFields.owned_by == "Vendor" && (
                  <>
                    <Col lg={12} className="mt-2">
                      <Controller
                        control={control}
                        name="vendor"
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <Form.Group className="mb-2">
                            <Form.Label>Select Vendor </Form.Label>
                            <span className="text-danger">*</span>
                            <Form.Select
                              value={watchAllFields.vendor}
                              onChange={(e: any) => {
                                field.onChange(e.target.value);
                              }}
                            >
                              <option hidden value="">
                                Select Vendor
                              </option>
                              {vendorNames &&
                                vendorNames.length > 0 &&
                                vendorNames.map((item: any) => {
                                  return (
                                    <option
                                      key={item.vendorId}
                                      value={item.vendorId}
                                    >
                                      {item.vendorName}
                                    </option>
                                  );
                                })}
                            </Form.Select>
                            {errors.vendor && (
                              <div className="login-error mb-3">
                                <Label
                                  title={"Vendor required"}
                                  modeError={true}
                                />
                              </div>
                            )}
                          </Form.Group>
                        )}
                      />
                    </Col>
                    {errors.vendor && (
                      <div className="login-error">
                        <Label
                          title={"Vendor name required"}
                          modeError={true}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* <Col lg={12} className="d-flex align-items-center gap-3 mt-4">
              <Form.Label>Points :</Form.Label>
              <button type="button" id="decrease" onClick={handleDecrement} className="btn btn-outline-secondary" style={{ padding: '5px 15px' }}>
                <img src="minus-icon.png" alt="-" />
              </button>
              <span id="num-travelers" style={{ fontSize: '16px', width: '30px', textAlign: 'center' }}>{points}</span>
              <button type="button" id="increase" onClick={handleIncrement} className="btn btn-outline-secondary" style={{ padding: '5px 15px' }}>
                <img src="plus-icon.png" alt="+" />
              </button>
            </Col> */}

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
      ) : (
        <>
          {isAccess &&
            userInfoData.user_info(<AccessDenied isShowMessage={true} />)}
        </>
      )}
    </>
  );
};

export default Station;
