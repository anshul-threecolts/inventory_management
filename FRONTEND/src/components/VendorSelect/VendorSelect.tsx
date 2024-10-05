import "./VendorSelect.scss";
import React, { useState, Fragment, useEffect } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import HelperService from "../../Services/HelperService";
import useClickOutside from "../../hook/useClickOutside";
 
interface PropData {
  placeholder?: string;
  options: Options[];
  selected: any;
  isSearchable?: boolean;
  onChange: any;
  type?: string;
  sakey?: string;
  disValue?: string;
  disCode?: string;
  value?: string;
  isHideArrow?: boolean;
  isDisable?: boolean;
  forceClose?: boolean;
  isCustomInput?: boolean;
  max?: number;
  column?: number;
}
 
export interface Options {
  id: any;
  code?: string;
  value: string;
  value2?: string;
  parentCode?: string;
  object?: any;
  icon?: string;
}
 
const VendorSelect = (props: PropData) => {
  let textInput = React.createRef<HTMLInputElement>();
  const [placeholder, setPlaceholder] = useState(props.placeholder);
  const [options, setOptions] = useState(props.options);
  const [selectedOption, setSelectedOption] = useState(props.selected);
  const [isFocus, setIsFocus] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpenTop, setIsOpenTop] = useState(false);
  let index = -1;
  let selectedValue = "";
  const [userInput, setUserInput] = useState(
    props.isSearchable ? "" : props.placeholder
  );
 
  useEffect(() => {
    setOptions(props.options);
    if (props.selected != selectedOption) {
      setSelectedOption(props.selected);
    }
 
    props.options.map((value, i: number) => {
      if (value.id == props.selected) {
        index = i;
        selectedValue = value.value;
        if (userInput != selectedValue) {
          setUserInput(selectedValue);
        }
      }
    });
 
    if (props.selected != selectedOption) {
      for (var i in props.options) {
        if (props.options[i].id == props.selected) {
          if (props.onChange) {
            props.onChange(props.options[i]);
          }
        }
      }
    }
 
    if (props.isCustomInput && !userInput) {
      setUserInput(props.selected);
    }
 
    if (props.selected == "resetsawin") {
      setSearch("");
      setUserInput("");
      setUserInput(props.isSearchable ? "" : props.placeholder);
    }
 
    if (props.placeholder == "SawinSelect") {
      // alert(props.selected + "  " + selectedValue + " " + props.options.length);
    }
  }, [props.selected, props.options]);
 
  useEffect(() => {
    if (props.forceClose) {
      setIsFocus(false);
    }
  }, [props.forceClose]);
 
  const [selectedIndex, setSelectedIndex] = useState(index);
 
  let domNode = useClickOutside(() => {
    setIsFocus(false);
    if (props.isSearchable && search) {
      if (props.isCustomInput) {
        setUserInput(search);
        setSelectedOption(search);
        props.onChange(search);
      }
    }
  }, this);
 
  const checkPossition = () => {
    var topHeight = domNode.current.getBoundingClientRect().y;
    var bottomHeight =
      window.innerHeight - domNode.current.getBoundingClientRect().y;
    if (bottomHeight > 300 || topHeight <= 280) {
      setIsOpenTop(false);
    } else {
      setIsOpenTop(true);
    }
  };
 
  let optionsListComponent;
 
  let searchOption: Options[] = search
    ? options.filter(function (option) {
      return option.value.toLowerCase().includes(search.toLowerCase());
    })
    : options;
 
  if (searchOption.length) {
    optionsListComponent = (
      <ul className={"options " + (isOpenTop ? "open-top" : "")}>
        {searchOption.map((suggestion: Options, index) => {
          let className;
          if (index === selectedIndex) {
            className = "option-active";
          }
 
          return (
            <li
              className={className}
              key={index}
              onMouseDown={() => onSelect(suggestion)}
            >
              {suggestion.icon ? (
                <div className="row-icon-view">
                  <img src={suggestion.icon} className="row-icons" />
                </div>
              ) : suggestion.code ? (
                props.column == 3 ? (
                  <div className="row option">
                    <div className="col-md-2 code-div"> {suggestion.code} </div>
                    <div className="col-md-5">{suggestion.value}</div>
                    <div className="col-md-5">{suggestion.value2}</div>
                  </div>
                ) : (
                  <div className="row option">
                    <div className="col-md-5 code-div"> {suggestion.code} </div>
                    <div className="col-md-7">{suggestion.value}</div>
                  </div>
                )
              ) : (
                <div className="option">{suggestion.value}</div>
              )}
            </li>
          );
        })}
      </ul>
    );
  } else {
    optionsListComponent = (
      <div className="no-options">
        <em>No data found</em>
      </div>
    );
  }
 
  const onSelect = (e: Options) => {
    setSearch("");
    setIsFocus(false);
    setUserInput(e.value);
    setSelectedOption(e.id);
    // options.map((value, i: number) => {
    //   if (value.id === e.id) {
    //     index = i;
    //     selectedValue = value.value;
    //     if (props.onChange) {
    //       props.onChange(e);
    //     }
    //     setSelectedIndex(index);
    //   }
    // });
  };
 
  const handleKey = (e: any) => {
    if (e.keyCode === 40) {
      if (selectedIndex < options.length - 1)
        setSelectedIndex(selectedIndex + 1);
    } else if (e.keyCode === 38) {
      if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
    } else if (e.keyCode === 13) {
      options.map((value: Options, i: number) => {
        if (selectedIndex === i) {
          onSelect(value);
        }
      });
    }
  };
 
  const checkOption = (enterValue: any) => {
    // setIsFocus(false);
    var isFound = false;
    options.map((value: Options, i: number) => {
      if (value.id === enterValue || value.value === enterValue) {
        setUserInput(enterValue);
        setSelectedOption(enterValue);
        onSelect(value);
        props.onChange(value);
        isFound = true;
      }
    });
 
    if (props.isCustomInput && enterValue && !isFound) {
      setUserInput(enterValue);
      setSelectedOption(enterValue);
      var temp: Options = { id: enterValue, value: enterValue };
      onSelect(temp);
      props.onChange(temp);
    }
 
    setSearch("");
  };
 
  return (
    <>
      <Fragment>
        <div
          ref={domNode}
          id={props.sakey ? props.sakey : "selectId"}
          key={props.sakey}
          className={
            props.isDisable === true ? "disabled-select" : "select w-100"
          }
        >
          {props.isSearchable ? (
            <div
              className={"form-style " + (isFocus ? "zindex" : "")}
              tabIndex={0}
            >
              <input
                ref={textInput}
                className="form-control text-truncate"
                value={isFocus ? search : userInput}
                type="text"
                style={{height:"43px"}}
                onKeyPress={(e) =>
                  props.max ? HelperService.maxNumber(e, props.max) : ""
                }
                onBlur={(e) => checkOption(e.target.value)}
                onKeyDown={(e) => {
                  handleKey(e);
 
                }}
                onClick={() => {
                  setIsFocus(!isFocus);
                }}
                onMouseDown={() => {
                  if (!props.isDisable) {
                    if (!isFocus) {
                      checkPossition();
                    }
                    // setIsFocus(true);
                  }
                }}
                disabled={props.isDisable}
                placeholder={placeholder}
                onChange={(e) => setSearch(e.target.value)}
              />
              {!props.isHideArrow && !isFocus ? (
                <div className="col-12 d-flex justify-content-end " style={{marginTop:"-26px"}}    onClick={() => {
                  setIsFocus(!isFocus);
                }}>
                  <ChevronDown
                    id="img_downarrow"
                    className="searchdownarrow text-dark"
                  />
                </div>
              ) : (
                ""
              )}
              {isFocus && props.isDisable == false ? optionsListComponent : ""}
            </div>
          ) : (
            <div
              className={"form-style " + (isFocus ? "zindex" : "")}
              onKeyDown={(e) => {
                handleKey(e);
              }}
              onClick={() => {
                setIsFocus(!isFocus);
              }}
              tabIndex={0}
              onMouseDown={() => {
                if (!props.isDisable) {
                  if (!isFocus) {
                    checkPossition();
                  }
                }
              }}
            >
              <div className="form-control select-div text-truncate">
                <span>{userInput}</span>
                {!props.isHideArrow || isFocus ? (
                  <div className="right-icon" style={{marginTop:"11px"}}>
                    <ChevronDown id="img_downarrow" className="downarrow" />
                  </div>
                ) : (
                  ""
                )}
              </div>
              {isFocus && props.isDisable == false ? optionsListComponent : ""}
            </div>
          )}
        </div>
      </Fragment>
    </>
  );
};
 
VendorSelect.defaultProps = {
  placeholder: "Select",
  selected: "",
  isSearchable: false,
  sakey: new Date().getTime(),
  type: "ARROW",
  isHideArrow: false,
  options: [],
  isDisable: false,
};
 
export default VendorSelect;