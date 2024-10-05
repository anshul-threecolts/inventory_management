import React, { useEffect, useRef, useState } from "react";
import "./charging.details.scss";
import { Container, Row, Form, Card, Button, Col, Table, Modal, Tab } from "react-bootstrap";
import WebService from "../../Services/WebService";
import NoDataAvailable from "../../components/No-Data/NoData";
import loader from "../../assets/images/loader.gif";
import Paginations from "../../components/pagination/Paginations";
import { RootState } from "../../config/Store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Logo from '../../assets/images/star.svg'
import AccessDenied from "../../components/AccessDenied/AccessDenied";
import Clock from '../../assets/images/clock-line-icon.svg';
import { useLocation, useNavigate } from "react-router-dom";

interface propData {
  activeTab: string;
  rolePermission: any;
  click: any;
}

const Chargingetails = (props: propData) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [isAccess, setIsAccess] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<Boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>();
  const [chargingPoints, setChargingPoints] = useState<any>();
  const [isDataAvailable, setIsDataAvailable] = useState<Boolean>(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chargeStationId = queryParams.get('station_id');

  const userInfoData: any = useSelector<RootState, any>(
    (state: any) => state.userInfoData
  );

  const getAllBookingDetails = (page: number) => {
    setShowLoader(true);
    var body: any = {};
    WebService.getAPI({
      action: `charging-booking-details/${chargeStationId}?page=${page}`,
      body: body,
    }).then((res: any) => {
      let temp: any = {};
      console.log(res.data)
      setPagination(res.pagination);
      setChargingPoints(res.data);
      if(res && res.pagination && res.pagination.totalRecords > 0){
        setIsDataAvailable(true)
      }
      setShowLoader(false);
    }).catch(() => {
      setShowLoader(false);
    });
  };

  useEffect(() => {
    if (userInfoData.user_info.isVendor === 0 && !userInfoData.user_info.vendorId) {
      setIsAccess(true)
    }
    getAllBookingDetails(1);
  }, [userInfoData.user_info.isVendor, isDataAvailable]);

  const formateDate = (time: any) => {
    var array = time.split(':');

    let hour = parseInt(array[0]);
    let minutes = array[1];
    let period = 'AM';

    if (hour >= 12) {
      period = 'PM';
      if (hour > 12) hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }
    let formattedTime = `${hour.toString().padStart(2, '0')}:${minutes} ${period}`;

    return formattedTime;
  }


  return (
    <>
      {showLoader === true ? (
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
            ) : null}

      {isAccess && showLoader === false ?
        <>
          {isDataAvailable ? <>
            <div className="container">
              {chargingPoints && Object.keys(chargingPoints).length > 0 && Object.keys(chargingPoints).map((dateKey) => (
                <Row className="g-3 mt-3" key={dateKey}>
                  <div className="col-lg-2 dayDivBox">
                    <h5>Date</h5>
                    <span>{dateKey}</span>
                  </div>
                  {Object.keys(chargingPoints[dateKey]).map((pointKey) => (
                    <div className="col-lg-5 timeDivBox" key={pointKey}>
                      <h5>{pointKey}</h5>
                      {chargingPoints[dateKey][pointKey].map((pointData: any, index: any) => (
                        <Row className="g-3" style={{ justifyContent: 'space-evenly' }} key={index}>
                          <span className="col-lg-5 timeSlot">
                            <img src={Clock} width={15} height={18} alt="" style={{ marginRight: '10px' }} />
                            {formateDate(pointData.startTime)} - {formateDate(pointData.endTime)}
                          </span>
                        </Row>
                      ))}
                    </div>
                  ))}
                </Row>
              ))}
            </div>
          </> : (
            <NoDataAvailable isShowMessage={true} />
          )
          }
        </>
        :
        ''
      }
    </>
  );
}

export default Chargingetails;
