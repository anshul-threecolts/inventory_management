import "./Grid.scss";
import React, { useState, useEffect, useImperativeHandle } from "react";
import loader from "../../assets/images/loader.gif";
// import calender from "../assets/images/calender.svg";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Display, X } from "react-bootstrap-icons";
import ButtonLight from "react-bootstrap/Button";
// import iconCalendar from "../assets/images/calander-icon.svg";
// import iconFilter from "../assets/images/filter-icon.svg";
// import iconCols from "../assets/images/col-icon.svg";
import { ArrowUp, ArrowDown, CaretRightFill } from "react-bootstrap-icons";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Form from "react-bootstrap/Form";
import { toast } from "react-toastify";
import useClickOutside from "../../hook/useClickOutside";
import { Label } from "../Common/Label/Label";
import Paginations from "../pagination/Paginations";
import { InputGroup } from "react-bootstrap";
import { IoSearchOutline } from "react-icons/io5";
import HelperService from "../../Services/HelperService";
import EBDatePicker from "../Common/EBDatePicker/EBDatePicker";

export interface GridColumn {
  value: any;
  type?: string;
  classname?: string;
  originalValue?: any;
}

export interface GridData {
  searchPlaceholder?: string | undefined;
  headers: GridHeader[];
  rows: GridRow[];
  filters?: Filter[];
  ShowLoader?: boolean;
  errorMessage?: string;
  isColumn?: boolean;
  dateFilter?: FilterOption[];
  onClickRow?: boolean;
  isSelectedRow?: any;
  hoverRow?: any;
  storeKey?: string;
  gridId?: string;
  count?: any;
  onPageChange?: any;
  onSort?: any;
  doubleClick?: any;
  onClickCheckBox?: any;
  checkBoxStauts?: boolean;
  perPageItem?: number;
  unselectRow?: any;
  showDateFilter?: boolean;
  showSearch?: boolean;
  showDropDown?:boolean;
  DropDownOptions?:any
}

export interface Filter {
  title: string;
  key: string;
  isShow?: boolean;
  child: FilterOption[];
}

export interface FilterOption {
  title: string;
  value: string;
  isChecked?: boolean;
  key?: string;
}

export interface GridHeader {
  title: string;
  isSorting?: boolean;
  class?: string;
  isAsc?: boolean;
  isDesc?: boolean;
  style?: string;
  isFilter?: boolean;
  isShow?: boolean;
  isFreeze?: boolean;
  width?: number;
  sortingKey?: string;
  isShowCheckBox?: any;
  isNotAllowClick?: any;
}

export interface GridRow {
  data: GridColumn[];
  isChecked?: boolean;
  style?: string;
  isRed?: boolean;
  backgroundColor?: string;
  textColor?: string;
  type?: string;
}

export interface ExpandableData {
  header: string;
  data: GridRow[];
}

const Grid = React.forwardRef((props: GridData, ref) => {
  const [checkBoxStauts, setCheckBoxStauts] = useState(props.checkBoxStauts);
  const [headers, setHeaders] = useState(
    props.headers.map((option: GridHeader) => {
      if (option.isShow === undefined) {
        option.isShow = true;
      }
      if (option.isShowCheckBox === undefined) {
        option.isShowCheckBox = false;
      }
      if (option.sortingKey) {
        option.isSorting = true;
      } else {
        option.isSorting = false;
      }

      return { ...option };
    })
  );
  const [filters, setFilters] = useState(
    props.filters
      ? props.filters.map((option: Filter) => {
        if (option.isShow === undefined) {
          option.isShow = false;
        }

        option.child.map((child: FilterOption) => {
          if (child.isChecked === undefined) {
            child.isChecked = false;
          }
        });

        return { ...option };
      })
      : []
  );
  const [dateFilter, setDateFilters] = useState(
    props.dateFilter
      ? props.dateFilter.map((child: FilterOption) => {
        if (child.isChecked === undefined) {
          child.isChecked = false;
        }
        return { ...child };
      })
      : []
  );
  const [isFilter, setIsFilter] = useState(false);
  const [isShowColumns, setIsShowColumns] = useState(false);
  const [isShowDateRange, setIsShowDateRange] = useState(false);
  const [rows, setRows] = useState([...props.rows]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPageItem, setPerPageItem] = useState(
    props.perPageItem ? props.perPageItem : 10
  );
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [firstDate, setFirstDate] = useState<any>();
  const [secondDate, setSecondDate] = useState<any>();
  const [data, setData] = useState<GridRow[]>([]);
  const [dateFilterBy, setDateFilterBy] = useState("THIS_WEEK");
  const [isAscending, setIsAscending] = useState(false);
  const [key, setKey] = useState("");
  const [searchText, setSearchText] = useState<string>("");
  const [dropDownSelect, setDropDownSelect] = useState<string>("");

  const [styledRow, setStyledRow] = useState<Number>();
  let isChildClick = false;

  useEffect(() => {
    setCheckBoxStauts(props.checkBoxStauts);
  }, [props.checkBoxStauts]);

  useEffect(() => {
    setFilters(
      props.filters
        ? props.filters.map((option: Filter) => {
          if (option.isShow === undefined) {
            option.isShow = false;
          }

          option.child.map((child: FilterOption) => {
            if (child.isChecked === undefined) {
              child.isChecked = false;
            }
          });

          return { ...option };
        })
        : []
    );
  }, [props.filters]);

  useImperativeHandle(
    ref,
    () => ({
      getValues: () => {
        return {
          filters: filters,
          dateFilter: dateFilter,
          key: key,
          isAscending: isAscending,
          currentPage: currentPage,
        };
      },
    }),
    [filters, dateFilter, key, isAscending, currentPage]
  );

  useEffect(() => {
    setHeaders(
      props.headers.map((option: GridHeader) => {
        if (option.isShow === undefined) {
          option.isShow = true;
        }

        return { ...option };
      })
    );
  }, [props.headers]);

  useEffect(() => {
    if (props.onPageChange) {      
      props.onPageChange(currentPage, searchText, startDate, endDate,dropDownSelect);
    }
  }, [currentPage]);

  useEffect(() => {
    setRows(props.rows);
    setData(props.rows);
  }, [props.rows]);

  let domNode = useClickOutside(() => {
    setIsFilter(false);
    setIsShowColumns(false);
    setIsShowDateRange(false);
  }, this);

  useEffect(() => {
    setStyledRow(-1);
  }, [props.unselectRow]);

  useEffect(() => {
    var tableId = props.gridId ? props.gridId : "resizable";
    var table = document.getElementById(tableId);
    resizableGrid(table);
    function resizableGrid(table: any) {
      var row = table.getElementsByTagName("tr")[0],
        cols = row ? row.children : undefined;
      if (!cols) return;

      var tableHeight = table.offsetHeight;

      for (var i = 0; i < cols.length; i++) {
        var div = createDiv(tableHeight);
        cols[i].appendChild(div);
        cols[i].style.position = "relative";
        setListeners(div);
      }

      function setListeners(div: any) {
        var pageX: any,
          curCol: any,
          nxtCol: any,
          curColWidth: any,
          nxtColWidth: any,
          tableWidth: any;

        div.addEventListener("mousedown", function (e: any) {
          var temp = document.getElementById(tableId);
          if (temp) {
            tableWidth = temp.offsetWidth;
          }

          curCol = e.target.parentElement;
          nxtCol = curCol.nextElementSibling;
          pageX = e.pageX;

          var padding = paddingDiff(curCol);

          curColWidth = curCol.offsetWidth - padding;
          //  if (nxtCol)
          //nxtColWidth = nxtCol.offsetWidth - padding;
        });

        div.addEventListener("mouseover", function (e: any) {
          e.target.style.borderRight = "2px solid #0000ff";
        });

        div.addEventListener("mouseout", function (e: any) {
          e.target.style.borderRight = "";
        });

        document.addEventListener("mousemove", function (e) {
          if (curCol) {
            var diffX = e.pageX - pageX;
            curCol.style.width = curColWidth + diffX + "px";
            var temp1 = document.getElementById(tableId);
            if (temp1 && temp1.style) {
              temp1.style.width = tableWidth + diffX + "px";
            }
          }
        });

        document.addEventListener("mouseup", function (e) {
          curCol = undefined;
          nxtCol = undefined;
          pageX = undefined;
          nxtColWidth = undefined;
          curColWidth = undefined;
        });
      }

      function createDiv(height: any) {
        var div = document.createElement("div");
        if (div && div.style) {
          div.style.top = "0";
          div.style.right = "0";
          div.style.width = "5px";
          div.style.position = "absolute";
          div.style.cursor = "col-resize";
          div.style.userSelect = "none";
          div.style.height = height + "px";
        }

        return div;
      }

      function paddingDiff(col: any) {
        if (getStyleVal(col, "box-sizing") == "border-box") {
          return 0;
        }

        var padLeft = getStyleVal(col, "padding-left");
        var padRight = getStyleVal(col, "padding-right");
        return parseInt(padLeft) + parseInt(padRight);
      }

      function getStyleVal(elm: any, css: any) {
        return window.getComputedStyle(elm, null).getPropertyValue(css);
      }
    }
  }, [headers]);

  const updateUserPreference = (data: GridHeader[]) => {
    if (props.storeKey) {
    }
  };

  const updateValue = (index: number) => {
    setHeaders(
      headers.map((option: GridHeader, i: number) => {
        return i === index ? { ...option, isShow: !option.isShow } : option;
      })
    );

    updateUserPreference(
      headers.map((option: GridHeader, i: number) => {
        return i === index ? { ...option, isShow: !option.isShow } : option;
      })
    );
  };

  const updatecheckValue = (index: number) => {
    isChildClick = true;
    let tempFilter = filters.map((option: Filter) => {
      return option.isShow
        ? {
          ...option,
          child: option.child.map((child: FilterOption, j: number) => {
            return j == index
              ? { ...child, isChecked: !child.isChecked }
              : child;
          }),
        }
        : option;
    });
    setFilters(tempFilter);
    setCurrentPage(1);
    props.onSort(
      1,
      isAscending,
      key,
      startDate,
      endDate,
      tempFilter,
      dateFilter
    );
  };

  const removeFilter = (i: number, j: number) => {
    isChildClick = true;
    removeFilters(i, j);
  };

  const removeFilters = (i: number, j: number) => {
    isChildClick = true;
    var tempFilter = filters.map((option: Filter, k: number) => {
      return i == k
        ? {
          ...option,
          child: option.child.map((child: FilterOption, l: number) => {
            return j == l ? { ...child, isChecked: !child.isChecked } : child;
          }),
        }
        : option;
    });
    setFilters(tempFilter);
    setCurrentPage(1);
    props.onSort(
      1,
      isAscending,
      key,
      startDate,
      endDate,
      tempFilter,
      dateFilter
    );
  };

  const removeAllFilter = () => {
    setStartDate("");
    setFilters(
      filters.map((option: Filter) => {
        return {
          ...option,
          child: option.child.map((child: FilterOption, l: number) => {
            return { ...child, isChecked: false };
          }),
        };
      })
    );
    setFirstDate("");
    setSecondDate("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    props.onSort(1, isAscending, key, "", "", [], []);
  };

  const sorting = (index: number, asc: boolean, key: any) => {
    setIsFilter(false);
    setIsShowColumns(false);
    setIsShowDateRange(false);
    setHeaders(
      headers.map((option: GridHeader, i: number) =>
        i === index
          ? {
            ...option,
            isAsc: !option.isAsc,
            isDesc: option.isAsc,
          }
          : {
            ...option,
            isAsc: false,
            isDesc: false,
          }
      )
    );
    setIsAscending(!asc);
    setKey(key);
    props.onSort(
      currentPage,
      !asc,
      key,
      startDate,
      endDate,
      filters,
      dateFilter
    );
  };

  const onDateFiltering = () => {
    var value = false;
    for (var i in dateFilter) {
      if (dateFilter[i].isChecked === true) {
        value = true;
      }
    }
    if (value === true) {
      setIsShowDateRange(!isShowDateRange);
      setIsFilter(false);
      setIsShowColumns(false);
      setFirstDate(startDate);
      setSecondDate(endDate);
      setCurrentPage(1);
      props.onSort(
        1,
        isAscending,
        key,
        startDate,
        endDate,
        filters,
        dateFilter
      );
    } else {
      toast.error("Please select type");
    }
  };

  const updatecheckValueDateFilter = (index: number) => {
    let tempFilter = dateFilter.map((child: FilterOption, j: number) => {
      return j == index ? { ...child, isChecked: !child.isChecked } : child;
    });
    setDateFilters(tempFilter);
  };

  const showFiterOption = (index: number) => {
    if (!isChildClick) {
      setFilters(
        filters.map((option: Filter, i: number) =>
          i === index
            ? { ...option, isShow: !option.isShow }
            : { ...option, isShow: false }
        )
      );
    } else {
      isChildClick = false;
    }
  };

  const OnSelectDateRange = (type: string) => {
    setDateFilterBy(type);
    if (type === "THIS_WEEK") {
      var startOfWeek = moment().startOf("week").toDate();
      var endOfWeek = moment().endOf("week").toDate();
      setStartDate(startOfWeek);
      setEndDate(endOfWeek);
    } else if (type === "THIS_MONTH") {
      var date = new Date();
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (type === "LAST_MONTH") {
      var date = new Date();
      const firstDayPrevMonth = new Date(
        date.getFullYear(),
        date.getMonth() - 1,
        1
      );
      const lastDayPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
      setStartDate(firstDayPrevMonth);
      setEndDate(lastDayPrevMonth);
    } else if (type === "LAST_YEAR") {
      var lastyear = new Date(new Date().getFullYear() - 1, 0, 1);
      var start = new Date(lastyear.getFullYear(), 0, 1).getTime();
      var end = new Date(lastyear.getFullYear(), 11, 31).getTime();
      setStartDate(start);
      setEndDate(end);
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  var count = 0;

  const onSelectRow = (e: any, data: any) => {
    if (props.onClickRow) {
      setStyledRow(e);
      props.isSelectedRow(e, data);
    }
  };

  const onResetDateFilter = () => {
    setFirstDate("");
    setSecondDate("");
    setStartDate("");
    setEndDate("");
    dateFilter.map((child: FilterOption) => {
      if (child.isChecked === true) {
        child.isChecked = false;
      }
    });
    setCurrentPage(1);
    props.onSort(1, isAscending, key, "", "", filters, []);
  };

  const onSelectAllRow = () => {
    setCheckBoxStauts(!checkBoxStauts);
    props.onClickCheckBox(!checkBoxStauts);
  };

  const currentDate = new Date(startDate);

  return (
    <div className="grid-div" data-testid="comp-sawin-table">
      <Row className="align-items-top mx-0 grid-filter-options">
        <Col className=" col-12  pb-2 align-items-center ">
          <div className="row mb-2">
            <div className="col-12 d-lg-flex gap-3 align-items-center">
              {props.showSearch && (
                <InputGroup className="table-search-box">
                  <InputGroup.Text id="basic-addon1">
                    <IoSearchOutline className="icon" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder={props.searchPlaceholder}
                    onChange={(e: any) => setSearchText(e.target.value)}
                  />
                </InputGroup>
              )}
              {props.showDropDown && (
                   <Col lg={4} sm={4} className="">
                   <select
                     className="form-select"
                     onChange={(e: any) => setDropDownSelect(e.target.value)}
                   >
                     <option value="" >
                      {"Select"}
                     </option>
                     <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="DOWNLOAD">Download</option>
                        <option value="VIEW">View</option>
                     {/* {props.DropDownOptions &&
                      props .DropDownOptions.length > 0 &&
                      props. DropDownOptions.map((item: any, index: number) => {
                         return (
                           <option key={index} value={item.id}>
                             {item.name}
                           </option>
                         );
                       })} */}
                   </select>
              
                 </Col>
              )}
              
              {props.showDateFilter && (
                <>
                  <div className="w-100">
                    <EBDatePicker
                      selected={startDate}
                      // maxData={new Date(endDate)}
                      maxData={endDate ? new Date(endDate) : null}
                      onChange={(date: any) => setStartDate(date)}
                    />
                  </div>
                  <span>To</span>
                  <div className="w-100">
                    <EBDatePicker
                      selected={endDate}
                      onChange={(date: any) => setEndDate(date)}
                      // minData={new Date(startDate)}
                      minData={startDate ? new Date(startDate) : null} 

                    />
                  </div>
                </>
              )}
              

              {(props.showDateFilter || props.showSearch|| props.showDropDown) && (
                <Button
                  className="btn-brand-1"
                  onClick={() => {
                    props.onPageChange &&
                      props.onPageChange(
                        currentPage,
                        searchText,
                        startDate,
                        endDate,
                        dropDownSelect
                      );
                  }}
                >
                  Search
                </Button>
              )}
            </div>
          </div>

          
          {props.filters && props.filters.length > 0 ? (
            <>
              {filters.length > 0
                ? filters.map((option: Filter, i: number) => {
                  return option.child.map(
                    (child: FilterOption, j: number) => {
                      if (child.isChecked) {
                        count++;
                      }
                      return "";
                    }
                  );
                })
                : ""}
              {count > 0 || (startDate && endDate) ? (
                <label className="font-medium font-14 font-w-medium d-inline me-3 text-dark">
                  Active Filters
                </label>
              ) : (
                ""
              )}

              <div className="applied-filter">
                {filters.length > 0
                  ? filters.map((option: Filter, i: number) => {
                    return option.child.map(
                      (child: FilterOption, j: number) => {
                        return (
                          <span key={"filter_" + i + "_" + j}>
                            {child.isChecked ? (
                              <span className="filter-name">
                                {child.title}{" "}
                                <X
                                  size={20}
                                  onClick={() => removeFilter(i, j)}
                                />{" "}
                              </span>
                            ) : (
                              ""
                            )}
                          </span>
                        );
                      }
                    );
                  })
                  : ""}
                {firstDate && secondDate && (
                  <span>
                    <span className="filter-name">
                      {`${moment(firstDate).format("MM/DD/YYYY")}` +
                        " - " +
                        `${moment(secondDate).format("MM/DD/YYYY")}`}{" "}
                      <X size={20} onClick={() => onResetDateFilter()} />
                    </span>
                  </span>
                )}

                {count > 0 || (startDate && endDate) ? (
                  <a
                    className="font-w-medium font-14 text-nowrap cursor-pointer"
                    onClick={() => removeAllFilter()}
                  >
                    Clear Filter
                  </a>
                ) : (
                  ""
                )}
              </div>
            </>
          ) : (
            " "
          )}{" "}
        </Col>
        <Col
          className="text-end pe-0 text-nowrap filter-opt-btns"
          style={{ maxWidth: "370px" }}
        >
          {props.dateFilter && props.dateFilter.length > 0 ? (
            <ButtonLight
              variant="light"
              className="btn-brand-light "
              onClick={() => {
                setIsShowDateRange(!isShowDateRange);
                setIsFilter(false);
                setIsShowColumns(false);
                var startOfWeek = moment().startOf("week").toDate();
                var endOfWeek = moment().endOf("week").toDate();
                setStartDate(startOfWeek);
                setEndDate(endOfWeek);
              }}
            >
              {" "}
              {/* <img
                src={iconCalendar}
                height={16}
                width={16}
                className="icon"
              />{" "} */}
              Date Range
            </ButtonLight>
          ) : (
            ""
          )}
          {props.filters && props.filters.length > 0 ? (
            <ButtonLight
              variant="light"
              className="btn-brand-light"
              onClick={() => {
                setIsShowColumns(false);
                setIsFilter(!isFilter);
                setIsShowDateRange(false);
              }}
            >
              {" "}
              {/* <img
                src={iconFilter}
                height={16}
                width={16}
                className="icon"
              />{" "} */}
              Filter
            </ButtonLight>
          ) : (
            ""
          )}
          {props.isColumn == true ? (
            <ButtonLight
              variant="light"
              className="btn-brand-light"
              onClick={() => {
                setIsShowColumns(!isShowColumns);
                setIsFilter(false);
                setIsShowDateRange(false);
              }}
            >
              {" "}
              {/* <img
                src={iconCols}
                height={16}
                width={16}
                className="icon"
              />{" "} */}
              Column
            </ButtonLight>
          ) : (
            ""
          )}
          {isShowColumns ? (
            <ul ref={domNode} id="columnsId" className="submenu">
              {headers.map((header: GridHeader, j) =>
                header.isFilter == false ? (
                  ""
                ) : (
                  <li key={"columns_" + j} className="">
                    <Form.Group className="mb-1" controlId="">
                      <Form.Check
                        type="checkbox"
                        checked={header.isShow}
                        onClick={() => updateValue(j)}
                        label={header.title}
                      />
                    </Form.Group>
                  </li>
                )
              )}
            </ul>
          ) : (
            ""
          )}
          {isFilter ? (
            <ul ref={domNode} id="filterId" className="filtermenu">
              {filters.map((filter: Filter, j) => (
                <li
                  key={"columns_" + j}
                  className=" mt-1 mb-1 cursor-pointer"
                  onClick={() => showFiterOption(j)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    {" "}
                    <label className="col-10 mt-1 cursor-pointer me-2">
                      {filter.title}
                    </label>
                    <CaretRightFill size={12} className="icon" />
                  </div>

                  {filter.isShow ? (
                    <ul className="filteroption">
                      {filter.child.map((child: FilterOption, j: Number) => (
                        <li
                          key={"columns_" + j}
                          className=" mt-1 mb-1 cursor-pointer"
                        >
                          <Form.Group className="px-3" controlId="">
                            <Form.Check
                              type="checkbox"
                              checked={child.isChecked}
                              onClick={() => updatecheckValue(Number(j))}
                              label={child.title}
                            />
                          </Form.Group>
                        </li>
                      ))}{" "}
                    </ul>
                  ) : (
                    ""
                  )}
                </li>
              ))}
            </ul>
          ) : (
            ""
          )}
          {isShowDateRange ? (
            <ul ref={domNode} id="dateRangeId" className="date-range-submenu">
              <li>
                <div className="row date-picker-border">
                  <div className="col-3  left-border">
                    <div onClick={() => OnSelectDateRange("THIS_WEEK")}>
                      <Label
                        title="This Week"
                        classNames={
                          dateFilterBy === "THIS_WEEK"
                            ? "mt-2 mb-2 date-filter-by-selected"
                            : "mt-2 mb-3 date-filter-by"
                        }
                      />{" "}
                    </div>
                    <div onClick={() => OnSelectDateRange("THIS_MONTH")}>
                      <Label
                        title="This Month"
                        classNames={
                          dateFilterBy === "THIS_MONTH"
                            ? "mb-2 date-filter-by-selected"
                            : "mb-3  date-filter-by"
                        }
                      />{" "}
                    </div>
                    <div onClick={() => OnSelectDateRange("LAST_MONTH")}>
                      <Label
                        title="Last Month"
                        classNames={
                          dateFilterBy === "LAST_MONTH"
                            ? "mb-3 date-filter-by-selected"
                            : "mb-3  date-filter-by"
                        }
                      />{" "}
                    </div>
                    <div onClick={() => OnSelectDateRange("LAST_YEAR")}>
                      <Label
                        title="Last year"
                        classNames={
                          dateFilterBy === "LAST_YEAR"
                            ? "mb-3 date-filter-by-selected"
                            : "mb-3  date-filter-by"
                        }
                      />{" "}
                    </div>
                    <div onClick={() => OnSelectDateRange("CUSTOM_RANGE")}>
                      <Label
                        title="Custom Range"
                        classNames={
                          dateFilterBy === "CUSTOM_RANGE"
                            ? "mb-3 date-filter-by-selected"
                            : "mb-3  date-filter-by"
                        }
                      />{" "}
                    </div>
                  </div>
                  <div className="col-9">
                    <div className="row ">
                      {dateFilter
                        ? dateFilter.map(
                          (filter: FilterOption, index: number) => (
                            <div key={index} className="col-4 mt-2">
                              <input
                                type="checkbox"
                                checked={filter.isChecked}
                                onClick={() =>
                                  updatecheckValueDateFilter(Number(index))
                                }
                                className="sawin-checkbox new-check"
                              />
                              <Label
                                title={filter.title}
                                classNames="mb-3 selection-option"
                              />
                            </div>
                          )
                        )
                        : ""}
                    </div>
                    <div className="row mb-3">
                      <div className="col-6 ">
                        <Label title="Start Date" classNames="text-dark" />
                        <div className="input-group input-group-sm bg-transparent">
                          <input
                            type="text"
                            disabled
                            className="form-control mt-0 bg-light border-end-0 text-dark bg-transparent"
                            value={
                              startDate &&
                              moment(startDate).format("MM/DD/YYYY")
                            }
                          />
                          <span
                            className="input-group-text bg-transparent mt-0 border-start-0 theme-icon-color"
                            id="basic-addon2"
                          >
                            {/* <img
                              src={calender}
                              width="40"
                              className="calender-icon"
                              alt="hamburg"
                            /> */}
                          </span>
                        </div>
                      </div>
                      <div className="col-6">
                        <Label title="End Date" classNames="text-dark" />
                        <div className="input-group input-group-sm bg-transparent">
                          <input
                            type="text"
                            disabled
                            className="form-control mt-0 bg-light border-end-0 text-dark bg-transparent"
                            value={
                              endDate && moment(endDate).format("MM/DD/YYYY")
                            }
                          />
                          <span
                            className="input-group-text bg-transparent mt-0 border-start-0"
                            id="basic-addon2"
                          >
                            {/* <img
                              src={calender}
                              width="40"
                              className="calender-icon theme-icon-color"
                              alt="hamburg"
                            /> */}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className=" row ">
                      <div className="col-6 ">
                        <DatePicker
                          selected={startDate}
                          onChange={(date: any) => setStartDate(date)}
                          minDate={
                            dateFilterBy == "CUSTOM_RANGE" ? "" : startDate
                          }
                          maxDate={
                            dateFilterBy == "CUSTOM_RANGE" ? "" : startDate
                          }
                          readOnly={true}
                          inline
                        />
                      </div>
                      <div className="col-6">
                        <DatePicker
                          selected={endDate}
                          onChange={(date: any) => setEndDate(date)}
                          minDate={
                            dateFilterBy == "CUSTOM_RANGE" ? "" : endDate
                          }
                          maxDate={
                            dateFilterBy == "CUSTOM_RANGE" ? "" : endDate
                          }
                          readOnly={
                            dateFilterBy == "CUSTOM_RANGE" ? false : true
                          }
                          inline
                        />
                      </div>
                    </div>
                    <div className="col-12  mt-3 text-center">
                      <Button
                        variant="primary"
                        className="btn-brand-solid me-3 mb-0"
                        type="submit"
                        onClick={() => onDateFiltering()}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="primary"
                        className="btn-brand-outline"
                        type="button"
                        onClick={() => {
                          setIsShowDateRange(!isShowDateRange);
                          setIsFilter(false);
                          setIsShowColumns(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          ) : (
            ""
          )}
        </Col>
      </Row>

      <div
        // className={
        //   props.ShowLoader === false ? "table-scroll" : "table-scroll px-0"
        // }
        className={"table-wrap"}
      >
        <table
          //  className="grid-table"
          className="table table-style-1"
          id={props.gridId ? props.gridId : "resizable"}
        >
          <thead>
            <tr>
              {headers.map((header: GridHeader, i) =>
                header.isShow === false ? (
                  ""
                ) : header.isSorting === false ? (
                  <th
                    className={
                      "cursor-pointer text-center " +
                      (header.isFreeze == true ? "freeze-column" : "")
                    }
                    style={{ width: header.width ? header.width : "",minWidth:"100px" }}
                    key={i.toString()}
                  >
                    {!header.isShowCheckBox && header.title}
                    {header.isShowCheckBox && (
                      <Form.Group className="mb-1">
                        <Form.Check
                          type="checkbox"
                          checked={checkBoxStauts}
                          onClick={() => onSelectAllRow()}
                        />
                      </Form.Group>
                    )}{" "}
                  </th>
                ) : (
                  <th
                    key={i.toString()}
                    className={
                      "cursor-pointer text-center " +
                      (header.isFreeze == true ? "freeze-column" : "")
                    }
                    style={{ width: header.width ? header.width : "" }}
                    onClick={() =>
                      sorting(
                        i,
                        header.isAsc ? header.isAsc : false,
                        header.sortingKey
                      )
                    }
                  >
                    {header.title}

                    <span className="sorting">
                      {header.isDesc ? <ArrowUp /> : null}
                      {header.isAsc ? <ArrowDown /> : null}
                    </span>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {props.ShowLoader === true || data.length == 0 ? (
              <></>
            ) : (
              data.map((row: GridRow, i) => (
                <tr
                  onDoubleClick={() =>
                    props.doubleClick && props.doubleClick(i, row)
                  }
                  key={"body_data_" + i.toString()}
                  style={{ backgroundColor: row.backgroundColor }}
                // className={
                //   (styledRow == i ? "selected-row" : "") ||
                //   (row.isRed ? "red-styled-row" : "") ||
                //   (props.hoverRow ? "hover-styled-row" : "")
                // }
                >
                  {headers.map((header: GridHeader, j) =>
                    header.isShow === false || (row.type == "B" && j != 0) ? (
                      ""
                    ) : (
                      <td
                        rowSpan={row.type == "A" && j == 0 ? 2 : 1}
                        colSpan={row.type == "B" ? headers.length - 1 : 1}
                        onClick={() =>
                          header.isNotAllowClick ? "" : onSelectRow(i, row)
                        }
                        key={"row_" + i + "_" + j}
                        style={{ color: row.textColor }}
                        className={
                          (header.class?.toString() ||
                            (styledRow == i ? "selected-row-text" : "")) +
                          (header.isFreeze == true ? " freeze-column" : "")
                        }
                      >
                        {row.data[j] ? (
                          row.data[j].type === "HTML" ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: row.data[j].value,
                              }}
                            />
                          ) : (
                            row.data[j].value
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                    )
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {rows.length == 0 && props.ShowLoader === false ? (
          <div>
            <div className="error-message">{props.errorMessage}</div>
          </div>
        ) : null}

        {props.ShowLoader === true ? (
          <div className="">
            <div></div>
            <div style={{ textAlign: "center", marginTop: "10%" }}>
              <img
                style={{ position: "relative" }}
                src={loader}
                alt="No loader found"
              />
              <div style={{ position: "relative", color: "white" }}>
                Loading...
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {props.count > 0 ? (
        <div className="d-flex flex-row justify-content-between pb-3 align-items-center pagination-row">
          <div className="showing-text ps-3 col-6 font-12">
            {perPageItem * (currentPage - 1) + 1} -{" "}
            {(currentPage - 1) * perPageItem + perPageItem > props.count
              ? props.count
              : (currentPage - 1) * perPageItem + perPageItem}{" "}
            of {props.count}
          </div>
          <div className="col-6 text-end ms-auto" style={{display: "flex", justifyContent: "end"}}>
            <Paginations
              className=""
              changePage={(page: number) => {
                setCurrentPage(page);
                setStyledRow(-1);
              }}
              totalItems={props.count}
              itemsCountPerPage={perPageItem}
              changeCurrentPage={currentPage}
            />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
});

export default Grid;
