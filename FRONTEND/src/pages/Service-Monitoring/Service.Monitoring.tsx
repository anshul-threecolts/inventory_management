import { Dispatch, useEffect, useRef, useState } from "react";
import "./service.monitoring.scss";
import { Form, Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import AccessDenied from "../../components/AccessDenied/AccessDenied";
import { Controller, useForm } from "react-hook-form";
import WebService from "../../Services/WebService";
import { toast } from "react-toastify";
import { Label } from "../../components/Common/Label/Label";
import HelperService from "../../Services/HelperService";
import VendorSelect from "../../components/VendorSelect/VendorSelect";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
} from "../../components/Grid/Grid";
import { UPDATE_ME_CALL, setDataInRedux } from "../../action/CommonAction";
import EBDatePicker from "../../components/Common/EBDatePicker/EBDatePicker";
import { Link } from "react-router-dom";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
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
    title: "Last Service Date",
    class: "text-center",
  },
];
const ServiceMonitoring = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setLastServiceDate("");
  };
  const handleShow = () => {
    getVendorList();
    getStationList();
    setShow(true);
  };
  const [isAccess, setIsAccess] = useState<boolean>(false);
  const userInfoData: any = useSelector<RootState, any>(
    (state: any) => state.userInfoData
  );
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm<any>({});
  const watchAllFields = watch();
  const pageCount = useRef<number>(0);
  const [ShowLoader, setShowLoader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<GridRow[]>([]);
  const rowCompute = useRef<GridRow[]>([]);
  const [vendorList, setVendorList] = useState<any[]>([]);
  const [lastServiceDate, setLastServiceDate] = useState<any>();
  const [stationList, setStationList] = useState<any[]>([]);
  const [editData, setEditData] = useState<any>();
  const [isEdit, setIsEdit] = useState(false);
  const [districtNames, setDistrictNames] = useState<any[]>([]);
  const [cityNames, setCityNames] = useState<any[]>([]);
  const [stateNames, setStateNames] = useState<any[]>([]);
  const selectedDistrict = useRef<any>("");
  const selectedCity = useRef<any>("");
  const selectedState = useRef<any>("");
  const vendorId = useRef<any>();

  useEffect(() => {
    if (userInfoData.user_info.isVendor === 0 && !userInfoData.user_info.vendorId) {
      setIsAccess(true)
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
    getState();
    getList(1);
  }, [userInfoData?.user_info?.isVendor]);

  useEffect(() => {
    const vendor_id = userInfoData.user_info.vendorId;
    vendorId.current = vendor_id;
    getList(1);
  }, [userInfoData.user_info.vendorId, selectedState, selectedDistrict]);

  const addServiceMonitoring = (data: any) => {
    if (data.vendorId && data.charge_station_id) {
      WebService.putAPI({
        action: "update-monitoring-station",
        body: data,
        id: "update_service",
      })
        .then((res: any) => {
          setShow(false);
          toast.success("Service Monitoring Updated Successfully");
          getList(1);
        })
        .catch((e) => {
          toast.error("Service Monitoring Updatation Failed try again.");
        });
    }
  };

  const getList = (
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
    if (vendorId) {
      requestBody["vendor_id"] = vendorId.current;
    }
    WebService.getAPI({
      action: `service-monitoring-list?keyword=${
        keyword ? keyword : ""
      }&date_from=${startDate ? startDate : ""}&date_to=${
        endDate ? endDate : ""
      }`,
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
            value: res.data[i].vendor_name ? res.data[i].vendor_name : "N/A",
          });
          columns.push({
            value: res.data[i].owned_by ? res.data[i].owned_by : "N/A",
          });
          columns.push({
            value: res.data[i].last_heartbeat
              ? HelperService.getFormatedDateForDetail(
                  res.data[i].last_heartbeat,
                  "MM/DD/YYYY"
                )
              : "N/A",
          });
          columns.push({ value: actionList(res.data[i]), type: "COMPONENT" });
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
  const getVendorList = () => {
    WebService.getAPI({
      action: `vendor-list`,
      body: {},
    })
      .then((res: any) => {
        let temp: any[] = [];
        for (let i in res.data) {
          temp.push({
            ...res.data[i],
            value: res.data[i].vendor_name,
            id: res.data[i].vendor_id,
          });
        }
        console.log("temp", temp);
        setVendorList(temp);
      })
      .catch(() => {});
  };
  const getStationList = () => {
    WebService.getAPI({
      action: `station-list`,
      body: {},
    })
      .then((res: any) => {
        let temp: any[] = [];
        for (let i in res.data) {
          temp.push({
            ...res.data[i],
            value: res.data[i].charge_station_name,
            id: res.data[i].charge_station_name,
          });
        }
        console.log("temp", temp);

        setStationList(temp);
      })
      .catch(() => {});
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
      </div>
    );
  };
  const onEdit = (val: any) => {
    console.log(val);
    setEditData(val);
    setLastServiceDate(val.last_heartbeat);
    reset(val);
    setIsEdit(true);
    setShow(true);
  };

  const getState = () => {
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

  const getDistrict = (id: any) => {
    if (id) {
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
    }
  };

  const getCity = (id: any) => {
    if (id) {
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
    }
  };

  return (
    <>
        <>
          <div className="container">
            <div className="justify-content-between d-flex mb-3 ">
              <span className="d-flex align-items-center">
                <h5 className="mb-0">Service Monitoring</h5>
              </span>
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
                      getDistrict(e.id);
                      getList(1);
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
                          getCity(e.id);
                          getList(1);
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
                          getList(1);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="table-card">
              <Grid
                searchPlaceholder="Search By Station/Vendor"
                rows={rows}
                showDateFilter={true}
                showSearch={true}
                headers={headers}
                ShowLoader={ShowLoader}
                count={totalCount}
                onPageChange={getList}
                errorMessage={"No User Found"}
              />
            </div>
          </div>

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Service Monitoring</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form
                className="mb-3"
                onSubmit={handleSubmit(addServiceMonitoring)}
              >
                <div className="col-lg-12 mt-3">
                  <label className="mb-2">Last Service Date</label>
                  <span className="text-danger">*</span>
                  <Controller
                    control={control}
                    name="last_heartbeat"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Form.Group>
                        <EBDatePicker
                          placeholderText={"Last Service Date"}
                          selected={lastServiceDate}
                          onChange={(data: any) => {
                            field.onChange(data);
                            setLastServiceDate(data);
                          }}
                        />
                        {errors.last_heartbeat && (
                          <div className="login-error mt-2">
                            <Label
                              title={"Last Service Date required"}
                              modeError={true}
                            />
                          </div>
                        )}
                      </Form.Group>
                    )}
                  />
                </div>

                <Button
                  id="update_service"
                  type="submit"
                  className="btn-brand-1 w-100 mt-4"
                >
                  Save
                </Button>
              </form>
            </Modal.Body>
            <Modal.Footer></Modal.Footer>
          </Modal>
        </>
    </>
  );
};

export default ServiceMonitoring;
