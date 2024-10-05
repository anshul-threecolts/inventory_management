import React, { Dispatch, useEffect, useRef, useState } from "react";
import "./users.scss";
import { Container, Row, Form, Card, Button, Table } from "react-bootstrap";
import Loginbg from "../../assets/images/rupess.svg";
import { Link } from "react-router-dom";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import Modal from "react-bootstrap/Modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import AccessDenied from "../../components/AccessDenied/AccessDenied";
import { Controller, useForm } from "react-hook-form";
import WebService from "../../Services/WebService";
import { toast } from "react-toastify";
import { Label } from "../../components/Common/Label/Label";
import { HiOutlineEnvelope, HiOutlineKey } from "react-icons/hi2";
import HelperService from "../../Services/HelperService";
import VendorSelect from "../../components/VendorSelect/VendorSelect";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
} from "../../components/Grid/Grid";
import DeleteModal from "../../components/Common/DeleteModal/DeleteModal";
import { UPDATE_ME_CALL, setDataInRedux } from "../../action/CommonAction";
const headers: GridHeader[] = [
  {
    title: "Name",
    class: "text-center",
  },
  {
    title: "Mobile Number",
    class: "text-center",
  },
  {
    title: "Email",
    class: "text-center",
  },
  {
    title: "Units Consumed",
    class: "text-center",
  },
  {
    title: "# Of Bookings",
    class: "text-center",
  },
  {
    title: "Action",
    class: "text-center",
  },
];
const CustomerDatabase = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setIsEdit(false);
    setEditData("")
    reset({});
  };
  const handleShow = () => {
    setShow(true);
    setEditData("")
    reset({});
  };
  const [isAccess, setIsAccess] = useState<boolean>(false);
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
  const dispatch: Dispatch<any> = useDispatch();

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const watchAllFields = watch();
  const [isEdit, setIsEdit] = useState(false);
  const [roleList, setRoleList] = useState<any[]>([]);
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState<any>(BsEyeSlash);
  const [showPassword, setShowPassword] = useState<any>();
  const [permissionList, setPermissionList] = useState<any[]>([]);
  const pageCount = useRef<number>(0);
  const [ShowLoader, setShowLoader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState<GridRow[]>([]);
  const rowCompute = useRef<GridRow[]>([]);
  const [editData, setEditData] = useState<any>();
  const [showDeleteModal, setDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    let exist = false;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].title == "Action") {
        exist = true;
        break;
      }
    }
    if (userInfoData?.user_info?.permission) {
      if (
        userInfoData?.user_info?.permission === "VIEW_EDIT" ||
        userInfoData?.user_info?.permission === "ALL"
      ) {
        if (!exist) {
          headers.push({ title: "Action", class: "text-center" });
        }
      }
    }
  }, [userInfoData?.user_info?.permission]);
  useEffect(() => {
    if (
      userInfoData?.user_info?.isVendor === 0 &&
      !userInfoData?.user_info?.vendorId
    ) {
      setIsAccess(true);
    }
    let roleValue = [
      { id: "MANAGER", role: "Manager" },
      { id: "ADMIN", role: "Admin" },
      { id: "SERVICE_ENGINEER", role: "Service Engineer" },
    ];
    let temp1: any[] = [];
    for (let i in roleValue) {
      temp1.push({
        ...roleValue[i],
        value: roleValue[i].role,
        id: roleValue[i].id,
      });
    }
    setRoleList(temp1);

    let permissionValue = [
      { id: "VIEW", permission: "View" },
      { id: "VIEW_EDIT", permission: "View Edit" },
      { id: "ALL", permission: "All" },
    ];
    let temp2: any[] = [];
    for (let i in permissionValue) {
      temp2.push({
        ...permissionValue[i],
        value: permissionValue[i].permission,
        id: permissionValue[i].id,
      });
    }
    setPermissionList(temp2);
    getCustomerList(1);
  }, [userInfoData?.user_info?.isVendor]);

  const updateCustomer = (data: any) => {
    if (data.id) {
      WebService.putAPI({
        action: "update-customer/" + data.id,
        body: data,
        id: "update_customer",
      })
        .then((res: any) => {
          reset({});
          setShow(false);
          toast.success("User Updated Successfully");
          getCustomerList(1);
        })
        .catch((e) => {
          toast.error("User Updatation Failed try again.");
        });
    } 
  };
  const handleToggle = () => {
    if (type === "password") {
      setIcon(BsEye);
      setType("text");
    } else {
      setIcon(BsEyeSlash);
      setType("password");
    }
  };

  const getCustomerList = (
    page: number,
    keyword?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    pageCount.current = page;
    setShowLoader(true);
    WebService.getAPI({
      action: `customers?keyword=${keyword ? keyword : ""}&date_from=${startDate ? startDate : ""
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
          columns.push({ value: res.data[i].name ? res.data[i].name : "N/A" });
          columns.push({ value: res.data[i].mobile_number ? res.data[i].mobile_number : "N/A" });
          columns.push({ value: res.data[i].email ? res.data[i].email : "N/A" });
          columns.push({ value: res.data[i].unit ? res.data[i].unit : "N/A" });
          columns.push({ value: res.data[i].totalBooking ? res.data[i].totalBooking : "N/A" });
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

  const onEdit = (val: any) => {
    setEditData(val);
    reset(val);
    setIsEdit(true);
    setShow(true);
  };
  const onConfirmDelete = (val: any) => {
    setEditData(val);
    setDeleteModal(true);
  };
  const onDelete = () => {
    setDeleteModal(false);
    setShowLoader(true);
    WebService.deleteAPI({
      action: `delete-customer/${editData?.id}`,
      body: null,
    })
      .then((res: any) => {
        setShowLoader(false);
        toast.success(res.message);
        setEditData({});
        getCustomerList(1);
      })
      .catch((e) => {
        setShowLoader(false);
        setEditData({});
      });
  };

  return (
    <>
      {isAccess ? (
        <>
          <div className="container">
            <div className="justify-content-between d-flex mb-3 ">
              <span className="d-flex align-items-center">
                <h5 className="mb-0">Customer Database</h5>
              </span>
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
                searchPlaceholder="Search By Name/Email"
                rows={rows}
                showDateFilter={false}
                showSearch={false}
                headers={headers}
                ShowLoader={ShowLoader}
                count={totalCount}
                onPageChange={getCustomerList}
                errorMessage={"No User Found"}
              />
            </div>
          </div>

          <Modal size="lg" show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{isEdit ? 'Edit' : 'Add'} Customer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form className="mb-3" onSubmit={handleSubmit(updateCustomer)}>
                <div className="row">
                  <div className="col-lg-12">
                    <label className="mt-2">Name</label>
                    <span className="text-danger">*</span>
                    <div className="input-group mb-1 mt-2">
                      <input
                        type="text"
                        className="form-control ps-3 p-2"
                        placeholder="Enter Name"
                        {...register("name", { required: true })}
                      />
                    </div>
                    {errors.name && (
                      <div className="login-error mt-2">
                        <Label title={"Name required"} modeError={true} />
                      </div>
                    )}
                  </div>
                </div>
                <Button id="update_customer" type="submit" className="btn-brand-1 w-100 mt-4">Save</Button>
              </form>
            </Modal.Body>
            <Modal.Footer></Modal.Footer>
          </Modal>
        </>
      ) : (
        <>
          {isAccess &&
            userInfoData?.user_info(<AccessDenied isShowMessage={true} />)}
        </>
      )}
    </>
  );
};

export default CustomerDatabase;
