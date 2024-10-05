import "./NoData.scss";
import NODataImg from "../../assets/images/no_data.svg";
import loader from "../../assets/images/ailoader.gif";

  interface PropData {
      message?: string;
      isShowMessage: boolean;
      isShowLoader?: boolean;
      isShowErrorMessage?: boolean;
      retry?: Function;
      type?: string;
  }
  
  const NoDataAvailable = (props: PropData) => {
      return (
          <div className="no-data-available-box">
              {
                  !props.isShowLoader && props.isShowMessage && <div className="noDataMessage">
                      <div className="center-data">
                          {!props.type && <img className="text-center" src={NODataImg} height={100} width={100} alt='' />}
                           {/* {props.type == 'review' && <img src='/images/no_review.svg' height={100} width={100} alt='No Data Found' />} */}
                          {props.type == 'cart' && <img className="center-chat-data" src={NODataImg} height={100} width={100} alt='No Data Found' />} 
                          <div className='text-secondary '><h3 className='font-16'>{props.message?props.message:"No data Available"}</h3></div>
                      </div>
                  </div >
              }
              {
                  props.isShowLoader && <div className="center-data compo-loader">
                      <img src={loader} alt='No Loader Found' height={100} width={100} />
                      
                  </div>
              }
              {
                  !props.isShowLoader && props.isShowErrorMessage && <div className="noDataMessage">
                      <div className="center-data">
                          <div className='text-secondary font-16 text-center'><h3 className='font-16'>Something went wrong!</h3></div>
                          <div className='text-danger cursor-pointer' style={{ textDecoration: 'underline' }} onClick={() => { props.retry && props.retry() }}>Please Retry</div>
                      </div>
                  </div >
              }
          </div>
      )
  }
  
  export default NoDataAvailable;
  