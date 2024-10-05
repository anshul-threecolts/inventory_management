import React, { useEffect, useRef, useState } from "react";
import "./charging.scss";
import { Container, Row, Form, Card, Button, Col } from "react-bootstrap";
import Loginbg from "../../assets/images/rupess.svg";
import Users from "../../assets/images/users.svg";
import Station from "../../assets/images/station.svg";
import Charge from "../../assets/images/charge.svg";
import Uparrow from "../../assets/images/uparrow.svg";
import Chart2 from "../../assets/images/chart2.svg";
import Prakash from "../../assets/images/prakash.svg";
import Kw from "../../assets/images/kw.svg";
import WebService from "../../Services/WebService";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import NoDataAvailable from "../../components/No-Data/NoData";
import loader from "../../assets/images/loader.gif";
import Paginations from "../../components/pagination/Paginations";
import { RootState } from "../../config/Store";
import AccessDenied from "../../components/AccessDenied/AccessDenied";
import { useSelector } from "react-redux";

const Charging = () => {
  const [chargingPoints, setChargingPoints] = useState<any>();
  const [showLoader, setShowLoader] = useState<Boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>();
  const [stateNames, setStateNames] = useState<any>();
  const [cityNames, setCityNames] = useState<any[]>();
  const [districtNamea, setDistrictNames] = useState<any[]>();
  const [filter, setFilter] = useState<any>();

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [stationHeader, setStationHeader] = useState<string>("stationheder");

  const userInfoData: any = useSelector<RootState, any>(
    (state: any) => state.userInfoData
  );

  const vendorId = useRef<any>();

  useEffect(() => {
    const vendor_id = userInfoData.user_info.vendorId;
    vendorId.current = vendor_id;
    setShowLoader(true)
    getAllChargingPoints(1);
  }, [userInfoData.user_info.vendorId, selectedState, selectedDistrict]);

  useEffect(() => {
    getStateNames();
    const ws = new WebSocket("ws://localhost:8088");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "StatusNotification") {
        const { connectorId, status, statName, last_heartbeat } = message.data;
        setChargingPoints((prevState: any) => {
          const updatedPoints = { ...prevState };
          for (const station in updatedPoints) {
            const points = updatedPoints[station].map(
              (point: { point: any }) => {
                if (point.point === connectorId && station == statName) {
                  return { ...point, status, last_heartbeat };
                }
                return point;
              }
            );
            updatedPoints[station] = points;
          }
          return updatedPoints;
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedCity]);

  const getStateNames = () => {
    WebService.getAPI({
      action: `states`,
      body: {},
    })
      .then((res: any) => {
        console.log(res.data);
        setStateNames(res.data);
      })
      .catch(() => { });
  };

  const getDistrictNames = (id: any) => {
    WebService.getAPI({
      action: `districts/` + id,
      body: {},
    })
      .then((res: any) => {
        console.log(res.data);
        setDistrictNames(res.data);
      })
      .catch(() => { });
  };

  const getCityNames = (id: any) => {
    WebService.getAPI({
      action: `cities/` + id,
      body: {},
    })
      .then((res: any) => {
        let temp: string[] = [];
        setCityNames(res.data);
      })
      .catch(() => { });
  };

  const getAllChargingPoints = (page: number) => {
    setShowLoader(true);
    var body: any = {};
    if (selectedState) {
      body["state"] = selectedState;
    }
    if (selectedDistrict) {
      body["district"] = selectedDistrict;
    }
    if (vendorId.current) {
      body["vendor_id"] = vendorId.current;
    }
    WebService.getAPI({
      action: `charging-monitoring?page=${page}`,
      body: body,
    })
      .then((res: any) => {
        let temp: any = {};
        setPagination(res.pagination);

        for (var key in res.data) {
          res.data[key].forEach((pointData: any) => {
            if (!temp[key]) {
              temp[key] = [];
            }
            temp[key].push({
              point: pointData.point,
              status: pointData.status,
              last_heartbeat: pointData.last_heartbeat,
            });
          });
        }

        setChargingPoints(temp);
        setShowLoader(false);
      })
      .catch(() => {
        setShowLoader(false);
      });
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("event.target.value-->", event.target.value);
    setSelectedState(event.target.value);
    setSelectedDistrict("");
    getDistrictNames(event.target.value);
  };

  const handleDistrictChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedDistrict(event.target.value);
    setSelectedCity("");
    getCityNames(event.target.value);
  };

  const getStationName  =  (name:string) => {
    let stationName = name.split("+")
    return stationName[1];
}

const getStationId  =  (name:string) => {
  let stationName = name.split("+")
  return stationName[0];
}

  return (
    <>
      <div className="container">
        <div className="justify-content-between d-flex mb-3 ">
          <span className="d-flex align-items-center">
            <h5 className="mb-0">Charging Monitoring</h5>
          </span>
          <span className="col-5 d-flex">
            <span className="pt-2">Filter</span>
            <Form.Select
              aria-label="Default select example mr-4"
              style={{ marginLeft: "10px" }}
              className="datestyle"
              onChange={handleStateChange}
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
            {selectedState && selectedState.length > 0 && (
              <>
                <Form.Select
                  aria-label="Default select example"
                  style={{ marginLeft: "10px" }}
                  className="datestyle "
                  onChange={handleDistrictChange}
                >
                  <option hidden value="">
                    Select District
                  </option>
                  {districtNamea &&
                    districtNamea.length > 0 &&
                    districtNamea.map((item: any) => {
                      return (
                        <option key={item.district_id} value={item.district_id}>
                          {item.district_name}
                        </option>
                      );
                    })}
                </Form.Select>
              </>
            )}
            {selectedDistrict && selectedDistrict.length > 0 && (
              <>
                <Form.Select
                  aria-label="Default select example"
                  style={{ marginLeft: "10px" }}
                  className="datestyle "
                  onChange={handleCityChange}
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
              </>
            )}
          </span>
        </div>
        {showLoader == true ? (
          <div className="">
            <div></div>
            <div style={{ textAlign: "center", marginTop: "10%" }}>
              <img
                style={{ position: "relative" }}
                src={loader}
                alt="No loader found"
              />
              <div style={{ position: "relative", color: "white" }}>
                Loading...
              </div>
            </div>
          </div>
        ) : (
          <Row className="g-3">
            {chargingPoints &&
              Object.keys(chargingPoints).length > 0 &&
              Object.keys(chargingPoints).map(
                (station: string, index: number) => {
                   const stationPoints = chargingPoints[station];
                   const anyAvailable = stationPoints.some((point: any) => point.status === "Available");
                  return (
                    <div key={index} className="col-lg-3">
                      <div className="box p-0 dashboardup">
                        <Card className="station-card">
                          <Link id="t-1" to={'/charging-details?name=' + getStationName(station) + "&station_id=" + getStationId(station) }>
                            <Card.Header className={anyAvailable? "greenheader": "stationheder"}>
                              {getStationName(station)}
                            </Card.Header>
                          </Link>
                          <Card.Body style={{ overflowY: "auto" }}>
                            <Card.Text>
                              {chargingPoints[station].map(
                                (point: any, pointIndex: number) => (
                                  <div
                                    key={pointIndex}
                                    className="border-one p-2 border3 mt-3"
                                  >
                                    <div className="d-flex justify-content-between">
                                      <div>Point {point.point}</div>
                                      <div
                                        className={
                                          point.status === "Available"
                                            ? "text-success"
                                            : point.status === "Charging"
                                              ? "text-warning"
                                              : "text-danger"
                                        }
                                      >
                                        {point.status}
                                        {/* {point.status == "Available"? setStationHeader("greenheader"): setStationHeader("stationheder")} */}
                                        {point.status === "Charging" && (
                                          <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M11 4H5C4.44772 4 4 4.44772 4 5V11C4 11.5523 4.44772 12 5 12H11C11.5523 12 12 11.5523 12 11V5C12 4.44772 11.5523 4 11 4Z"
                                              fill="#FFCA42"
                                              stroke="#FFCA42"
                                            />
                                            <path
                                              d="M8.00008 12V13.6667C8.00008 14.219 7.55238 14.6667 7.00008 14.6667H2.66675"
                                              stroke="#FFCA42"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                            />
                                            <path
                                              d="M6.66675 4.00065V1.33398"
                                              stroke="#FFCA42"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                            />
                                            <path
                                              d="M9.33325 4.00065V1.33398"
                                              stroke="#FFCA42"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                            />
                                            <path
                                              d="M7.33325 8H8.66659"
                                              stroke="white"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      Last Heartbeat:{" "}
                                      {new Date(
                                        point.last_heartbeat
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                )
                              )}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </div>
                    </div>
                  );
                }
              )}
          </Row>
        )}

        {chargingPoints && Object.keys(chargingPoints).length > 0 ? (
          ""
        ) : showLoader ? (
          ""
        ) : (
          <NoDataAvailable isShowMessage={true} />
        )}

        {chargingPoints && Object.keys(chargingPoints).length > 0 ? (
          <div className="d-flex flex-row justify-content-between pb-3 align-items-center pagination-row">
            <div className="showing-text ps-3 col-6 font-12">
              {10 * (currentPage - 1) + 1} -{" "}
              {(currentPage - 1) * 10 + 10 > pagination.totalRecords
                ? pagination.totalRecords
                : (currentPage - 1) * 10 + 10}{" "}
              of {pagination.totalRecords}
            </div>
            <div
              className="col-6 text-end ms-auto mt-4"
              style={{ display: "flex", justifyContent: "end" }}
            >
              <Paginations
                className=""
                changePage={(page: number) => {
                  setCurrentPage(page);
                  getAllChargingPoints(page);
                }}
                totalItems={pagination.totalRecords}
                itemsCountPerPage={10}
                changeCurrentPage={currentPage}
              />
            </div>
          </div>
        ) : (
          ""
        )}

        {/* <Row className=" g-3">
                    <div className="col-lg-3">
                        <div className="box p-0 dashboardup">
                            <Card>
                                <Card.Header className="stationheder">Station 1</Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <div className="border-one p-2 d-flex justify-content-between border3">
                                            <div>Point 1</div>
                                            <div className="text-success">Available</div>
                                        </div>
                                        <div className="border-one p-2  border3 mt-3">
                                            <div className="d-flex justify-content-between">
                                                <div>Point 2</div>
                                                <div className="text-warning"><svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11 4H5C4.44772 4 4 4.44772 4 5V11C4 11.5523 4.44772 12 5 12H11C11.5523 12 12 11.5523 12 11V5C12 4.44772 11.5523 4 11 4Z" fill="#FFCA42" stroke="#FFCA42" />
                                                    <path d="M8.00008 12V13.6667C8.00008 14.219 7.55238 14.6667 7.00008 14.6667H2.66675" stroke="#FFCA42" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M6.66675 4.00065V1.33398" stroke="#FFCA42" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M9.33325 4.00065V1.33398" stroke="#FFCA42" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M7.33325 8H8.66659" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>&nbsp;
                                                    Charging</div></div>
                                            <Row><hr className="mt-2 mb-2"></hr></Row>
                                            <div className="mt-0"><img src={Prakash} />&nbsp;Prakash Singh</div>
                                            <div className="mt-2"><img src={Kw} />&nbsp;20kw</div>
                                        </div>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                    <div className="col-lg-3">
                        <div className="box p-0 dashboardup">
                            <Card>
                                <Card.Header className="greenheader">Station 2</Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <div className="border-one p-2 d-flex justify-content-between border3">
                                            <div>Point 1</div>
                                            <div className="text-success">Available</div>
                                        </div>
                                        <div className="border-one p-2 d-flex justify-content-between border3 mt-3">
                                            <div>Point 1</div>
                                            <div className="text-success">Available</div>
                                        </div>
                                    </Card.Text>

                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                    <div className="col-lg-3">
                        <div className="box p-0 dashboardup">
                            <Card>
                                <Card.Header className="stationheder">Station 3</Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <div className="border-one p-2  border3 ">
                                            <div className="d-flex justify-content-between">
                                                <div>Point 2</div>
                                                <div className="text-warning"><svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11 4H5C4.44772 4 4 4.44772 4 5V11C4 11.5523 4.44772 12 5 12H11C11.5523 12 12 11.5523 12 11V5C12 4.44772 11.5523 4 11 4Z" fill="#FFCA42" stroke="#FFCA42" />
                                                    <path d="M8.00008 12V13.6667C8.00008 14.219 7.55238 14.6667 7.00008 14.6667H2.66675" stroke="#FFCA42" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M6.66675 4.00065V1.33398" stroke="#FFCA42" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M9.33325 4.00065V1.33398" stroke="#FFCA42" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M7.33325 8H8.66659" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>&nbsp;
                                                    Charging</div></div>
                                            <Row><hr className="mt-2 mb-2"></hr></Row>
                                            <div className="mt-0"><img src={Prakash} />&nbsp;Prakash Singh</div>
                                            <div className="mt-2"><img src={Kw} />&nbsp;20kw</div>

                                        </div>
                                        <div className="border-one p-2 d-flex justify-content-between border3 mt-3">
                                            <div>Point 1</div>
                                            <div className="text-success">Available</div>
                                        </div>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                    <div className="col-lg-3">
                        <div className="box p-0 dashboardup">
                            <Card>
                                <Card.Header className="greenheader">Station 4</Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <div className="border-one p-2 d-flex justify-content-between border3">
                                            <div>Point 1</div>
                                            <div className="text-success">Available</div>
                                        </div>
                                        <div className="border-one p-2 d-flex justify-content-between border3 mt-3">
                                            <div>Point 1</div>
                                            <div className="text-success">Available</div>
                                        </div>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Row>  */}
      </div>
    </>
  );
};

export default Charging;
