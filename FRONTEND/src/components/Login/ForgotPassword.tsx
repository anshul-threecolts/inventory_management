import LoginImg from "../../assets/images/login-img.png"
import Logo from '../../assets/images/shan_and_co_logo.png'
import { BsEye } from "react-icons/bs";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { HiOutlineKey } from "react-icons/hi2";
import "./login.scss";
const ForgotPassword = () => {
    return (
        <>
            <div className="login-page">
                <div className="row g-0">
                    <div className="col-lg-7">
                        <img src={LoginImg} className="login-img" alt="" />
                    </div>
                    <div className="col-lg-5 d-flex align-items-center justify-content-center">
                        <div className="mb-3 w-100">
                            <div className="px-lg-5 mb-3">
                                <div className="  mb-4">
                                    <img src={Logo} width="69" alt="Logo" />
                                </div>
                                <div className=" ">

                                    <h4 className="text-brand mb-4">Login to your account</h4>
                                    <div className="form-group">
                                         
                                        <div className="input-group mb-3">
                                        <span className="input-group-text bg-white border-end-0 text-secondary">
                                                <HiOutlineEnvelope size={16} />
                                            </span>
                                            <input type="email" className="form-control border-start-0 ps-0" placeholder="Email Address" />
                                           
                                        </div>
                                    </div>
                                    <div className="form-group mb-2">
                                        <div className="input-group mb-2">
                                            <span className="input-group-text bg-white border-end-0 text-secondary">
                                                <HiOutlineKey size={16} />
                                            </span>
                                            <input type="password" className="form-control border-end-0 border-start-0 ps-0" placeholder="Password" />
                                            <span className="input-group-text text-secondary bg-white border-start-0">
                                                <BsEye  size={16} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-end mb-3"><a href="" className="text-brand font-14">Forgot Password?</a> </div>
                                </div>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-brand-1 w-100">Login</button>
                                </div>
                            </div>
                            <p className="font-14 text-center mb-4">By continuing, you agree to our Terms of Service  and  Privacy Policy.</p>
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}
export default ForgotPassword;