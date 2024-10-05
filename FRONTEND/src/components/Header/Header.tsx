import { Container, Navbar, Dropdown, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Logo from "../../assets/images/ev-logo.svg";
import user from "../../assets/images/user.svg";
import { GoChevronDown } from "react-icons/go";
import { Dispatch, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import { reduxState } from "../../reducer/CommonReducer";
import DeleteModal from "../Common/DeleteModal/DeleteModal";
import WebService from "../../Services/WebService";
import {
  setDataInRedux,
  USER_INFO,
  USER_LOGOUT,
} from "../../action/CommonAction";
import HelperService from "../../Services/HelperService";

const Header = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const commonData: any = useSelector<RootState, reduxState>(
    (state: any) => state.commonData
  );
  const [showDeleteModal, setDeleteModal] = useState<boolean>(false);
  const userInfoData: any = useSelector<RootState, any>(
    (state: any) => state.userInfoData
  );

  useEffect(() => {
    userMeCall();
  }, []);

  useEffect(() => {
    if ( commonData && commonData.update_me_call) {
        dispatch(setDataInRedux({ type: USER_INFO, value:{} }));
      userMeCall();
    }
  }, [commonData]);

  const onConfirmDelete = () => {
    setDeleteModal(true);
  };

  const logOut = () => {
    localStorage.clear();
    dispatch(setDataInRedux({ type: USER_LOGOUT, value: "" }));
    window.location.href = "/login";
  };

  const onLogoutredirect = () => {
    logOut();
  };

  const onLogout = () => {
    onConfirmDelete();
  };

  const userMeCall = async () => {
    WebService.getAPI({ action: "me", id: "login_btn" })
      .then((res: any) => {
        console.log("header---> ", res.user[0]);
        dispatch(setDataInRedux({ type: USER_INFO, value: res.user[0] }));
      })
      .catch(() => {
        typeof window !== "undefined" && localStorage.clear();
      });
  };

  return (
    <>
      <header className="site-header">
        <DeleteModal
          isShow={showDeleteModal}
          message={"Are You sure you want to logout.?"}
          close={() => {
            setDeleteModal(false);
          }}
          onDelete={() => {
            onLogoutredirect();
          }}
        />
        <Container fluid className="header-nav">
          <Navbar expand="lg">
            <Navbar.Brand className="me-5 mt-1">
              <img src={Logo} width={186} height={30} alt="" />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <div className="d-flex align-items-center ms-auto gap-3">
              <Dropdown className="profile-dd">
                <Dropdown.Toggle>
                  <div>{}</div>
                  {userInfoData &&
                    userInfoData?.user_info &&
                    !HelperService.isEmptyObject(userInfoData?.user_info) && (
                      <div className="d-flex gap-2 align-items-center">
                        <div>
                          <img
                            src={user}
                            width={35}
                            height={35}
                            className=" rounded-circle object-fit-cover"
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="font-12 mb-0 text-black text-secondary">
                            {userInfoData?.user_info?.email}
                          </p>
                        </div>
                      </div>
                    )}
                  {/* <div className='d-flex gap-2'>
                                        <div><img src={user} width={35} height={35} className=" rounded-circle object-fit-cover" alt='' /></div>
                                        <div >
                                            <p className='font-14 mb-0 text-dark font-medium'>Welcome</p>
                                            <p className='font-12 mb-0 text-secondary'>randywonana123@gmail.com</p>
                                        </div>
                                    </div> */}
                  <GoChevronDown size={16} className="icon" />
                </Dropdown.Toggle>

                <Dropdown.Menu align="end">
                  {/* <Link to="/profile" className="dropdown-item">My Profile</Link> */}
                  <Button className=" dropdown-item" onClick={() => onLogout()}>
                    Logout
                  </Button>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Navbar>
        </Container>
      </header>
    </>
  );
};
export default Header;
