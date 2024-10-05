import React, { Dispatch, useEffect, useRef, useState } from "react";
import "./feedback.scss";
import { Container, Row, Form, Card, Button, Table } from "react-bootstrap";
import Loginbg from "../../assets/images/rupess.svg";
import { Link, useNavigate } from "react-router-dom";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import Logo from "../../assets/images/star.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import AccessDenied from "../../components/AccessDenied/AccessDenied";
import { Rating } from "react-simple-star-rating";

import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
} from "../../components/Grid/Grid";
import WebService from "../../Services/WebService";
import { FEEDBACK_VIEW_DATA, setDataInRedux } from "../../action/CommonAction";
const Feedback = () => {
  const [isAccess, setIsAccess] = useState<boolean>(false);
  const userInfoData: any = useSelector<RootState, any>(
    (state: any) => state.userInfoData
  );
  const Navigate = useNavigate();
  const pageCount = useRef<number>(0);
  const dispatch: Dispatch<any> = useDispatch();

  const [ShowLoader, setShowLoader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<GridRow[]>([]);
  const rowCompute = useRef<GridRow[]>([]);
  const headers: GridHeader[] = [
    {
      title: "User Name",
      class: "text-center",
    },
    {
      title: "Email",
      class: "text-center",
    },
    {
      title: "City",
      class: "text-center",
    },
    {
      title: "Rating",
      class: "text-center",
    },
    {
      title: "Comment",
      class: "text-center",
    },
    {
      title: "Action",
      class: "text-center",
    },
  ];
  const vendorId = useRef<any>();

  useEffect(() => {
    if (
      userInfoData.user_info.isVendor === 0 &&
      !userInfoData.user_info.vendorId
    ) {
      setIsAccess(true);
    }
  }, [userInfoData.user_info.isVendor]);

  useEffect(() => {
    const vendor_id = userInfoData.user_info.vendorId;
    vendorId.current = vendor_id;
    getFeedBackList(1);
  }, [userInfoData.user_info.vendorId]);

  const getFeedBackList = (
    page: number,
    keyword?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    var obj: any = {};
    if(vendorId && vendorId.current){
      obj["vendor_id"] =  vendorId.current;
    }
    pageCount.current = page;
    setShowLoader(true);
    if(vendorId && vendorId.current){
      obj["page"] =  page;
    }
    WebService.getAPI({
      action: `feedbacks?keyword=${keyword ? keyword : ""}&date_from=${startDate ? startDate : ""
        }&date_to=${endDate ? endDate : ""}`,
      body: obj,
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
            value: res.data[i].userName ? res.data[i].userName : "N/A",
          });

          columns.push({
            value: res.data[i].email ? res.data[i].email : "N/A",
          });

          columns.push({
            value: res.data[i].city ? res.data[i].city : "N/A",
          });
          // columns.push({
          //   value: res.data[i].rating ? res.data[i].rating : "N/A",
          // });
          columns.push({
            value: res.data[i].rating ? setRatingValue(res.data[i].rating) : "N/A",
          });
          columns.push({
            value: res.data[i].comment ? res.data[i].comment : "N/A",
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


const handleViewFeedBack  =(data:any)=>{
  dispatch(setDataInRedux({ type: FEEDBACK_VIEW_DATA, value: data }));
  Navigate("/feedbackdetails")

}
  
  const actionList = (data: any) => {
    return (
      <div className="action-btns">
        <Button
          variant="outline-success"
          size="sm"
          onClick={()=>handleViewFeedBack(data)}
        >
          View
        </Button>
      </div> 
    );
  };


  const setRatingValue = (rating: any) => {

    return (
      <>
        <Rating
          allowFraction={true}
          size={20}
          readonly={true}
          initialValue={rating}
        />
      </>
    )




  }
  return (
    <>
        <>
          <div className="container">
            <div className="justify-content-between d-flex mb-3 ">
              <span className="d-flex align-items-center">
                <h5 className="mb-0">Feedback Management</h5>
              </span>
            </div>
            <div className="table-card">
              <Grid
                searchPlaceholder="Search By Name/Email/City"
                rows={rows}
                showDateFilter={true}
                showSearch={true}
                headers={headers}
                ShowLoader={ShowLoader}
                count={totalCount}
                onPageChange={getFeedBackList}
                errorMessage={"No User Found"}
              />
            </div>
          </div>
        </>
    </>
  );
};

export default Feedback;
