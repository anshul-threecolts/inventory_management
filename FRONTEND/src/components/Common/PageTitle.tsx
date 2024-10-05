import React from "react";
import { MdOutlineKeyboardBackspace } from 'react-icons/md'

interface PropData {
    title: string,
    name?: any,
    backArrow?: boolean
}

const PageTitle = (props: PropData) => {
    const goBack = () => {
        window.history.back();
    };
    return (
        <>
            <div className=" mb-3">
                <div className="d-flex align-items-center gap-2">
                    {
                        props?.backArrow == true
                            ?
                            (
                                <a onClick={goBack} href="javascript:void(0)" className="left-arrow mr-3 text-brand">
                                    <MdOutlineKeyboardBackspace size={24} />
                                </a>
                            )
                            :
                            null
                    }
                    <div className="page-title">
                        {props.title} { props?.name ? props?.name : '' }
                    </div>
                </div>
            </div>
        </>
    );
};

export default PageTitle;