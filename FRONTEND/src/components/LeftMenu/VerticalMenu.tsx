import { Link } from 'react-router-dom';
import icon3 from '../../assets/images/menu-icon-3.svg'
import icon4 from '../../assets/images/menu-icon-4.svg'
import iconDashboard from "../../assets/images/icon-dashboard.svg"
import iconComplienceUser from "../../assets/images/icon-compli-user.svg"

import { MdSpaceDashboard, MdCategory, MdLocalGroceryStore, MdLayers, MdGroup, MdCoPresent, MdManageAccounts, MdOutlinePublicOff, MdGppGood } from "react-icons/md";
import { BiSolidOffer } from "react-icons/bi";
import { PiBatteryChargingVertical } from "react-icons/pi";
import { RxDashboard } from "react-icons/rx";
import { LiaChargingStationSolid, LiaServicestack } from "react-icons/lia";
import { LuSettings, LuUsers } from "react-icons/lu";
import { LuIndianRupee } from "react-icons/lu";
import { VscFeedback } from "react-icons/vsc";
import { LuCalendarCheck } from "react-icons/lu";
import { LuLayoutDashboard } from "react-icons/lu";
import { useSelector } from 'react-redux';
import { RootState } from '../../config/Store';
import { useEffect } from 'react';

const VerticalMenu = () => {

    const userInfoData: any = useSelector<RootState, any>(
        (state: any) => state.userInfoData
    );

    useEffect(() => {
        console.log("sidebar--->", userInfoData.user_info)
        console.log("vendor", userInfoData.user_info.isVendor)
        console.log("id", !userInfoData.user_info.vendorId)
        console.log(userInfoData.user_info.isVendor === 0 && !userInfoData.user_info.vendorId)
    }, []);

    return (
        <>
            <div id="vertical_menu" className="verticle-menu">
                <div className="menu-list">
                    <Link id="t-1" to={'/dashboard'} className="menu-item"> <LuLayoutDashboard className="menu-icon dashboard" /> <span className='nav-text'>Dashbaord</span></Link>
                    <Link id="t-1" to={'/charging'} className="menu-item"><PiBatteryChargingVertical className="menu-icon" />  <span className='nav-text'>Charging Monitoring</span></Link>
                    <Link id="t-1" to={'/service-monitoring'} className="menu-item"><LuSettings className="menu-icon" />  <span className='nav-text'>Service Monitoring</span></Link>
                    <Link id="t-1" to={'/feedback'} className="menu-item"><VscFeedback className="menu-icon" />  <span className='nav-text'>Feedback Management</span></Link> 
                    {userInfoData.user_info.isVendor === 0 && !userInfoData.user_info.vendorId && (
                        <>
                            <Link id="t-1" to={'/station'} className="menu-item"> <LiaChargingStationSolid className="menu-icon" /> <span className='nav-text'>Station Management</span></Link>
                            <Link id="t-1" to={'/customer-database'} className="menu-item"> <LuUsers className="menu-icon" /> <span className='nav-text'>Customer Database</span></Link>
                            <Link id="t-1" to={'/bookings'} className="menu-item"> <LuCalendarCheck className="menu-icon" /> <span className='nav-text'>Manage Booking</span></Link>
                            <Link id="t-1" to={'/vendor-management'} className="menu-item"> <LuIndianRupee className="menu-icon" /> <span className='nav-text'>Vendor Management</span></Link>
                            <Link id="t-1" to={'/users'} className="menu-item"> <LuUsers className="menu-icon" /> <span className='nav-text'>User Management</span></Link>
                        </>
                     )
                    }

                </div>
            </div>
        </>
    )
}
export default VerticalMenu;