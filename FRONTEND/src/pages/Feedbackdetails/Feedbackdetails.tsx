import React, { useEffect, useState } from "react";
import "./feedbackdetails.scss";
import { Container, Row, Form, Card, Button, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Logo from "../../assets/images/star.svg";
import { MdArrowBack } from "react-icons/md";
import { TiLocation } from "react-icons/ti";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import { reduxState } from "../../reducer/CommonReducer";
import { Rating } from "react-simple-star-rating";

const Feedbackdetails = () => {
  const commonData: any = useSelector<RootState, reduxState>(
    (state: any) => state.commonData
  );
  const Navigate = useNavigate();


  const [feedBackData,setFeedBackData]= useState<any>()

  useEffect(() => {

console.log(commonData.Feedback_View_Data  );

   if (Object.keys(commonData.Feedback_View_Data).length === 0){
      Navigate("/feedback")
    } else{
     setFeedBackData(commonData.Feedback_View_Data)
    }


  }, [commonData]);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <div className="container">
        <div className="justify-content-between d-flex mb-3 ">
          <Link to="/feedback">
            {" "}
            <span className="d-flex align-items-center">
              <h6 className="mb-0 text-dark">
                <MdArrowBack />
                &nbsp;&nbsp;Back
              </h6>
            </span>
          </Link>
        </div>
        <Row className=" g-3">
          <div className="box p-4 mb-2">
            <h5 className="ps-1">{feedBackData?.userName}</h5>
            <p className="mt-0 mb-2">
              <TiLocation />
              &nbsp;{feedBackData?.city}
            </p>
            <div className="text-start mt-0 mb-2">
              {/* <img src={Logo} width={112} height={16} alt="" /> */}
              <Rating
          allowFraction={true}
          size={20}
          readonly={true}
          initialValue={feedBackData?.rating}
        />
            </div>

            <p className="mb-0">
           {feedBackData?.comment}
            </p>
          </div>
        </Row>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Station</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <div className="mb-2">
                <Form.Label>Station Name</Form.Label>
                <Form.Control type="email" placeholder="Enter station name" />
              </div>
              <div className="mb-2">
                <Form.Label>City</Form.Label>
                <Form.Control type="email" placeholder="Enter city name" />
              </div>
              <div className="mb-2">
                <Form.Label>Status</Form.Label>
                <Form.Select aria-label="Default select example">
                  <option>Select status</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                </Form.Select>
              </div>
              <div className="mb-3">
                <Form.Label>Vendor Name</Form.Label>
                <Form.Control type="email" placeholder="Enter vendor name" />
              </div>
              <Form.Label>Owned By</Form.Label>
              <Form>
                {["radio"].map((type) => (
                  <div key={`inline-${type}`} className="mb-3">
                    <Form.Check inline id={`check-api-${type}`}>
                      <Form.Check.Input isValid type="radio" />
                      <Form.Check.Label>Vendor</Form.Check.Label>
                    </Form.Check>

                    <Form.Check inline id={`check-api-${type}`}>
                      <Form.Check.Input isValid type="radio" />
                      <Form.Check.Label>Bharat Energy</Form.Check.Label>
                    </Form.Check>
                  </div>
                ))}
              </Form>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleClose} className="w-100">
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Feedbackdetails;
