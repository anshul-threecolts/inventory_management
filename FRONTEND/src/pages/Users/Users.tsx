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
    title: "Date",
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
    title: "Role",
    class: "text-center",
  },
  {
    title: "Permission",
    class: "text-center",
  },
];
const Users = () => {
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
    getUserList(1);
  }, [userInfoData?.user_info?.isVendor]);

  const addUser = (data: any) => {
    if (data.id) {
      WebService.putAPI({
        action: "update-user/" + data.id,
        body: data,
        id: "add_user",
      })
        .then((res: any) => {
          reset({});
          setShow(false);
          toast.success("User Updated Successfully");
          dispatch(setDataInRedux({ type: UPDATE_ME_CALL, value: true }));
          getUserList(1);
        })
        .catch((e) => {
          toast.error("User Updatation Failed try again.");
        });
    } else {
      WebService.postAPI({ action: "add-user", body: data, id: "add_user" })
        .then((res: any) => {
          reset({});
          setShow(false);
          getUserList(1);
          toast.success("User Created Successfully");
        })
        .catch(() => {
          toast.error("User Creation Failed try again.");
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

  const getUserList = (
    page: number,
    keyword?: string,
    startDate?: Date,
    endDate?: Date
  ) => {
    pageCount.current = page;
    setShowLoader(true);
    WebService.getAPI({
      action: `users?keyword=${keyword ? keyword : ""}&date_from=${
        startDate ? startDate : ""
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
            value: res.data[i].name ? res.data[i].name : "N/A",
          });
          columns.push({
            value: res.data[i].created_at
              ? HelperService.getFormatedDateForDetail(
                  res.data[i].created_at,
                  "MM/DD/YYYY"
                )
              : "N/A",
          });
          columns.push({
            value: res.data[i].mobile_number
              ? res.data[i].mobile_number
              : "N/A",
          });
          columns.push({
            value: res.data[i].email ? res.data[i].email : "N/A",
          });
          columns.push({
            value: res.data[i].role
              ? HelperService.getRoleValue(res.data[i].role)
              : "N/A",
          });
          columns.push({
            value: res.data[i].permission
              ? HelperService.getPermissionValue(res.data[i].permission)
              : "N/A",
          });
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
      action: `delete-user/${editData?.id}`,
      body: null,
    })
      .then((res: any) => {
        setShowLoader(false);
        toast.success(res.message);
        setEditData({});
        getUserList(1);
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
                <h5 className="mb-0">User Management</h5>
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
                showDateFilter={true}
                showSearch={true}
                headers={headers}
                ShowLoader={ShowLoader}
                count={totalCount}
                onPageChange={getUserList}
                errorMessage={"No User Found"}
              />
            </div>
          </div>

          <Modal size="lg" show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{isEdit ? 'Edit' : 'Add' } User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form className="mb-3" onSubmit={handleSubmit(addUser)}>
                <div className="row">
                  <div className="col-lg-6">
                    <label className="mt-2">First Name</label>
                    <span className="text-danger">*</span>
                    <div className="input-group mb-1 mt-2">
                      <input
                        type="text"
                        className="form-control ps-3 p-2"
                        placeholder="First Name"
                        {...register("first_name", { required: true })}
                      />
                    </div>
                    {errors.first_name && (
                      <div className="login-error mt-2">
                        <Label title={"First Name required"} modeError={true} />
                      </div>
                    )}
                  </div>
                  <div className="col-lg-6">
                    <label className="mt-2">Last Name</label>
                    <span className="text-danger">*</span>
                    <div className="input-group mb-1 mt-2">
                      <input
                        type="text"
                        className="form-control ps-3 p-2"
                        placeholder="Last Name"
                        {...register("last_name", { required: true })}
                      />
                    </div>
                    {errors.last_name && (
                      <div className="login-error mt-2">
                        <Label title={"Last Name required"} modeError={true} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6">
                    <label className="mt-2">Mobile Number</label>
                    <span className="text-danger">*</span>
                    <div className="input-group mb-1 mt-2">
                      <input
                        type="text"
                        className="form-control ps-3 p-2"
                        placeholder="Mobile Number"
                        onKeyPress={HelperService.allowOnlyNumericValue10}
                        {...register("mobile_number", { required: true })}
                      />
                    </div>
                    {errors.mobile_number && (
                      <div className="login-error mt-2">
                        <Label
                          title={"Mobile Number required"}
                          modeError={true}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-lg-6">
                    <label className="mt-2">Email</label>
                    <span className="text-danger">*</span>
                    <Controller
                      control={control}
                      name="email"
                      rules={{
                        required: "false",
                        pattern: {
                          value: emailRegex,
                          message: "Enter valid email address",
                        },
                      }}
                      render={({
                        field: { onChange, onBlur },
                        fieldState: { isTouched, isDirty },
                      }) => (
                        <div>
                          <div className="form-group">
                            <div className="input-group mb-1 mt-2">
                              <span className="input-group-text bg-white border-end-0 text-secondary">
                                <HiOutlineEnvelope size={16} />
                              </span>
                              <input
                                type="text"
                                className="form-control ps-3 p-2"
                                name="new-email"
                                placeholder="Email Address"
                                onChange={onChange}
                                onBlur={onBlur}
                                value={watch().email}
                              />
                            </div>
                          </div>
                          {(errors["email"]?.message ||
                            Boolean(errors["email"]?.message) ||
                            (isTouched && !watchAllFields.email) ||
                            (watchAllFields.email &&
                              !emailRegex.test(watchAllFields.email))) && (
                            <div className="login-error">
                              <Label
                                title={
                                  errors.email?.message || watchAllFields.email
                                    ? "Enter valid email address"
                                    : "Please Enter Email."
                                }
                                modeError={true}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6">
                      <>
                        <label className="mt-3 mb-2">{isEdit ? 'Change' : 'Create' } Password</label>
                        <span className="text-danger">{!isEdit ? '*' : '' }</span>
                        <Controller
                          control={control}
                          name="password"
                          rules={{
                            required: isEdit ? false : "Please Enter Password",
                          }}
                          render={({
                            field: { onChange, onBlur },
                            fieldState: { isTouched },
                          }) => (
                            <div className="mb-3">
                              <div className="form-group mb-2">
                                <div className="input-group mb-2">
                                  <span className="input-group-text bg-white border-end-0 text-secondary">
                                    <HiOutlineKey size={16} />
                                  </span>
                                  <input
                                    type={type}
                                    name="new-email"
                                    className="form-control ps-3 p-2"
                                    placeholder="Password"
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    autoComplete="new-password"
                                  />

                                  <span
                                    className="input-group-text text-secondary bg-white border-start-0 cursor-pointer"
                                    onClick={handleToggle}
                                  >
                                    {type == "password" ? (
                                      <BsEye size={16} />
                                    ) : (
                                      <BsEyeSlash size={16} />
                                    )}
                                  </span>
                                </div>
                              </div>
                              {(errors["password"]?.message ||
                                Boolean(errors["password"]?.message) ||
                                (isTouched && !watchAllFields.password)) && (
                                <div className="login-error">
                                  <Label
                                    title={
                                      errors.password?.message ||
                                      watchAllFields.password
                                        ? "Between 8 to 20 characters and at least one upper case, lower case, number and special character."
                                        : "Please Enter Password."
                                    }
                                    modeError={true}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        />
                      </>
                  </div>
                  <div className="col-lg-6 mt-3">
                    <div className="form-group">
                        <>
                          <label className="mb-2">
                            {" "}
                            {"Confirm New Password"}
                          </label>
                          <span className="text-danger">{!isEdit ? '*' : ''}</span>
                          <Controller
                            control={control}
                            name="comfirmpassword"
                            rules={{
                              required: isEdit ? false : "Please Enter New Password",
                              validate: (value: any) => {
                                const { password } = getValues();
                                return (
                                  password === value || "Passwords must match"
                                );
                              },
                            }}
                            render={({
                              field: { onChange, onBlur },
                              fieldState: { isTouched },
                            }) => (
                              <div className="mb-3">
                                <div className="input-group mb-2">
                                  <span className="input-group-text bg-white border-end-0 text-secondary">
                                    <HiOutlineKey size={16} />
                                  </span>
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control ps-3 p-2"
                                    placeholder="Confirm New Password"
                                    onChange={onChange}
                                    onBlur={onBlur}
                                  />
                                  <span
                                    className="input-group-text text-secondary bg-white border-start-0 cursor-pointer"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {type == "password" ? (
                                      <BsEye
                                        size={16}
                                        style={{ color: "#0B1956" }}
                                      />
                                    ) : (
                                      <BsEyeSlash
                                        size={16}
                                        style={{ color: "#0B1956" }}
                                      />
                                    )}
                                  </span>
                                </div>
                                {(errors["comfirmpassword"]?.message ||
                                  Boolean(errors["comfirmpassword"]?.message) ||
                                  (isTouched &&
                                    !watchAllFields.comfirmpassword) ||
                                  (watchAllFields.comfirmpassword &&
                                    watchAllFields.password !=
                                      watchAllFields.comfirmpassword)) && (
                                  <div className="login-error">
                                    <Label
                                      title={
                                        errors.comfirmpassword?.message ||
                                        watchAllFields.comfirmpassword
                                          ? "Passwords Must Match"
                                          : "Please Enter Confirm Password."
                                      }
                                      modeError={true}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          />
                        </>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6">
                    <div className="time-pickers position-relative w-100-mob w-100">
                      <Controller
                        control={control}
                        name="role"
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <Form.Group className="mb-1">
                            <label className="mb-2 mt-2">{"Role"}</label>
                            <span className="text-danger">*</span>
                            <VendorSelect
                              onChange={(e: any) => {
                                field.onChange(e.id);
                              }}
                              isSearchable={true}
                              options={roleList}
                              selected={watchAllFields.role}
                            />
                          </Form.Group>
                        )}
                      />
                      {errors.role && (
                        <div className="login-error mt-3">
                          <Label
                            title={"Please Select Role"}
                            modeError={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="time-pickers position-relative w-100-mob w-100">
                      <Controller
                        control={control}
                        name="permission"
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <Form.Group className="mb-1">
                            <label className="mb-2 mt-2">{"Permission"}</label>
                            <span className="text-danger">*</span>
                            <VendorSelect
                              onChange={(e: any) => {
                                field.onChange(e.id);
                              }}
                              isSearchable={true}
                              options={permissionList}
                              selected={watchAllFields.permission}
                            />
                          </Form.Group>
                        )}
                      />
                      {errors.permission && (
                        <div className="login-error mt-3">
                          <Label
                            title={"Please Select Permission"}
                            modeError={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  id="add_user"
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
      ) : (
        <>
          {isAccess &&
            userInfoData?.user_info(<AccessDenied isShowMessage={true} />)}
        </>
      )}
    </>
  );
};

export default Users;
