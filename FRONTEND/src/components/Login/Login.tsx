
import { Dispatch, useState } from 'react';
import Logo from '../../assets/images/shan_and_co_logo.png'
import { Link, useNavigate } from 'react-router-dom';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { HiOutlineEnvelope } from "react-icons/hi2";
import { HiOutlineKey } from "react-icons/hi2";
import { Form, Button } from 'react-bootstrap'
import "./login.scss";
import { useDispatch } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import WebService from '../../Services/WebService';
import { toast } from 'react-toastify';
import { Label } from '../Common/Label/Label';
import { ROLE_PERMMISION_DATA, USER_INFO, USER_LOGIN_SUCCESS, USER_LOGOUT, setDataInRedux } from "../../action/CommonAction";


const Login = () => {
    const [password, setPassword] = useState("");
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState<any>(BsEyeSlash);

    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const { handleSubmit, formState: { errors, isValid }, control, watch } = useForm<any>({});
    const watchAllFields = watch();
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    const handleToggle = () => {
        if (type === 'password') {
            setIcon(BsEye);
            setType('text')
        } else {
            setIcon(BsEyeSlash)
            setType('password')
        }
    }

    const handleLogin = (data: any) => {
        WebService.postAPI({ action: "login", body: data, id: 'login_btn' })
            .then((res: any) => {
                localStorage.setItem("token", res?.token);
                userMeCall(res?.token);
            }).catch(() => {

            })
    }

    const userMeCall = async (token: string) => {
        await WebService.getAPI({ action: "me", id: "login_btn" })
            .then((res: any) => {
                if (token) {
                    toast.success("Login successfully");
                    dispatch({ type: USER_LOGIN_SUCCESS, payload: { access_token: token }, });
                    dispatch(setDataInRedux({ type: USER_INFO, value: res.user[0] }));
                    localStorage.setItem("token", token);
                    localStorage.setItem("vendor_id", res.user[0].vendorId);                    
                    navigate("/dashboard")
                } else {
                    localStorage.removeItem("token");
                    toast.success(res.message);
                    toast.error("Invalid username and password", { theme: "colored" });
                }
            })
            .catch(() => {
                typeof window !== "undefined" && localStorage.clear();
            });
    };

    return (
        <>
            <div className="">
                <div className="row no-gutter">
                    <div className="col-md-6 d-none d-md-flex loginbg-image"></div>


                    <div className="col-md-6 bg-light">
                        <div className="login d-flex align-items-center">

                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-10 col-xl-7 mx-auto">
                                        <div className=" login-card rounded-4 login d-flex align-items-center">
                                            <div className="px-lg-1 px-1 py-1 w-100">
                                                <form onSubmit={handleSubmit(handleLogin)}>
                                                    <div className=" ">
                                                        {/* <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M2 10H17" stroke="#0F1010" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M7.416 15L2.41602 10L7.416 5" stroke="#0F1010" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>
                                                        &nbsp;Back */}
                                                        <h4 className="text-dark mb-4 font-bold text-start mt-3">
                                                            Login
                                                        </h4>
                                                        <Controller
                                                            control={control}
                                                            name="email"
                                                            rules={{
                                                                required: "false",
                                                                pattern: {
                                                                    value: emailRegex,
                                                                    message: "Enter valid email address",
                                                                }
                                                            }}
                                                            render={({
                                                                field: { onChange, onBlur },
                                                                fieldState: { isTouched, isDirty }
                                                            }) => (
                                                                <div className='mb-4'>
                                                                    <div className="form-group">

                                                                        <div className="input-group mb-3">
                                                                            <span className="input-group-text bg-white border-end-0 text-secondary">
                                                                                <HiOutlineEnvelope size={16} />
                                                                            </span>
                                                                            <input type="text" className="form-control border-start-0 ps-0" placeholder="Email Address" onChange={onChange} onBlur={onBlur} />
                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        (errors["email"]?.message || Boolean(errors["email"]?.message) || (isTouched && !watchAllFields.email) || (watchAllFields.email && !emailRegex.test(watchAllFields.email))) &&
                                                                        <div className="login-error">
                                                                            <Label
                                                                                title={(errors.email?.message || watchAllFields.email
                                                                                    ? "Enter valid email address"
                                                                                    : "Please Enter Email.")}
                                                                                modeError={true}
                                                                            />
                                                                        </div>
                                                                    }
                                                                </div>
                                                            )}
                                                        />

                                                        <Controller
                                                            control={control}
                                                            name="password"
                                                            rules={{
                                                                required: "Please Enter Password",
                                                            }}
                                                            render={({
                                                                field: { onChange, onBlur },
                                                                fieldState: { isTouched }
                                                            }) => (
                                                                <div className="mb-3">
                                                                    <div className="form-group mb-4">
                                                                        <div className="input-group mb-2">
                                                                            <span className="input-group-text bg-white border-end-0 text-secondary">
                                                                                <HiOutlineKey size={16} />
                                                                            </span>
                                                                            <input type={type} className="form-control border-end-0 border-start-0 ps-0" placeholder="Password"
                                                                                onChange={onChange} onBlur={onBlur} />
                                                                            <span className="input-group-text text-secondary bg-white border-start-0 cursor-pointer" onClick={handleToggle} >
                                                                                {type == "password" ? <BsEye size={16} /> : <BsEyeSlash size={16} />
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    {
                                                                        (errors["password"]?.message || Boolean(errors["password"]?.message) || (isTouched && !watchAllFields.password))
                                                                        &&
                                                                        <div className="login-error">
                                                                            <Label
                                                                                title={(errors.password?.message || watchAllFields.password
                                                                                    ? "Between 8 to 20 characters and at least one upper case, lower case, number and special character." : "Please Enter Password.")}
                                                                                modeError={true}
                                                                            />
                                                                        </div>
                                                                    }
                                                                </div>
                                                            )}
                                                        />

                                                        <div className="d-flex justify-content-between mb-3">
                                                            <Form.Check id="remember" label="Remember me" className='text-dark' />
                                                            <Link to="" className="text-brand font-14">Forgot Password?</Link> 
                                                        </div>
                                                    </div>
                                                    <div className="text-center ">
                                                        <Button type='submit' id='login_btn' disabled={!isValid} className="btn btn-brand-1 w-100">Login</Button>
                                                        {/* <p className='text-white mt-3 mb-0'>Don't have an account?   <Link to="/signup" className="text-brand">Create an Account!</Link></p> */}
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    )

}
export default Login;