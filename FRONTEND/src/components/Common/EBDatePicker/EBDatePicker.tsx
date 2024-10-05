import "./EBDatePicker.scss";
import React, { useState, Fragment, useEffect } from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface PropData {
  onChange?: any;
  selected?: any;
  type?: string;
  minData?: any;
  maxData?: any;
  placeholderText?: any;
  isDisabled?: boolean;
}

const EBDatePicker = (props: PropData) => {
  const [startDate, setStartDate] = useState<any>();

  useEffect(() => {
    if (props.selected) {
      setStartDate(new Date(props.selected) as any);
    }
    else {
      setStartDate(null); // If props.selected is null, set startDate to null
    }
  }, [props.selected]);


  return (
    <>
      <Fragment>
        <div className="rounded-pill date-pick">
          {!props.type &&
            <DatePicker
              className="form-control"
              selected={startDate}
              peekNextMonth
              dateFormat="MM/dd/yy"
              dropdownMode="select"
              showMonthDropdown
              showYearDropdown
              disabled={props.isDisabled}
              minDate={props.minData ? props.minData : ""}
              maxDate={props.maxData ? props.maxData : ""}
              // onChange={(date: any) => {
              //   setStartDate(date);
              //   if (props.onChange && date) {
              //     props.onChange(moment(date).format("YYYY-MM-DD"));
              //   }
              // }}

              onChange={(date: any) => {
                setStartDate(date);
                if (props.onChange) {
                  if (date) {
                    props.onChange(moment(date).format("YYYY-MM-DD"));
                  } else {
                    props.onChange(null); // Send null if date is cleared
                  }
                }
              }}
              placeholderText={props.placeholderText ? props.placeholderText : "mm/dd/yy"}
            />
          }
          {props.type == 'DATETIME' &&
            <DatePicker
              className="form-control"
              selected={startDate}
              disabled={props.isDisabled}
              showTimeSelect
              timeFormat="hh:mm aa"
              timeIntervals={30}
              timeCaption="Time"
              dateFormat="MM/dd/yy hh:mm aa"
              onChange={(date: any) => {
                setStartDate(date);
                if (props.onChange) {
                  props.onChange(date);
                }
              }}
              placeholderText={props.placeholderText ? props.placeholderText : ""}
            />
          }
          {props.type == 'MONTH' &&
            <DatePicker
              className="form-control"
              selected={startDate}
              dateFormat="MM"
              showMonthYearPicker
              onChange={(date: any) => {
                setStartDate(date);
                if (props.onChange) {
                  props.onChange(date);
                }
              }}
              placeholderText={props.placeholderText ? props.placeholderText : ""}
            />
          }
          {props.type == 'YEAR' &&
            <DatePicker
              className="form-control"
              selected={startDate}
              showYearPicker
              dateFormat="yyyy"
              yearItemNumber={9}
              onChange={(date: any) => {
                setStartDate(date);
                if (props.onChange) {
                  props.onChange(moment(date).format("YYYY"));
                }
              }}
              placeholderText={props.placeholderText ? props.placeholderText : ""}
            />
          }
        </div>
      </Fragment>
    </>
  );
};

EBDatePicker.defaultProps = {
  placeholder: "Select",
  selected: "",
  isSearchable: false,
  key: new Date().getTime(),
};

export default EBDatePicker;
