import React, { useEffect, useRef, useState } from "react";
import "./VendorManagement.scss";
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
import { toast } from "react-toastify";
import { Label } from "../../components/Common/Label/Label";
import { useForm, Controller } from "react-hook-form";
import { HiOutlineEnvelope, HiOutlineKey } from "react-icons/hi2";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
} from "../../components/Grid/Grid";
import DeleteModal from "../../components/Common/DeleteModal/DeleteModal";
import EBDatePicker from "../../components/Common/EBDatePicker/EBDatePicker";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import AccessDenied from "../../components/AccessDenied/AccessDenied";
import HelperService from "../../Services/HelperService";
import VendorSelect from "../../components/VendorSelect/VendorSelect";

const headers: GridHeader[] = [
  {
    title: "Vendor Name",
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
    title: "Contact Number",
    class: "text-center",
  },
  {
    title: "Email",
    class: "text-center",
  },
  {
    title: "Address",
    class: "text-center",
  },
];

const VendorManagement = () => {
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const handleClose = () => {
    setShow(false);
    reset({});
    setIsEdit(false);
  };
  const handleShow = () => {
    setShow(true);
    getStateNames();
    reset({});
  };
  const {
    handleSubmit,
    formState: { errors, isValid },
    control,
    watch,
    getValues,
    register,
    reset,
  } = useForm<any>({});
  const [editData, setEditData] = useState<any>();
  const watchAllFields = watch();
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState<any>(BsEyeSlash);
  const pageCount = useRef<number>(0);
  const [ShowLoader, setShowLoader] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const rowCompute = useRef<GridRow[]>([]);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [showDeleteModal, setDeleteModal] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [isAccess, setIsAccess] = useState<boolean>(false);
  const userInfoData: any = useSelector<RootState, any>(
    (state: any) => state.userInfoData
  );
  const [stateNames, setStateNames] = useState<any[]>([]);
  const [districtNames, setDistrictNames] = useState<any[]>([]);
  const [cityNames, setCityNames] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState<any>();
  const selectedDistrict = useRef<any>("");
  const selectedCity = useRef<any>("");
  const selectedState = useRef<any>("");

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
    getStateNames();
    getVendorList(1);
  }, [userInfoData.user_info.isVendor]);

  const addVendor = (data: any) => {
    console.log("data---", data);

    if (data.id) {
      WebService.putAPI({
        action: "update-vendor/" + data.vendorId,
        body: data,
        id: "add_vendor",
      })
        .then((res: any) => {
          reset({});
          setShow(false);
          getVendorList(1);
          toast.success("Vendor Updated Successfully");
        })
        .catch((e) => {
          toast.error("Vendor Updatation Failed try again.");
        });
    } else {
      console.log(data);
      WebService.postAPI({ action: "add-vendor", body: data, id: "add_vendor" })
        .then((res: any) => {
          reset({});
          setShow(false);
          getVendorList(1);
          toast.success("Vendor Created Successfully");
        })
        .catch(() => {
          toast.error("Vendor Creation Failed try again.");
        });
    }
  };

  const getVendorList = (
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
      action: `vendors?keyword=${keyword ? keyword : ""}&date_from=${
        startDate ? startDate : ""
      }&date_to=${endDate ? endDate : ""}`,
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
            value: res.data[i].vendorName ? res.data[i].vendorName : "N/A",
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
            value: res.data[i].contact_number
              ? res.data[i].contact_number
              : "N/A",
          });
          columns.push({
            value: res.data[i].email ? res.data[i].email : "N/A",
          });
          columns.push({
            value: res.data[i].address ? res.data[i].address : "N/A",
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

  const handleToggle = () => {
    if (type === "password") {
      setIcon(BsEye);
      setType("text");
    } else {
      setIcon(BsEyeSlash);
      setType("password");
    }
  };

  const onEdit = (val: any) => {
    console.log(val);

    getStateNames();
    setEditData(val);
    reset(val);
    getDistrict(val.state_id);
    getCity(val.district_id);
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
      action: `delete-vendor/${editData?.vendorId}`,
      body: null,
    })
      .then((res: any) => {
        setShowLoader(false);
        toast.success(res.message);
        setEditData("");
        getVendorList(1);
      })
      .catch((e) => {
        setShowLoader(false);
        setEditData("");
      });
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
        console.log("temp", temp);

        setStateNames(temp);
      })
      .catch(() => {});
  };

  const getDistrict = (id: any) => {
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
        console.log("temp", temp);
        setDistrictNames(temp);
      })
      .catch(() => {});
  };

  const getCity = (id: any) => {
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

  return (
    <>
      {isAccess ? (
        <>
          <div className="container">
            <div className="justify-content-between d-flex mb-3 ">
              <span className="d-flex align-items-center">
                <h5 className="mb-0">Vendor Management</h5>
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
                      getDistrict(e.id);
                      getVendorList(1);
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
                          getVendorList(1);
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
                          getVendorList(1);
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
                searchPlaceholder="Search By Vendor Name/Email"
                rows={rows}
                showDateFilter={true}
                showSearch={true}
                headers={headers}
                ShowLoader={ShowLoader}
                count={totalCount}
                onPageChange={getVendorList}
                errorMessage={"No Station Found"}
              />
            </div>
          </div>

          <Modal size="lg" show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{editData ? "Edit" : "Add"} Vendor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form className="mb-3" onSubmit={handleSubmit(addVendor)}>
                <div className="row">
                  <div className="col-lg-6">
                    <label className="mt-2">Vendor First name</label>
                    <span className="text-danger">*</span>
                    <div className="input-group mb-1 mt-2">
                      <input
                        type="text"
                        className="form-control ps-3 p-2"
                        placeholder="Vendor First Name"
                        {...register("firstName", { required: true })}
                      />
                    </div>
                    {errors.firstName && (
                      <div className="login-error">
                        <Label
                          title={"Vendor first name required"}
                          modeError={true}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-lg-6">
                    <label className="mt-2">Vendor Last name</label>
                    <span className="text-danger">*</span>
                    <div className="input-group mb-1 mt-2">
                      <input
                        type="text"
                        className="form-control ps-3 p-2"
                        placeholder="Vendor Last Name"
                        {...register("lastName", { required: true })}
                      />
                    </div>
                    {errors.lastName && (
                      <div className="login-error">
                        <Label
                          title={"Vendor last name required"}
                          modeError={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-lg-6">
                    <div className="input-group">
                      <div className="time-pickers position-relative w-100-mob w-100">
                        <Controller
                          control={control}
                          name="state_id"
                          rules={{
                            required: true,
                          }}
                          render={({ field }) => (
                            <Form.Group className="mb-1">
                              <label className="mb-2">{"State"}</label>
                              <span className="text-danger">*</span>
                              <VendorSelect
                                onChange={(e: any) => {
                                  getDistrict(e.id);
                                  field.onChange(e.id);
                                }}
                                isSearchable={true}
                                options={stateNames}
                                selected={watchAllFields.state_id}
                              />
                            </Form.Group>
                          )}
                        />
                        {errors.state_id && (
                          <div className="login-error mt-4">
                            <Label
                              title={"Please Select State"}
                              modeError={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="time-pickers position-relative w-100-mob w-100">
                      <Controller
                        control={control}
                        name="district_id"
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <Form.Group className="mb-1">
                            <label className="mb-2">{"District"}</label>
                            <span className="text-danger">*</span>
                            <VendorSelect
                              onChange={(e: any) => {
                                getCity(e.id);
                                field.onChange(e.id);
                              }}
                              isSearchable={true}
                              options={districtNames}
                              selected={watchAllFields.district_id}
                            />
                          </Form.Group>
                        )}
                      />
                      {errors.district_id && (
                        <div className="login-error mt-4">
                          <Label
                            title={"Please Select District"}
                            modeError={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-lg-6">
                    <div className="time-pickers position-relative w-100-mob w-100">
                      <Controller
                        control={control}
                        name="city_id"
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <Form.Group className="mb-1">
                            <label className="mb-2">{"City"}</label>
                            <span className="text-danger">*</span>
                            <VendorSelect
                              onChange={(e: any) => {
                                field.onChange(e.id);
                              }}
                              isSearchable={true}
                              options={cityNames}
                              selected={watchAllFields.city_id}
                            />
                          </Form.Group>
                        )}
                      />
                      {errors.city_id && (
                        <div className="login-error mt-4">
                          <Label
                            title={"Please Select City"}
                            modeError={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <label className="mb-2">Contact Number</label>
                    <span className="text-danger">*</span>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control ps-3 p-2"
                        placeholder="Contact Number"
                        onKeyPress={(e) =>
                          HelperService.allowOnlyNumericValue10(e)
                        }
                        {...register("contact_number", { required: true })}
                      />
                    </div>
                    {errors.contact_number && (
                      <div className="login-error">
                        <Label
                          title={"Contact Number required"}
                          modeError={true}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="row mt-3">
                  <div className="col-lg-6">
                    {!isEdit && (
                      <>
                        <label>Email</label>
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
                                      errors.email?.message ||
                                      watchAllFields.email
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
                      </>
                    )}
                  </div>
                  <div className={isEdit ? "col-lg-12" : "col-lg-6"}>
                    <div>
                      <label className="mb-2">Comment</label>
                      <span className="text-danger">*</span>
                      <div className="input-group">
                        <textarea
                          placeholder="Enter comment"
                          style={{ width: "100%", height: "42px", padding: "5px" }}
                          {...register("comment", { required: true })}
                        />
                      </div>
                      {errors.comment && (
                        <div className="login-error">
                          <Label title={"Comment required"} modeError={true} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-lg-6">
                      <>
                        <label className="mb-2">{isEdit ? 'Change' : 'Create'} Password</label>
                        <span className="text-danger">{!isEdit ? '*' : ''}</span>
                        <Controller
                          control={control}
                          name="password"
                          rules={{
                            required: isEdit?false:"Please Enter Password",
                          }}
                          render={({
                            field: { onChange, onBlur },
                            fieldState: { isTouched },
                          }) => (
                            <div className="mb-3">
                              <div className="form-group mb-4">
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
                  <div className="col-lg-6">
                    <div className="form-group mb-3">
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
                              required: isEdit?false:"Please Enter New Password",
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

                <Button
                  id="add_vendor"
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

export default VendorManagement;
